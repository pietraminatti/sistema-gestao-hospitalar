package br.com.gestao_hospitalar.consulta_service.repositories;

import br.com.gestao_hospitalar.consulta_service.models.EspecialidadeModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository para operações de persistência de Especialidade
 */
@Repository
public interface EspecialidadeRepository extends JpaRepository<EspecialidadeModel, String> {
    
    /**
     * Busca especialidades pelo nome (parcial, case insensitive)
     */
    List<EspecialidadeModel> findByNomeContainingIgnoreCase(String nome);
}