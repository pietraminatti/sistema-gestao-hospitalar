import { ConsultaModel } from "../../types";
import axiosConfig from "../axiosConfig";

const prefix = "/consulta";

export const getAllConsultas = async (
  especialidade?: string,
  medico?: string,
  status?: string,
  disponiveis?: boolean
) => {
  const params: Record<string, string | boolean> = {};
  if (especialidade) params.especialidade = especialidade;
  if (medico) params.medico = medico;
  if (status) params.status = status;
  if (disponiveis !== undefined) params.disponiveis = disponiveis;
  return axiosConfig.get<ConsultaModel[]>(`${prefix}/consultas`, { params });
};

export const getConsultaByCodigo = async (codigo: string) => {
  return axiosConfig.get<ConsultaModel>(`${prefix}/consultas/${codigo}`);
};

export const getConsultasByPeriodo = async (inicio: string, fim: string) => {
  return axiosConfig.get<ConsultaModel[]>(`${prefix}/consultas/periodo`, {
    params: { inicio, fim },
  });
};

export const createConsulta = async (consulta: ConsultaModel) => {
  return axiosConfig.post<ConsultaModel>(`${prefix}/consultas`, consulta);
};

export const updateConsulta = async (
  codigo: string,
  consulta: ConsultaModel
) => {
  return axiosConfig.put<ConsultaModel>(
    `${prefix}/consultas/${codigo}`,
    consulta
  );
};

export const patchStatusConsulta = async (codigo: string, status: string) => {
  return axiosConfig.patch<ConsultaModel>(
    `${prefix}/consultas/status/${codigo}`,
    null,
    {
      params: { status },
    }
  );
};

export const patchVagasConsulta = async (
  codigo: string,
  vagasDisponiveis: number
) => {
  return axiosConfig.patch<ConsultaModel>(
    `${prefix}/consultas/vagas/${codigo}`,
    null,
    {
      params: { vagasDisponiveis },
    }
  );
};

export const reservarVagaConsulta = async (codigo: string) => {
  return axiosConfig.patch<ConsultaModel>(
    `${prefix}/consultas/reservar/${codigo}`
  );
};

export const liberarVagaConsulta = async (codigo: string) => {
  return axiosConfig.patch<ConsultaModel>(
    `${prefix}/consultas/liberar/${codigo}`
  );
};

export const deleteConsulta = async (codigo: string) => {
  return axiosConfig.delete(`${prefix}/consultas/${codigo}`);
};
