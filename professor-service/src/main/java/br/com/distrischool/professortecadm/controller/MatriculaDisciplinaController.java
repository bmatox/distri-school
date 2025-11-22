package br.com.distrischool.professortecadm.controller;

import br.com.distrischool.professortecadm.model.MatriculaDisciplina;
import br.com.distrischool.professortecadm.service.MatriculaDisciplinaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/matriculas")
@RequiredArgsConstructor
public class MatriculaDisciplinaController {

    private final MatriculaDisciplinaService matriculaService;

    @PostMapping
    public ResponseEntity<MatriculaDisciplina> matricular(@RequestBody Map<String, Long> request) {
        Long alunoId = request.get("alunoId");
        Long disciplinaId = request.get("disciplinaId");

        if (alunoId == null || disciplinaId == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            MatriculaDisciplina matricula = matriculaService.matricular(alunoId, disciplinaId);
            return ResponseEntity.status(HttpStatus.CREATED).body(matricula);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/aluno/{alunoId}")
    public ResponseEntity<List<MatriculaDisciplina>> getMatriculasByAluno(@PathVariable Long alunoId) {
        List<MatriculaDisciplina> matriculas = matriculaService.getMatriculasByAluno(alunoId);
        return ResponseEntity.ok(matriculas);
    }

    @DeleteMapping("/{matriculaId}/aluno/{alunoId}")
    public ResponseEntity<Void> cancelarMatricula(
            @PathVariable Long matriculaId,
            @PathVariable Long alunoId) {
        try {
            matriculaService.cancelarMatricula(matriculaId, alunoId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
