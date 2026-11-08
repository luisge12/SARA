// Middleware de Autenticación y Autorización por Roles para SARA
const jwt = require('jsonwebtoken');

module.exports = {
  verifyToken: (req, res, next) => {
    let token = null;

    // 1. Intentar leer desde Cookie HttpOnly sara_token
    if (req.cookies && req.cookies.sara_token) {
      token = req.cookies.sara_token;
    } else if (req.headers.cookie) {
      const match = req.headers.cookie.match(/(?:^|;\s*)sara_token=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    // 2. Fallback a la cabecera Authorization Bearer
    if (!token) {
      const authHeader = req.headers['authorization'];
      if (authHeader) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token o la sesión ha expirado.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey_sara_18992791');
      req.user = decoded;

      // Bloqueo de Seguridad Crítico para Pacientes (Con excepciones para su portal)
      if (req.user.role === 'Paciente' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        if (!req.originalUrl.startsWith('/api/patients/')) {
          return res.status(403).json({ error: 'Acceso denegado. El rol Paciente solo tiene permisos de lectura.' });
        }
      }

      // El rol SuperMaster está estrictamente restringido a la administración de licencias (/api/licenses)
      if (req.user.role === 'SuperMaster' || req.user.role === 'Super Master') {
        const path = req.originalUrl || req.url || '';
        const isAllowedPath = path.startsWith('/api/licenses') || path.startsWith('/api/users/profile') || path.startsWith('/api/users/login');
        if (!isAllowedPath) {
          return res.status(403).json({
            error: 'Acceso denegado. El usuario Super Master tiene acceso exclusivo a la gestión de licencias y no puede consultar información de las clínicas.'
          });
        }
      }

      // Renovación Automática de Sesión (Sliding Window):
      // Si el usuario está activo y han pasado más de 10 minutos desde que se firmó el token,
      // renovamos la Cookie HttpOnly por 24 horas completas adicionales desde este momento.
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const tokenAge = nowInSeconds - (decoded.iat || 0);
      if (tokenAge > 600) {
        try {
          const refreshedToken = jwt.sign(
            { id: decoded.id, username: decoded.username, role: decoded.role, clinicId: decoded.clinicId },
            process.env.JWT_SECRET || 'supersecretkey_sara_18992791',
            { expiresIn: '24h' }
          );

          const cookieOptions = {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 horas nuevas
            sameSite: 'lax',
            path: '/'
          };
          if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
            cookieOptions.secure = true;
          }
          res.cookie('sara_token', refreshedToken, cookieOptions);
          res.setHeader('X-Refreshed-Token', refreshedToken);
        } catch (rErr) {
          console.warn('Aviso en renovación automática de token:', rErr.message);
        }
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
    // El rol SuperMaster únicamente gestiona licencias de SARA
    if (req.user.role === 'SuperMaster' || req.user.role === 'Super Master') {
      return res.status(403).json({ 
        error: 'Acceso denegado. El usuario Super Master gestiona exclusivamente la emisión y control de licencias, sin acceso a información clínica.' 
      });
    }
    // El rol Master de la clínica tiene acceso ilimitado a los módulos de su clínica
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
