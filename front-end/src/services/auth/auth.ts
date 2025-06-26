import axiosConfig from "../axiosConfig";

const prefix = "/auth";

/** Login do usuário */
export const login = async (identifier: string, password: string) => {
  return axiosConfig.post(`${prefix}/login`, { identifier, password });
};

/** Cadastro do usuário  */
export const signUp = async (cpf: string, email: string, type: string) => {
  return axiosConfig.post(`${prefix}/register`, { cpf, email, type });
};

/** Esqueci minha senha */
export const resetPassword = async (email: string) => {
  return axiosConfig.post(`${prefix}/forgot-password`, { email });
};
