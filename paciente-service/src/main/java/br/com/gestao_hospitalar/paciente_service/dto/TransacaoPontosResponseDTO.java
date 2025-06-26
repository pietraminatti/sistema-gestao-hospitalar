package br.com.gestao_hospitalar.paciente_service.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class TransacaoPontosResponseDTO {

  private String tipo; // ENTRADA/SAIDA
  private String descricao;
  private Integer quantidade; // pontos
  private Double valorReais; // valor em reais
  private LocalDateTime data;
}
