// Rutas de Usuarios y Roles para SARA
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/', verifyToken, checkRole(['Master', 'Administrador', 'Recepcionista', 'Médico']), userController.getUsers);
router.post('/create', verifyToken, checkRole(['Master', 'Administrador', 'Recepcionista', 'Médico']), userController.createUser);
router.post('/register', verifyToken, checkRole(['Master', 'Administrador', 'Recepcionista', 'Médico']), userController.createUser);
router.put('/:id', verifyToken, checkRole(['Master', 'Administrador']), userController.updateUser);
router.delete('/:id', verifyToken, checkRole(['Master']), userController.deleteUser);
router.put('/update-password', verifyToken, userController.updatePassword);

module.exports = router;
