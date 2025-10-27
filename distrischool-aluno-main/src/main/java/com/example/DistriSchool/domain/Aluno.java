package com.example.DistriSchool.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Aluno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotNull
    @Past
    @JsonFormat(pattern = "dd-MM-yyyy", shape = JsonFormat.Shape.STRING)
    private LocalDate dataNascimento;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "rua", column = @Column(name = "endereco_rua")),
            @AttributeOverride(name = "numero", column = @Column(name = "endereco_numero")),
            @AttributeOverride(name = "cep", column = @Column(name = "endereco_cep")), // <-- Mapeando CEP
            @AttributeOverride(name = "cidade", column = @Column(name = "endereco_cidade")),
            @AttributeOverride(name = "estado", column = @Column(name = "endereco_estado"))
    })
    private Endereco endereco;

    @NotBlank(message = "O nome é obrigatório.")
    private String nome;

    private String matricula;

    @NotBlank(message = "A turma é obrigatória.")
    private String turma;

    @NotBlank(message = "O contato é obrigatório.")
    @Size(min = 12, max = 50, message = "O contato deve ter entre 12 e 50 caracteres.")
    private String contato;

}
