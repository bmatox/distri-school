package br.com.distrischool.professortecadm.controller;

import br.com.distrischool.professortecadm.model.Turma;
import br.com.distrischool.professortecadm.service.TurmaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/turmas")
@RequiredArgsConstructor
public class TurmaController {

    private final TurmaService turmaService;

    @PostMapping
    public ResponseEntity<Turma> createTurma(@RequestBody Turma turma) {
        Turma created = turmaService.createTurma(turma);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<Turma>> getAllTurmas() {
        return ResponseEntity.ok(turmaService.getAllTurmas());
    }

    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<List<Turma>> getTurmasByCurso(@PathVariable Long cursoId) {
        return ResponseEntity.ok(turmaService.getTurmasByCurso(cursoId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Turma> getTurmaById(@PathVariable Long id) {
        return ResponseEntity.ok(turmaService.getTurmaById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Turma> updateTurma(@PathVariable Long id, @RequestBody Turma turma) {
        return ResponseEntity.ok(turmaService.updateTurma(id, turma));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTurma(@PathVariable Long id) {
        turmaService.deleteTurma(id);
        return ResponseEntity.noContent().build();
    }
}
