package br.com.distrischool.professortecadm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record UpdateProfessorRequest(
        @NotBlank String nome,
        @NotBlank @Email String email,
        @NotBlank String especialidade,
        @NotNull LocalDate dataContratacao
) {}