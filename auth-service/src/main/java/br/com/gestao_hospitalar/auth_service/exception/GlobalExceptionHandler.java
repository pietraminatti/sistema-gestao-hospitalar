package br.com.gestao_hospitalar.auth_service.exception;

import jakarta.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

@ControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ApiException.class)
  public ResponseEntity<Object> handleApiException(ApiException ex) {
    Map<String, Object> body = new HashMap<>();
    body.put("error", ex.getMessage());
    HttpStatus status = ex.getStatus() != null
      ? ex.getStatus()
      : HttpStatus.BAD_REQUEST;
    return new ResponseEntity<>(body, status);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Object> handleValidationException(
    MethodArgumentNotValidException ex
  ) {
    Map<String, Object> body = new HashMap<>();
    body.put("error", "Dados inválidos");
    return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<Object> handleConstraintViolationException(
    ConstraintViolationException ex
  ) {
    Map<String, Object> body = new HashMap<>();
    body.put("error", ex.getMessage());
    return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Object> handleGenericException(Exception ex) {
    Map<String, Object> body = new HashMap<>();
    body.put("error", "Erro interno no servidor");
    return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
