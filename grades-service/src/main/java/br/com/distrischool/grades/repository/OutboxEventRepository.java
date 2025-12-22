package br.com.distrischool.grades.repository;

import br.com.distrischool.grades.entity.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long> {
    
    /**
     * Busca eventos não enviados, limitando por quantidade para evitar sobrecarga.
     * Ordena por created_at para processar eventos mais antigos primeiro (FIFO).
     */
    @Query("SELECT o FROM OutboxEvent o WHERE o.sent = false AND o.retryCount < 5 ORDER BY o.createdAt ASC")
    List<OutboxEvent> findPendingEvents(org.springframework.data.domain.Pageable pageable);
    
    /**
     * Busca eventos não enviados mais antigos que uma data específica (para cleanup).
     */
    List<OutboxEvent> findBySentFalseAndCreatedAtBefore(LocalDateTime cutoffDate);
    
    /**
     * Busca eventos enviados mais antigos que uma data específica (para cleanup/archiving).
     */
    List<OutboxEvent> findBySentTrueAndSentAtBefore(LocalDateTime cutoffDate);
}
