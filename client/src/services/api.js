import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

// Interceptor para inyectar el token JWT en cada petición saliente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

export const portalApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

portalApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('portal_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
