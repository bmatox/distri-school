package com.example.DistriSchool.messaging;

import com.example.DistriSchool.domain.Aluno;
import com.example.DistriSchool.domain.Endereco;
import com.example.DistriSchool.messaging.dto.AlunoEventDTO;
import com.example.DistriSchool.repository.AlunoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AlunoEventListener {
    
    private final AlunoRepository alunoRepository;

    @RabbitListener(queues = "#{alunoEventsQueue.name}")
    @Transactional
    public void handleAlunoEvent(AlunoEventDTO event) {
        log.info("Received aluno event: type={}, userId={}", event.getType(), event.getUserId());
        
        if ("CREATED".equals(event.getType())) {
            // Check if aluno with this userId already exists
            if (alunoRepository.findByUserId(event.getUserId()).isPresent()) {
                log.info("Aluno with userId={} already exists, skipping creation", event.getUserId());
                return;
            }
            
            // Validate required fields before processing
            if (!isValidEvent(event)) {
                log.error("Invalid aluno event data: userId={}, validation failed", event.getUserId());
                return;
            }
            
            // Create aluno record
            Aluno aluno = new Aluno();
            aluno.setNome(event.getNome());
            aluno.setUserId(event.getUserId());
            
            // Generate matricula: [CURRENT_YEAR][SEQUENCE]
            String generatedMatricula = generateMatricula();
            aluno.setMatricula(generatedMatricula);
            log.info("Generated matricula: {} for userId: {}", generatedMatricula, event.getUserId());
            
            aluno.setCursoId(event.getCursoId());
            aluno.setTurmaId(event.getTurmaId());
            aluno.setContato(event.getContato());
            aluno.setDataNascimento(event.getDataNascimento());
            
            // Map endereco if present and valid
            if (event.getEndereco() != null && isValidEndereco(event.getEndereco())) {
                Endereco endereco = new Endereco();
                endereco.setRua(event.getEndereco().getRua());
                endereco.setNumero(event.getEndereco().getNumero());
                endereco.setCidade(event.getEndereco().getCidade());
                endereco.setEstado(event.getEndereco().getEstado());
                endereco.setCep(event.getEndereco().getCep());
                aluno.setEndereco(endereco);
            }
            
            alunoRepository.save(aluno);
            log.info("Created aluno record for user: userId={}, alunoId={}", event.getUserId(), aluno.getId());
        }
    }
    
    private boolean isValidEvent(AlunoEventDTO event) {
        // Validate nome
        if (event.getNome() == null || event.getNome().isBlank()) {
            log.error("Validation failed: nome is required");
            return false;
        }
        
        // Validate contato - must be between 12 and 50 characters
        if (event.getContato() == null || event.getContato().isBlank()) {
            log.error("Validation failed: contato is required");
            return false;
        }
        if (event.getContato().length() < 12 || event.getContato().length() > 50) {
            log.error("Validation failed: contato must be between 12 and 50 characters, got: {}", event.getContato().length());
            return false;
        }
        
        // Validate dataNascimento - must be a past date
        if (event.getDataNascimento() == null) {
            log.error("Validation failed: dataNascimento is required");
            return false;
        }
        if (!event.getDataNascimento().isBefore(java.time.LocalDate.now())) {
            log.error("Validation failed: dataNascimento must be a past date, got: {}", event.getDataNascimento());
            return false;
        }
        
        return true;
    }
    
    private boolean isValidEndereco(com.example.DistriSchool.messaging.dto.EnderecoEventDTO endereco) {
        // Validate that all required endereco fields are present
        return endereco.getRua() != null && !endereco.getRua().isBlank() &&
               endereco.getNumero() != null && !endereco.getNumero().isBlank() &&
               endereco.getCidade() != null && !endereco.getCidade().isBlank() &&
               endereco.getEstado() != null && !endereco.getEstado().isBlank() &&
               endereco.getCep() != null && !endereco.getCep().isBlank();
    }
    
    /**
     * Generate a new matricula using the sequence number.
     * Example: "1", "2", "3", etc.
     */
    private String generateMatricula() {
        Long sequence = alunoRepository.getNextMatriculaSequence();
        return String.valueOf(sequence);
    }
}
