// Rutas de Facturación y Caja para SARA
const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

router.get('/rates', verifyToken, billingController.getRates);
router.post('/rates', verifyToken, billingController.updateRates);
router.post('/calculate', verifyToken, billingController.calculatePayment);
router.post('/report', verifyToken, billingController.reportPayment);

module.exports = router;
