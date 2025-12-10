package br.com.distrischool.grades.controller;

import br.com.distrischool.grades.dto.CreateGradeRequest;
import br.com.distrischool.grades.entity.Grade;
import br.com.distrischool.grades.service.GradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    @PostMapping
    public ResponseEntity<Grade> createGrade(@Valid @RequestBody CreateGradeRequest request) {
        Grade grade = gradeService.createGrade(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(grade);
    }

    @GetMapping
    public ResponseEntity<List<Grade>> getAllGrades() {
        return ResponseEntity.ok(gradeService.getAllGrades());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Grade> getGradeById(@PathVariable Long id) {
        return ResponseEntity.ok(gradeService.getGradeById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Grade>> getGradesByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(gradeService.getGradesByStudentId(studentId));
    }

    // novo endpoint para buscar notas por professor
    @GetMapping("/professor/{professorId}")
    public ResponseEntity<List<Grade>> getGradesByProfessor(@PathVariable Long professorId) {
        return ResponseEntity.ok(gradeService.getGradesByProfessorId(professorId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Grade> updateGrade(@PathVariable Long id, @Valid @RequestBody CreateGradeRequest request) {
        return ResponseEntity.ok(gradeService.updateGrade(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long id) {
        gradeService.deleteGrade(id);
        return ResponseEntity.noContent().build();
    }
}
