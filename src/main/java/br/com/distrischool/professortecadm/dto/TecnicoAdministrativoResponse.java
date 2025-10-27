package br.com.distrischool.professortecadm.dto;

import java.time.LocalDate;

public record TecnicoAdministrativoResponse(
        Long id,
        String nome,
        String email,
        String cargo,
        LocalDate dataContratacao
) {}