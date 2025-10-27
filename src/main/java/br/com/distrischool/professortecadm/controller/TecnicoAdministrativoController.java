package br.com.distrischool.professortecadm.controller;

import br.com.distrischool.professortecadm.dto.CreateTecnicoRequest;
import br.com.distrischool.professortecadm.dto.TecnicoAdministrativoResponse;
import br.com.distrischool.professortecadm.dto.UpdateTecnicoRequest;
import br.com.distrischool.professortecadm.service.TecnicoAdministrativoService;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;

@RestController
@RequestMapping("/api/v1/tecnicos")
public class TecnicoAdministrativoController {

    private final TecnicoAdministrativoService service;

    public TecnicoAdministrativoController(TecnicoAdministrativoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TecnicoAdministrativoResponse> create(@Valid @RequestBody CreateTecnicoRequest req) {
        TecnicoAdministrativoResponse created = service.create(req);
        URI location = URI.create("/api/v1/tecnicos/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping
    public ResponseEntity<Page<TecnicoAdministrativoResponse>> list(@ParameterObject Pageable pageable) {
        return ResponseEntity.ok(service.list(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TecnicoAdministrativoResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TecnicoAdministrativoResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateTecnicoRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}