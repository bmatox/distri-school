package br.com.distrischool.professortecadm.repository;

import br.com.distrischool.professortecadm.model.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {
}
