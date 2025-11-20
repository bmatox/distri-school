package com.example.DistriSchool.service;

import com.example.DistriSchool.domain.Aluno;
import com.example.DistriSchool.dto.FiltroAlunoDTO;
import com.example.DistriSchool.repository.AlunoRepository;
import org.springframework.amqp.AmqpException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final AlunoProducer alunoProducer;

    public AlunoService(AlunoRepository alunoRepository, AlunoProducer alunoProducer) {
        this.alunoRepository = alunoRepository;
        this.alunoProducer = alunoProducer;
    }

    public Aluno save(Aluno aluno) {
        if (aluno.getMatricula() == null || aluno.getMatricula().isEmpty()) {
            String novaMatricula = generateSequentialMatricula();
            aluno.setMatricula(novaMatricula);
        }

        Aluno alunoSalvo = alunoRepository.save(aluno);
        alunoProducer.sendMessage(alunoSalvo);
        return alunoSalvo;
    }

    public List<Aluno> getAll() {
        return alunoRepository.findAll();
    }

    public Optional<Aluno> getById(Long id) {
        return alunoRepository.findById(id);
    }

    public Optional<Aluno> getByMatricula(String matricula) {
        return alunoRepository.findByMatricula(matricula);
    }

    public List<Aluno> getByFilter(FiltroAlunoDTO filtro) {
        if (filtro.getNome() != null && !filtro.getNome().isEmpty()) {
            return alunoRepository.findByNomeContainingIgnoreCase(filtro.getNome());
        }

        if (filtro.getTurma() != null && !filtro.getTurma().isEmpty()) {
            // Legacy filter - now filters by turmaId if numeric
            try {
                Long turmaId = Long.parseLong(filtro.getTurma());
                return alunoRepository.findByTurmaId(turmaId);
            } catch (NumberFormatException e) {
                // Ignore if not numeric
            }
        }

        return alunoRepository.findAll();
    }

    public Optional<Aluno> update(Long id, Aluno alunoInfo) {
        Optional<Aluno> alunoOptional = alunoRepository.findById(id);

        if (alunoOptional.isPresent()) {
            Aluno aluno = alunoOptional.get();
            aluno.setNome(alunoInfo.getNome());
            aluno.setMatricula(alunoInfo.getMatricula());
            aluno.setDataNascimento(alunoInfo.getDataNascimento());
            aluno.setCursoId(alunoInfo.getCursoId());
            aluno.setTurmaId(alunoInfo.getTurmaId());
            aluno.setEndereco(alunoInfo.getEndereco());
            aluno.setContato(alunoInfo.getContato());
            return Optional.of(alunoRepository.save(aluno));
        }
        return Optional.empty();
    }

    public void delete(Long id) {
        if (!alunoRepository.existsById(id)) {
            throw new EmptyResultDataAccessException(
                    String.format("Nenhum Aluno encontrado com o ID %d", id), 1
            );
        }
        alunoRepository.deleteById(id);
    }

    public long countAlunos() {
        return alunoRepository.count();
    }

    private synchronized String generateSequentialMatricula() {
        // Get the count of all students to generate sequential matricula
        // Using synchronized to prevent race conditions in concurrent scenarios
        long totalAlunos = alunoRepository.count();
        long nextSequential = totalAlunos + 1;
        
        String ano = String.valueOf(Year.now());
        return ano + nextSequential;
    }
}
