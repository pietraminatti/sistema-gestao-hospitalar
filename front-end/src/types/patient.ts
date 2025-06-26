export interface PacienteRequest {
  nome: string;
  telefone: string;
  cep: string;
  numero: string;
  complemento?: string;
}
export interface PatientData {
  id?: string;
  cpf?: string;
  email?: string;
  nome: string;
  sobrenome?: string;
  telefone: string;
  logradouro?: string;
  numero: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep: string;
  pontos?: number;
}
