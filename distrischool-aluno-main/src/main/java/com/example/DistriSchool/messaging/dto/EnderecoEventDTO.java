package com.example.DistriSchool.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnderecoEventDTO {
    private String rua;
    private String numero;
    private String cidade;
    private String estado;
    private String cep;
}
