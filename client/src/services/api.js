import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  withCredentials: true // Permite enviar y recibir Cookies HttpOnly seguras
});

// Interceptor para inyectar el token JWT en cada petición saliente como respaldo
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

// Interceptor de respuesta para detectar expiración de sesión y bloqueo de licencias
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const errDetail = error.response.data?.error?.toLowerCase() || '';

      // 1. Detección de sesión vencida o no autorizada (401 o 403 por token expirado)
      if (status === 401 || (status === 403 && (errDetail.includes('token') || errDetail.includes('expirado') || errDetail.includes('sesión')))) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('session_expires_at');

        // Redirigir al login si no estamos ya allí
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=1';
        }
      }

      // 2. Detección de licencia vencida (402)
      if (status === 402) {
        window.dispatchEvent(
          new CustomEvent('sara_license_expired', {
            detail: error.response.data || { error: 'Licencia de la clínica vencida' }
          })
        );
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const portalApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  withCredentials: true
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
