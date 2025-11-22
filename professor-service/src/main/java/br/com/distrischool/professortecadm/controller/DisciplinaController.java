package br.com.distrischool.professortecadm.controller;

import br.com.distrischool.professortecadm.model.Disciplina;
import br.com.distrischool.professortecadm.service.DisciplinaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/disciplinas")
@RequiredArgsConstructor
public class DisciplinaController {

    private final DisciplinaService disciplinaService;

    @PostMapping
    public ResponseEntity<Disciplina> createDisciplina(@RequestBody Disciplina disciplina) {
        Disciplina created = disciplinaService.createDisciplina(disciplina);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<Disciplina>> getAllDisciplinas() {
        return ResponseEntity.ok(disciplinaService.getAllDisciplinas());
    }

    @GetMapping("/turma/{turmaId}")
    public ResponseEntity<List<Disciplina>> getDisciplinasByTurma(@PathVariable Long turmaId) {
        return ResponseEntity.ok(disciplinaService.getDisciplinasByTurma(turmaId));
    }

    @GetMapping("/professor/{professorId}")
    public ResponseEntity<List<Disciplina>> getDisciplinasByProfessor(@PathVariable Long professorId) {
        return ResponseEntity.ok(disciplinaService.getDisciplinasByProfessor(professorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Disciplina> getDisciplinaById(@PathVariable Long id) {
        return ResponseEntity.ok(disciplinaService.getDisciplinaById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Disciplina> updateDisciplina(@PathVariable Long id, @RequestBody Disciplina disciplina) {
        return ResponseEntity.ok(disciplinaService.updateDisciplina(id, disciplina));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDisciplina(@PathVariable Long id) {
        disciplinaService.deleteDisciplina(id);
        return ResponseEntity.noContent().build();
    }
}
