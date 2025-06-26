export interface ConsultaModel {
  codigo?: string;
  especialidade?: string;
  medico?: string;
  status?: string;
  data?: string;
  vagasDisponiveis?: number;
  vagasTotal?: number;
  valor?: number;
}

export interface AgendamentoModel {
  id: string;
  codigoConsulta: string;
  codigoPaciente: string;
  data: string; // ISO string (LocalDateTime)
  especialidade: string;
  medico: string;
  valor: number;
  pontosUsados: number;
  valorPago: number;
  status: string;
}
