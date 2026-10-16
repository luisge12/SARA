const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Clinic = sequelize.define('Clinic', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    defaultValue: 'Clínica Principal'
  },
  rif: {
    type: DataTypes.STRING(50)
  },
  planType: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'MONTHLY', // 'MONTHLY' o 'ANNUAL'
    field: 'plan_type'
  },
  licenseStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'ACTIVE', // 'ACTIVE', 'EXPIRED'
    field: 'license_status'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  },
  activeLicenseKey: {
    type: DataTypes.STRING(64),
    field: 'active_license_key'
  },
  maxDoctors: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    field: 'max_doctors'
  }
}, {
  tableName: 'clinics',
  timestamps: true,
  underscored: true
});

module.exports = Clinic;
