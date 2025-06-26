import { PacienteRequest } from "../../types";
import axiosConfig from "../axiosConfig";

const prefix = "/paciente";

export const getPatientInfo = async (id?: string, cpf?: string) => {
  const response = await axiosConfig.get(`${prefix}/buscar`, {
    params: { id, cpf },
  });
  return response;
};

export const getAllPatients = async () => {
  const response = await axiosConfig.get(`${prefix}/todos`);
  return response;
};

export const updatePatientInfo = async (id: string, data: PacienteRequest) => {
  const response = await axiosConfig.put(`${prefix}/editar/${id}`, data);
  return response;
};

export const completeInfo = async (
  id: string,
  cpf: string,
  email: string,
  data: PacienteRequest
) => {
  const response = await axiosConfig.post(`${prefix}/completar`, data, {
    headers: {
      "X-User-Id": id,
      "X-User-Cpf": cpf,
      "X-User-Email": email,
    },
  });
  return response;
};

export const getPointsBalance = async () => {
  const response = await axiosConfig.get(`${prefix}/pontos/saldo`);
  return response;
};

export const getPointsHistory = async () => {
  const response = await axiosConfig.get(`${prefix}/pontos/historico`);
  return response;
};
