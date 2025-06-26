export interface MedicoModel {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  especialidade: string;
  ativo: boolean;
  crm: string;
  telefone: string;
}

export interface EspecialidadeModel {
  codigo: string;
  nome: string;
}
