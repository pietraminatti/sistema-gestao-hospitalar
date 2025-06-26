package br.com.gestao_hospitalar.consulta_service.controller;

import br.com.gestao_hospitalar.consulta_service.models.AgendamentoModel;
import br.com.gestao_hospitalar.consulta_service.services.AgendamentoService;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class AgendamentoController {

  @Autowired
  private AgendamentoService agendamentoService;

  @GetMapping("/agendamentos")
  public ResponseEntity<List<AgendamentoModel>> findAll(
    @RequestParam(required = false) String status,
    @RequestParam(required = false) String paciente,
    @RequestParam(required = false) String medico
  ) {
    if (status != null && !status.isEmpty()) {
      return ResponseEntity.ok(agendamentoService.findByStatus(status));
    }

    if (paciente != null && !paciente.isEmpty()) {
      return ResponseEntity.ok(
        agendamentoService.findByCodigoPaciente(paciente)
      );
    }

    if (medico != null && !medico.isEmpty()) {
      return ResponseEntity.ok(agendamentoService.findByMedico(medico));
    }

    return ResponseEntity.ok(agendamentoService.findAll());
  }

  @GetMapping("/agendamentos/{id}")
  public ResponseEntity<AgendamentoModel> findById(@PathVariable String id) {
    return agendamentoService
      .findById(id)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("/agendamentos/periodo")
  public ResponseEntity<List<AgendamentoModel>> findByPeriodo(
    @RequestParam @DateTimeFormat(
      iso = DateTimeFormat.ISO.DATE_TIME
    ) LocalDateTime inicio,
    @RequestParam @DateTimeFormat(
      iso = DateTimeFormat.ISO.DATE_TIME
    ) LocalDateTime fim
  ) {
    return ResponseEntity.ok(agendamentoService.findByDataBetween(inicio, fim));
  }

  @PostMapping("/agendamentos")
  public ResponseEntity<AgendamentoModel> create(
    @RequestBody AgendamentoModel agendamento
  ) {
    return ResponseEntity.status(HttpStatus.CREATED).body(
      agendamentoService.save(agendamento)
    );
  }

  @PutMapping("/agendamentos/{id}")
  public ResponseEntity<AgendamentoModel> update(
    @PathVariable String id,
    @RequestBody AgendamentoModel agendamento
  ) {
    if (!agendamentoService.findById(id).isPresent()) {
      return ResponseEntity.notFound().build();
    }

    agendamento.setId(id);
    return ResponseEntity.ok(agendamentoService.save(agendamento));
  }

  @PatchMapping("/agendamentos/status/{id}")
  public ResponseEntity<AgendamentoModel> atualizarStatus(
    @PathVariable String id,
    @RequestParam String status
  ) {
    AgendamentoModel agendamentoAtualizado = agendamentoService.atualizarStatus(
      id,
      status
    );
    if (agendamentoAtualizado != null) {
      return ResponseEntity.ok(agendamentoAtualizado);
    }
    return ResponseEntity.notFound().build();
  }

  @DeleteMapping("/agendamentos/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    if (!agendamentoService.findById(id).isPresent()) {
      return ResponseEntity.notFound().build();
    }

    agendamentoService.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}
