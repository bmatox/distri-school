package br.com.distrischool.grades.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "grades", schema = "grades_schema")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "professor_id", nullable = false)
    private Long professorId;

    @Column(name = "student_user_id")
    private Long studentUserId;

    @Column(name = "professor_user_id")
    private Long professorUserId;

    @Column(name = "disciplina_id")
    private Long disciplinaId;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal grade;

    @Column(name = "evaluation_type", nullable = false)
    private String evaluationType; // PROVA, TRABALHO, PARTICIPACAO, etc.

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
