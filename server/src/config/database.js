// Configuración de la Base de Datos PostgreSQL con Sequelize para SARA
const { Sequelize } = require('sequelize');

// Leer variables de entorno
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 5432;
const dbName = process.env.DB_NAME || 'sara';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';

// Inicializar Sequelize con el dialecto Postgres
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
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
    // alter: true sincroniza la estructura de las tablas sin perder los datos
    await sequelize.sync({ alter: true });
    console.log('Modelos de base de datos sincronizados con éxito.');
  } catch (error) {
    console.error('Error al conectar e inicializar la base de datos PostgreSQL:', error);
  }
};

module.exports = {
  sequelize,
  initDatabase
};
