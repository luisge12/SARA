// Middleware de Autenticación y Autorización por Roles para SARA
const jwt = require('jsonwebtoken');

// TODO: Implementar verificación de tokens JWT y permisos de rol.
module.exports = {
  verifyToken: (req, res, next) => next(),
  checkRole: (roles) => (req, res, next) => next()
};
