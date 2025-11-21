package br.com.distrischool.user_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record TecnicoAdminProfileData(
    @NotBlank String departamento,
    @NotNull LocalDate dataAdmissao
) {}
