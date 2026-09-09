const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const Consultation = require('../models/Consultation');
const AuditLog = require('../models/AuditLog');
const { calculateDiff, logPatientAudit } = require('../services/auditService');
const { Op } = require('sequelize');

module.exports = {
  // === MÓDULO 2: Recepción ===
  
  // Obtener todos los pacientes
  getPatients: async (req, res) => {
    try {
      const patients = await User.findAll({
        where: { role: 'Paciente' },
        include: [{ model: PatientProfile, as: 'patientProfile' }]
      });
      return res.json(patients);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al obtener pacientes' });
    }
  },

  // Obtener un paciente específico (Secciones 1 y 2)
  getPatientProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const patient = await User.findOne({
        where: { id, role: 'Paciente' },
        include: [{ model: PatientProfile, as: 'patientProfile' }]
      });
      if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' });
      return res.json(patient);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al obtener perfil' });
    }
  },

  // Actualizar datos del paciente (Secciones 1 y 2)
  updatePatientProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const userId = req.user ? req.user.id : null; // El usuario que hace la modificación (Recepcionista o Médico)

      const patient = await User.findOne({ where: { id, role: 'Paciente' } });
      if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' });

      // Buscar o crear perfil
      let profile = await PatientProfile.findOne({ where: { userId: id } });
      if (!profile) {
        profile = await PatientProfile.create({ userId: id });
      }

      const safeIsoDate = (val) => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d.toISOString();
      };

      const safeDateOnly = (val) => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
      };

      // Capturar estado previo para cálculo exacto de diferencias
      const oldState = {
        name: patient.name || '',
        identificationNumber: patient.identificationNumber || '',
        sedeAtencion: patient.sedeAtencion || '',
        gender: profile.gender || patient.gender || '',
        dateOfBirth: safeDateOnly(profile.dateOfBirth || patient.date_of_birth) || '',
        phone: profile.phone || patient.phone || '',
        email: profile.email || patient.email || '',
        treatingDoctor: profile.treatingDoctor || '',
        referringEntity: profile.referringEntity || '',
        nextAppointment: safeIsoDate(profile.nextAppointment) || '',
        address: profile.address || '',
        personalHistory: profile.personalHistory || '',
        surgicalHistory: profile.surgicalHistory || '',
        familyHistory: profile.familyHistory || '',
        heartRate: profile.heartRate != null ? String(profile.heartRate) : '',
        respiratoryRate: profile.respiratoryRate != null ? String(profile.respiratoryRate) : '',
        bloodPressure: profile.bloodPressure || '',
        oxygenSaturation: profile.oxygenSaturation != null ? String(profile.oxygenSaturation) : '',
        heightCm: profile.heightCm != null ? String(profile.heightCm) : '',
        weightKg: profile.weightKg != null ? String(profile.weightKg) : ''
      };
      
      const oldUserData = { name: patient.name, identificationNumber: patient.identificationNumber, sedeAtencion: patient.sedeAtencion };
      const oldProfileData = profile.toJSON();

      // Actualizar datos base del User
      if (data.name !== undefined) patient.name = data.name;
      if (data.identificationNumber !== undefined) patient.identificationNumber = data.identificationNumber;
      if (data.sedeAtencion !== undefined) patient.sedeAtencion = data.sedeAtencion;
      if (data.gender !== undefined) patient.gender = data.gender;
      if (data.dateOfBirth !== undefined) patient.date_of_birth = safeDateOnly(data.dateOfBirth);
      if (data.phone !== undefined) patient.phone = data.phone;
      if (data.email !== undefined) patient.email = data.email;
      await patient.save();

      // Actualizar campos del perfil con sanitización de tipos
      if (data.gender !== undefined) profile.gender = data.gender;
      if (data.dateOfBirth !== undefined) profile.dateOfBirth = safeDateOnly(data.dateOfBirth);
      if (data.phone !== undefined) profile.phone = data.phone;
      if (data.email !== undefined) profile.email = data.email;
      if (data.treatingDoctor !== undefined) profile.treatingDoctor = data.treatingDoctor;
      if (data.referringEntity !== undefined) profile.referringEntity = data.referringEntity;
      if (data.nextAppointment !== undefined) profile.nextAppointment = safeIsoDate(data.nextAppointment);
      if (data.address !== undefined) profile.address = data.address;
      if (data.bloodPressure !== undefined) profile.bloodPressure = data.bloodPressure;

      // Antecedentes Médicos y Quirúrgicos
      if (data.personalHistory !== undefined) profile.personalHistory = data.personalHistory;
      if (data.surgicalHistory !== undefined) profile.surgicalHistory = data.surgicalHistory;
      if (data.familyHistory !== undefined) profile.familyHistory = data.familyHistory;

      // Sanitizar campos numéricos
      if (data.heartRate !== undefined) profile.heartRate = (data.heartRate === '' || data.heartRate === null || isNaN(data.heartRate)) ? null : parseInt(data.heartRate);
      if (data.respiratoryRate !== undefined) profile.respiratoryRate = (data.respiratoryRate === '' || data.respiratoryRate === null || isNaN(data.respiratoryRate)) ? null : parseInt(data.respiratoryRate);
      if (data.oxygenSaturation !== undefined) profile.oxygenSaturation = (data.oxygenSaturation === '' || data.oxygenSaturation === null || isNaN(data.oxygenSaturation)) ? null : parseInt(data.oxygenSaturation);
      if (data.heightCm !== undefined) profile.heightCm = (data.heightCm === '' || data.heightCm === null || isNaN(data.heightCm)) ? null : parseInt(data.heightCm);
      if (data.weightKg !== undefined) profile.weightKg = (data.weightKg === '' || data.weightKg === null || isNaN(data.weightKg)) ? null : parseFloat(data.weightKg);
      
      await profile.save();

      // Capturar nuevo estado
      const newState = {
        name: patient.name || '',
        identificationNumber: patient.identificationNumber || '',
        sedeAtencion: patient.sedeAtencion || '',
        gender: profile.gender || patient.gender || '',
        dateOfBirth: safeDateOnly(profile.dateOfBirth || patient.date_of_birth) || '',
        phone: profile.phone || patient.phone || '',
        email: profile.email || patient.email || '',
        treatingDoctor: profile.treatingDoctor || '',
        referringEntity: profile.referringEntity || '',
        nextAppointment: safeIsoDate(profile.nextAppointment) || '',
        address: profile.address || '',
        personalHistory: profile.personalHistory || '',
        surgicalHistory: profile.surgicalHistory || '',
        familyHistory: profile.familyHistory || '',
        heartRate: profile.heartRate != null ? String(profile.heartRate) : '',
        respiratoryRate: profile.respiratoryRate != null ? String(profile.respiratoryRate) : '',
        bloodPressure: profile.bloodPressure || '',
        oxygenSaturation: profile.oxygenSaturation != null ? String(profile.oxygenSaturation) : '',
        heightCm: profile.heightCm != null ? String(profile.heightCm) : '',
        weightKg: profile.weightKg != null ? String(profile.weightKg) : ''
      };

      // Calcular diferencias campo por campo
      const diffs = calculateDiff(oldState, newState, Object.keys(oldState));

      // Registrar Trazabilidad en base de datos si hubo cambios
      if (diffs.length > 0) {
        await logPatientAudit({
          patientId: profile.id,
          userId,
          actionType: 'UPDATE_DEMOGRAPHICS',
          summary: `Se modificaron ${diffs.length} campo(s): ${diffs.map(d => d.label).join(', ')}`,
          diffs,
          metadata: {
            oldUser: oldUserData,
            newUser: { name: patient.name, identificationNumber: patient.identificationNumber, sedeAtencion: patient.sedeAtencion },
            oldProfile: oldProfileData,
            newProfile: profile.toJSON()
          }
        });
      }

      return res.json({ message: 'Perfil actualizado exitosamente', profile, diffsCount: diffs.length });
    } catch (error) {
      console.error('Error al actualizar paciente:', error);
      return res.status(500).json({ error: 'Error al actualizar paciente' });
    }
  },


  // === MÓDULO 4: Médico (Datos Clínicos) ===

  // Crear/Actualizar una Consulta
  saveConsultation: async (req, res) => {
    try {
      const { patientId } = req.params;
      const data = req.body;
      const doctorId = req.user ? req.user.id : null;

      const profile = await PatientProfile.findOne({
        where: {
          [Op.or]: [{ userId: patientId }, { id: patientId }]
        }
      });
      if (!profile) return res.status(404).json({ error: 'Perfil de paciente no encontrado. Actualice los demográficos primero.' });

      let consultation;
      let action = 'CREATE_CONSULTATION';
      let oldData = {};

      if (data.id) {
        // Actualizar consulta existente
        consultation = await Consultation.findByPk(data.id);
        if (!consultation) return res.status(404).json({ error: 'Consulta no encontrada' });
        oldData = consultation.toJSON();
        action = 'UPDATE_CONSULTATION';
      } else {
        // Crear nueva consulta
        consultation = Consultation.build({
          patientId: profile.id,
          doctorId: doctorId
        });
      }

      const consultFields = [
        'reasonForVisit', 'physicalInspection', 'physicalPalpation', 'rectalExamination', 
        'anoscopy', 'diagnoses', 'treatmentPlan', 'evolutionaryReport'
      ];

      consultFields.forEach(field => {
        if (data[field] !== undefined) {
          consultation[field] = data[field];
        }
      });

      await consultation.save();
      const newData = consultation.toJSON();

      // Calcular diferencias clínicas
      let diffs = [];
      let summary = 'Consulta clínica registrada';

      if (action === 'UPDATE_CONSULTATION') {
        diffs = calculateDiff(oldData, newData, consultFields);
        summary = diffs.length > 0 
          ? `Consulta modificada: ${diffs.map(d => d.label).join(', ')}`
          : 'Consulta clínica actualizada';
      } else {
        // Nueva consulta: listar secciones no vacías
        diffs = consultFields
          .filter(f => data[f] && (Array.isArray(data[f]) ? data[f].length > 0 : String(data[f]).trim().length > 0))
          .map(f => ({
            field: f,
            label: require('../services/auditService').FIELD_LABELS[f] || f,
            oldValue: '(nueva consulta)',
            newValue: require('../services/auditService').formatDisplayValue(data[f])
          }));
        summary = 'Nueva consulta médica registrada';
      }

      // Registrar Trazabilidad
      await logPatientAudit({
        patientId: profile.id,
        userId: doctorId,
        actionType: action,
        summary,
        diffs,
        metadata: { oldData, newData }
      });

      return res.json({ message: 'Consulta guardada', consultation });
    } catch (error) {
      console.error('Error al guardar consulta:', error);
      return res.status(500).json({ error: 'Error al guardar consulta' });
    }
  },

  // Obtener Historial de Consultas de un Paciente
  getPatientConsultations: async (req, res) => {
    try {
      const { patientId } = req.params;
      const profile = await PatientProfile.findOne({
        where: {
          [Op.or]: [{ userId: patientId }, { id: patientId }]
        }
      });
      if (!profile) return res.json([]);

      const consultations = await Consultation.findAll({
        where: { patientId: profile.id },
        include: [{ model: User, as: 'doctor', attributes: ['name', 'role'] }],
        order: [['created_at', 'DESC']]
      });

      return res.json(consultations);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al obtener consultas' });
    }
  },

  // Obtener Auditoría de un Paciente (Historial Completo de Modificaciones)
  getPatientAuditLogs: async (req, res) => {
    try {
      const { patientId } = req.params;
      const profile = await PatientProfile.findOne({
        where: {
          [Op.or]: [{ userId: patientId }, { id: patientId }]
        }
      });
      if (!profile) return res.json([]);

      const logs = await AuditLog.findAll({
        where: {
          [Op.or]: [
            { patientId: profile.id },
            { patientId: profile.userId }
          ]
        },
        include: [{
          model: User,
          as: 'modifiedBy',
          attributes: ['id', 'name', 'role', 'username', 'sedeAtencion']
        }],
        order: [['created_at', 'DESC']]
      });

      return res.json(logs);
    } catch (error) {
      console.error('Error al obtener auditoría del paciente:', error);
      return res.status(500).json({ error: 'Error al obtener auditoría' });
    }
  }
};
