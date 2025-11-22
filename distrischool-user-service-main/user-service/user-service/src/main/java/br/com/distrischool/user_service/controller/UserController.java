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
@RequestMapping("/api/v1/users")
public class UserController {

  private final UserService service;

  public UserController(UserService service) {
    this.service = service;
  }

  @PostMapping
  public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
    UserResponse created = service.create(req);
    return ResponseEntity.created(URI.create("/api/v1/users/" + created.id())).body(created);
  }

  @GetMapping("/{id}")
  public ResponseEntity<UserResponse> get(@PathVariable Long id) {
    return ResponseEntity.ok(service.getById(id));
  }

  @GetMapping
  public ResponseEntity<Page<UserResponse>> list(Pageable pageable) {
    return ResponseEntity.ok(service.list(pageable));
  }

  @PutMapping("/{id}")
  public ResponseEntity<UserResponse> update(@PathVariable Long id,
                                             @Valid @RequestBody UpdateUserRequest req) {
    return ResponseEntity.ok(service.update(id, req));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }
}
