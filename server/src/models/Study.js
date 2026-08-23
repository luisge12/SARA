const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Study = sequelize.define('Study', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    field: 'patient_id'
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    },
    field: 'doctor_id'
  },
  studyType: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'study_type'
  },
  sede: {
    type: DataTypes.STRING(100),
    defaultValue: 'CENTRAL'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  findings: {
    type: DataTypes.TEXT
  },
  biopsySample: {
    type: DataTypes.STRING(255),
    field: 'biopsy_sample'
  },
  diagnosticImpression: {
    type: DataTypes.TEXT,
    field: 'diagnostic_impression'
  },
  recommendations: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'Completado'
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  tableName: 'medical_studies',
  timestamps: true,
  underscored: true
});

User.hasMany(Study, { foreignKey: 'patientId', as: 'patientStudies' });
User.hasMany(Study, { foreignKey: 'doctorId', as: 'doctorStudies' });
Study.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Study.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

module.exports = Study;
