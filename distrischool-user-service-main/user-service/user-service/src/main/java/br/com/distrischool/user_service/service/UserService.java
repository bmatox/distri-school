package br.com.distrischool.user_service.service;

import br.com.distrischool.user_service.domain.Role;
import br.com.distrischool.user_service.domain.User;
import br.com.distrischool.user_service.dto.CreateUserRequest;
import br.com.distrischool.user_service.dto.UpdateUserRequest;
import br.com.distrischool.user_service.dto.UserResponse;
import br.com.distrischool.user_service.exception.EmailAlreadyUsedException;
import br.com.distrischool.user_service.exception.ResourceNotFoundException;
import br.com.distrischool.user_service.messaging.UserEventPublisher;
import br.com.distrischool.user_service.messaging.dto.UserEventDTO;
import br.com.distrischool.user_service.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

  private final UserRepository repository;
  private final PasswordEncoder passwordEncoder;
  private final UserEventPublisher publisher;

  @Transactional
  public UserResponse create(CreateUserRequest req) {
    if (repository.existsByEmail(req.email())) {
      throw new EmailAlreadyUsedException("Email já está em uso: " + req.email());
    }

    User u = new User();
    u.setName(req.name());
    u.setEmail(req.email());
    u.setRole(req.role());
    u.setPasswordHash(passwordEncoder.encode(req.password())); // BCrypt
    u.setExternalId(req.externalId());
    u.setUserType(req.userType());

    repository.save(u);

    // Publish role-specific events with profile data
    publishUserCreatedEvent(u, req);

    return toResponse(u);
  }

  @Transactional(readOnly = true)
  public UserResponse getById(Long id) {
    User u = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: id=" + id));
    return toResponse(u);
  }

  @Transactional(readOnly = true)
  public Page<UserResponse> list(Pageable pageable) {
    return repository.findAll(pageable).map(this::toResponse);
  }

  @Transactional(readOnly = true)
  public List<UserResponse> listByRole(Role role) {
    return repository.findByRole(role).stream()
            .map(this::toResponse)
            .toList();
  }

  @Transactional(readOnly = true)
  public List<UserResponse> listAvailableByRole(Role role) {
    return repository.findByRoleAndExternalIdIsNull(role).stream()
            .map(this::toResponse)
            .toList();
  }

  @Transactional
  public UserResponse update(Long id, UpdateUserRequest req) {
    User u = repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: id=" + id));

    if (req.name() != null) {
      u.setName(req.name());
    }

    if (req.email() != null) {
      if (!req.email().equals(u.getEmail()) && repository.existsByEmail(req.email())) {
        throw new EmailAlreadyUsedException("Email já está em uso: " + req.email());
      }
      u.setEmail(req.email());
    }

    if (req.role() != null) {
      u.setRole(req.role());
    }

    if (req.password() != null && !req.password().isBlank()) {
      u.setPasswordHash(passwordEncoder.encode(req.password())); // re-hash se trocar
    }

    if (req.externalId() != null) {
      u.setExternalId(req.externalId());
    }

    if (req.userType() != null) {
      u.setUserType(req.userType());
    }

    // Evento: USER UPDATED
    publisher.publish("user.updated",
            UserEventDTO.builder()
                    .id(u.getId())
                    .name(u.getName())
                    .email(u.getEmail())
                    .role(u.getRole().name())
                    .type("UPDATED")
                    .build()
    );

    return toResponse(u);
  }

  @Transactional
  public void delete(Long id) {
    if (!repository.existsById(id)) {
      throw new ResourceNotFoundException("Usuário não encontrado: id=" + id);
    }
    repository.deleteById(id);

    // Evento: USER DELETED
    publisher.publish("user.deleted",
            UserEventDTO.builder()
                    .id(id)
                    .type("DELETED")
                    .build()
    );
  }

  private UserResponse toResponse(User u) {
    return new UserResponse(
            u.getId(),
            u.getName(),
            u.getEmail(),
            u.getRole(),
            u.getExternalId(),
            u.getUserType(),
            u.getCreatedAt(),
            u.getUpdatedAt()
    );
  }

  private void publishUserCreatedEvent(User u, CreateUserRequest req) {
    switch (u.getRole()) {
      case TEACHER -> {
        if (req.professorProfile() != null) {
          log.info("Publishing professor.created event for user: userId={}, nome={}", u.getId(), u.getName());
          publisher.publish("professor.created",
                  br.com.distrischool.user_service.messaging.dto.ProfessorEventDTO.builder()
                          .userId(u.getId())
                          .nome(u.getName())
                          .email(u.getEmail())
                          .especialidade(req.professorProfile().especialidade())
                          .dataContratacao(req.professorProfile().dataContratacao())
                          .turmaId(req.professorProfile().turmaId())
                          .type("CREATED")
                          .build()
          );
          log.info("Successfully published professor.created event for userId={}", u.getId());
        } else {
          log.warn("TEACHER user created but professorProfile is NULL - event NOT published! userId={}, name={}", u.getId(), u.getName());
        }
      }
      case STUDENT -> {
        if (req.alunoProfile() != null) {
          log.info("Publishing aluno.created event for user: userId={}, nome={}", u.getId(), u.getName());
          br.com.distrischool.user_service.messaging.dto.EnderecoEventDTO enderecoDTO = null;
          if (req.alunoProfile().endereco() != null) {
            enderecoDTO = br.com.distrischool.user_service.messaging.dto.EnderecoEventDTO.builder()
                    .rua(req.alunoProfile().endereco().rua())
                    .numero(req.alunoProfile().endereco().numero())
                    .cidade(req.alunoProfile().endereco().cidade())
                    .estado(req.alunoProfile().endereco().estado())
                    .cep(req.alunoProfile().endereco().cep())
                    .build();
          }
          publisher.publish("aluno.created",
                  br.com.distrischool.user_service.messaging.dto.AlunoEventDTO.builder()
                          .userId(u.getId())
                          .nome(u.getName())
                          .matricula(req.alunoProfile().matricula())
                          .cursoId(req.alunoProfile().cursoId())
                          .turmaId(req.alunoProfile().turmaId())
                          .contato(req.alunoProfile().contato())
                          .dataNascimento(req.alunoProfile().dataNascimento())
                          .endereco(enderecoDTO)
                          .type("CREATED")
                          .build()
          );
          log.info("Successfully published aluno.created event for userId={}", u.getId());
        } else {
          log.warn("STUDENT user created but alunoProfile is NULL - event NOT published! userId={}, name={}", u.getId(), u.getName());
        }
      }
      case TECHNICAL_ADMIN -> {
        if (req.tecnicoAdminProfile() != null) {
          publisher.publish("tecnicoadmin.created",
                  br.com.distrischool.user_service.messaging.dto.TecnicoAdminEventDTO.builder()
                          .userId(u.getId())
                          .nome(u.getName())
                          .email(u.getEmail())
                          .departamento(req.tecnicoAdminProfile().departamento())
                          .dataAdmissao(req.tecnicoAdminProfile().dataAdmissao())
                          .type("CREATED")
                          .build()
          );
        }
      }
      default -> {
        // For ADMIN or other roles without profile-specific data
        log.info("Creating user with role {} without profile data", u.getRole());
        publisher.publish("user.created",
                UserEventDTO.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .role(u.getRole().name())
                        .type("CREATED")
                        .build()
        );
      }
    }
  }
}