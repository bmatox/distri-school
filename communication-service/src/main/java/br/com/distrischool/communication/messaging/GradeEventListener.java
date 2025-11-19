package br.com.distrischool.communication.messaging;

import br.com.distrischool.communication.dto.CreateNotificationRequest;
import br.com.distrischool.communication.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class GradeEventListener {

    private final NotificationService notificationService;

    @RabbitListener(queues = "communication.events.queue")
    public void handleGradeCreated(Map<String, Object> gradeData, Message message) {
        try {
            String routingKey = message.getMessageProperties().getReceivedRoutingKey();
            
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
        } catch (Exception e) {
            log.error("Error processing grade event", e);
        }
    }
}
