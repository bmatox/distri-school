package br.com.distrischool.communication.messaging;

import br.com.distrischool.communication.dto.CreateNotificationRequest;
import br.com.distrischool.communication.entity.ProcessedMessage;
import br.com.distrischool.communication.repository.ProcessedMessageRepository;
import br.com.distrischool.communication.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class GradeEventListener {

    private final NotificationService notificationService;
    private final ProcessedMessageRepository processedMessageRepository;

    @RabbitListener(queues = "communication.events.queue")
    @Transactional
    public void handleGradeCreated(Map<String, Object> gradeData, Message message) {
        try {
            String routingKey = message.getMessageProperties().getReceivedRoutingKey();
            
            // Idempotency check: Generate message ID from RabbitMQ properties or payload
            String messageId = generateMessageId(message, gradeData);
            
            if (processedMessageRepository.existsByMessageId(messageId)) {
                log.info("Message {} already processed, skipping (idempotency)", messageId);
                return;
            }
            
            if ("grade.created".equals(routingKey)) {
                log.info("Received grade.created event: {}", gradeData);
                
                // Use studentUserId (the User's ID) instead of studentId (the Aluno's ID)
                Object studentUserIdObj = gradeData.get("studentUserId");
                if (studentUserIdObj != null) {
                    Long studentUserId = ((Number) studentUserIdObj).longValue();
                    String subject = (String) gradeData.get("subject");
                    Object gradeValue = gradeData.get("grade");
                    
                    CreateNotificationRequest request = new CreateNotificationRequest();
                    request.setUserId(studentUserId);
                    request.setTitle("Nova Nota Lançada");
                    request.setMessage(String.format("Você recebeu uma nova nota em %s: %s", subject, gradeValue));
                    request.setNotificationType("GRADE_POSTED");
                    
                    notificationService.createNotification(request);
                    log.info("Created notification for student user {} about new grade in {}", studentUserId, subject);
                } else {
                    log.warn("studentUserId not found in grade event, notification not sent");
                }
            }
            
            // Mark message as processed
            ProcessedMessage processedMessage = new ProcessedMessage();
            processedMessage.setMessageId(messageId);
            processedMessage.setEventType(routingKey);
            processedMessage.setAggregateId(gradeData.get("id") != null ? 
                ((Number) gradeData.get("id")).longValue() : null);
            processedMessage.setConsumerName("GradeEventListener");
            processedMessageRepository.save(processedMessage);
            
            log.info("Message {} marked as processed", messageId);
        } catch (Exception e) {
            log.error("Error processing grade event", e);
            throw new RuntimeException("Failed to process grade event", e); // Force requeue
        }
    }
    
    /**
     * Generates a unique message ID from RabbitMQ properties or creates a hash from payload.
     */
    private String generateMessageId(Message message, Map<String, Object> payload) {
        // Try to use RabbitMQ's message ID first
        String rabbitMessageId = message.getMessageProperties().getMessageId();
        if (rabbitMessageId != null && !rabbitMessageId.isBlank()) {
            return rabbitMessageId;
        }
        
        // Fallback: Generate hash from payload for idempotency
        try {
            String payloadString = payload.toString();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(payloadString.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.substring(0, 64); // Limit to 64 characters
        } catch (Exception e) {
            log.error("Failed to generate message hash, using timestamp", e);
            return "fallback-" + System.currentTimeMillis() + "-" + Math.random();
        }
    }
}
