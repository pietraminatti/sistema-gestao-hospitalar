package br.com.gestao_hospitalar.paciente_service.service;

import br.com.gestao_hospitalar.paciente_service.dto.PacienteRequestDTO;
import br.com.gestao_hospitalar.paciente_service.dto.PacienteResponseDTO;
import br.com.gestao_hospitalar.paciente_service.dto.TransacaoPontosResponseDTO;
import br.com.gestao_hospitalar.paciente_service.entity.Paciente;
import br.com.gestao_hospitalar.paciente_service.entity.TransacaoPontos;
import br.com.gestao_hospitalar.paciente_service.exception.ApiException;
import br.com.gestao_hospitalar.paciente_service.repository.PacienteRepository;
import br.com.gestao_hospitalar.paciente_service.repository.TransacaoPontosRepository;
import br.com.gestao_hospitalar.paciente_service.via_cep.ViaCepResponse;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class PacienteService {

  @Value("${stripe.secret}")
  private String stripeSecret;

  @Autowired
  private PacienteRepository pacienteRepository;

  @Autowired
  private TransacaoPontosRepository transacaoPontosRepository;

  private final RestTemplate restTemplate = new RestTemplate();

  public PacienteResponseDTO completarCadastro(
    UUID id,
    String cpf,
    String email,
    PacienteRequestDTO dto
  ) {
    Paciente paciente = pacienteRepository
      .findById(id)
      .orElseGet(() -> {
        Paciente novoPaciente = new Paciente();
        novoPaciente.setId(id);
        novoPaciente.setCpf(cpf);
        novoPaciente.setEmail(email);
        novoPaciente.setPontos(0); // pontos iniciais
        return novoPaciente;
      });

    paciente.setNome(dto.getNome());
    paciente.setTelefone(dto.getTelefone());
    paciente.setCep(dto.getCep());
    paciente.setNumero(dto.getNumero());
    paciente.setComplemento(dto.getComplemento());

    preencherEnderecoViaCep(paciente, dto.getCep());

    pacienteRepository.save(paciente);

    return toResponseDTO(paciente);
  }

  public PacienteResponseDTO buscarPacientePorIdOuCpf(UUID id, String cpf) {
    Paciente paciente = null;

    if (id != null) {
      paciente = pacienteRepository.findById(id).orElse(null);
    } else if (cpf != null) {
      paciente = pacienteRepository.findByCpf(cpf).orElse(null);
    }

    if (paciente == null) {
      throw new ApiException("Paciente não encontrado", HttpStatus.NOT_FOUND);
    }

    return toResponseDTO(paciente);
  }

  public List<PacienteResponseDTO> buscarTodosPacientes() {
    return pacienteRepository
      .findAll()
      .stream()
      .map(this::toResponseDTO)
      .collect(Collectors.toList());
  }

  public PacienteResponseDTO editarPaciente(UUID id, PacienteRequestDTO dto) {
    Paciente paciente = pacienteRepository
      .findById(id)
      .orElseThrow(() ->
        new ApiException("Paciente não encontrado", HttpStatus.NOT_FOUND)
      );

    paciente.setNome(dto.getNome());
    paciente.setTelefone(dto.getTelefone());
    paciente.setCep(dto.getCep());
    paciente.setNumero(dto.getNumero());
    paciente.setComplemento(dto.getComplemento());

    preencherEnderecoViaCep(paciente, dto.getCep());

    pacienteRepository.save(paciente);

    return toResponseDTO(paciente);
  }

  private void preencherEnderecoViaCep(Paciente paciente, String cep) {
    try {
      String url = "https://viacep.com.br/ws/" + cep + "/json/";
      ViaCepResponse response = restTemplate.getForObject(
        url,
        ViaCepResponse.class
      );

      boolean cepValido =
        response != null &&
        response.getCep() != null &&
        (response.getErro() == null ||
          Boolean.FALSE.equals(response.getErro()));

      if (cepValido) {
        paciente.setLogradouro(response.getLogradouro());
        paciente.setBairro(response.getBairro());
        paciente.setCidade(response.getLocalidade());
        paciente.setEstado(response.getUf());
      } else {
        throw new ApiException(
          "CEP inválido ou não encontrado",
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (Exception e) {
      throw new ApiException(
        "Erro ao consultar ViaCEP: " + e.getMessage(),
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private PacienteResponseDTO toResponseDTO(Paciente paciente) {
    return new PacienteResponseDTO(paciente);
  }

  public int consultarSaldo(UUID id) {
    Paciente paciente = pacienteRepository
      .findById(id)
      .orElseThrow(() ->
        new ApiException("Paciente não encontrado", HttpStatus.NOT_FOUND)
      );
    return paciente.getPontos();
  }

  public List<TransacaoPontosResponseDTO> consultarHistorico(UUID id) {
    Paciente paciente = pacienteRepository
      .findById(id)
      .orElseThrow(() ->
        new ApiException("Paciente não encontrado", HttpStatus.NOT_FOUND)
      );
    List<TransacaoPontos> transacoes =
      transacaoPontosRepository.findByPacienteOrderByDataDesc(paciente);

    return transacoes
      .stream()
      .map(t -> {
        TransacaoPontosResponseDTO dto = new TransacaoPontosResponseDTO();
        dto.setTipo(t.getTipo());
        dto.setDescricao(t.getDescricao());
        dto.setQuantidade(t.getQuantidade());
        dto.setValorReais(t.getValorReais());
        dto.setData(t.getData());
        return dto;
      })
      .collect(Collectors.toList());
  }
  // Removido Stripe temporariamente
}
