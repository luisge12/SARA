const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const Consultation = require('../models/Consultation');
const AuditLog = require('../models/AuditLog');

// Función auxiliar para registrar la trazabilidad
async function logAudit(patientId, modifiedByUserId, actionType, changesDescription) {
  try {
    await AuditLog.create({
      patientId,
      modifiedByUserId,
      actionType,
      changesDescription
    });
  } catch (error) {
    console.error('Error al registrar auditoría:', error);
  }
}

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
      const userId = req.user.id; // El usuario que hace la modificación (Recepcionista o Médico)

      const patient = await User.findOne({ where: { id, role: 'Paciente' } });
      if (!patient) return res.status(404).json({ error: 'Paciente no encontrado' });

      // Actualizar datos base del User
      const oldUserData = { name: patient.name, identificationNumber: patient.identificationNumber, sedeAtencion: patient.sedeAtencion };
      
      if (data.name) patient.name = data.name;
      if (data.identificationNumber) patient.identificationNumber = data.identificationNumber;
      if (data.sedeAtencion) patient.sedeAtencion = data.sedeAtencion;
      await patient.save();

      // Buscar o crear perfil
      let profile = await PatientProfile.findOne({ where: { userId: id } });
      let oldProfileData = profile ? profile.toJSON() : {};
      
      if (!profile) {
        profile = await PatientProfile.create({ userId: id });
      }

      // Actualizar campos del perfil
      const updatableFields = [
        'gender', 'dateOfBirth', 'phone', 'email', 'treatingDoctor', 'referringEntity', 
        'nextAppointment', 'address', 'heartRate', 'respiratoryRate', 'bloodPressure', 
        'oxygenSaturation', 'heightCm', 'weightKg'
      ];

      updatableFields.forEach(field => {
        if (data[field] !== undefined) {
          profile[field] = data[field];
        }
      });
      
      await profile.save();

      // Registrar Trazabilidad
      await logAudit(profile.id, userId, 'UPDATE_DEMOGRAPHICS', { 
        oldUser: oldUserData, 
        newUser: { name: patient.name, identificationNumber: patient.identificationNumber, sedeAtencion: patient.sedeAtencion },
        oldProfile: oldProfileData, 
        newProfile: profile.toJSON() 
      });

      return res.json({ message: 'Perfil actualizado exitosamente', profile });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al actualizar paciente' });
    }
  },


  // === MÓDULO 4: Médico (Datos Clínicos) ===

  // Crear/Actualizar una Consulta
  saveConsultation: async (req, res) => {
    try {
      const { patientId } = req.params;
      const data = req.body;
      const doctorId = req.user.id; // El médico que está haciendo la consulta

      const profile = await PatientProfile.findOne({ where: { userId: patientId } });
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

      // Registrar Trazabilidad
      await logAudit(profile.id, doctorId, action, { oldData, newData: consultation.toJSON() });

      return res.json({ message: 'Consulta guardada', consultation });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al guardar consulta' });
    }
  },

  // Obtener Historial de Consultas de un Paciente
  getPatientConsultations: async (req, res) => {
    try {
      const { patientId } = req.params;
      const profile = await PatientProfile.findOne({ where: { userId: patientId } });
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

  // Obtener Auditoría de un Paciente
  getPatientAuditLogs: async (req, res) => {
    try {
      const { patientId } = req.params;
      const profile = await PatientProfile.findOne({ where: { userId: patientId } });
      if (!profile) return res.json([]);

      const logs = await AuditLog.findAll({
        where: { patientId: profile.id },
        include: [{ model: User, as: 'modifiedBy', attributes: ['name', 'role'] }],
        order: [['created_at', 'DESC']]
      });

      return res.json(logs);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al obtener auditoría' });
    }
  }
};
