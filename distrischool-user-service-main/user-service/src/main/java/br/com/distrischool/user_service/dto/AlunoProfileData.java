package br.com.distrischool.user_service.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record AlunoProfileData(
    String matricula,
    Long cursoId,
    Long turmaId,
    @NotBlank @Size(min = 12, max = 50, message = "O contato deve ter entre 12 e 50 caracteres.") String contato,
    @NotNull @Past LocalDate dataNascimento,
    @Valid EnderecoData endereco
) {}
