package br.com.gestao_hospitalar.auth_service.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApiResponse<T> {

  private LocalDateTime timestamp;
  private int status;
  private String path;
  private String message;
  private T data;
}
