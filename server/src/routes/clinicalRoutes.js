// Rutas de Datos Clínicos de Pacientes para SARA
const express = require('express');
const router = express.Router();
const clinicalController = require('../controllers/clinicalController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, clinicalController.createRecord);
router.get('/:patientId', verifyToken, clinicalController.getRecord);
router.put('/:id', verifyToken, clinicalController.updateRecord);

module.exports = router;
