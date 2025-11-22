package br.com.distrischool.professortecadm.service;

import br.com.distrischool.professortecadm.model.Curso;
import br.com.distrischool.professortecadm.repository.CursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CursoService {

    private final CursoRepository cursoRepository;

    @Transactional
    public Curso createCurso(Curso curso) {
        return cursoRepository.save(curso);
    }

    public List<Curso> getAllCursos() {
        return cursoRepository.findAll();
    }

    public Curso getCursoById(Long id) {
        return cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso não encontrado com ID: " + id));
    }

    @Transactional
    public Curso updateCurso(Long id, Curso curso) {
        Curso existingCurso = getCursoById(id);
        existingCurso.setNome(curso.getNome());
        existingCurso.setDescricao(curso.getDescricao());
        existingCurso.setDuracaoSemestres(curso.getDuracaoSemestres());
        return cursoRepository.save(existingCurso);
    }

    @Transactional
    public void deleteCurso(Long id) {
        cursoRepository.deleteById(id);
    }
}
