const express = require('express');
const router = express.Router();
const formTemplateController = require('../controllers/formTemplateController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

const allowedRoles = [
  'Master', 'Administrador', 'Médico', 'Director Médico', 'Médico Tratante',
  'MASTER', 'ADMINISTRADOR', 'MEDICO', 'MÉDICO', 'DIRECTOR MÉDICO', 'MÉDICO TRATANTE'
];

router.get('/', verifyToken, checkRole(allowedRoles), formTemplateController.getTemplates);
router.get('/:id', verifyToken, checkRole(allowedRoles), formTemplateController.getTemplateById);
router.post('/', verifyToken, checkRole(allowedRoles), formTemplateController.createTemplate);
router.put('/:id', verifyToken, checkRole(allowedRoles), formTemplateController.updateTemplate);
router.delete('/:id', verifyToken, checkRole(allowedRoles), formTemplateController.deleteTemplate);

module.exports = router;
