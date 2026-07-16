const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const PatientProfile = require('./PatientProfile');
const User = require('./User'); // Para el doctor

const Consultation = sequelize.define('Consultation', {
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
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    field: 'doctor_id'
  },
  
  // Sección 3: Motivo de consulta (Array JSON)
  // [{ onset, symptom, complement, regionGeneral, regionSpecific, relatedTo, additionalInfo }]
  reasonForVisit: {
    type: DataTypes.JSONB,
    field: 'reason_for_visit'
  },

  // Sección 4: Hallazgos
  physicalInspection: {
    type: DataTypes.TEXT,
    field: 'physical_inspection'
  },
  physicalPalpation: {
    type: DataTypes.TEXT,
    field: 'physical_palpation'
  },
  rectalExamination: {
    type: DataTypes.TEXT,
    field: 'rectal_examination'
  },
  anoscopy: {
    type: DataTypes.TEXT,
    field: 'anoscopy'
  },

  // Sección 5: Diagnósticos (Array JSON)
  // [{ diagnosis, classification, complication, histologicType, stage }]
  diagnoses: {
    type: DataTypes.JSONB
  },

  // Sección 6: Plan de trabajo (Array JSON)
  // [{ medication, presentation, indication, duration }]
  treatmentPlan: {
    type: DataTypes.JSONB,
    field: 'treatment_plan'
  },

  // Sección 7: Informe Evolutivo
  evolutionaryReport: {
    type: DataTypes.TEXT,
    field: 'evolutionary_report'
  }
}, {
  tableName: 'consultations',
  timestamps: true, // Registra created_at y updated_at
  underscored: true
});

PatientProfile.hasMany(Consultation, { foreignKey: 'patientId', as: 'consultations' });
Consultation.belongsTo(PatientProfile, { foreignKey: 'patientId', as: 'patient' });

User.hasMany(Consultation, { foreignKey: 'doctorId', as: 'doctorConsultations' });
Consultation.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

module.exports = Consultation;
