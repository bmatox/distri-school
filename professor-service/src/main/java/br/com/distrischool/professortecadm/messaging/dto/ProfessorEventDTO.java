package br.com.distrischool.professortecadm.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfessorEventDTO {
    private Long userId;
    private String nome;
    private String email;
    private String especialidade;
    private LocalDate dataContratacao;
    private Long turmaId;
    private String type; // CREATED, UPDATED, DELETED
}
