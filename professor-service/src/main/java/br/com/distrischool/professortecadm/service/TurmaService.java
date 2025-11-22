package br.com.distrischool.professortecadm.service;

import br.com.distrischool.professortecadm.model.Turma;
import br.com.distrischool.professortecadm.repository.TurmaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TurmaService {

    private final TurmaRepository turmaRepository;

    @Transactional
    public Turma createTurma(Turma turma) {
        return turmaRepository.save(turma);
    }

    public List<Turma> getAllTurmas() {
        return turmaRepository.findAll();
    }

    public List<Turma> getTurmasByCurso(Long cursoId) {
        return turmaRepository.findByCursoId(cursoId);
    }

    public Turma getTurmaById(Long id) {
        return turmaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Turma não encontrada com ID: " + id));
    }

    @Transactional
    public Turma updateTurma(Long id, Turma turma) {
        Turma existingTurma = getTurmaById(id);
        existingTurma.setNome(turma.getNome());
        existingTurma.setCurso(turma.getCurso());
        existingTurma.setAno(turma.getAno());
        existingTurma.setSemestre(turma.getSemestre());
        return turmaRepository.save(existingTurma);
    }

    @Transactional
    public void deleteTurma(Long id) {
        turmaRepository.deleteById(id);
    }
}
