import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const axiosConfig = axios.create({
  baseURL: API_URL,
});

axiosConfig.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta e passar mensagem exata da API
axiosConfig.interceptors.response.use(
  (response) => response, // resposta OK segue normalmente
  (error) => {
    // Tenta extrair a mensagem de erro exata da API no campo 'error'
    if (error.response && error.response.data && error.response.data.error) {
      return Promise.reject(new Error(error.response.data.error));
    }

    // Se não existir a mensagem esperada, rejeita com o erro original (sem genéricos)
    return Promise.reject(error);
  }
);

export default axiosConfig;
