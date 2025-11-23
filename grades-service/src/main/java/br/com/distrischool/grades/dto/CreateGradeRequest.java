package br.com.distrischool.grades.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateGradeRequest {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Professor ID is required")
    private Long professorId;

    private Long studentUserId;

    private Long professorUserId;

    private Long disciplinaId;

    // Subject is optional as it can be derived from disciplina
    private String subject;

    @NotNull(message = "Grade is required")
    @DecimalMin(value = "0.0", message = "Grade must be at least 0")
    @DecimalMax(value = "10.0", message = "Grade must be at most 10")
    private BigDecimal grade;

    @NotBlank(message = "Evaluation type is required")
    private String evaluationType;

    private String comments;
}
