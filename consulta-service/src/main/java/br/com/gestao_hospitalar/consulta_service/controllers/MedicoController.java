package br.com.gestao_hospitalar.consulta_service.controller;

import br.com.gestao_hospitalar.consulta_service.models.MedicoModel;
import br.com.gestao_hospitalar.consulta_service.services.MedicoService;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class MedicoController {

  @Autowired
  private MedicoService medicoService;

  @GetMapping("/medicos")
  public ResponseEntity<List<MedicoModel>> findAll(
    @RequestParam(required = false) String especialidade,
    @RequestParam(required = false) Boolean ativo
  ) {
    if (especialidade != null && !especialidade.isEmpty() && ativo != null) {
      return ResponseEntity.ok(
        medicoService.findByEspecialidadeAndAtivo(especialidade, ativo)
      );
    } else if (especialidade != null && !especialidade.isEmpty()) {
      return ResponseEntity.ok(
        medicoService.findByEspecialidade(especialidade)
      );
    } else if (ativo != null) {
      return ResponseEntity.ok(medicoService.findByAtivo(ativo));
    }

    return ResponseEntity.ok(medicoService.findAll());
  }

  @GetMapping("/medicos/{id}")
  public ResponseEntity<MedicoModel> findById(@PathVariable UUID id) {
    return medicoService
      .findById(id)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping("/medicos")
  public ResponseEntity<MedicoModel> create(
    @RequestHeader("x-user-id") UUID id,
    @RequestHeader("x-user-cpf") String cpf,
    @RequestHeader("x-user-email") String email,
    @RequestBody MedicoModel medico
  ) {
    medico.setId(id);
    medico.setCpf(cpf);
    medico.setEmail(email);
    return ResponseEntity.status(HttpStatus.CREATED).body(
      medicoService.save(medico)
    );
  }

  @PutMapping("/medicos/{id}")
  public ResponseEntity<MedicoModel> update(
    @PathVariable UUID id,
    @RequestBody MedicoModel medico
  ) {
    if (!medicoService.findById(id).isPresent()) {
      return ResponseEntity.notFound().build();
    }

    medico.setId(id);
    return ResponseEntity.ok(medicoService.save(medico));
  }

  @DeleteMapping("/medicos/{id}")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    if (!medicoService.findById(id).isPresent()) {
      return ResponseEntity.notFound().build();
    }

    medicoService.deleteById(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/crm/{crm}")
  public ResponseEntity<MedicoModel> findByCrm(@PathVariable String crm) {
    return medicoService
      .findByCrm(crm)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }
}
