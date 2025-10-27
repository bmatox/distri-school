package br.com.distrischool.professortecadm.dto;

import java.time.LocalDate;

public record ProfessorResponse(
        Long id,
        String nome,
        String email,
        String especialidade,
        LocalDate dataContratacao
) {}