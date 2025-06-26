package br.com.gestao_hospitalar.consulta_service.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "agendamento")
public class AgendamentoModel {

  @Id
  private String id;

  @Column(nullable = false)
  private String codigoConsulta;

  @Column(nullable = false)
  private String codigoPaciente;

  @Column(nullable = false)
  private LocalDateTime data;

  @Column(nullable = false)
  private String especialidade;

  @Column(nullable = false)
  private String medico;

  @Column(nullable = false)
  private double valor;

  @Column(nullable = false)
  private int pontosUsados;

  @Column(nullable = false)
  private double valorPago;

  @Column(nullable = false)
  private String status;

  // Construtores
  public AgendamentoModel() {}

  public AgendamentoModel(
    String id,
    String codigoConsulta,
    String codigoPaciente,
    LocalDateTime data,
    String especialidade,
    String medico,
    double valor,
    int pontosUsados,
    double valorPago,
    String status
  ) {
    this.id = id;
    this.codigoConsulta = codigoConsulta;
    this.codigoPaciente = codigoPaciente;
    this.data = data;
    this.especialidade = especialidade;
    this.medico = medico;
    this.valor = valor;
    this.pontosUsados = pontosUsados;
    this.valorPago = valorPago;
    this.status = status;
  }

  // Getters e Setters
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getCodigoConsulta() {
    return codigoConsulta;
  }

  public void setCodigoConsulta(String codigoConsulta) {
    this.codigoConsulta = codigoConsulta;
  }

  public String getCodigoPaciente() {
    return codigoPaciente;
  }

  public void setCodigoPaciente(String codigoPaciente) {
    this.codigoPaciente = codigoPaciente;
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

  public int getPontosUsados() {
    return pontosUsados;
  }

  public void setPontosUsados(int pontosUsados) {
    this.pontosUsados = pontosUsados;
  }

  public double getValorPago() {
    return valorPago;
  }

  public void setValorPago(double valorPago) {
    this.valorPago = valorPago;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }
}
