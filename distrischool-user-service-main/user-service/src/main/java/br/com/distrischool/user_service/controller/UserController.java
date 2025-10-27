package br.com.distrischool.user_service.controller;

import br.com.distrischool.user_service.dto.CreateUserRequest;
import br.com.distrischool.user_service.dto.UpdateUserRequest;
import br.com.distrischool.user_service.dto.UserResponse;
import br.com.distrischool.user_service.service.UserService;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
// CORREÇÃO CRUCIAL: Mapeamento ajustado para /users para funcionar com o StripPrefix=1 do Gateway.
// A versão da API (v1) deve ser controlada pelo Gateway ou no Path Predicate, não aqui.
@RequestMapping("/users") 
public class UserController {

    private final UserService service;

    // Injeção de dependência via Construtor (Boa Prática)
    public UserController(UserService service) {
        this.service = service;
    }

    //-------------------------------------------------------------
    // POST /users
    //-------------------------------------------------------------
    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
        UserResponse created = service.create(req);
        
        // Uso de URI.create() e ResponseEntity.created() (Boa Prática)
        // O path deve ser relativo ao Controller
        return ResponseEntity.created(URI.create("/users/" + created.id())).body(created);
    }

    //-------------------------------------------------------------
    // GET /users/{id}
    //-------------------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    //-------------------------------------------------------------
    // GET /users?page=...
    //-------------------------------------------------------------
    @GetMapping
    public ResponseEntity<Page<UserResponse>> list(Pageable pageable) {
        return ResponseEntity.ok(service.list(pageable));
    }

    //-------------------------------------------------------------
    // PUT /users/{id}
    //-------------------------------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(@PathVariable Long id,
                                              @Valid @RequestBody UpdateUserRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    //-------------------------------------------------------------
    // DELETE /users/{id}
    //-------------------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        // Retorna 204 No Content (Boa Prática para exclusão bem-sucedida)
        return ResponseEntity.noContent().build();
    }
}