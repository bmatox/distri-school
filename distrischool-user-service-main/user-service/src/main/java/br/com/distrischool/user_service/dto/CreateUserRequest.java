package br.com.distrischool.user_service.dto;

import br.com.distrischool.user_service.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateUserRequest(
    @NotBlank String name, // OBRIGATÓRIO E NÃO PODE ESTAR VAZIO
    @NotBlank @Email String email,
    @NotBlank String password,
    @NotNull Role role // OBRIGATÓRIO E NÃO PODE SER NULL
) {}