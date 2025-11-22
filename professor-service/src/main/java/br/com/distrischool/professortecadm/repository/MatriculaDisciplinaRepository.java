package br.com.distrischool.professortecadm.repository;

import br.com.distrischool.professortecadm.model.MatriculaDisciplina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatriculaDisciplinaRepository extends JpaRepository<MatriculaDisciplina, Long> {
    
    List<MatriculaDisciplina> findByAlunoId(Long alunoId);
    
    Optional<MatriculaDisciplina> findByAlunoIdAndDisciplinaId(Long alunoId, Long disciplinaId);
    
    boolean existsByAlunoIdAndDisciplinaId(Long alunoId, Long disciplinaId);
}
