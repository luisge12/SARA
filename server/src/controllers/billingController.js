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
      
      const transaction = await Transaction.create({
        patientId,
        doctorId,
        sedeAtencion,
        serviceType,
        totalAmountUSD,
        exchangeRate,
        totalAmountLocal,
        unimecoPercentage,
        doctorPercentage,
        unimecoAmount,
        doctorAmount,
        operativeCosts,
        incentives,
        netAmount,
        createdById: req.user.id
      });

      return res.status(201).json({ message: 'Pago registrado exitosamente', transaction });
    } catch (error) {
      console.error('Error al registrar pago:', error);
      return res.status(500).json({ error: 'Error interno del servidor al registrar pago' });
    }
  },

  getTransactions: async (req, res) => {
    try {
      const transactions = await Transaction.findAll({
        include: [
          { model: User, as: 'patient', attributes: ['id', 'name', 'username'] },
          { model: User, as: 'doctor', attributes: ['id', 'name', 'username'] },
          { model: User, as: 'creator', attributes: ['id', 'name', 'username'] }
        ],
        order: [['created_at', 'DESC']]
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
          created_at: {
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

