package br.com.distrischool.user_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ProfessorProfileData(
    @NotBlank String especialidade,
    @NotNull LocalDate dataContratacao,
    Long turmaId
) {}
