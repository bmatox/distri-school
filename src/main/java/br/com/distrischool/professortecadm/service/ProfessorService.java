package br.com.distrischool.professortecadm.service;

import br.com.distrischool.professortecadm.dto.*;
import br.com.distrischool.professortecadm.exception.*;
import br.com.distrischool.professortecadm.messaging.ProfessorEventPublisher;
import br.com.distrischool.professortecadm.messaging.dto.ProfessorEventDTO;
import br.com.distrischool.professortecadm.model.Professor;
import br.com.distrischool.professortecadm.repository.ProfessorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfessorService {

    private final ProfessorRepository professorRepository;
    private final ProfessorEventPublisher eventPublisher;

    public ProfessorService(ProfessorRepository professorRepository, ProfessorEventPublisher eventPublisher) {
        this.professorRepository = professorRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ProfessorResponse create(CreateProfessorRequest request) {
        if (professorRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyUsedException("Email já está em uso: " + request.email());
        }
        Professor professor = new Professor();
        professor.setNome(request.nome());
        professor.setEmail(request.email());
        professor.setEspecialidade(request.especialidade());
        professor.setDataContratacao(request.dataContratacao());
        Professor saved = professorRepository.save(professor);
        
        // Publish professor.created event
        eventPublisher.publish("professor.created",
                ProfessorEventDTO.builder()
                        .id(saved.getId())
                        .nome(saved.getNome())
                        .email(saved.getEmail())
                        .especialidade(saved.getEspecialidade())
                        .dataContratacao(saved.getDataContratacao().toString())
                        .type("CREATED")
                        .build()
        );
        
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ProfessorResponse> list(Pageable pageable) {
        return professorRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProfessorResponse getById(Long id) {
        return professorRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Professor não encontrado: id=" + id));
    }

    @Transactional
    public ProfessorResponse update(Long id, UpdateProfessorRequest request) {
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Professor não encontrado: id=" + id));

        if (!request.email().equalsIgnoreCase(professor.getEmail()) && professorRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyUsedException("Email já está em uso: " + request.email());
        }
        professor.setNome(request.nome());
        professor.setEmail(request.email());
        professor.setEspecialidade(request.especialidade());
        professor.setDataContratacao(request.dataContratacao());
        Professor saved = professorRepository.save(professor);
        
        // Publish professor.updated event
        eventPublisher.publish("professor.updated",
                ProfessorEventDTO.builder()
                        .id(saved.getId())
                        .nome(saved.getNome())
                        .email(saved.getEmail())
                        .especialidade(saved.getEspecialidade())
                        .dataContratacao(saved.getDataContratacao().toString())
                        .type("UPDATED")
                        .build()
        );
        
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!professorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Professor não encontrado: id=" + id);
        }
        professorRepository.deleteById(id);
        
        // Publish professor.deleted event
        eventPublisher.publish("professor.deleted",
                ProfessorEventDTO.builder()
                        .id(id)
                        .type("DELETED")
                        .build()
        );
    }

    private ProfessorResponse toResponse(Professor professor) {
        return new ProfessorResponse(
                professor.getId(),
                professor.getNome(),
                professor.getEmail(),
                professor.getEspecialidade(),
                professor.getDataContratacao()
        );
    }
}