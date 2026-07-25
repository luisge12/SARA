// Controlador de Usuarios y Roles para SARA
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PatientProfile = require('../models/PatientProfile');
const AuditLog = require('../models/AuditLog');

module.exports = {
  getUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['passwordHash'] },
        order: [['created_at', 'ASC']]
      });
      return res.json(users);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  },
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'El usuario y la contraseña son requeridos.' });
      }

      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(404).json({ error: 'El usuario ingresado no existe en el sistema.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'La contraseña ingresada es incorrecta. Verifique sus datos.' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'supersecretkey_sara_18992791',
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          sedeAtencion: user.sedeAtencion
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  },
  createUser: async (req, res) => {
    try {
      const { 
        username, password, role, name, identificationNumber, mppsNumber, medicalCollegeNumber, sedeAtencion,
        shift, academicDegree, specialty,
        gender, dateOfBirth, phone, email, treatingDoctor, referringEntity, nextAppointment, address
      } = req.body;
      if (!username || !password || !role) {
        return res.status(400).json({ error: 'Campos requeridos faltantes' });
      }
      
      // Restringir a Recepcionistas/Médicos para que solo creen Pacientes
      if (req.user && req.user.role !== 'Master' && role !== 'Paciente') {
        return res.status(403).json({ error: 'No tienes permisos para crear usuarios de este tipo' });
      }

      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ error: 'El nombre de usuario ya está registrado' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        username,
        passwordHash,
        role,
        name,
        identificationNumber,
        mppsNumber,
        medicalCollegeNumber,
        sedeAtencion,
        shift,
        academicDegree,
        specialty
      });

      if (role === 'Paciente') {
        const newProfile = await PatientProfile.create({
          userId: newUser.id,
          gender,
          dateOfBirth,
          phone,
          email,
          treatingDoctor,
          referringEntity,
          nextAppointment,
          address
        });
        
        await AuditLog.create({
          patientId: newProfile.id,
          modifiedByUserId: req.user ? req.user.id : null,
          actionType: 'CREATE_PATIENT',
          changesDescription: {
            message: 'Paciente creado',
            user: { username: newUser.username, name: newUser.name }
          }
        });
      }

      return res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
          name: newUser.name
        }
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      return res.status(500).json({ error: 'Error al crear usuario' });
    }
  },
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      await user.destroy();
      return res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      return res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  },
  updatePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Ambas contraseñas son requeridas' });
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'La contraseña anterior es incorrecta' });
      }

      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      await user.save();

      return res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return res.status(500).json({ error: 'Error al actualizar contraseña' });
    }
  }
};
