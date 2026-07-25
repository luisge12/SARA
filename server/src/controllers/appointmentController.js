const Appointment = require('../models/Appointment');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const { Op } = require('sequelize');

module.exports = {
  // Obtener todas las citas (con filtros opcionales)
  getAppointments: async (req, res) => {
    try {
      const { patientId, doctorId, status, sedeAtencion, date } = req.query;
      const whereClause = {};

      if (patientId) whereClause.patientId = patientId;
      if (doctorId) whereClause.doctorId = doctorId;
      if (status) whereClause.status = status;
      if (sedeAtencion) whereClause.sedeAtencion = sedeAtencion;

      if (date) {
        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);
        whereClause.appointmentDate = {
          [Op.between]: [startOfDay, endOfDay]
        };
      }

      const appointments = await Appointment.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'patient', attributes: ['id', 'name', 'username', 'identificationNumber'] },
          { model: User, as: 'doctor', attributes: ['id', 'name', 'username', 'sedeAtencion'] },
          { model: User, as: 'creator', attributes: ['id', 'name', 'username'] }
        ],
        order: [['appointmentDate', 'ASC']]
      });

      return res.json(appointments);
    } catch (error) {
      console.error('Error al obtener citas:', error);
      return res.status(500).json({ error: 'Error al obtener la lista de citas' });
    }
  },

  // Crear una nueva cita
  createAppointment: async (req, res) => {
    try {
      const { patientId, doctorId, sedeAtencion, appointmentDate, reason, status, notes } = req.body;

      if (!patientId || !appointmentDate) {
        return res.status(400).json({ error: 'El paciente y la fecha/hora de la cita son obligatorios.' });
      }

      // Validar existencia del paciente
      const patient = await User.findOne({ where: { id: patientId, role: 'Paciente' } });
      if (!patient) {
        return res.status(404).json({ error: 'El paciente seleccionado no existe.' });
      }

      const newAppointment = await Appointment.create({
        patientId,
        doctorId: doctorId || null,
        sedeAtencion: sedeAtencion || patient.sedeAtencion || 'CENTRAL',
        appointmentDate,
        reason: reason || 'Consulta General',
        status: status || 'Confirmada',
        notes: notes || '',
        createdById: req.user ? req.user.id : null
      });

      // Actualizar la fecha de próxima cita en el PatientProfile si aplica
      let profile = await PatientProfile.findOne({ where: { userId: patientId } });
      if (profile) {
        profile.nextAppointment = appointmentDate;
        await profile.save();
      }

      const createdFull = await Appointment.findByPk(newAppointment.id, {
        include: [
          { model: User, as: 'patient', attributes: ['id', 'name', 'username', 'identificationNumber'] },
          { model: User, as: 'doctor', attributes: ['id', 'name', 'username'] }
        ]
      });

      return res.status(201).json({
        message: 'Cita creada exitosamente',
        appointment: createdFull
      });
    } catch (error) {
      console.error('Error al crear cita:', error);
      return res.status(500).json({ error: 'Error al agendar la cita médica' });
    }
  },

  // Actualizar datos o estado de una cita
  updateAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const { doctorId, sedeAtencion, appointmentDate, reason, status, notes } = req.body;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada.' });
      }

      if (doctorId !== undefined) appointment.doctorId = doctorId;
      if (sedeAtencion) appointment.sedeAtencion = sedeAtencion;
      if (appointmentDate) appointment.appointmentDate = appointmentDate;
      if (reason) appointment.reason = reason;
      if (status) appointment.status = status;
      if (notes !== undefined) appointment.notes = notes;

      await appointment.save();

      const updatedFull = await Appointment.findByPk(appointment.id, {
        include: [
          { model: User, as: 'patient', attributes: ['id', 'name', 'username', 'identificationNumber'] },
          { model: User, as: 'doctor', attributes: ['id', 'name', 'username'] }
        ]
      });

      return res.json({
        message: 'Cita actualizada exitosamente',
        appointment: updatedFull
      });
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      return res.status(500).json({ error: 'Error al actualizar la cita' });
    }
  },

  // Cancelar / Eliminar cita
  deleteAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada.' });
      }

      await appointment.destroy();
      return res.json({ message: 'Cita eliminada correctamente.' });
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      return res.status(500).json({ error: 'Error al cancelar la cita' });
    }
  }
};
