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

  // Obtener estadísticas de claves (Super Master)
  getKeyStats: async () => {
    const response = await api.get('/api/licenses/stats');
    return response.data;
  },

  // Revocar clave de licencia (Super Master)
  revokeKey: async (keyId, reason) => {
    const response = await api.post('/api/licenses/revoke', { keyId, reason });
    return response.data;
  },

  // Aprobar / Reactivar clave de licencia (Super Master)
  approveKey: async (keyId) => {
    const response = await api.post('/api/licenses/approve', { keyId });
    return response.data;
  },

  // Obtener información de la versión e instalador
  getDownloadInfo: async () => {
    const response = await api.get('/api/licenses/download/info');
    return response.data;
  },

  // Crear usuario con rol Master y clínica (Super Master)
  createMasterUser: async ({ username, password, name, clinicName, clinicRif, clinicId, initialDays }) => {
    const response = await api.post('/api/licenses/masters', {
      username,
      password,
      name,
      clinicName,
      clinicRif,
      clinicId,
      initialDays
    });
    return response.data;
  },

  // Listar usuarios Master registrados (Super Master)
  listMasterUsers: async () => {
    const response = await api.get('/api/licenses/masters');
    return response.data;
  },

  // Listar clínicas registradas (Super Master)
  listClinicsSummary: async () => {
    const response = await api.get('/api/licenses/clinics-summary');
    return response.data;
  }
};

export default licenseService;
