package br.com.distrischool.user_service.dto;

import br.com.distrischool.user_service.domain.Role;
import java.time.LocalDateTime;

public record UserResponse(
    Long id,
    String name,
    String email,
    Role role,
    Long externalId,
    String userType,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}