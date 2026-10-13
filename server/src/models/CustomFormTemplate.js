const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const CustomFormTemplate = sequelize.define('CustomFormTemplate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  title: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(100),
    defaultValue: 'General'
  },
  targetModule: {
    type: DataTypes.STRING(50),
    defaultValue: 'ALL', // 'CONSULTATION', 'STUDY', 'ALL'
    field: 'target_module'
  },
  description: {
    type: DataTypes.TEXT
  },
  // Array de objetos de campos definidos
  // [{ id, label, type, placeholder, required, options: [], defaultValue, width }]
  fields: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  isGlobal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_global'
  }
}, {
  tableName: 'custom_form_templates',
  timestamps: true,
  underscored: true
});

User.hasMany(CustomFormTemplate, { foreignKey: 'doctorId', as: 'customTemplates' });
CustomFormTemplate.belongsTo(User, { foreignKey: 'doctorId', as: 'author' });

module.exports = CustomFormTemplate;
