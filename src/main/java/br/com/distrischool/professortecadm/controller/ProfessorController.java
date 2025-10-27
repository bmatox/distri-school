package br.com.distrischool.professortecadm.controller;

import br.com.distrischool.professortecadm.dto.*;
import br.com.distrischool.professortecadm.service.ProfessorService;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;

@RestController
@RequestMapping("/api/v1/professores")
public class ProfessorController {

    private final ProfessorService service;

    public ProfessorController(ProfessorService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ProfessorResponse> create(@Valid @RequestBody CreateProfessorRequest req) {
        ProfessorResponse created = service.create(req);
        URI location = URI.create("/api/v1/professores/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping
    public ResponseEntity<Page<ProfessorResponse>> list(@ParameterObject Pageable pageable) {
        return ResponseEntity.ok(service.list(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfessorResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfessorResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateProfessorRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}