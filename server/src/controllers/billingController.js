// Controlador de Gestión Administrativa (Finanzas) para SARA
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { Op } = require('sequelize');

module.exports = {
  registerPayment: async (req, res) => {
    try {
      const {
        patientId, doctorId, sedeAtencion, serviceType,
        totalAmountUSD, exchangeRate, totalAmountLocal,
        unimecoPercentage, doctorPercentage,
        unimecoAmount, doctorAmount,
        operativeCosts, incentives, netAmount
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
        createdById: validCreatedById
      });

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

