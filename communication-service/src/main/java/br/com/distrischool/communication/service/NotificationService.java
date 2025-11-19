package br.com.distrischool.communication.service;

import br.com.distrischool.communication.dto.CreateNotificationRequest;
import br.com.distrischool.communication.entity.Notification;
import br.com.distrischool.communication.exception.NotificationNotFoundException;
import br.com.distrischool.communication.repository.NotificationRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final RabbitTemplate rabbitTemplate;
    
    private static final String EXCHANGE_NAME = "distrischool.events.exchange";

    @Transactional
    @CircuitBreaker(name = "default", fallbackMethod = "createNotificationFallback")
    @Retry(name = "default")
    public Notification createNotification(CreateNotificationRequest request) {
        log.info("Creating notification for user {}", request.getUserId());
        
        Notification notification = new Notification();
        notification.setUserId(request.getUserId());
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setNotificationType(request.getNotificationType());
        notification.setIsRead(false);
        
        Notification savedNotification = notificationRepository.save(notification);
        
        // Publish event to RabbitMQ
        try {
            rabbitTemplate.convertAndSend(EXCHANGE_NAME, "notification.created", savedNotification);
            log.info("Published notification.created event for notification ID: {}", savedNotification.getId());
        } catch (Exception e) {
            log.error("Failed to publish notification.created event", e);
            // Don't fail the transaction if event publishing fails
        }
        
        return savedNotification;
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserId(userId);
    }

    public List<Notification> getUnreadNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdAndIsRead(userId, false);
    }

    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));
    }

    @Transactional
    public Notification markAsRead(Long id) {
        Notification notification = getNotificationById(id);
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        
        Notification updatedNotification = notificationRepository.save(notification);
        
        // Publish event
        try {
            rabbitTemplate.convertAndSend(EXCHANGE_NAME, "notification.read", updatedNotification);
            log.info("Published notification.read event for notification ID: {}", updatedNotification.getId());
        } catch (Exception e) {
            log.error("Failed to publish notification.read event", e);
        }
        
        return updatedNotification;
    }

    @Transactional
    public void deleteNotification(Long id) {
        Notification notification = getNotificationById(id);
        notificationRepository.delete(notification);
        
        // Publish event
        try {
            rabbitTemplate.convertAndSend(EXCHANGE_NAME, "notification.deleted", notification);
            log.info("Published notification.deleted event for notification ID: {}", id);
        } catch (Exception e) {
            log.error("Failed to publish notification.deleted event", e);
        }
    }

    // Fallback method for Circuit Breaker
    private Notification createNotificationFallback(CreateNotificationRequest request, Exception e) {
        log.error("Circuit breaker activated - createNotification fallback", e);
        throw new RuntimeException("Service temporarily unavailable. Please try again later.");
    }
}
