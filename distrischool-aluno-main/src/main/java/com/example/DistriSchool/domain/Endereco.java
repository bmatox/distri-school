package com.example.DistriSchool.domain;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Endereco {
    @NotBlank(message = "A rua é obrigatória.")
    private String rua;

    @NotBlank(message = "O número é obrigatório.")
    private String numero;

    @NotBlank(message = "O CEP é obrigatório.")
    private String cep;

    @NotBlank(message = "A cidade é obrigatória.")
    private String cidade;

    @NotBlank(message = "O estado é obrigatório.")
    private String estado;
}
