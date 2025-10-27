package br.com.distrischool.professortecadm.messaging.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ProfessorEventDTO {
    private Long id;
    private String nome;
    private String email;
    private String especialidade;
    private String dataContratacao;
    private String type;
    
    @Builder.Default
    private String timestamp = Instant.now().toString();
}
