package br.com.gestao_hospitalar.paciente_service.repository;

import br.com.gestao_hospitalar.paciente_service.entity.Transacao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TransacaoRepository extends JpaRepository<Transacao, Long> {
}