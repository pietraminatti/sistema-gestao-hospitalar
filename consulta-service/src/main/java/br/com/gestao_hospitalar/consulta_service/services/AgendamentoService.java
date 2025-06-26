package br.com.gestao_hospitalar.consulta_service.services;

import br.com.gestao_hospitalar.consulta_service.models.AgendamentoModel;
import br.com.gestao_hospitalar.consulta_service.repositories.AgendamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AgendamentoService {
    
    @Autowired
    private AgendamentoRepository agendamentoRepository;
    
    public List<AgendamentoModel> findAll() {
        return agendamentoRepository.findAll();
    }
    
    public Optional<AgendamentoModel> findById(String id) {
        return agendamentoRepository.findById(id);
    }
    
    public List<AgendamentoModel> findByCodigoPaciente(String codigoPaciente) {
        return agendamentoRepository.findByCodigoPaciente(codigoPaciente);
    }
    
    public List<AgendamentoModel> findByMedico(String medico) {
        return agendamentoRepository.findByMedico(medico);
    }
    
    public List<AgendamentoModel> findByStatus(String status) {
        return agendamentoRepository.findByStatus(status);
    }
    
    public List<AgendamentoModel> findByDataBetween(LocalDateTime inicio, LocalDateTime fim) {
        return agendamentoRepository.findByDataBetween(inicio, fim);
    }
    
    public AgendamentoModel save(AgendamentoModel agendamento) {
        if (agendamento.getId() == null || agendamento.getId().isEmpty()) {
            agendamento.setId(UUID.randomUUID().toString());
        }
        return agendamentoRepository.save(agendamento);
    }
    
    public void deleteById(String id) {
        agendamentoRepository.deleteById(id);
    }
    
    public AgendamentoModel atualizarStatus(String id, String novoStatus) {
        Optional<AgendamentoModel> agendamentoOpt = agendamentoRepository.findById(id);
        if (agendamentoOpt.isPresent()) {
            AgendamentoModel agendamento = agendamentoOpt.get();
            agendamento.setStatus(novoStatus);
            return agendamentoRepository.save(agendamento);
        }
        return null;
    }
}