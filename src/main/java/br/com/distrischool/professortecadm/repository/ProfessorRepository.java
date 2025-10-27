package br.com.distrischool.professortecadm.repository;

import br.com.distrischool.professortecadm.model.Professor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfessorRepository extends JpaRepository<Professor, Long> {

    boolean existsByEmail(String email);
}