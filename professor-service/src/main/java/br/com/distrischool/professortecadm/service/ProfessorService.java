package br.com.distrischool.professortecadm.service;

import br.com.distrischool.professortecadm.dto.*;
import br.com.distrischool.professortecadm.exception.*;
import br.com.distrischool.professortecadm.messaging.ProfessorEventPublisher;
import br.com.distrischool.professortecadm.messaging.dto.ProfessorEventDTO;
import br.com.distrischool.professortecadm.model.Professor;
import br.com.distrischool.professortecadm.model.Turma;
import br.com.distrischool.professortecadm.repository.ProfessorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfessorService {

    private final ProfessorRepository professorRepository;
    private final ProfessorEventPublisher eventPublisher;
    private final TurmaService turmaService;

    public ProfessorService(ProfessorRepository professorRepository, ProfessorEventPublisher eventPublisher, TurmaService turmaService) {
        this.professorRepository = professorRepository;
        this.eventPublisher = eventPublisher;
        this.turmaService = turmaService;
    }

    @Transactional
    public ProfessorResponse create(CreateProfessorRequest request) {
        if (professorRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyUsedException("Email já está em uso: " + request.email());
        }
        
        // Validate especialidade against turma's curso if turmaId is provided
        if (request.turmaId() != null) {
            validateEspecialidadeMatchesTurmaCurso(request.especialidade(), request.turmaId());
        }
        
        Professor professor = new Professor();
        professor.setNome(request.nome());
        professor.setEmail(request.email());
        professor.setEspecialidade(request.especialidade());
        professor.setDataContratacao(request.dataContratacao());
        professor.setUserId(request.userId());
        professor.setTurmaId(request.turmaId());
        Professor saved = professorRepository.save(professor);
        
        // Note: Events are now published from User Service
        // This endpoint is kept for backward compatibility only
        
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
        
        // Validate especialidade against turma's curso if turmaId is provided
        if (request.turmaId() != null) {
            validateEspecialidadeMatchesTurmaCurso(request.especialidade(), request.turmaId());
        }
        
        professor.setNome(request.nome());
        professor.setEmail(request.email());
        professor.setEspecialidade(request.especialidade());
        professor.setDataContratacao(request.dataContratacao());
        professor.setTurmaId(request.turmaId());
        Professor saved = professorRepository.save(professor);
        
        // Note: Events are now published from User Service for profile updates
        
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!professorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Professor não encontrado: id=" + id);
        }
        professorRepository.deleteById(id);
        
        // Note: Deletion events are handled separately if needed
    }

    private void validateEspecialidadeMatchesTurmaCurso(String especialidade, Long turmaId) {
        Turma turma = turmaService.getTurmaById(turmaId);
        String cursoNome = turma.getCurso().getNome();
        
        // Normalize strings for comparison (remove accents, convert to lowercase)
        String normalizedEspecialidade = normalizeString(especialidade);
        String normalizedCursoNome = normalizeString(cursoNome);
        
        // Check if especialidade matches or is contained in curso name
        if (!normalizedEspecialidade.equals(normalizedCursoNome) && 
            !normalizedCursoNome.contains(normalizedEspecialidade) && 
            !normalizedEspecialidade.contains(normalizedCursoNome)) {
            throw new EspecialidadeMismatchException(
                String.format("A especialidade '%s' do professor não se enquadra no curso '%s' da turma selecionada.", 
                    especialidade, cursoNome)
            );
        }
    }
    
    private String normalizeString(String str) {
        if (str == null) return "";
        return java.text.Normalizer.normalize(str, java.text.Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "")
                .toLowerCase()
                .trim();
    }

    private ProfessorResponse toResponse(Professor professor) {
        return new ProfessorResponse(
                professor.getId(),
                professor.getNome(),
                professor.getEmail(),
                professor.getEspecialidade(),
                professor.getDataContratacao(),
                professor.getUserId(),
                professor.getTurmaId()
        );
    }
}