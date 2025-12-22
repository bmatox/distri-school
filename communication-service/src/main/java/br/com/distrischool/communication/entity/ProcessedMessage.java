package br.com.distrischool.communication.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "processed_messages", schema = "communication_schema")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessedMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "message_id", nullable = false, unique = true)
    private String messageId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "aggregate_id")
    private Long aggregateId;

    @Column(name = "processed_at", nullable = false)
    private LocalDateTime processedAt;

    @Column(name = "consumer_name", nullable = false)
    private String consumerName;

    @PrePersist
    protected void onCreate() {
        processedAt = LocalDateTime.now();
    }
}
