package br.com.gestao_hospitalar.consulta_service.services;

import br.com.gestao_hospitalar.consulta_service.models.ConsultaModel;
import br.com.gestao_hospitalar.consulta_service.repositories.ConsultaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ConsultaService {
    
    @Autowired
    private ConsultaRepository consultaRepository;
    
    public List<ConsultaModel> findAll() {
        return consultaRepository.findAll();
    }
    
    public Optional<ConsultaModel> findByCodigo(String codigo) {
        return consultaRepository.findById(codigo);
    }
    
    public List<ConsultaModel> findByEspecialidade(String especialidade) {
        return consultaRepository.findByEspecialidade(especialidade);
    }
    
    public List<ConsultaModel> findByMedico(String medico) {
        return consultaRepository.findByMedico(medico);
    }
    
    public List<ConsultaModel> findByStatus(String status) {
        return consultaRepository.findByStatus(status);
    }
    
    public List<ConsultaModel> findByDataBetween(LocalDateTime inicio, LocalDateTime fim) {
        return consultaRepository.findByDataBetween(inicio, fim);
    }
    
    public List<ConsultaModel> findConsultasDisponiveis() {
        return consultaRepository.findByVagasDisponiveisGreaterThan(0);
    }
    
    public List<ConsultaModel> findConsultasDisponiveisByEspecialidade(String especialidade) {
        return consultaRepository.findByEspecialidadeAndVagasDisponiveisGreaterThan(especialidade, 0);
    }
    
    public List<ConsultaModel> findConsultasDisponiveisByMedico(String medico) {
        return consultaRepository.findByMedicoAndVagasDisponiveisGreaterThan(medico, 0);
    }
    
    public ConsultaModel save(ConsultaModel consulta) {
        if (consulta.getCodigo() == null || consulta.getCodigo().isEmpty()) {
            consulta.setCodigo(UUID.randomUUID().toString());
        }
        return consultaRepository.save(consulta);
    }
    
    public void deleteByCodigo(String codigo) {
        consultaRepository.deleteById(codigo);
    }
    
    public ConsultaModel atualizarStatus(String codigo, String novoStatus) {
        Optional<ConsultaModel> consultaOpt = consultaRepository.findById(codigo);
        if (consultaOpt.isPresent()) {
            ConsultaModel consulta = consultaOpt.get();
            consulta.setStatus(novoStatus);
            return consultaRepository.save(consulta);
        }
        return null;
    }
    
    public ConsultaModel atualizarVagas(String codigo, int novasVagasDisponiveis) {
        Optional<ConsultaModel> consultaOpt = consultaRepository.findById(codigo);
        if (consultaOpt.isPresent()) {
            ConsultaModel consulta = consultaOpt.get();
            consulta.setVagasDisponiveis(novasVagasDisponiveis);
            return consultaRepository.save(consulta);
        }
        return null;
    }
    
    public ConsultaModel reservarVaga(String codigo) {
        Optional<ConsultaModel> consultaOpt = consultaRepository.findById(codigo);
        if (consultaOpt.isPresent()) {
            ConsultaModel consulta = consultaOpt.get();
            if (consulta.getVagasDisponiveis() > 0) {
                consulta.setVagasDisponiveis(consulta.getVagasDisponiveis() - 1);
                return consultaRepository.save(consulta);
            }
        }
        return null;
    }
    
    public ConsultaModel liberarVaga(String codigo) {
        Optional<ConsultaModel> consultaOpt = consultaRepository.findById(codigo);
        if (consultaOpt.isPresent()) {
            ConsultaModel consulta = consultaOpt.get();
            if (consulta.getVagasDisponiveis() < consulta.getVagasTotal()) {
                consulta.setVagasDisponiveis(consulta.getVagasDisponiveis() + 1);
                return consultaRepository.save(consulta);
            }
        }
        return null;
    }
}