package br.com.distrischool.user_service.dto;

import br.com.distrischool.user_service.domain.Role;
import jakarta.validation.constraints.Email;

public record UpdateUserRequest(
    String name,
    @Email String email,
    String password,
    Role role
) {}