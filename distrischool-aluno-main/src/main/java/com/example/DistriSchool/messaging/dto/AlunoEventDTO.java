package com.example.DistriSchool.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlunoEventDTO {
    private Long userId;
    private String nome;
    private String matricula;
    private Long cursoId;
    private Long turmaId;
    private String contato;
    private LocalDate dataNascimento;
    private EnderecoEventDTO endereco;
    private String type; // CREATED, UPDATED, DELETED
}
