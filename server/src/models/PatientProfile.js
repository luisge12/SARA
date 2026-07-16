const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const PatientProfile = sequelize.define('PatientProfile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    field: 'user_id'
  },
  // Demográficos (Sección 1) adicionales al User
  gender: {
    type: DataTypes.STRING(50)
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    field: 'date_of_birth'
  },
  phone: {
    type: DataTypes.STRING(50)
  },
  email: {
    type: DataTypes.STRING(150)
  },
  treatingDoctor: {
    type: DataTypes.STRING(150),
    field: 'treating_doctor'
  },
  referringEntity: {
    type: DataTypes.STRING(150),
    field: 'referring_entity'
  },
  nextAppointment: {
    type: DataTypes.DATE,
    field: 'next_appointment'
  },
  address: {
    type: DataTypes.TEXT
  },

  // Parámetros Generales (Sección 2)
  heartRate: {
    type: DataTypes.INTEGER,
    field: 'heart_rate'
  },
  respiratoryRate: {
    type: DataTypes.INTEGER,
    field: 'respiratory_rate'
  },
  bloodPressure: {
    type: DataTypes.STRING(20),
    field: 'blood_pressure'
  },
  oxygenSaturation: {
    type: DataTypes.INTEGER,
    field: 'oxygen_saturation'
  },
  heightCm: {
    type: DataTypes.INTEGER,
    field: 'height_cm'
  },
  weightKg: {
    type: DataTypes.DECIMAL(5, 2),
    field: 'weight_kg'
  }
}, {
  tableName: 'patient_profiles',
  timestamps: true,
  underscored: true
});

User.hasOne(PatientProfile, { foreignKey: 'userId', as: 'patientProfile' });
PatientProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = PatientProfile;
