package br.com.gestao_hospitalar.consulta_service.repositories;

import br.com.gestao_hospitalar.consulta_service.models.ConsultaModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository para operações de persistência de Consulta
 */
@Repository
public interface ConsultaRepository extends JpaRepository<ConsultaModel, String> {
    
    /**
     * Busca consultas por especialidade
     */
    List<ConsultaModel> findByEspecialidade(String especialidade);
    
    /**
     * Busca consultas por médico
     */
    List<ConsultaModel> findByMedico(String medico);
    
    /**
     * Busca consultas por status
     */
    List<ConsultaModel> findByStatus(String status);
    
    /**
     * Busca consultas dentro de um período de tempo
     */
    List<ConsultaModel> findByDataBetween(LocalDateTime inicio, LocalDateTime fim);
    
    /**
     * Busca consultas por especialidade e com vagas disponíveis
     */
    List<ConsultaModel> findByEspecialidadeAndVagasDisponiveisGreaterThan(String especialidade, int minVagas);
    
    /**
     * Busca consultas por médico e com vagas disponíveis
     */
    List<ConsultaModel> findByMedicoAndVagasDisponiveisGreaterThan(String medico, int minVagas);

    /**
    * Busca consultas com vagas disponíveis
    */
    List<ConsultaModel> findByVagasDisponiveisGreaterThan(int minVagas);
}
