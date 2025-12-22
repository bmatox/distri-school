package br.com.distrischool.grades.service;

import br.com.distrischool.grades.entity.OutboxEvent;
import br.com.distrischool.grades.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Outbox Event Poller - Responsável por processar eventos pendentes e enviá-los ao RabbitMQ.
 * 
 * Este componente implementa o Transactional Outbox Pattern, garantindo entrega at-least-once
 * de eventos ao RabbitMQ. Eventos são salvos no banco de dados na mesma transação que a entidade
 * de domínio (Grade), e posteriormente enviados de forma assíncrona.
 * 
 * Características:
 * - Polling a cada 5 segundos (configurável)
 * - Processa até 100 eventos por execução (evita sobrecarga)
 * - Máximo de 5 tentativas por evento (evita loops infinitos)
 * - Marca eventos como enviados após sucesso
 * - Registra erros para análise manual
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OutboxEventPoller {

    private final OutboxEventRepository outboxEventRepository;
    private final RabbitTemplate rabbitTemplate;
    
    private static final String EXCHANGE_NAME = "distrischool.events.exchange";
    private static final int MAX_RETRIES = 5;
    private static final int BATCH_SIZE = 100;

    /**
     * Processa eventos pendentes a cada 5 segundos.
     * 
     * O método é executado em uma transação separada para cada evento,
     * garantindo que falhas em um evento não afetem outros.
     */
    @Scheduled(fixedDelay = 5000, initialDelay = 10000)
    public void pollAndPublishEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findPendingEvents(
            PageRequest.of(0, BATCH_SIZE)
        );

        if (!pendingEvents.isEmpty()) {
            log.info("Found {} pending outbox events to process", pendingEvents.size());
        }

        for (OutboxEvent event : pendingEvents) {
            try {
                publishEvent(event);
            } catch (Exception e) {
                log.error("Error processing outbox event id={}: {}", event.getId(), e.getMessage(), e);
                updateEventError(event, e);
            }
        }
    }

    /**
     * Publica um evento no RabbitMQ e marca como enviado.
     */
    @Transactional
    public void publishEvent(OutboxEvent event) {
        try {
            // Publica no RabbitMQ usando o payload JSON já serializado
            rabbitTemplate.convertAndSend(
                EXCHANGE_NAME,
                event.getRoutingKey(),
                event.getPayload()
            );

            // Marca como enviado
            event.setSent(true);
            event.setSentAt(LocalDateTime.now());
            outboxEventRepository.save(event);

            log.info("Successfully published outbox event: id={}, eventType={}, aggregateId={}", 
                event.getId(), event.getEventType(), event.getAggregateId());
        } catch (Exception e) {
            log.error("Failed to publish outbox event id={}: {}", event.getId(), e.getMessage());
            throw e; // Re-lança para o método chamador tratar
        }
    }

    /**
     * Atualiza o evento com informações de erro e incrementa contador de tentativas.
     */
    @Transactional
    public void updateEventError(OutboxEvent event, Exception e) {
        try {
            event.setRetryCount(event.getRetryCount() + 1);
            event.setLastError(e.getMessage() != null ? e.getMessage().substring(0, Math.min(500, e.getMessage().length())) : "Unknown error");
            outboxEventRepository.save(event);

            if (event.getRetryCount() >= MAX_RETRIES) {
                log.error("Outbox event id={} exceeded max retries ({}). Manual intervention required.", 
                    event.getId(), MAX_RETRIES);
            }
        } catch (Exception updateException) {
            log.error("Failed to update error information for outbox event id={}", event.getId(), updateException);
        }
    }

    /**
     * Job de limpeza (opcional) - Pode ser executado diariamente para remover eventos antigos já enviados.
     * Descomente a anotação @Scheduled para ativar.
     */
    // @Scheduled(cron = "0 0 2 * * ?") // Executa às 2h da manhã todos os dias
    @Transactional
    public void cleanupOldEvents() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        List<OutboxEvent> oldEvents = outboxEventRepository.findBySentTrueAndSentAtBefore(cutoffDate);
        
        if (!oldEvents.isEmpty()) {
            outboxEventRepository.deleteAll(oldEvents);
            log.info("Cleaned up {} old outbox events", oldEvents.size());
        }
    }
}
