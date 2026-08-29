const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

const authorizedRoles = ['Master', 'Administrador', 'Médico', 'Recepcionista', 'MASTER', 'ADMINISTRADOR', 'MEDICO', 'RECEPCIONISTA'];

// Rutas protegidas para estudios y procedimientos
router.get('/', verifyToken, checkRole(authorizedRoles), studyController.getStudies);
router.post('/', verifyToken, checkRole(authorizedRoles), studyController.createStudy);
router.get('/patient/:patientId', verifyToken, checkRole(authorizedRoles), studyController.getPatientStudies);
router.put('/:id', verifyToken, checkRole(authorizedRoles), studyController.updateStudy);
router.delete('/:id', verifyToken, checkRole(authorizedRoles), studyController.deleteStudy);

module.exports = router;
