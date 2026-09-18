const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// === Rutas compartidas (Lectura) ===
router.get('/', verifyToken, patientController.getPatients);
router.get('/:id/profile', verifyToken, patientController.getPatientProfile);

// === Rutas de Recepción / Administrativas ===
// (Solo recepcionista y admin deberían poder modificar demográficos en teoría, pero por ahora permitimos que ambos roles actualicen)
router.put('/:id/profile', verifyToken, patientController.updatePatientProfile);

// === Rutas Médicas ===
// Solo Médicos y Master
router.post('/:patientId/consultations', verifyToken, checkRole(['Director Médico', 'Médico Tratante', 'Médico', 'Master']), patientController.saveConsultation);
router.get('/:patientId/consultations', verifyToken, patientController.getPatientConsultations);

// === Rutas de Auditoría / Trazabilidad ===
router.get('/:patientId/audit', verifyToken, patientController.getPatientAuditLogs);

module.exports = router;
