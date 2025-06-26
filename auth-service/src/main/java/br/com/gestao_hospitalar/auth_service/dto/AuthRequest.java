package br.com.gestao_hospitalar.auth_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {

  @NotBlank
  private String identifier;

  @NotBlank
  private String password;
}
