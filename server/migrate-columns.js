const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sequelize } = require('./src/config/database');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a la base de datos PostgreSQL...');

    const queries = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS shift VARCHAR(50);',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS academic_degree VARCHAR(150);',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS specialty VARCHAR(150);',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(50);',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS clinic_id INTEGER DEFAULT 1;',
      'ALTER TABLE medical_studies ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT \'[]\'::jsonb;',
      'ALTER TABLE medical_studies ADD COLUMN IF NOT EXISTS biopsy_sample VARCHAR(255);',
      'ALTER TABLE medical_studies ADD COLUMN IF NOT EXISTS technique_or_region VARCHAR(255);',
      'ALTER TABLE medical_studies ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0.00;',
      'ALTER TABLE medical_studies ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) DEFAULT 0.00;',
      'ALTER TABLE medical_studies ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT \'Pendiente\';',
      'ALTER TABLE medical_studies ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\'::jsonb;'
    ];

    for (const q of queries) {
      try {
        await sequelize.query(q);
        console.log('Ejecutado con éxito:', q);
      } catch (err) {
        console.warn('Aviso en query:', err.message);
      }
    }

    console.log('\n--- VERIFICANDO CONSULTA DE USUARIOS ---');
    const User = require('./src/models/User');
    const users = await User.findAll({ attributes: ['id', 'username', 'role', 'name'] });
    console.log('Usuarios encontrados en BD:', users.map(u => ({ id: u.id, username: u.username, role: u.role })));

    process.exit(0);
  } catch (error) {
    console.error('Error general en migración:', error);
    process.exit(1);
  }
}

migrate();
