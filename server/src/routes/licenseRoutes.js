const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/licenseController');
const { verifyToken, checkRole, ROLES } = require('../middlewares/authMiddleware');

// Consulta de estado de la licencia (abierto a todo usuario autenticado de la clínica)
router.get('/status', verifyToken, licenseController.getStatus);

// Canjear clave de activación (Permitido para Master y Administrador de la clínica)
router.post('/redeem', verifyToken, checkRole(ROLES.ADMINISTRADOR), licenseController.redeem);

// Rutas exclusivas para Super Master (Dueño de la plataforma SARA)
router.post('/generate', verifyToken, checkRole(['Master']), licenseController.generate);
router.get('/list', verifyToken, checkRole(['Master']), licenseController.listKeys);
router.post('/manual-extend', verifyToken, checkRole(['Master']), licenseController.manualExtend);

module.exports = router;
