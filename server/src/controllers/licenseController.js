const LicenseService = require('../services/licenseService');

module.exports = {
  // Obtener estado de la licencia de la clínica actual
  getStatus: async (req, res) => {
    try {
      const clinicId = req.user?.clinicId || 1;
      const licenseInfo = await LicenseService.getClinicLicense(clinicId);
      return res.json(licenseInfo);
    } catch (error) {
      console.error('Error al obtener estado de licencia:', error);
      return res.status(500).json({ error: 'Error al consultar el estado de la licencia' });
    }
  },

  // Canjear clave de licencia (Administrador o Master de la clínica)
  redeem: async (req, res) => {
    try {
      const { licenseKey } = req.body;
      const clinicId = req.user?.clinicId || 1;

      if (!licenseKey) {
        return res.status(400).json({ error: 'La clave de licencia es requerida.' });
      }

      const result = await LicenseService.redeemKey(clinicId, licenseKey);
      return res.json(result);
    } catch (error) {
      console.error('Error al canjear clave de licencia:', error.message);
      return res.status(400).json({ error: error.message });
    }
  },

  // Generar nueva clave de licencia (Solo Super Master)
  generate: async (req, res) => {
    try {
      const { planType, durationDays, notes } = req.body;
      const createdBy = req.user?.username || 'Master';

      const newKey = await LicenseService.generateKey({
        planType: planType || 'MONTHLY',
        durationDays: durationDays ? parseInt(durationDays) : undefined,
        notes: notes || '',
        createdBy
      });

      return res.status(201).json({
        success: true,
        message: 'Clave de licencia generada exitosamente.',
        key: newKey
      });
    } catch (error) {
      console.error('Error al generar clave de licencia:', error);
      return res.status(500).json({ error: 'Error al generar la clave de licencia.' });
    }
  },

  // Listar todas las claves generadas en el sistema (Solo Super Master)
  listKeys: async (req, res) => {
    try {
      const keys = await LicenseService.getAllKeys();
      return res.json(keys);
    } catch (error) {
      console.error('Error al listar claves de licencia:', error);
      return res.status(500).json({ error: 'Error al obtener la lista de claves' });
    }
  },

  // Extensión manual de días (Solo Super Master)
  manualExtend: async (req, res) => {
    try {
      const { days, notes, clinicId } = req.body;
      const targetClinicId = clinicId || req.user?.clinicId || 1;
      const daysCount = parseInt(days) || 30;

      const result = await LicenseService.manualExtend(targetClinicId, daysCount, notes);
      return res.json(result);
    } catch (error) {
      console.error('Error en extensión manual de licencia:', error);
      return res.status(400).json({ error: error.message });
    }
  }
};
