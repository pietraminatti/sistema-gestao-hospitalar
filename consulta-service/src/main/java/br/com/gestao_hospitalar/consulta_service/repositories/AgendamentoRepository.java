package br.com.gestao_hospitalar.consulta_service.repositories;

import br.com.gestao_hospitalar.consulta_service.models.AgendamentoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository para operações de persistência de Agendamento
 */
@Repository
public interface AgendamentoRepository extends JpaRepository<AgendamentoModel, String> {
    
    /**
     * Busca agendamentos pelo código do paciente
     */
    List<AgendamentoModel> findByCodigoPaciente(String codigoPaciente);
    
    /**
     * Busca agendamentos pelo código do médico
     */
    List<AgendamentoModel> findByMedico(String medico);
    
    /**
     * Busca agendamentos por status
     */
    List<AgendamentoModel> findByStatus(String status);
    
    /**
     * Busca agendamentos dentro de um período
     */
    List<AgendamentoModel> findByDataBetween(LocalDateTime inicio, LocalDateTime fim);
}