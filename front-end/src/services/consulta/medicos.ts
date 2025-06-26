import { MedicoModel } from "../../types";
import axiosConfig from "../axiosConfig";

const prefix = "/consulta";

export const getAllMedicos = async (
  especialidade?: string,
  ativo?: boolean
) => {
  const params: Record<string, string | boolean> = {};
  if (especialidade) params.especialidade = especialidade;
  if (ativo !== undefined) params.ativo = ativo;
  return axiosConfig.get<MedicoModel[]>(`${prefix}/medicos`, { params });
};

export const getMedicoById = async (id: string) => {
  return axiosConfig.get<MedicoModel>(`${prefix}/medicos/${id}`);
};

export const createMedico = async (
  medico: MedicoModel,
  userId: string,
  cpf: string,
  email: string
) => {
  return axiosConfig.post<MedicoModel>(`${prefix}/medicos`, medico, {
    headers: {
      "x-user-id": userId,
      "x-user-cpf": cpf,
      "x-user-email": email,
    },
  });
};

export const updateMedico = async (id: string, medico: MedicoModel) => {
  return axiosConfig.put<MedicoModel>(`${prefix}/medicos/${id}`, medico);
};

export const deleteMedico = async (id: string) => {
  return axiosConfig.delete(`${prefix}/medicos/${id}`);
};

export const getMedicoByCrm = async (crm: string) => {
  return axiosConfig.get<MedicoModel>(`${prefix}/crm/${crm}`);
};
