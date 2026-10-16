const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LicenseKey = sequelize.define('LicenseKey', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  licenseKey: {
    type: DataTypes.STRING(64),
    unique: true,
    allowNull: false,
    field: 'license_key'
  },
  planType: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'MONTHLY', // 'MONTHLY' o 'ANNUAL'
    field: 'plan_type'
  },
  durationDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30, // 30 o 365
    field: 'duration_days'
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_used'
  },
  usedByClinicId: {
    type: DataTypes.INTEGER,
    field: 'used_by_clinic_id'
  },
  usedAt: {
    type: DataTypes.DATE,
    field: 'used_at'
  },
  notes: {
    type: DataTypes.STRING(255)
  },
  createdBy: {
    type: DataTypes.STRING(100),
    field: 'created_by'
  }
}, {
  tableName: 'license_keys',
  timestamps: true,
  underscored: true
});

module.exports = LicenseKey;
