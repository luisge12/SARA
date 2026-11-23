const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const readRoles = ['Master', 'Administrador', 'Médico', 'Director Médico', 'Médico Tratante', 'Recepcionista', 'MASTER', 'ADMINISTRADOR', 'MEDICO', 'RECEPCIONISTA', 'MÉDICO', 'DIRECTOR MÉDICO', 'MÉDICO TRATANTE'];
const patientStudyReadRoles = [...readRoles, 'Paciente', 'PACIENTE'];
const medicalWriteRoles = ['Director Médico', 'Médico Tratante', 'Médico', 'Master', 'Administrador', 'DIRECTOR MÉDICO', 'MÉDICO TRATANTE', 'MEDICO', 'MASTER', 'ADMINISTRADOR'];
const attachmentRoles = ['Master', 'Administrador', 'Médico', 'Director Médico', 'Médico Tratante', 'Recepcionista', 'MASTER', 'ADMINISTRADOR', 'MEDICO', 'RECEPCIONISTA', 'MÉDICO', 'DIRECTOR MÉDICO', 'MÉDICO TRATANTE'];

// Rutas protegidas para estudios y procedimientos médicos
router.get('/', verifyToken, checkRole(readRoles), studyController.getStudies);
router.get('/patient/:patientId', verifyToken, checkRole(patientStudyReadRoles), studyController.getPatientStudies);

// Subida y gestión de archivos adjuntos (Permitido a Médicos y Recepcionistas)
router.post('/:id/attachments', verifyToken, checkRole(attachmentRoles), upload.array('files', 10), studyController.uploadAttachments);
router.delete('/:id/attachments/:attachmentId', verifyToken, checkRole(attachmentRoles), studyController.deleteAttachment);

// Creación, edición y eliminación de informes médicos
router.post('/', verifyToken, checkRole(medicalWriteRoles), studyController.createStudy);
router.put('/:id', verifyToken, checkRole(medicalWriteRoles), studyController.updateStudy);
router.delete('/:id', verifyToken, checkRole(medicalWriteRoles), studyController.deleteStudy);

module.exports = router;
