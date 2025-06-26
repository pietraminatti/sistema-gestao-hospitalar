package br.com.gestao_hospitalar.paciente_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Data
@Table(name = "transacao")
public class Transacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false)
    private Integer pontos; 

    @Column(nullable = false)
    private BigDecimal valor; // Valor em R$

    @Column(nullable = false)
    private LocalDateTime dataTransacao;
}