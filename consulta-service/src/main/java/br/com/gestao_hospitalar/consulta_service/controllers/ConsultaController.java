package br.com.gestao_hospitalar.consulta_service.controller;

import br.com.gestao_hospitalar.consulta_service.models.ConsultaModel;
import br.com.gestao_hospitalar.consulta_service.services.ConsultaService;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class ConsultaController {

  @Autowired
  private ConsultaService consultaService;

  @GetMapping("/consultas")
  public ResponseEntity<List<ConsultaModel>> findAll(
    @RequestParam(required = false) String especialidade,
    @RequestParam(required = false) String medico,
    @RequestParam(required = false) String status,
    @RequestParam(required = false) Boolean disponiveis
  ) {
    if (Boolean.TRUE.equals(disponiveis)) {
      return ResponseEntity.ok(consultaService.findConsultasDisponiveis());
    }

    if (
      especialidade != null &&
      !especialidade.isEmpty() &&
      Boolean.TRUE.equals(disponiveis)
    ) {
      return ResponseEntity.ok(
        consultaService.findConsultasDisponiveisByEspecialidade(especialidade)
      );
    } else if (especialidade != null && !especialidade.isEmpty()) {
      return ResponseEntity.ok(
        consultaService.findByEspecialidade(especialidade)
      );
    }

    if (
      medico != null && !medico.isEmpty() && Boolean.TRUE.equals(disponiveis)
    ) {
      return ResponseEntity.ok(
        consultaService.findConsultasDisponiveisByMedico(medico)
      );
    } else if (medico != null && !medico.isEmpty()) {
      return ResponseEntity.ok(consultaService.findByMedico(medico));
    }

    if (status != null && !status.isEmpty()) {
      return ResponseEntity.ok(consultaService.findByStatus(status));
    }

    return ResponseEntity.ok(consultaService.findAll());
  }

  @GetMapping("/consultas/{codigo}")
  public ResponseEntity<ConsultaModel> findByCodigo(
    @PathVariable String codigo
  ) {
    return consultaService
      .findByCodigo(codigo)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("/consultas/periodo")
  public ResponseEntity<List<ConsultaModel>> findByPeriodo(
    @RequestParam @DateTimeFormat(
      iso = DateTimeFormat.ISO.DATE_TIME
    ) LocalDateTime inicio,
    @RequestParam @DateTimeFormat(
      iso = DateTimeFormat.ISO.DATE_TIME
    ) LocalDateTime fim
  ) {
    return ResponseEntity.ok(consultaService.findByDataBetween(inicio, fim));
  }

  @PostMapping("/consultas")
  public ResponseEntity<ConsultaModel> create(
    @RequestBody ConsultaModel consulta
  ) {
    return ResponseEntity.status(HttpStatus.CREATED).body(
      consultaService.save(consulta)
    );
  }

  @PutMapping("/consultas/{codigo}")
  public ResponseEntity<ConsultaModel> update(
    @PathVariable String codigo,
    @RequestBody ConsultaModel consulta
  ) {
    if (!consultaService.findByCodigo(codigo).isPresent()) {
      return ResponseEntity.notFound().build();
    }

    consulta.setCodigo(codigo);
    return ResponseEntity.ok(consultaService.save(consulta));
  }

  @PatchMapping("/consultas/status/{codigo}")
  public ResponseEntity<ConsultaModel> atualizarStatus(
    @PathVariable String codigo,
    @RequestParam String status
  ) {
    ConsultaModel consultaAtualizada = consultaService.atualizarStatus(
      codigo,
      status
    );
    if (consultaAtualizada != null) {
      return ResponseEntity.ok(consultaAtualizada);
    }
    return ResponseEntity.notFound().build();
  }

  @PatchMapping("/consultas/vagas/{codigo}")
  public ResponseEntity<ConsultaModel> atualizarVagas(
    @PathVariable String codigo,
    @RequestParam int vagasDisponiveis
  ) {
    ConsultaModel consultaAtualizada = consultaService.atualizarVagas(
      codigo,
      vagasDisponiveis
    );
    if (consultaAtualizada != null) {
      return ResponseEntity.ok(consultaAtualizada);
    }
    return ResponseEntity.notFound().build();
  }

  @PatchMapping("/consultas/reservar/{codigo}")
  public ResponseEntity<ConsultaModel> reservarVaga(
    @PathVariable String codigo
  ) {
    ConsultaModel consultaAtualizada = consultaService.reservarVaga(codigo);
    if (consultaAtualizada != null) {
      return ResponseEntity.ok(consultaAtualizada);
    }
    return ResponseEntity.badRequest().build();
  }

  @PatchMapping("/consultas/liberar/{codigo}")
  public ResponseEntity<ConsultaModel> liberarVaga(
    @PathVariable String codigo
  ) {
    ConsultaModel consultaAtualizada = consultaService.liberarVaga(codigo);
    if (consultaAtualizada != null) {
      return ResponseEntity.ok(consultaAtualizada);
    }
    return ResponseEntity.badRequest().build();
  }

  @DeleteMapping("/consultas/{codigo}")
  public ResponseEntity<Void> delete(@PathVariable String codigo) {
    if (!consultaService.findByCodigo(codigo).isPresent()) {
      return ResponseEntity.notFound().build();
    }

    consultaService.deleteByCodigo(codigo);
    return ResponseEntity.noContent().build();
  }
}
