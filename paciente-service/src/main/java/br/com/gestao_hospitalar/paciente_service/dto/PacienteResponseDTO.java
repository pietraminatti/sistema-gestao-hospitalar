package br.com.gestao_hospitalar.paciente_service.dto;

import br.com.gestao_hospitalar.paciente_service.entity.Paciente;
import java.util.UUID;
import lombok.Data;

@Data
public class PacienteResponseDTO {

  private UUID id;
  private String cpf;
  private String email;
  private String nome;
  private String telefone;

  private String cep;
  private String logradouro;
  private String numero;
  private String complemento;
  private String bairro;
  private String cidade;
  private String estado;

  private Integer pontos;

  // Construtor que recebe um objeto Paciente
  public PacienteResponseDTO(Paciente paciente) {
    this.id = paciente.getId();
    this.cpf = paciente.getCpf();
    this.email = paciente.getEmail();
    this.nome = paciente.getNome();
    this.telefone = paciente.getTelefone();
    this.cep = paciente.getCep();
    this.logradouro = paciente.getLogradouro();
    this.numero = paciente.getNumero();
    this.complemento = paciente.getComplemento();
    this.bairro = paciente.getBairro();
    this.cidade = paciente.getCidade();
    this.estado = paciente.getEstado();
    this.pontos = paciente.getPontos();
  }
}
