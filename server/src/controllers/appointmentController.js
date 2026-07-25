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
      const { 
        patientId, doctorId, sedeAtencion, appointmentDate, reason, status, notes,
        totalAmount, paidAmount, paymentMethod, paymentStatus 
      } = req.body;

      if (!patientId || !appointmentDate) {
        return res.status(400).json({ error: 'El paciente y la fecha/hora de la cita son obligatorios.' });
      }

      // Validar existencia del paciente
      const patient = await User.findOne({ where: { id: patientId, role: 'Paciente' } });
      if (!patient) {
        return res.status(404).json({ error: 'El paciente seleccionado no existe.' });
      }

      const tot = parseFloat(totalAmount || 0);
      const paid = parseFloat(paidAmount || 0);
      const pending = Math.max(0, tot - paid);

      let computedPayStatus = paymentStatus;
      if (!computedPayStatus) {
        if (paid >= tot && tot > 0) computedPayStatus = 'Pagado';
        else if (paid > 0) computedPayStatus = 'Parcial';
        else computedPayStatus = 'Pendiente';
      }

      const newAppointment = await Appointment.create({
        patientId,
        doctorId: doctorId || null,
        sedeAtencion: sedeAtencion || patient.sedeAtencion || 'CENTRAL',
        appointmentDate,
        reason: reason || 'Consulta General',
        status: status || 'Confirmada',
        notes: notes || '',
        totalAmount: tot,
        paidAmount: paid,
        pendingAmount: pending,
        paymentMethod: paymentMethod || 'Efectivo (USD)',
        paymentStatus: computedPayStatus,
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
      const { 
        patientId, doctorId, sedeAtencion, appointmentDate, reason, status, notes,
        totalAmount, paidAmount, paymentMethod, paymentStatus
      } = req.body;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada.' });
      }

      if (patientId) appointment.patientId = patientId;
      if (doctorId !== undefined) appointment.doctorId = doctorId;
      if (sedeAtencion) appointment.sedeAtencion = sedeAtencion;
      if (appointmentDate) appointment.appointmentDate = appointmentDate;
      if (reason) appointment.reason = reason;
      if (status) appointment.status = status;
      if (notes !== undefined) appointment.notes = notes;

      // Actualizar campos financieros si se proporcionan
      if (totalAmount !== undefined || paidAmount !== undefined) {
        const tot = totalAmount !== undefined ? parseFloat(totalAmount) : parseFloat(appointment.totalAmount || 0);
        const paid = paidAmount !== undefined ? parseFloat(paidAmount) : parseFloat(appointment.paidAmount || 0);
        appointment.totalAmount = tot;
        appointment.paidAmount = paid;
        appointment.pendingAmount = Math.max(0, tot - paid);

        if (paymentStatus) {
          appointment.paymentStatus = paymentStatus;
        } else {
          if (paid >= tot && tot > 0) appointment.paymentStatus = 'Pagado';
          else if (paid > 0) appointment.paymentStatus = 'Parcial';
          else appointment.paymentStatus = 'Pendiente';
        }
      } else if (paymentStatus) {
        appointment.paymentStatus = paymentStatus;
      }

      if (paymentMethod) appointment.paymentMethod = paymentMethod;

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
