package br.com.gestao_hospitalar.consulta_service.services;

import br.com.gestao_hospitalar.consulta_service.models.EspecialidadeModel;
import br.com.gestao_hospitalar.consulta_service.repositories.EspecialidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EspecialidadeService {
    
    @Autowired
    private EspecialidadeRepository especialidadeRepository;
    
    public List<EspecialidadeModel> findAll() {
        return especialidadeRepository.findAll();
    }
    
    public Optional<EspecialidadeModel> findByCodigo(String codigo) {
        return especialidadeRepository.findById(codigo);
    }
    
    public List<EspecialidadeModel> findByNome(String nome) {
        return especialidadeRepository.findByNomeContainingIgnoreCase(nome);
    }
    
    public EspecialidadeModel save(EspecialidadeModel especialidade) {
        if (especialidade.getCodigo() == null || especialidade.getCodigo().isEmpty()) {
            especialidade.setCodigo(UUID.randomUUID().toString());
        }
        return especialidadeRepository.save(especialidade);
    }
    
    public void deleteByCodigo(String codigo) {
        especialidadeRepository.deleteById(codigo);
    }
}