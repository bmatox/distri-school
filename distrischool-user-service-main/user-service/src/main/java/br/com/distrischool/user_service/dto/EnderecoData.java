package br.com.distrischool.user_service.dto;

import jakarta.validation.constraints.NotBlank;

public record EnderecoData(
    @NotBlank String rua,
    @NotBlank String numero,
    @NotBlank String cidade,
    @NotBlank String estado,
    @NotBlank String cep
) {}
