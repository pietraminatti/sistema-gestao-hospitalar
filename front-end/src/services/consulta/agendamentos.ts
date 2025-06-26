import { AgendamentoModel } from "../../types";
import axiosConfig from "../axiosConfig";

const prefix = "/consulta";

export const getAllAgendamentos = async (
  status?: string,
  paciente?: string,
  medico?: string
) => {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (paciente) params.paciente = paciente;
  if (medico) params.medico = medico;
  return axiosConfig.get<AgendamentoModel[]>(`${prefix}/agendamentos`, {
    params,
  });
};

export const getAgendamentoById = async (id: string) => {
  return axiosConfig.get<AgendamentoModel>(`${prefix}/agendamentos/${id}`);
};

export const getAgendamentosByPeriodo = async (inicio: string, fim: string) => {
  return axiosConfig.get<AgendamentoModel[]>(`${prefix}/agendamentos/periodo`, {
    params: { inicio, fim },
  });
};

export const createAgendamento = async (agendamento: AgendamentoModel) => {
  return axiosConfig.post<AgendamentoModel>(
    `${prefix}/agendamentos`,
    agendamento
  );
};

export const updateAgendamento = async (
  id: string,
  agendamento: AgendamentoModel
) => {
  return axiosConfig.put<AgendamentoModel>(
    `${prefix}/agendamentos/${id}`,
    agendamento
  );
};

export const patchStatusAgendamento = async (id: string, status: string) => {
  return axiosConfig.patch<AgendamentoModel>(
    `${prefix}/agendamentos/status/${id}`,
    null,
    {
      params: { status },
    }
  );
};

export const deleteAgendamento = async (id: string) => {
  return axiosConfig.delete(`${prefix}/agendamentos/${id}`);
};
