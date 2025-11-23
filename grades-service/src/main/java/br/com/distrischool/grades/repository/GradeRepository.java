package br.com.distrischool.grades.repository;

import br.com.distrischool.grades.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    
    List<Grade> findByStudentId(Long studentId);
    
    List<Grade> findByProfessorId(Long professorId);
    
    List<Grade> findBySubject(String subject);
    
    List<Grade> findByDisciplinaId(Long disciplinaId);
}
