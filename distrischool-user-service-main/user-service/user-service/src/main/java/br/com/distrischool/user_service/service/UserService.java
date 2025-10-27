package br.com.distrischool.user_service.service;

import br.com.distrischool.user_service.domain.User;
import br.com.distrischool.user_service.dto.CreateUserRequest;
import br.com.distrischool.user_service.dto.UpdateUserRequest;
import br.com.distrischool.user_service.dto.UserResponse;
import br.com.distrischool.user_service.exception.EmailAlreadyUsedException;
import br.com.distrischool.user_service.exception.ResourceNotFoundException;
import br.com.distrischool.user_service.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

  private final UserRepository repository;
  private final PasswordEncoder passwordEncoder;

  public UserService(UserRepository repository, PasswordEncoder passwordEncoder) {
    this.repository = repository;
    this.passwordEncoder = passwordEncoder;
  }

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
    repository.save(u);
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

  @Transactional
  public UserResponse update(Long id, UpdateUserRequest req) {
    User u = repository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: id=" + id));

    if (req.name() != null) u.setName(req.name());

    if (req.email() != null) {
      if (!req.email().equals(u.getEmail()) && repository.existsByEmail(req.email())) {
        throw new EmailAlreadyUsedException("Email já está em uso: " + req.email());
      }
      u.setEmail(req.email());
    }

    if (req.role() != null) u.setRole(req.role());

    if (req.password() != null && !req.password().isBlank()) {
      u.setPasswordHash(passwordEncoder.encode(req.password())); // re-hash se trocar
    }

    return toResponse(u);
  }

  @Transactional
  public void delete(Long id) {
    if (!repository.existsById(id)) {
      throw new ResourceNotFoundException("Usuário não encontrado: id=" + id);
    }
    repository.deleteById(id);
  }

  private UserResponse toResponse(User u) {
    return new UserResponse(
        u.getId(), u.getName(), u.getEmail(), u.getRole(),
        u.getCreatedAt(), u.getUpdatedAt()
    );
  }
}
