// Rutas de Gestión Administrativa (Caja) para SARA
const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Solo Master, Administrador y Recepcionista tienen acceso
const allowedRoles = ['Master', 'Administrador', 'Recepcionista'];

router.post('/transactions', verifyToken, checkRole(allowedRoles), billingController.registerPayment);
router.get('/transactions', verifyToken, checkRole(allowedRoles), billingController.getTransactions);
router.get('/summary', verifyToken, checkRole(allowedRoles), billingController.getAnnualSummary);

module.exports = router;
