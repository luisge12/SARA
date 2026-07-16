require('dotenv').config({ path: './server/.env' });
const { sequelize } = require('./server/src/config/database');

async function fix() {
  try {
    await sequelize.authenticate();
    await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS shift VARCHAR(50);');
    await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS academic_degree VARCHAR(150);');
    console.log('Columns added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error modifying DB:', error);
    process.exit(1);
  }
}

fix();
