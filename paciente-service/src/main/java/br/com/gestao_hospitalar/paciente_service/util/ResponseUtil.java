package br.com.gestao_hospitalar.paciente_service.util;

import br.com.gestao_hospitalar.paciente_service.dto.ApiResponse;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;

public class ResponseUtil {

  public static <T> ApiResponse<T> ok(String path, String message, T data) {
    return build(HttpStatus.OK, path, message, data);
  }

  public static <T> ApiResponse<T> created(
    String path,
    String message,
    T data
  ) {
    return build(HttpStatus.CREATED, path, message, data);
  }

  public static <T> ApiResponse<T> error(
    HttpStatus status,
    String path,
    String message
  ) {
    return build(status, path, message, null);
  }

  private static <T> ApiResponse<T> build(
    HttpStatus status,
    String path,
    String message,
    T data
  ) {
    return ApiResponse.<T>builder()
      .timestamp(LocalDateTime.now())
      .status(status.value())
      .path(path)
      .message(message)
      .data(data)
      .build();
  }
}
