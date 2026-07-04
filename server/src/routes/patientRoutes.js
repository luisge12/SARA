// Rutas de Pacientes para SARA
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, patientController.createPatient);
router.get('/', verifyToken, patientController.getPatients);
router.put('/:id', verifyToken, patientController.updatePatient);

module.exports = router;
