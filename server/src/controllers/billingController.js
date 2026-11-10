// Controlador de Gestión Administrativa (Finanzas) para SARA
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Study = require('../models/Study');
const { Op } = require('sequelize');

module.exports = {
  // Obtener cuentas pendientes por cobrar (Citas y Estudios médicos no pagados)
  getPendingReceivables: async (req, res) => {
    try {
      // 1. Citas pendientes o parciales (no canceladas)
      const appointments = await Appointment.findAll({
        where: {
          paymentStatus: { [Op.in]: ['Pendiente', 'Parcial'] },
          status: { [Op.ne]: 'Cancelada' }
        },
        include: [
          { model: User, as: 'patient', attributes: ['id', 'name', 'username', 'identificationNumber'] },
          { model: User, as: 'doctor', attributes: ['id', 'name', 'username', 'specialty', 'sedeAtencion'] }
        ],
        order: [['appointmentDate', 'DESC']]
      });

      // 2. Estudios / Procedimientos pendientes
      const studies = await Study.findAll({
        where: {
          [Op.or]: [
            { paymentStatus: { [Op.in]: ['Pendiente', 'Parcial'] } },
            { paymentStatus: null }
          ]
        },
        include: [
          { model: User, as: 'patient', attributes: ['id', 'name', 'username', 'identificationNumber'] },
          { model: User, as: 'doctor', attributes: ['id', 'name', 'username', 'specialty'] }
        ],
        order: [['date', 'DESC'], ['id', 'DESC']]
      });

      const formattedApts = appointments.map(apt => ({
        id: `cita-${apt.id}`,
        itemType: 'CITA',
        appointmentId: apt.id,
        studyId: null,
        patientId: apt.patientId,
        patientName: apt.patient?.name || apt.patient?.username || 'Paciente Sin Nombre',
        patientIdDoc: apt.patient?.identificationNumber || '',
        doctorId: apt.doctorId,
        doctorName: apt.doctor?.name || apt.doctor?.username || 'Médico No Asignado',
        doctorSpecialty: apt.doctor?.specialty || '',
        sedeAtencion: apt.sedeAtencion || 'CENTRAL',
        date: apt.appointmentDate,
        concept: `Cita Médica / Consulta: ${apt.reason || 'Consulta General'}`,
        totalAmount: parseFloat(apt.totalAmount) || 0,
        paidAmount: parseFloat(apt.paidAmount) || 0,
        pendingAmount: Math.max(0, (parseFloat(apt.totalAmount) || 0) - (parseFloat(apt.paidAmount) || 0)),
        paymentStatus: apt.paymentStatus || 'Pendiente'
      }));

      const formattedStudies = studies.map(st => ({
        id: `estudio-${st.id}`,
        itemType: 'ESTUDIO',
        appointmentId: null,
        studyId: st.id,
        patientId: st.patientId,
        patientName: st.patient?.name || st.patient?.username || 'Paciente Sin Nombre',
        patientIdDoc: st.patient?.identificationNumber || '',
        doctorId: st.doctorId,
        doctorName: st.doctor?.name || st.doctor?.username || 'Médico No Asignado',
        doctorSpecialty: st.doctor?.specialty || '',
        sedeAtencion: st.sede || 'CENTRAL',
        date: st.date,
        concept: `Estudio / Procedimiento: ${st.studyType}`,
        totalAmount: parseFloat(st.totalAmount) || 0,
        paidAmount: parseFloat(st.paidAmount) || 0,
        pendingAmount: Math.max(0, (parseFloat(st.totalAmount) || 0) - (parseFloat(st.paidAmount) || 0)),
        paymentStatus: st.paymentStatus || 'Pendiente'
      }));

      const allPending = [...formattedApts, ...formattedStudies];
      return res.json(allPending);
    } catch (error) {
      console.error('Error al obtener cuentas por cobrar:', error);
      return res.status(500).json({ error: 'Error al obtener cuentas por cobrar pendientes' });
    }
  },

  registerPayment: async (req, res) => {
    try {
      const {
        patientId, doctorId, sedeAtencion, serviceType,
        totalAmountUSD, exchangeRate, totalAmountLocal,
        unimecoPercentage, doctorPercentage,
        unimecoAmount, doctorAmount,
        operativeCosts, incentives, netAmount,
        appointmentId, studyId
      } = req.body;
      
      if (!patientId || !doctorId || !sedeAtencion || !serviceType || totalAmountUSD === undefined) {
        return res.status(400).json({ error: 'Faltan campos requeridos para registrar el pago' });
      }

      // Validar paciente y médico
      const patient = await User.findByPk(patientId);
      if (!patient) {
        return res.status(400).json({ error: 'El paciente seleccionado no existe' });
      }

      const doctor = await User.findByPk(doctorId);
      if (!doctor) {
        return res.status(400).json({ error: 'El médico seleccionado no existe' });
      }

      // Validar createdById de forma segura sin romper FK
      let validCreatedById = null;
      if (req.user && req.user.id) {
        const creator = await User.findByPk(req.user.id);
        if (creator) {
          validCreatedById = creator.id;
        }
      }

      // Si el ID del token no existe en la base de datos actual, usar como fallback un Master/Admin o el médico
      if (!validCreatedById) {
        const fallbackUser = await User.findOne({ where: { role: 'Master' } }) 
          || await User.findOne({ where: { role: 'Administrador' } }) 
          || await User.findByPk(doctorId);
        if (fallbackUser) {
          validCreatedById = fallbackUser.id;
        }
      }

      // Parsear números de forma segura (soportando comas y puntos)
      const parseSafe = (val, def = 0) => {
        if (val === undefined || val === null || val === '') return def;
        const str = String(val).replace(',', '.');
        const num = parseFloat(str);
        return isNaN(num) ? def : num;
      };

      const numTotalUSD = parseSafe(totalAmountUSD, 0);
      const numExchangeRate = parseSafe(exchangeRate, 0);
      const numTotalLocal = totalAmountLocal ? parseSafe(totalAmountLocal, 0) : (numTotalUSD * numExchangeRate);
      const numUnimecoPerc = parseSafe(unimecoPercentage, 30);
      const numDoctorPerc = parseSafe(doctorPercentage, 70);
      
      // Validar que la suma de porcentajes sea exactamente 100%
      const sumPerc = numUnimecoPerc + numDoctorPerc;
      if (Math.abs(sumPerc - 100) > 0.05) {
        return res.status(400).json({ error: `La suma de retención de la clínica (${numUnimecoPerc}%) y honorarios del médico (${numDoctorPerc}%) debe ser exactamente 100% (suma actual: ${sumPerc}%).` });
      }

      const numUnimecoAmt = unimecoAmount !== undefined ? parseSafe(unimecoAmount, 0) : (numTotalUSD * (numUnimecoPerc / 100));
      const numDoctorAmt = doctorAmount !== undefined ? parseSafe(doctorAmount, 0) : (numTotalUSD * (numDoctorPerc / 100));
      const numOperativeCosts = parseSafe(operativeCosts, 0);
      const numIncentives = parseSafe(incentives, 0);
      const numNetAmount = netAmount !== undefined ? parseSafe(netAmount, 0) : (numUnimecoAmt - numOperativeCosts - numIncentives);
      
      const transaction = await Transaction.create({
        patientId: patient.id,
        doctorId: doctor.id,
        sedeAtencion,
        serviceType,
        totalAmountUSD: numTotalUSD,
        exchangeRate: numExchangeRate,
        totalAmountLocal: numTotalLocal,
        unimecoPercentage: numUnimecoPerc,
        doctorPercentage: numDoctorPerc,
        unimecoAmount: numUnimecoAmt,
        doctorAmount: numDoctorAmt,
        operativeCosts: numOperativeCosts,
        incentives: numIncentives,
        netAmount: numNetAmount,
        createdById: validCreatedById,
        appointmentId: appointmentId ? parseInt(appointmentId) : null,
        studyId: studyId ? parseInt(studyId) : null
      });

      // Si el pago proviene de una cita médica, actualizar su estado de pago
      if (appointmentId) {
        try {
          const apt = await Appointment.findByPk(appointmentId);
          if (apt) {
            const currentPaid = parseFloat(apt.paidAmount) || 0;
            const newPaid = currentPaid + numTotalUSD;
            const aptTotal = parseFloat(apt.totalAmount) || 0;
            const finalTotal = aptTotal > 0 ? aptTotal : newPaid;
            const pending = Math.max(0, finalTotal - newPaid);

            apt.totalAmount = finalTotal;
            apt.paidAmount = newPaid;
            apt.pendingAmount = pending;
            apt.paymentStatus = pending <= 0 ? 'Pagado' : 'Parcial';
            await apt.save();
          }
        } catch (aptErr) {
          console.warn('Aviso al actualizar cita tras pago:', aptErr.message);
        }
      }

      // Si el pago proviene de un estudio médico, actualizar su estado de pago
      if (studyId) {
        try {
          const st = await Study.findByPk(studyId);
          if (st) {
            const currentPaid = parseFloat(st.paidAmount) || 0;
            const newPaid = currentPaid + numTotalUSD;
            const studyTotal = parseFloat(st.totalAmount) || 0;
            const finalTotal = studyTotal > 0 ? studyTotal : newPaid;

            st.totalAmount = finalTotal;
            st.paidAmount = newPaid;
            st.paymentStatus = 'Pagado';
            await st.save();
          }
        } catch (stErr) {
          console.warn('Aviso al actualizar estudio tras pago:', stErr.message);
        }
      }

      return res.status(201).json({ message: 'Pago registrado exitosamente', transaction });
    } catch (error) {
      console.error('Error al registrar pago:', error);
      return res.status(500).json({ error: error.message || 'Error interno del servidor al registrar pago' });
    }
  },

  getTransactions: async (req, res) => {
    try {
      const { patientId } = req.query;
      const whereClause = {};
      
      if (patientId) {
        whereClause.patientId = patientId;
      }
      
      const transactions = await Transaction.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'patient', attributes: ['id', 'name', 'username', 'identificationNumber'] },
          { model: User, as: 'doctor', attributes: ['id', 'name', 'username'] },
          { model: User, as: 'creator', attributes: ['id', 'name', 'username'], required: false }
        ],
        order: [['id', 'DESC']]
      });
      return res.json(transactions);
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      return res.status(500).json({ error: 'Error al obtener historial de pagos' });
    }
  },

  getAnnualSummary: async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();
      
      const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);
      
      const transactions = await Transaction.findAll({
        where: {
          createdAt: {
            [Op.between]: [startOfYear, endOfYear]
          }
        }
      });
      
      let totalGrossUSD = 0;
      let totalUnimecoUSD = 0;
      let totalDoctorUSD = 0;
      let totalCostsUSD = 0;
      
      transactions.forEach(t => {
        totalGrossUSD += parseFloat(t.totalAmountUSD) || 0;
        totalUnimecoUSD += parseFloat(t.unimecoAmount) || 0;
        totalDoctorUSD += parseFloat(t.doctorAmount) || 0;
        totalCostsUSD += (parseFloat(t.operativeCosts) || 0) + (parseFloat(t.incentives) || 0);
      });
      
      return res.json({
        year: currentYear,
        totalGrossUSD,
        totalUnimecoUSD,
        totalDoctorUSD,
        totalCostsUSD,
        netUnimecoUSD: totalUnimecoUSD - totalCostsUSD
      });
    } catch (error) {
      console.error('Error al obtener resumen anual:', error);
      return res.status(500).json({ error: 'Error al obtener resumen financiero' });
    }
  },

  getBcvExchangeRate: async (req, res) => {
    try {
      const { getBcvRate } = require('../services/bcvService');
      const forceRefresh = req.query.refresh === 'true';
      const bcvData = await getBcvRate(forceRefresh);
      return res.json(bcvData);
    } catch (error) {
      console.error('Error al consultar tasa BCV:', error.message);
      return res.status(500).json({ error: 'No se pudo obtener la tasa oficial del BCV', details: error.message });
    }
  }
};

