package br.com.distrischool.grades.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "outbox_events", schema = "grades_schema")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OutboxEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "aggregate_type", nullable = false)
    private String aggregateType; // "Grade", "Notification", etc.

    @Column(name = "aggregate_id", nullable = false)
    private Long aggregateId; // ID da entidade (Grade.id)

    @Column(name = "event_type", nullable = false)
    private String eventType; // "grade.created", "grade.updated", "grade.deleted"

    @Column(name = "payload", nullable = false, columnDefinition = "TEXT")
    private String payload; // JSON serializado do evento

    @Column(name = "routing_key", nullable = false)
    private String routingKey; // "grade.created", "grade.updated", etc.

    @Column(name = "sent", nullable = false)
    private Boolean sent = false; // Indica se o evento foi enviado ao RabbitMQ

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;

    @Column(name = "last_error", columnDefinition = "TEXT")
    private String lastError;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
