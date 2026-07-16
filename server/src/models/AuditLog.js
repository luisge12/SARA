const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const PatientProfile = require('./PatientProfile');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: PatientProfile,
      key: 'id'
    },
    field: 'patient_id'
  },
  modifiedByUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    field: 'modified_by_user_id'
  },
  actionType: {
    type: DataTypes.STRING(100),
    allowNull: false, // Ej: 'UPDATE_DEMOGRAPHICS', 'CREATE_CONSULTATION', 'UPDATE_CONSULTATION'
    field: 'action_type'
  },
  changesDescription: {
    type: DataTypes.JSONB, // Qué campos cambiaron y sus nuevos/viejos valores
    field: 'changes_description'
  }
}, {
  tableName: 'audit_logs',
  timestamps: true, // Registra `created_at` automáticamente
  updatedAt: false, // Los logs son inmutables
  underscored: true
});

PatientProfile.hasMany(AuditLog, { foreignKey: 'patientId', as: 'auditLogs' });
AuditLog.belongsTo(PatientProfile, { foreignKey: 'patientId', as: 'patient' });

User.hasMany(AuditLog, { foreignKey: 'modifiedByUserId', as: 'actionLogs' });
AuditLog.belongsTo(User, { foreignKey: 'modifiedByUserId', as: 'modifiedBy' });

module.exports = AuditLog;
