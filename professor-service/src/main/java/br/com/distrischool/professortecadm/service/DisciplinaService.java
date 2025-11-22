package br.com.distrischool.professortecadm.service;

import br.com.distrischool.professortecadm.model.Disciplina;
import br.com.distrischool.professortecadm.model.Turma;
import br.com.distrischool.professortecadm.repository.DisciplinaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DisciplinaService {

    private final DisciplinaRepository disciplinaRepository;
    private final TurmaService turmaService;

    @Transactional
    public Disciplina createDisciplina(Disciplina disciplina) {
        // Validate that turma exists and load it from database to ensure proper relationships
        if (disciplina.getTurma() == null || disciplina.getTurma().getId() == null) {
            throw new IllegalArgumentException("Turma é obrigatória para criar uma disciplina");
        }
        
        // Load the turma from database to ensure it exists and has proper relationships
        Turma turma = turmaService.getTurmaById(disciplina.getTurma().getId());
        disciplina.setTurma(turma);
        
        return disciplinaRepository.save(disciplina);
    }

    public List<Disciplina> getAllDisciplinas() {
        return disciplinaRepository.findAll();
    }

    public List<Disciplina> getDisciplinasByTurma(Long turmaId) {
        return disciplinaRepository.findByTurmaId(turmaId);
    }

    public List<Disciplina> getDisciplinasByProfessor(Long professorId) {
        return disciplinaRepository.findByProfessorId(professorId);
    }

    public Disciplina getDisciplinaById(Long id) {
        return disciplinaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disciplina não encontrada com ID: " + id));
    }

    @Transactional
    public Disciplina updateDisciplina(Long id, Disciplina disciplina) {
        Disciplina existingDisciplina = getDisciplinaById(id);
        existingDisciplina.setNome(disciplina.getNome());
        existingDisciplina.setDescricao(disciplina.getDescricao());
        
        // Validate and load turma if it's being changed
        if (disciplina.getTurma() != null && disciplina.getTurma().getId() != null) {
            Turma turma = turmaService.getTurmaById(disciplina.getTurma().getId());
            existingDisciplina.setTurma(turma);
        }
        
        existingDisciplina.setProfessores(disciplina.getProfessores());
        return disciplinaRepository.save(existingDisciplina);
    }

    @Transactional
    public void deleteDisciplina(Long id) {
        disciplinaRepository.deleteById(id);
    }
}
