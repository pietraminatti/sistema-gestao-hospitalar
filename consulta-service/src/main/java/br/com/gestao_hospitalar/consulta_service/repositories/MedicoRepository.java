package br.com.gestao_hospitalar.consulta_service.repositories;

import br.com.gestao_hospitalar.consulta_service.models.MedicoModel;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository para operações de persistência de Medico
 */
@Repository
public interface MedicoRepository extends JpaRepository<MedicoModel, UUID> {
  /**
   * Método que busca médicos por especialidade
   * O Spring Data JPA implementa automaticamente este método baseado na convenção
   * de nomenclatura
   *
   * @param especialidade código da especialidade médica
   * @return lista de médicos que pertencem à especialidade informada
   */
  List<MedicoModel> findByEspecialidade(String especialidade);

  /**
   * Busca médico por CRM
   */
  Optional<MedicoModel> findByCrm(String crm);

  /**
   * Busca médicos ativos
   */
  List<MedicoModel> findByAtivo(Boolean ativo);

  /**
   * Busca médicos por especialidade e que estejam ativos
   */
  List<MedicoModel> findByEspecialidadeAndAtivo(
    String especialidade,
    Boolean ativo
  );
}
