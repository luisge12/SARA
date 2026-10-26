// Script para crear usuarios Master rápidamente desde la consola
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const User = require('../models/User');

async function createMaster(username, password, name, clinicId = 1) {
  if (!username || !password) {
    console.log('Uso: node src/scripts/createMaster.js <usuario> <contraseña> [nombre_completo] [clinic_id]');
    process.exit(1);
  }

  try {
    await sequelize.authenticate();
    console.log('Conectado a la base de datos PostgreSQL...');

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      console.error(`Error: El usuario "${username}" ya existe con el rol "${existing.role}".`);
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username: username.trim(),
      passwordHash,
      role: 'Master',
      name: name || `Master ${username}`,
      sedeAtencion: 'CENTRAL',
      clinicId: parseInt(clinicId) || 1
    });

    console.log('\n==========================================');
    console.log('¡USUARIO MASTER CREADO CON ÉXITO!');
    console.log('==========================================');
    console.log(`ID:           ${newUser.id}`);
    console.log(`Usuario:      ${newUser.username}`);
    console.log(`Nombre:       ${newUser.name}`);
    console.log(`Rol:          ${newUser.role}`);
    console.log(`Clínica ID:   ${newUser.clinicId}`);
    console.log('==========================================\n');
    process.exit(0);
  } catch (err) {
    console.error('Error al crear usuario master:', err.message);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const [username, password, name, clinicId] = args;
createMaster(username, password, name, clinicId);
