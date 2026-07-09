const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configuración de WebSockets para tiempo real (Requerimiento 2.5 y 2.14)
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Bitácora de Auditoría simple (Middleware global o específico)
app.use((req, res, next) => {
  // Aquí registraremos auditoría básica si fuera necesario para depuración.
  // Ejemplo: console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Importar Rutas de SARA
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const clinicalRoutes = require('./routes/clinicalRoutes');
const billingRoutes = require('./routes/billingRoutes');

// Registrar Rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/clinical', clinicalRoutes);
app.use('/api/billing', billingRoutes);

// Ruta de estado del servidor
app.get('/status', (req, res) => {
  res.json({
    status: "active",
    system: "SARA (Sistema Administrativo y de Registro Automatizado de Pacientes)",
    time: new Date().toISOString()
  });
});

// Configuración de conexión WebSocket
io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado al sistema SARA:', socket.id);

  // Manejar unión a salas específicas (ej. por sucursales o médicos para tiempo real)
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Usuario ${socket.id} se unió a la sala: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Pasar la instancia de 'io' para que pueda ser usada en controladores y middlewares
app.set('io', io);

// Iniciar Servidor
const PORT = process.env.PORT || 4000;
server.listen(PORT, async () => {
  console.log(`Servidor SARA escuchando en el puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV}`);
  
  // Inicializar Base de Datos PostgreSQL
  const { initDatabase } = require('./config/database');
  await initDatabase();
});

module.exports = { app, server };

