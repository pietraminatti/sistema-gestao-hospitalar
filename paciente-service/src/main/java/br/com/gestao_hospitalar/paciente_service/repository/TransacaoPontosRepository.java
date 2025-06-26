package br.com.gestao_hospitalar.paciente_service.repository;

import br.com.gestao_hospitalar.paciente_service.entity.Paciente;
import br.com.gestao_hospitalar.paciente_service.entity.TransacaoPontos;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransacaoPontosRepository
  extends JpaRepository<TransacaoPontos, Long> {
  List<TransacaoPontos> findByPacienteOrderByDataDesc(Paciente paciente);
}
