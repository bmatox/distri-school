package br.com.distrischool.communication.repository;

import br.com.distrischool.communication.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUserId(Long userId);
    
    List<Notification> findByUserIdAndIsRead(Long userId, Boolean isRead);
    
    List<Notification> findByNotificationType(String notificationType);
}
