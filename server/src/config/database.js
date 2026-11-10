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

const poolConfig = {
  max: 10,
  min: 0,
  acquire: 30000,
  idle: 10000,
  evict: 2000
};

if (databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      keepAlive: true
    },
    pool: poolConfig,
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
      },
      keepAlive: true
    } : {
      keepAlive: true
    },
    pool: poolConfig,
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
    const CustomFormTemplate = require('../models/CustomFormTemplate');
    const Clinic = require('../models/Clinic');
    const LicenseKey = require('../models/LicenseKey');

    // Asociaciones
    Clinic.hasMany(User, { foreignKey: 'clinic_id', as: 'users' });
    User.belongsTo(Clinic, { foreignKey: 'clinic_id', as: 'clinic' });
    Clinic.hasMany(LicenseKey, { foreignKey: 'used_by_clinic_id', as: 'redeemedKeys' });
    LicenseKey.belongsTo(Clinic, { foreignKey: 'used_by_clinic_id', as: 'clinic' });

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
        { name: 'phone', type: 'VARCHAR(50)' },
        { name: 'clinic_id', type: 'INTEGER DEFAULT 1' }
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
        { name: 'photo_url', type: 'TEXT' },
        { name: 'flow_type', type: 'VARCHAR(50)' },
        { name: 'custom_fields', type: 'JSONB' },
        { name: 'menarche_age', type: 'VARCHAR(20)' },
        { name: 'menopause_age', type: 'VARCHAR(20)' },
        { name: 'obstetric_formula', type: 'VARCHAR(50)' },
        { name: 'bristol_type', type: 'VARCHAR(50)' },
        { name: 'bowel_frequency', type: 'VARCHAR(100)' },
        { name: 'strain_to_evacuate', type: 'VARCHAR(20)' },
        { name: 'incomplete_evacuation', type: 'VARCHAR(20)' },
        { name: 'bowel_notes', type: 'TEXT' },
        { name: 'ocupacion', type: 'VARCHAR(150)' },
        { name: 'motivo_consulta', type: 'TEXT' },
        { name: 'enfermedad_actual', type: 'TEXT' },
        { name: 'habitos_psicobiologicos', type: 'TEXT' },
        { name: 'examen_funcional', type: 'TEXT' }
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

      // Asegurar columnas en medical_studies
      const [studyCols] = await sequelize.query(`
        SELECT column_name FROM information_schema.columns WHERE table_name = 'medical_studies';
      `);
      const existingStudyCols = (studyCols || []).map(c => c.column_name.toLowerCase());
      const neededStudyCols = [
        { name: 'category', type: "VARCHAR(100) DEFAULT 'General'" },
        { name: 'technique_or_region', type: 'VARCHAR(255)' },
        { name: 'metadata', type: "JSONB DEFAULT '{}'" }
      ];

      for (const col of neededStudyCols) {
        if (!existingStudyCols.includes(col.name.toLowerCase())) {
          await sequelize.query(`ALTER TABLE medical_studies ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`);
        }
      }

      // Asegurar columnas en consultations
      const [consCols] = await sequelize.query(`
        SELECT column_name FROM information_schema.columns WHERE table_name = 'consultations';
      `);
      const existingConsCols = (consCols || []).map(c => c.column_name.toLowerCase());
      if (!existingConsCols.includes('custom_template_data')) {
        await sequelize.query(`ALTER TABLE consultations ADD COLUMN IF NOT EXISTS custom_template_data JSONB;`);
      }

      // Asegurar tabla y columnas en appointments
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS appointments (
          id SERIAL PRIMARY KEY,
          patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          sede_atencion VARCHAR(100) DEFAULT 'CENTRAL',
          appointment_date TIMESTAMP WITH TIME ZONE,
          priority VARCHAR(50) DEFAULT 'Normal',
          duration INTEGER DEFAULT 30,
          reason TEXT,
          status VARCHAR(50) DEFAULT 'Confirmada',
          notes TEXT,
          total_amount DECIMAL(10, 2) DEFAULT 0.00,
          paid_amount DECIMAL(10, 2) DEFAULT 0.00,
          pending_amount DECIMAL(10, 2) DEFAULT 0.00,
          payment_method VARCHAR(50) DEFAULT 'Efectivo (USD)',
          payment_status VARCHAR(50) DEFAULT 'Pendiente',
          created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const [aptCols] = await sequelize.query(`
        SELECT column_name FROM information_schema.columns WHERE table_name = 'appointments';
      `);
      const existingAptCols = (aptCols || []).map(c => c.column_name.toLowerCase());
      const neededAptCols = [
        { name: 'patient_id', type: 'INTEGER' },
        { name: 'doctor_id', type: 'INTEGER' },
        { name: 'sede_atencion', type: "VARCHAR(100) DEFAULT 'CENTRAL'" },
        { name: 'appointment_date', type: 'TIMESTAMP WITH TIME ZONE' },
        { name: 'priority', type: "VARCHAR(50) DEFAULT 'Normal'" },
        { name: 'duration', type: 'INTEGER DEFAULT 30' },
        { name: 'reason', type: 'TEXT' },
        { name: 'status', type: "VARCHAR(50) DEFAULT 'Confirmada'" },
        { name: 'notes', type: 'TEXT' },
        { name: 'total_amount', type: 'DECIMAL(10, 2) DEFAULT 0.00' },
        { name: 'paid_amount', type: 'DECIMAL(10, 2) DEFAULT 0.00' },
        { name: 'pending_amount', type: 'DECIMAL(10, 2) DEFAULT 0.00' },
        { name: 'payment_method', type: "VARCHAR(50) DEFAULT 'Efectivo (USD)'" },
        { name: 'payment_status', type: "VARCHAR(50) DEFAULT 'Pendiente'" },
        { name: 'created_by_id', type: 'INTEGER' }
      ];

      for (const col of neededAptCols) {
        if (!existingAptCols.includes(col.name.toLowerCase())) {
          await sequelize.query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`);
        }
      }

      // Asegurar tabla y columnas en transactions
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          sede_atencion VARCHAR(100) NOT NULL DEFAULT 'CENTRAL',
          service_type VARCHAR(150) NOT NULL,
          total_amount_usd DECIMAL(10, 2) NOT NULL,
          exchange_rate DECIMAL(12, 4) NOT NULL,
          total_amount_local DECIMAL(16, 2) NOT NULL,
          unimeco_percentage DECIMAL(5, 2) NOT NULL,
          doctor_percentage DECIMAL(5, 2) NOT NULL,
          unimeco_amount DECIMAL(10, 2) NOT NULL,
          doctor_amount DECIMAL(10, 2) NOT NULL,
          operative_costs DECIMAL(10, 2) DEFAULT 0,
          incentives DECIMAL(10, 2) DEFAULT 0,
          net_amount DECIMAL(10, 2) NOT NULL,
          created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const [transCols] = await sequelize.query(`
        SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions';
      `);
      const existingTransCols = (transCols || []).map(c => c.column_name.toLowerCase());
      const neededTransCols = [
        { name: 'patient_id', type: 'INTEGER' },
        { name: 'doctor_id', type: 'INTEGER' },
        { name: 'sede_atencion', type: "VARCHAR(100) DEFAULT 'CENTRAL'" },
        { name: 'service_type', type: 'VARCHAR(150)' },
        { name: 'total_amount_usd', type: 'DECIMAL(10, 2)' },
        { name: 'exchange_rate', type: 'DECIMAL(12, 4)' },
        { name: 'total_amount_local', type: 'DECIMAL(16, 2)' },
        { name: 'unimeco_percentage', type: 'DECIMAL(5, 2)' },
        { name: 'doctor_percentage', type: 'DECIMAL(5, 2)' },
        { name: 'unimeco_amount', type: 'DECIMAL(10, 2)' },
        { name: 'doctor_amount', type: 'DECIMAL(10, 2)' },
        { name: 'operative_costs', type: 'DECIMAL(10, 2) DEFAULT 0' },
        { name: 'incentives', type: 'DECIMAL(10, 2) DEFAULT 0' },
        { name: 'net_amount', type: 'DECIMAL(10, 2)' },
        { name: 'created_by_id', type: 'INTEGER' }
      ];

      for (const col of neededTransCols) {
        if (!existingTransCols.includes(col.name.toLowerCase())) {
          await sequelize.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`);
        }
      }
    } catch (err) {
      console.warn('Aviso comprobación de columnas de base de datos:', err.message);
    }

    // Sincronizar modelos automáticamente
    await Clinic.sync({ alter: true }).catch(err => console.error('Error al sincronizar modelo Clinic:', err));
    await LicenseKey.sync({ alter: true }).catch(err => console.error('Error al sincronizar modelo LicenseKey:', err));
    await User.sync({ alter: true }).catch(err => console.error('Error al sincronizar modelo User:', err));
    await PatientProfile.sync({ alter: true }).catch(err => console.error('Error al sincronizar modelo PatientProfile:', err));
    await Consultation.sync({ alter: true }).catch(err => console.error('Error al sincronizar modelo Consultation:', err));
    await AuditLog.sync({ alter: true }).catch(err => console.error('Error al sincronizar modelo AuditLog:', err));
    await Appointment.sync({ alter: true }).catch(err => console.error('Error al sincronizar modelo Appointment:', err));
    await Study.sync({ alter: true }).catch(err => console.error('Error al sincronizar modelo Study:', err));
    await CustomFormTemplate.sync({ alter: true }).catch(err => console.error('Error al sincronizar modelo CustomFormTemplate:', err));

    // Asegurar que exista la clínica principal con ID 1 y licencia activa de 30 días
    try {
      const clinicCount = await Clinic.count();
      if (clinicCount === 0) {
        const initialExpiration = new Date();
        initialExpiration.setDate(initialExpiration.getDate() + 30); // 30 días iniciales
        await Clinic.create({
          id: 1,
          name: 'UNIMECO - Centro Médico Principal',
          rif: 'J-50123456-7',
          planType: 'MONTHLY',
          licenseStatus: 'ACTIVE',
          expiresAt: initialExpiration,
          activeLicenseKey: 'SARA-M-PRO-START-2026',
          maxDoctors: 15
        });
        console.log('Clínica Principal UNIMECO creada con 30 días de licencia activa.');
      }
    } catch (cErr) {
      console.warn('Aviso al semillar clínica principal:', cErr.message);
    }

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
        name: 'Master / Director UNIMECO',
        sedeAtencion: 'CENTRAL',
        clinicId: 1
      });
      console.log('Usuario Master de Clínica (UNIMECO) creado exitosamente.');
    }

    // Semillar usuario Super Master luisge con clave 1234
    const luisgeExists = await User.findOne({ where: { username: 'luisge' } });
    if (!luisgeExists) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('1234', salt);
      await User.create({
        username: 'luisge',
        passwordHash: passwordHash,
        role: 'SuperMaster',
        name: 'Luis G. (Super Master SARA)',
        sedeAtencion: 'CENTRAL',
        clinicId: null
      });
      console.log('Usuario Super Master (luisge) creado exitosamente.');
    } else if (luisgeExists.clinicId !== null) {
      await User.update({ clinicId: null }, { where: { username: 'luisge' } });
    }

    // Eliminar el usuario de prueba genérico "master" para que solo exista el Master oficial UNIMECO
    await User.destroy({ where: { username: 'master' } }).catch(() => {});

    // Asegurar que cualquier usuario existente (excepto SuperMaster) esté vinculado a la clínica 1 (UNIMECO)
    await User.update({ clinicId: 1 }, { 
      where: { 
        clinicId: null, 
        role: { [Op.ne]: 'SuperMaster' } 
      } 
    }).catch(() => {});
  } catch (error) {
    console.error('Error al conectar e inicializar la base de datos PostgreSQL:', error);
  }
};

module.exports = {
  sequelize,
  initDatabase
};
