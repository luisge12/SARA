// Middleware de Autenticación y Autorización por Roles para SARA
const jwt = require('jsonwebtoken');

module.exports = {
  verifyToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado. Token mal formateado.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_sara_18992791');
      req.user = decoded;

      // Bloqueo de Seguridad Crítico para Pacientes
      if (req.user.role === 'Paciente' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return res.status(403).json({ error: 'Acceso denegado. El rol Paciente solo tiene permisos de lectura.' });
      }

      next();
    } catch (error) {
      return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
  },
  checkRole: (roles) => (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ error: 'Acceso denegado. Permisos insuficientes.' });
    }
    // El rol Master tiene acceso ilimitado a todos los recursos y endpoints
    if (req.user.role === 'Master') {
      return next();
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acceso denegado. Permisos insuficientes.' });
    }
    next();
  },
  
  // Agrupación de Roles para facilitar acceso
  ROLES: {
    ADMINISTRADOR: ['Master/administrador', 'Administrador', 'Master'],
    MEDICO: ['Director Médico', 'Médico Tratante', 'Médico'],
    RECEPCIONISTA: ['Asistente Administrativo', 'Asistente Medico', 'Recepcionista'],
    PACIENTE: ['Paciente']
  }
};
