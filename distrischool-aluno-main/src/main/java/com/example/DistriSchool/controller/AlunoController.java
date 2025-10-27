package com.example.DistriSchool.controller;

import com.example.DistriSchool.domain.Aluno;
import com.example.DistriSchool.dto.FiltroAlunoDTO;
import com.example.DistriSchool.service.AlunoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/alunos")
public class AlunoController {

    @Autowired
    private AlunoService alunoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Aluno createAluno(@Valid @RequestBody Aluno aluno) {
        return alunoService.save(aluno);
    }

    //Busca múltipla
    @GetMapping
    public List<Aluno> searchAlunos(FiltroAlunoDTO filtro) {
        return alunoService.getByFilter(filtro);
    }

    //Busca única - matrícula
    @GetMapping("/matricula/{matricula}")
    public ResponseEntity<Aluno> searchAlunobyMatricula(@PathVariable String matricula) {
        return alunoService.getByMatricula(matricula)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Aluno> searchAlunobyId(@PathVariable Long id) {
        return alunoService.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Aluno> updateAluno(@PathVariable Long id, @Valid @RequestBody Aluno alunoInfo) {
        return alunoService.update(id, alunoInfo)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAluno(@PathVariable Long id) {
        alunoService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
