package br.com.gestao_hospitalar.paciente_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PacienteRequestDTO {

  @NotBlank
  private String nome;

  @NotBlank
  private String telefone;

  @NotBlank
  private String cep;

  @NotBlank
  private String numero;

  private String complemento;
}
