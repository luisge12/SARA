// Configuración de la Base de Datos PostgreSQL con Sequelize para SARA
const { Sequelize } = require('sequelize');

// Leer variables de entorno
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

const dbSSL = process.env.DB_SSL === 'true';
const databaseUrl = process.env.DATABASE_URL;

let sequelize;

if (databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    define: {
      timestamps: true, // Agrega createdAt y updatedAt automáticamente
      underscored: true // Usa snake_case para nombres de columnas generados
    }
  });
} else {
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
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
}

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
    const Appointment = require('../models/Appointment');
    const Study = require('../models/Study');

    // Asegurar columnas requeridas en users de forma no destructiva
    try {
      const [cols] = await sequelize.query(`
        SELECT column_name FROM information_schema.columns WHERE table_name = 'users';
      `);
      const existingCols = (cols || []).map(c => c.column_name.toLowerCase());
      const neededCols = [
        { name: 'shift', type: 'VARCHAR(50)' },
        { name: 'academic_degree', type: 'VARCHAR(150)' },
        { name: 'specialty', type: 'VARCHAR(150)' },
        { name: 'expires_at', type: 'TIMESTAMP WITH TIME ZONE' },
        { name: 'identification_number', type: 'VARCHAR(50)' },
        { name: 'mpps_number', type: 'VARCHAR(50)' },
        { name: 'medical_college_number', type: 'VARCHAR(50)' },
        { name: 'sede_atencion', type: 'VARCHAR(100)' },
        { name: 'gender', type: 'VARCHAR(50)' },
        { name: 'date_of_birth', type: 'DATE' },
        { name: 'email', type: 'VARCHAR(150)' },
        { name: 'phone', type: 'VARCHAR(50)' }
      ];

      for (const col of neededCols) {
        if (!existingCols.includes(col.name.toLowerCase())) {
          await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`);
        }
      }

      // Asegurar columnas en patient_profiles
      const [pCols] = await sequelize.query(`
        SELECT column_name FROM information_schema.columns WHERE table_name = 'patient_profiles';
      `);
      const existingPCols = (pCols || []).map(c => c.column_name.toLowerCase());
      const neededPCols = [
        { name: 'personal_history', type: 'TEXT' },
        { name: 'surgical_history', type: 'TEXT' },
        { name: 'family_history', type: 'TEXT' },
        { name: 'menarche_age', type: 'VARCHAR(20)' },
        { name: 'menopause_age', type: 'VARCHAR(20)' },
        { name: 'obstetric_formula', type: 'VARCHAR(50)' },
        { name: 'bristol_type', type: 'VARCHAR(50)' },
        { name: 'bowel_frequency', type: 'VARCHAR(100)' },
        { name: 'strain_to_evacuate', type: 'VARCHAR(20)' },
        { name: 'incomplete_evacuation', type: 'VARCHAR(20)' },
        { name: 'bowel_notes', type: 'TEXT' }
      ];

      for (const col of neededPCols) {
        if (!existingPCols.includes(col.name.toLowerCase())) {
          await sequelize.query(`ALTER TABLE patient_profiles ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`);
        }
      }

      // Asegurar tabla y columnas de auditoría (audit_logs)
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id SERIAL PRIMARY KEY,
          patient_id INTEGER,
          modified_by_user_id INTEGER,
          action_type VARCHAR(100),
          changes_description JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const [auditCols] = await sequelize.query(`
        SELECT column_name FROM information_schema.columns WHERE table_name = 'audit_logs';
      `);
      const existingAuditCols = (auditCols || []).map(c => c.column_name.toLowerCase());
      const neededAuditCols = [
        { name: 'patient_id', type: 'INTEGER' },
        { name: 'modified_by_user_id', type: 'INTEGER' },
        { name: 'action_type', type: 'VARCHAR(100)' },
        { name: 'changes_description', type: 'JSONB' },
        { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP' }
      ];

      for (const col of neededAuditCols) {
        if (!existingAuditCols.includes(col.name.toLowerCase())) {
          await sequelize.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`);
        }
      }
    } catch (err) {
      console.warn('Aviso comprobación de columnas de base de datos:', err.message);
    }

    // Sincronizar modelos automáticamente
    await User.sync({ alter: true }).catch(err => console.error('Error al sincronizar modelo User:', err));
    await PatientProfile.sync({ alter: true }).catch(err => console.error('Error al sincronizar modelo PatientProfile:', err));
    await Consultation.sync({ alter: true }).catch(err => console.error('Error al sincronizar modelo Consultation:', err));
    await AuditLog.sync({ alter: true }).catch(err => console.error('Error al sincronizar modelo AuditLog:', err));
    await Appointment.sync({ alter: true }).catch(err => console.error('Error al sincronizar modelo Appointment:', err));
    await Study.sync({ alter: true }).catch(err => console.error('Error al sincronizar modelo Study:', err));

    // Sincronizar modelos solo si se solicita explícitamente en el entorno
    if (process.env.DB_SYNC === 'true') {
      await sequelize.sync({ alter: true });
      console.log('Modelos de base de datos sincronizados con éxito.');
    }

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

    // Semillar usuario master con clave 1234
    const masterExists = await User.findOne({ where: { username: 'master' } });
    if (!masterExists) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('1234', salt);
      await User.create({
        username: 'master',
        passwordHash: passwordHash,
        role: 'Master',
        name: 'Usuario Master SARA',
        sedeAtencion: 'CENTRAL'
      });
      console.log('Usuario Master (master) creado exitosamente.');
    } else {
      const salt = await bcrypt.genSalt(10);
      masterExists.passwordHash = await bcrypt.hash('1234', salt);
      masterExists.role = 'Master';
      await masterExists.save();
      console.log('Usuario Master (master) actualizado exitosamente.');
    }
  } catch (error) {
    console.error('Error al conectar e inicializar la base de datos PostgreSQL:', error);
  }
};

module.exports = {
  sequelize,
  initDatabase
};
