const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Consultation = require('../models/Consultation');
const Transaction = require('../models/Transaction');
const PatientProfile = require('../models/PatientProfile');
const { Op, fn, col } = require('sequelize');

module.exports = {
  // Resumen de estadísticas del Dashboard
  getDashboardStats: async (req, res) => {
    try {
      // 1. Total Pacientes en BD
      const totalPatients = await User.count({
        where: { role: 'Paciente' }
      });

      // 2. Citas para hoy en BD (Calculadas en rango de medianoche a medianoche sin mutación de objeto)
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const todayAppointments = await Appointment.count({
        where: {
          appointmentDate: {
            [Op.between]: [startOfDay, endOfDay]
          },
          status: {
            [Op.ne]: 'Cancelada'
          }
        }
      });

      // 3. Total de consultas médicas registradas
      const totalConsultations = await Consultation.count();

      // 4. Total de transacciones financieras
      const totalTransactions = await Transaction.count();

      // 5. Próximas citas médicas agendadas (desde el inicio del día de hoy en adelante)
      const upcomingAppointments = await Appointment.findAll({
        where: {
          appointmentDate: {
            [Op.gte]: startOfDay
          },
          status: {
            [Op.ne]: 'Cancelada'
          }
        },
        include: [
          { model: User, as: 'patient', attributes: ['id', 'name', 'username'] },
          { model: User, as: 'doctor', attributes: ['id', 'name', 'username'] }
        ],
        order: [['appointmentDate', 'ASC']],
        limit: 10
      });

      return res.json({
        totalPatients,
        todayAppointments,
        totalConsultations,
        totalTransactions,
        upcomingAppointments
      });
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      return res.status(500).json({ error: 'Error al obtener resumen de estadísticas' });
    }
  },

  // Estadísticas históricas avanzadas para Módulo 7 (Director Médico)
  getHistoricalStats: async (req, res) => {
    try {
      const totalPatients = await User.count({ where: { role: 'Paciente' } });
      const totalConsultations = await Consultation.count();
      const totalAppointments = await Appointment.count();

      // Pacientes agrupados por sede de atención
      const patientsBySede = await User.findAll({
        where: { role: 'Paciente' },
        attributes: ['sedeAtencion', [fn('COUNT', col('id')), 'count']],
        group: ['sedeAtencion']
      });

      // Citas por estado
      const appointmentsByStatus = await Appointment.findAll({
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        group: ['status']
      });

      // Lista completa de distribución de usuarios por rol
      const usersByRole = await User.findAll({
        attributes: ['role', [fn('COUNT', col('id')), 'count']],
        group: ['role']
      });

      return res.json({
        totalPatients,
        totalConsultations,
        totalAppointments,
        patientsBySede,
        appointmentsByStatus,
        usersByRole
      });
    } catch (error) {
      console.error('Error al obtener estadísticas históricas:', error);
      return res.status(500).json({ error: 'Error al obtener estadísticas históricas' });
    }
  }
};
