package br.com.distrischool.professortecadm.service;

import br.com.distrischool.professortecadm.model.Disciplina;
import br.com.distrischool.professortecadm.model.MatriculaDisciplina;
import br.com.distrischool.professortecadm.repository.DisciplinaRepository;
import br.com.distrischool.professortecadm.repository.MatriculaDisciplinaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MatriculaDisciplinaService {

    private final MatriculaDisciplinaRepository matriculaRepository;
    private final DisciplinaRepository disciplinaRepository;

    @Transactional
    public MatriculaDisciplina matricular(Long alunoId, Long disciplinaId) {
        // Check if already enrolled
        if (matriculaRepository.existsByAlunoIdAndDisciplinaId(alunoId, disciplinaId)) {
            throw new IllegalStateException("Aluno já está matriculado nesta disciplina");
        }

        // Get disciplina
        Disciplina disciplina = disciplinaRepository.findById(disciplinaId)
                .orElseThrow(() -> new IllegalArgumentException("Disciplina não encontrada"));

        // Create matricula
        MatriculaDisciplina matricula = new MatriculaDisciplina();
        matricula.setAlunoId(alunoId);
        matricula.setDisciplina(disciplina);

        return matriculaRepository.save(matricula);
    }

    public List<MatriculaDisciplina> getMatriculasByAluno(Long alunoId) {
        return matriculaRepository.findByAlunoId(alunoId);
    }

    @Transactional
    public void cancelarMatricula(Long matriculaId, Long alunoId) {
        MatriculaDisciplina matricula = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new IllegalArgumentException("Matrícula não encontrada"));

        // Verify ownership
        if (!matricula.getAlunoId().equals(alunoId)) {
            throw new IllegalStateException("Esta matrícula não pertence ao aluno");
        }

        matriculaRepository.delete(matricula);
    }
}
