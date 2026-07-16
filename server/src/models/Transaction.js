const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Transaction = sequelize.define('Transaction', {
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
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    field: 'doctor_id'
  },
  sedeAtencion: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'sede_atencion'
  },
  serviceType: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'service_type'
  },
  totalAmountUSD: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount_usd'
  },
  exchangeRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'exchange_rate'
  },
  totalAmountLocal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'total_amount_local'
  },
  unimecoPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    field: 'unimeco_percentage'
  },
  doctorPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    field: 'doctor_percentage'
  },
  unimecoAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'unimeco_amount'
  },
  doctorAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'doctor_amount'
  },
  operativeCosts: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'operative_costs'
  },
  incentives: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'incentives'
  },
  netAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'net_amount'
  },
  createdById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    field: 'created_by_id'
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  underscored: true
});

User.hasMany(Transaction, { foreignKey: 'patientId', as: 'patientTransactions' });
User.hasMany(Transaction, { foreignKey: 'doctorId', as: 'doctorTransactions' });
User.hasMany(Transaction, { foreignKey: 'createdById', as: 'createdTransactions' });
Transaction.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Transaction.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
Transaction.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

module.exports = Transaction;
