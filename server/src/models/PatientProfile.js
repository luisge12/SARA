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
  photoUrl: {
    type: DataTypes.TEXT,
    field: 'photo_url'
  },
  flowType: {
    type: DataTypes.STRING(50),
    field: 'flow_type',
    defaultValue: 'PRIMERA_VEZ'
  },
  customFields: {
    type: DataTypes.JSONB,
    field: 'custom_fields',
    defaultValue: {}
  },
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

  // Antecedentes Personales y Quirúrgicos
  personalHistory: {
    type: DataTypes.TEXT,
    field: 'personal_history'
  },
  surgicalHistory: {
    type: DataTypes.TEXT,
    field: 'surgical_history'
  },

  // Antecedentes Familiares
  familyHistory: {
    type: DataTypes.TEXT,
    field: 'family_history'
  },

  // Antecedentes Gineco-Obstétricos
  menarcheAge: {
    type: DataTypes.STRING(20),
    field: 'menarche_age'
  },
  menopauseAge: {
    type: DataTypes.STRING(20),
    field: 'menopause_age'
  },
  obstetricFormula: {
    type: DataTypes.STRING(50),
    field: 'obstetric_formula'
  },

  // Hábito Evacuatorio y Coloproctología
  bristolType: {
    type: DataTypes.STRING(50),
    field: 'bristol_type'
  },
  bowelFrequency: {
    type: DataTypes.STRING(100),
    field: 'bowel_frequency'
  },
  strainToEvacuate: {
    type: DataTypes.STRING(20),
    field: 'strain_to_evacuate'
  },
  incompleteEvacuation: {
    type: DataTypes.STRING(20),
    field: 'incomplete_evacuation'
  },
  bowelNotes: {
    type: DataTypes.TEXT,
    field: 'bowel_notes'
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
