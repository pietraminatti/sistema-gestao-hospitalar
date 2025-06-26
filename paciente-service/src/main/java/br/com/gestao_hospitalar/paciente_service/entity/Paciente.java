package br.com.gestao_hospitalar.paciente_service.entity;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.Data;

@Data
@Entity
@Table(name = "paciente")
public class Paciente {

  @Id
  @Column(name = "id", nullable = false, unique = true)
  private UUID id;

  @Column(name = "cpf", nullable = false, length = 14, unique = true)
  private String cpf;

  @Column(name = "email", nullable = false, length = 100, unique = true)
  private String email;

  @Column(name = "nome", nullable = false, length = 100)
  private String nome;

  @Column(name = "telefone", length = 20)
  private String telefone;

  @Column(name = "cep", length = 9)
  private String cep;

  @Column(name = "logradouro", length = 150)
  private String logradouro;

  @Column(name = "numero", length = 10)
  private String numero;

  @Column(name = "complemento", length = 50)
  private String complemento;

  @Column(name = "bairro", length = 100)
  private String bairro;

  @Column(name = "cidade", length = 100)
  private String cidade;

  @Column(name = "estado", length = 2)
  private String estado;

  @Column(name = "pontos")
  private Integer pontos;
}
