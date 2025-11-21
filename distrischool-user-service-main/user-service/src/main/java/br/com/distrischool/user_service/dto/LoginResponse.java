package br.com.distrischool.user_service.dto;

public record LoginResponse(
    String token,
    Long userId,
    String email,
    String name,
    String role
) {}
