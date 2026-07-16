// Configuración de la Base de Datos PostgreSQL con Sequelize para SARA
const { Sequelize } = require('sequelize');

// Leer variables de entorno
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

const dbSSL = process.env.DB_SSL === 'true';

// Inicializar Sequelize con el dialecto Postgres
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: dbSSL ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {},
  define: {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    underscored: true // Usa snake_case para nombres de columnas generados
  }
});

// Función para inicializar y verificar la base de datos
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión con PostgreSQL establecida correctamente.');

    // Sincronizar todos los modelos definidos
    // Importamos los modelos para registrarlos en Sequelize
    const User = require('../models/User');
    const PatientProfile = require('../models/PatientProfile');
    const Consultation = require('../models/Consultation');
    const AuditLog = require('../models/AuditLog');
    const Transaction = require('../models/Transaction');

    // alter: true sincroniza la estructura de las tablas sin perder los datos
    await sequelize.sync({ alter: true });
    console.log('Modelos de base de datos sincronizados con éxito.');

    // Semillar el usuario master por defecto si no existe
    const bcrypt = require('bcryptjs');
    const masterUser = process.env.DEFAULT_MASTER_USER || 'UNIMECO';
    const masterPass = process.env.DEFAULT_MASTER_PASS || '18992791';

    const unimecoExists = await User.findOne({ where: { username: masterUser } });
    if (!unimecoExists) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(masterPass, salt);
      await User.create({
        username: masterUser,
        passwordHash: passwordHash,
        role: 'Master',
        name: 'Administrador Master SARA',
        sedeAtencion: 'CENTRAL'
      });
      console.log('Usuario Master (UNIMECO) creado exitosamente.');
    }

    // Semillar usuario de prueba luisge con clave 1234
    const luisgeExists = await User.findOne({ where: { username: 'luisge' } });
    if (!luisgeExists) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('1234', salt);
      await User.create({
        username: 'luisge',
        passwordHash: passwordHash,
        role: 'Master',
        name: 'Luis G. SARA Master',
        sedeAtencion: 'CENTRAL'
      });
      console.log('Usuario de prueba Master (luisge) creado exitosamente.');
    }
  } catch (error) {
    console.error('Error al conectar e inicializar la base de datos PostgreSQL:', error);
  }
};

module.exports = {
  sequelize,
  initDatabase
};
