package com.example.DistriSchool.repository;

import com.example.DistriSchool.domain.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, Long> {
    List<Aluno> findByNomeContainingIgnoreCase(String nome);
    Optional<Aluno> findByMatricula(String matricula);
    List<Aluno> findByTurmaId(Long turmaId);
    Optional<Aluno> findByUserId(Long userId);

    @Query(value = "SELECT nextval('aluno_schema.matricula_seq')", nativeQuery = true)
    Long getNextMatriculaSequence();
}
