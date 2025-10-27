package br.com.distrischool.professortecadm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "tecnicos_administrativos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TecnicoAdministrativo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String cargo;

    private LocalDate dataContratacao;
}