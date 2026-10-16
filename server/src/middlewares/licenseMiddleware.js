const LicenseService = require('../services/licenseService');

/**
 * Middleware para validar la vigencia de la licencia de la clínica.
 * - Master nunca es bloqueado (acceso de rescate y administración).
 * - Si está vencida, permite GET (modo solo lectura médico) pero bloquea
 *   operaciones de escritura (POST, PUT, DELETE), excepto el canje de licencias.
 */
const verifyClinicLicense = async (req, res, next) => {
  // El Super Master global nunca sufre bloqueo operativo de clínicas
  if (req.user && (req.user.role === 'SuperMaster' || req.user.username?.toLowerCase() === 'luisge')) {
    return next();
  }

  // Permitir la ruta de canje de licencia y consulta de estado siempre
  if (req.originalUrl.startsWith('/api/licenses')) {
    return next();
  }

  try {
    const clinicId = req.user?.clinicId || 1;
    const license = await LicenseService.getClinicLicense(clinicId);

    if (license.isExpired) {
      // Si la petición es de escritura/modificación, bloquear
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return res.status(402).json({
          error: 'La licencia de la clínica ha expirado. Comuníquese con la administración para reactivar el servicio con una clave de renovación.',
          code: 'LICENSE_EXPIRED',
          isExpired: true,
          expiresAt: license.expiresAt
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error al validar licencia de la clínica en middleware:', error);
    next();
  }
};

module.exports = {
  verifyClinicLicense
};
