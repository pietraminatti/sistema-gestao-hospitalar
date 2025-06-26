package br.com.gestao_hospitalar.paciente_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Data;

@Data
@Entity
@Table(name = "transacao_pontos")
public class TransacaoPontos {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "paciente_id", nullable = false)
  private Paciente paciente;

  @Column(nullable = false)
  private String tipo; // ENTRADA ou SAIDA

  @Column(nullable = false)
  private String descricao;

  @Column(nullable = false)
  private Integer quantidade; // quantidade de pontos

  @Column(name = "valor", nullable = false)
  private Double valorReais; // valor em reais (para compras)

  @Column(nullable = false)
  private LocalDateTime data;
}
