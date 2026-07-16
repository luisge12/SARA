// Rutas de Usuarios y Roles para SARA
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

router.post('/login', userController.login);
router.get('/', verifyToken, checkRole(['Master', 'Administrador', 'Recepcionista', 'Médico']), userController.getUsers);
router.post('/create', verifyToken, checkRole(['Master', 'Administrador', 'Recepcionista', 'Médico']), userController.createUser);
router.delete('/:id', verifyToken, checkRole(['Master']), userController.deleteUser);
router.put('/update-password', verifyToken, userController.updatePassword);

module.exports = router;
