const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Appointment = sequelize.define('Appointment', {
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
  sedeAtencion: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'CENTRAL',
    field: 'sede_atencion'
  },
  appointmentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'appointment_date'
  },
  reason: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Confirmada' // 'Pendiente', 'Confirmada', 'Completada', 'Cancelada'
  },
  notes: {
    type: DataTypes.TEXT
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'total_amount'
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'paid_amount'
  },
  pendingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'pending_amount'
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Efectivo (USD)',
    field: 'payment_method'
  },
  paymentStatus: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Pendiente', // 'Pendiente', 'Parcial', 'Pagado'
    field: 'payment_status'
  },
  createdById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    },
    field: 'created_by_id'
  }
}, {
  tableName: 'appointments',
  timestamps: true,
  underscored: true
});

User.hasMany(Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
Appointment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

User.hasMany(Appointment, { foreignKey: 'createdById', as: 'createdAppointments' });
Appointment.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

module.exports = Appointment;
