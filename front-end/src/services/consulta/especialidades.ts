import axiosConfig from "../axiosConfig";

const prefix = "/consulta";

export interface EspecialidadeModel {
  codigo?: string;
  nome: string;
}

export const getAllEspecialidades = async (nome?: string) => {
  const params: Record<string, string> = {};
  if (nome) params.nome = nome;
  return axiosConfig.get<EspecialidadeModel[]>(`${prefix}/especialidades`, {
    params,
  });
};

export const getEspecialidadeByCodigo = async (codigo: string) => {
  return axiosConfig.get<EspecialidadeModel>(
    `${prefix}/especialidades/${codigo}`
  );
};

export const createEspecialidade = async (
  especialidade: EspecialidadeModel
) => {
  return axiosConfig.post<EspecialidadeModel>(
    `${prefix}/especialidades`,
    especialidade
  );
};

export const updateEspecialidade = async (
  codigo: string,
  especialidade: EspecialidadeModel
) => {
  return axiosConfig.put<EspecialidadeModel>(
    `${prefix}/especialidades/${codigo}`,
    especialidade
  );
};

export const deleteEspecialidade = async (codigo: string) => {
  return axiosConfig.delete(`${prefix}/especialidades/${codigo}`);
};
