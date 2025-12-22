package com.example.DistriSchool.messaging;

import com.example.DistriSchool.domain.Aluno;
import com.example.DistriSchool.domain.Endereco;
import com.example.DistriSchool.entity.ProcessedMessage;
import com.example.DistriSchool.messaging.dto.AlunoEventDTO;
import com.example.DistriSchool.repository.AlunoRepository;
import com.example.DistriSchool.repository.ProcessedMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Component
@RequiredArgsConstructor
@Slf4j
public class AlunoEventListener {
    
    private final AlunoRepository alunoRepository;
    private final ProcessedMessageRepository processedMessageRepository;

    @RabbitListener(queues = "#{alunoEventsQueue.name}")
    @Transactional
    public void handleAlunoEvent(AlunoEventDTO event) {
        log.info("Received aluno event: type={}, userId={}", event.getType(), event.getUserId());
        
        // Idempotency check: Generate message ID from event data
        String messageId = generateMessageId(event);
        
        if (processedMessageRepository.existsByMessageId(messageId)) {
            log.info("Message {} already processed for userId={}, skipping (idempotency)", 
                messageId, event.getUserId());
            return;
        }
        
        if ("CREATED".equals(event.getType())) {
            // Check if aluno with this userId already exists
            if (alunoRepository.findByUserId(event.getUserId()).isPresent()) {
                log.info("Aluno with userId={} already exists, skipping creation", event.getUserId());
                // Mark as processed even if skipping to avoid reprocessing
                markAsProcessed(messageId, event);
                return;
            }
            
            // Validate required fields before processing
            if (!isValidEvent(event)) {
                log.error("Invalid aluno event data: userId={}, validation failed", event.getUserId());
                markAsProcessed(messageId, event); // Mark as processed to avoid reprocessing invalid events
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
        
        // Mark message as processed
        markAsProcessed(messageId, event);
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
    
    /**
     * Generates a unique message ID from event data using SHA-256 hash.
     */
    private String generateMessageId(AlunoEventDTO event) {
        try {
            String eventString = String.format("%s-%d-%s", 
                event.getType(), event.getUserId(), event.getNome());
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(eventString.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.substring(0, 64);
        } catch (Exception e) {
            log.error("Failed to generate message hash", e);
            return "fallback-" + event.getUserId() + "-" + System.currentTimeMillis();
        }
    }
    
    /**
     * Marks a message as processed in the database.
     */
    private void markAsProcessed(String messageId, AlunoEventDTO event) {
        try {
            ProcessedMessage processedMessage = new ProcessedMessage();
            processedMessage.setMessageId(messageId);
            processedMessage.setEventType(event.getType());
            processedMessage.setAggregateId(event.getUserId());
            processedMessage.setConsumerName("AlunoEventListener");
            processedMessageRepository.save(processedMessage);
            log.info("Message {} marked as processed for userId={}", messageId, event.getUserId());
        } catch (Exception e) {
            log.error("Failed to mark message as processed: messageId={}", messageId, e);
            // Don't throw - we don't want to fail the entire message processing
        }
    }
}
