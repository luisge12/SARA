import api from './api';

export const licenseService = {
  // Consultar estado de la licencia de la clínica
  getStatus: async () => {
    const response = await api.get('/api/licenses/status');
    return response.data;
  },

  // Canjear clave de activación (Admin / Master)
  redeemKey: async (licenseKey) => {
    const response = await api.post('/api/licenses/redeem', { licenseKey });
    return response.data;
  },

  // Generar clave de licencia (Super Master)
  generateKey: async ({ planType, durationDays, notes }) => {
    const response = await api.post('/api/licenses/generate', { planType, durationDays, notes });
    return response.data;
  },

  // Listar todas las claves generadas (Super Master)
  listKeys: async () => {
    const response = await api.get('/api/licenses/list');
    return response.data;
  },

  // Extensión manual de días (Super Master)
  manualExtend: async ({ days, notes, clinicId }) => {
    const response = await api.post('/api/licenses/manual-extend', { days, notes, clinicId });
    return response.data;
  }
};

export default licenseService;
