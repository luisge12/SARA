const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

const readRoles = ['Master', 'Administrador', 'Médico', 'Director Médico', 'Médico Tratante', 'Recepcionista', 'MASTER', 'ADMINISTRADOR', 'MEDICO', 'RECEPCIONISTA'];
const medicalWriteRoles = ['Director Médico', 'Médico Tratante', 'Médico', 'Master', 'Administrador', 'DIRECTOR MÉDICO', 'MÉDICO TRATANTE', 'MEDICO', 'MASTER', 'ADMINISTRADOR'];

// Rutas protegidas para estudios y procedimientos médicos
router.get('/', verifyToken, checkRole(readRoles), studyController.getStudies);
router.get('/patient/:patientId', verifyToken, checkRole(readRoles), studyController.getPatientStudies);

// Exclusivo para Médicos y Master (Bloqueo absoluto para Pacientes y Recepcionistas)
router.post('/', verifyToken, checkRole(medicalWriteRoles), studyController.createStudy);
router.put('/:id', verifyToken, checkRole(medicalWriteRoles), studyController.updateStudy);
router.delete('/:id', verifyToken, checkRole(medicalWriteRoles), studyController.deleteStudy);

module.exports = router;
