package br.com.distrischool.professortecadm.repository;

import br.com.distrischool.professortecadm.model.Turma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TurmaRepository extends JpaRepository<Turma, Long> {
    List<Turma> findByCursoId(Long cursoId);
}
