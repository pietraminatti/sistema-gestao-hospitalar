package br.com.gestao_hospitalar.consulta_service.models;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "medico")
public class MedicoModel {

  @Id
  private UUID id;

  @Column(nullable = false)
  private String nome;

  @Column(nullable = false)
  private String especialidade;

  @Column(nullable = false)
  private String telefone;

  @Column(nullable = false, unique = true)
  private String crm;

  @Column(nullable = false)
  private Boolean ativo;

  @Column(nullable = false, unique = true)
  private String cpf;

  @Column(nullable = false, unique = true)
  private String email;

  // Construtores
  public MedicoModel() {}

  public MedicoModel(
    UUID id,
    String nome,
    String especialidade,
    String telefone,
    String crm,
    String cpf,
    String email
  ) {
    this.id = id;
    this.nome = nome;
    this.especialidade = especialidade;
    this.telefone = telefone;
    this.crm = crm;
    this.ativo = true;
    this.cpf = cpf;
    this.email = email;
  }

  // Getters e Setters
  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public String getNome() {
    return nome;
  }

  public void setNome(String nome) {
    this.nome = nome;
  }

  public String getEspecialidade() {
    return especialidade;
  }

  public void setEspecialidade(String especialidade) {
    this.especialidade = especialidade;
  }

  public String getTelefone() {
    return telefone;
  }

  public void setTelefone(String telefone) {
    this.telefone = telefone;
  }

  public String getCrm() {
    return crm;
  }

  public void setCrm(String crm) {
    this.crm = crm;
  }

  public Boolean getAtivo() {
    return ativo;
  }

  public void setAtivo(Boolean ativo) {
    this.ativo = ativo;
  }

  public String getCpf() {
    return cpf;
  }

  public void setCpf(String cpf) {
    this.cpf = cpf;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }
}
