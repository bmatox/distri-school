package br.com.distrischool.professortecadm.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEventDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private Long externalId;
    private String userType;
    private String type; // CREATED, UPDATED, DELETED
}
