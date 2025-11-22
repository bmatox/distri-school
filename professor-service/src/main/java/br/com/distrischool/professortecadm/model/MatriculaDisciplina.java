package br.com.distrischool.professortecadm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "matricula_disciplina")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatriculaDisciplina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "aluno_id", nullable = false)
    private Long alunoId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "disciplina_id", nullable = false)
    private Disciplina disciplina;

    @Column(name = "data_matricula", nullable = false)
    private LocalDateTime dataMatricula;

    @Column(name = "status")
    private String status; // ATIVO, CONCLUIDO, CANCELADO

    @PrePersist
    protected void onCreate() {
        if (dataMatricula == null) {
            dataMatricula = LocalDateTime.now();
        }
        if (status == null) {
            status = "ATIVO";
        }
    }
}
