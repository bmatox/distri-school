package br.com.distrischool.professortecadm.repository;

import br.com.distrischool.professortecadm.model.Disciplina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisciplinaRepository extends JpaRepository<Disciplina, Long> {
    List<Disciplina> findByTurmaId(Long turmaId);
    
    @Query("SELECT d FROM Disciplina d JOIN d.professores p WHERE p.id = :professorId")
    List<Disciplina> findByProfessorId(@Param("professorId") Long professorId);
}
