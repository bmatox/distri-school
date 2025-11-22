package br.com.distrischool.user_service.messaging.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEventDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String type; // CREATED, UPDATED, DELETED
}
