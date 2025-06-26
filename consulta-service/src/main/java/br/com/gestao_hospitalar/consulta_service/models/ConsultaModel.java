package br.com.gestao_hospitalar.consulta_service.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "consulta")
public class ConsultaModel {

  @Id
  private String codigo;

  @Column(nullable = false)
  private LocalDateTime data;

  @Column(nullable = false)
  private String especialidade;

  @Column(nullable = false)
  private String medico;

  @Column(nullable = false)
  private double valor;

  @Column(nullable = false)
  private int vagasTotal;

  @Column(nullable = false)
  private int vagasDisponiveis;

  @Column(nullable = false)
  private String status;

  // Construtores
  public ConsultaModel() {}

  public ConsultaModel(
    String codigo,
    LocalDateTime data,
    String especialidade,
    String medico,
    double valor,
    int vagasTotal,
    int vagasDisponiveis,
    String status
  ) {
    this.codigo = codigo;
    this.data = data;
    this.especialidade = especialidade;
    this.medico = medico;
    this.valor = valor;
    this.vagasTotal = vagasTotal;
    this.vagasDisponiveis = vagasDisponiveis;
    this.status = status;
  }

  // Getters e Setters
  public String getCodigo() {
    return codigo;
  }

  public void setCodigo(String codigo) {
    this.codigo = codigo;
  }

  public LocalDateTime getData() {
    return data;
  }

  public void setData(LocalDateTime data) {
    this.data = data;
  }

  public String getEspecialidade() {
    return especialidade;
  }

  public void setEspecialidade(String especialidade) {
    this.especialidade = especialidade;
  }

  public String getMedico() {
    return medico;
  }

  public void setMedico(String medico) {
    this.medico = medico;
  }

  public double getValor() {
    return valor;
  }

  public void setValor(double valor) {
    this.valor = valor;
  }

  public int getVagasTotal() {
    return vagasTotal;
  }

  public void setVagasTotal(int vagasTotal) {
    this.vagasTotal = vagasTotal;
  }

  public int getVagasDisponiveis() {
    return vagasDisponiveis;
  }

  public void setVagasDisponiveis(int vagasDisponiveis) {
    this.vagasDisponiveis = vagasDisponiveis;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }
}
