const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(150)
  },
  identificationNumber: {
    type: DataTypes.STRING(50),
    field: 'identification_number'
  },
  mppsNumber: {
    type: DataTypes.STRING(50),
    field: 'mpps_number'
  },
  medicalCollegeNumber: {
    type: DataTypes.STRING(50),
    field: 'medical_college_number'
  },
  sedeAtencion: {
    type: DataTypes.STRING(100),
    field: 'sede_atencion'
  },
  expiresAt: {
    type: DataTypes.DATE,
    field: 'expires_at'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

module.exports = User;
