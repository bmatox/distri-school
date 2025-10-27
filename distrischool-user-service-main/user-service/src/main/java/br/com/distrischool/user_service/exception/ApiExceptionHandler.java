package br.com.distrischool.user_service.exception;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<Map<String,Object>> handleNotFound(ResourceNotFoundException ex) {
    Map<String,Object> body = new HashMap<>();
    body.put("timestamp", Instant.now().toString());
    body.put("status", 404);
    body.put("error", "Not Found");
    body.put("message", ex.getMessage());
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
  }

  @ExceptionHandler(EmailAlreadyUsedException.class)
  public ResponseEntity<Map<String,Object>> handleEmail(EmailAlreadyUsedException ex) {
    Map<String,Object> body = new HashMap<>();
    body.put("timestamp", Instant.now().toString());
    body.put("status", 409);
    body.put("error", "Conflict");
    body.put("message", ex.getMessage());
    return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String,Object>> handleValidation(MethodArgumentNotValidException ex) {
    Map<String,Object> body = new HashMap<>();
    body.put("timestamp", Instant.now().toString());
    body.put("status", 400);
    body.put("error", "Bad Request");
    body.put("message", "Validation failed");
    body.put("details", ex.getBindingResult().getFieldErrors()
        .stream().map(fe -> fe.getField() + ": " + fe.getDefaultMessage()).toList());
    return ResponseEntity.badRequest().body(body);
  }
}
