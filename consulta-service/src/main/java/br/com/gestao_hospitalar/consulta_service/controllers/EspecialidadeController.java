package br.com.gestao_hospitalar.consulta_service.controller;

import br.com.gestao_hospitalar.consulta_service.models.EspecialidadeModel;
import br.com.gestao_hospitalar.consulta_service.services.EspecialidadeService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class EspecialidadeController {

  @Autowired
  private EspecialidadeService especialidadeService;

  @GetMapping("/especialidades")
  public ResponseEntity<List<EspecialidadeModel>> findAll(
    @RequestParam(required = false) String nome
  ) {
    if (nome != null && !nome.isEmpty()) {
      return ResponseEntity.ok(especialidadeService.findByNome(nome));
    }

    return ResponseEntity.ok(especialidadeService.findAll());
  }

  @GetMapping("/especialidades/{codigo}")
  public ResponseEntity<EspecialidadeModel> findByCodigo(
    @PathVariable String codigo
  ) {
    return especialidadeService
      .findByCodigo(codigo)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping("/especialidades")
  public ResponseEntity<EspecialidadeModel> create(
    @RequestBody EspecialidadeModel especialidade
  ) {
    return ResponseEntity.status(HttpStatus.CREATED).body(
      especialidadeService.save(especialidade)
    );
  }

  @PutMapping("/especialidades/{codigo}")
  public ResponseEntity<EspecialidadeModel> update(
    @PathVariable String codigo,
    @RequestBody EspecialidadeModel especialidade
  ) {
    if (!especialidadeService.findByCodigo(codigo).isPresent()) {
      return ResponseEntity.notFound().build();
    }

    especialidade.setCodigo(codigo);
    return ResponseEntity.ok(especialidadeService.save(especialidade));
  }

  @DeleteMapping("/especialidades/{codigo}")
  public ResponseEntity<Void> delete(@PathVariable String codigo) {
    if (!especialidadeService.findByCodigo(codigo).isPresent()) {
      return ResponseEntity.notFound().build();
    }

    especialidadeService.deleteByCodigo(codigo);
    return ResponseEntity.noContent().build();
  }
}
