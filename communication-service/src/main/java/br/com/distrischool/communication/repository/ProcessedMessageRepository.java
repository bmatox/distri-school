package br.com.distrischool.communication.repository;

import br.com.distrischool.communication.entity.ProcessedMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProcessedMessageRepository extends JpaRepository<ProcessedMessage, Long> {
    
    /**
     * Verifica se uma mensagem já foi processada.
     */
    boolean existsByMessageId(String messageId);
    
    /**
     * Busca mensagens processadas mais antigas que uma data específica (para cleanup).
     */
    List<ProcessedMessage> findByProcessedAtBefore(LocalDateTime cutoffDate);
}
