const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/licenseController');
const { verifyToken, checkRole, ROLES } = require('../middlewares/authMiddleware');

// Middleware para proteger acciones exclusivas del Super Master (luisge / SuperMaster)
const verifySuperMaster = (req, res, next) => {
  if (req.user && (req.user.role === 'SuperMaster' || req.user.username?.toLowerCase() === 'luisge')) {
    return next();
  }
  return res.status(403).json({ error: 'Acceso denegado. Acción exclusiva del Super Master de SARA.' });
};

// Consulta de estado de la licencia (abierto a todo usuario autenticado de la clínica)
router.get('/status', verifyToken, licenseController.getStatus);

// Canjear clave de activación (Permitido para el Master y Administrador de la clínica)
router.post('/redeem', verifyToken, checkRole(ROLES.ADMINISTRADOR), licenseController.redeem);

// Rutas exclusivas para Super Master (Emisión, aprobación y revocación de licencias, y gestión de Masters)
router.post('/generate', verifyToken, verifySuperMaster, licenseController.generate);
router.get('/list', verifyToken, verifySuperMaster, licenseController.listKeys);
router.get('/stats', verifyToken, verifySuperMaster, licenseController.getKeyStats);
router.post('/revoke', verifyToken, verifySuperMaster, licenseController.revokeKey);
router.post('/approve', verifyToken, verifySuperMaster, licenseController.approveKey);
router.post('/masters', verifyToken, verifySuperMaster, licenseController.createMasterUser);
router.get('/masters', verifyToken, verifySuperMaster, licenseController.listMasterUsers);
router.get('/clinics-summary', verifyToken, verifySuperMaster, licenseController.listClinicsSummary);

// Rutas públicas de descarga de la aplicación
router.get('/download/info', licenseController.getDownloadInfo);
router.get('/download/setup', licenseController.downloadSetup);

module.exports = router;
