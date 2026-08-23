const Study = require('../models/Study');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');

module.exports = {
  // Crear un nuevo estudio médico
  createStudy: async (req, res) => {
    try {
      const {
        patientId,
        doctorId,
        studyType,
        sede,
        date,
        findings,
        biopsySample,
        diagnosticImpression,
        recommendations,
        status,
        attachments
      } = req.body;

      if (!patientId || !studyType || !date) {
        return res.status(400).json({ error: 'Faltan campos obligatorios (paciente, tipo de estudio, fecha).' });
      }

      // Si no se envía doctorId, se usa el del usuario autenticado si es médico/master
      const assignedDoctorId = doctorId || req.user.id;

      const study = await Study.create({
        patientId,
        doctorId: assignedDoctorId,
        studyType,
        sede: sede || 'CENTRAL',
        date,
        findings,
        biopsySample: biopsySample || 'No se tomó muestra',
        diagnosticImpression,
        recommendations,
        status: status || 'Completado',
        attachments: attachments || []
      });

      // Devolver con datos del paciente y doctor
      const fullStudy = await Study.findByPk(study.id, {
        include: [
          {
            model: User,
            as: 'patient',
            attributes: ['id', 'name', 'username', 'identificationNumber'],
            include: [{ model: PatientProfile, as: 'patientProfile' }]
          },
          {
            model: User,
            as: 'doctor',
            attributes: ['id', 'name', 'username', 'mppsNumber', 'medicalCollegeNumber']
          }
        ]
      });

      return res.status(201).json({ message: 'Estudio registrado exitosamente', study: fullStudy });
    } catch (error) {
      console.error('Error al registrar estudio:', error);
      return res.status(500).json({ error: 'Error al registrar estudio o procedimiento', details: error.message });
    }
  },

  // Obtener todos los estudios
  getStudies: async (req, res) => {
    try {
      const studies = await Study.findAll({
        include: [
          {
            model: User,
            as: 'patient',
            attributes: ['id', 'name', 'username', 'identificationNumber'],
            include: [{ model: PatientProfile, as: 'patientProfile' }]
          },
          {
            model: User,
            as: 'doctor',
            attributes: ['id', 'name', 'username', 'mppsNumber', 'medicalCollegeNumber']
          }
        ],
        order: [['date', 'DESC'], ['id', 'DESC']]
      });

      return res.json(studies);
    } catch (error) {
      console.error('Error al obtener estudios:', error);
      return res.status(500).json({ error: 'Error al obtener la lista de estudios', details: error.message });
    }
  },

  // Obtener estudios de un paciente específico
  getPatientStudies: async (req, res) => {
    try {
      const { patientId } = req.params;
      const studies = await Study.findAll({
        where: { patientId },
        include: [
          {
            model: User,
            as: 'doctor',
            attributes: ['id', 'name', 'username', 'mppsNumber', 'medicalCollegeNumber']
          }
        ],
        order: [['date', 'DESC'], ['id', 'DESC']]
      });

      return res.json(studies);
    } catch (error) {
      console.error('Error al obtener estudios del paciente:', error);
      return res.status(500).json({ error: 'Error al obtener estudios del paciente', details: error.message });
    }
  },

  // Eliminar estudio
  deleteStudy: async (req, res) => {
    try {
      const { id } = req.params;
      const study = await Study.findByPk(id);
      if (!study) {
        return res.status(404).json({ error: 'Estudio no encontrado' });
      }

      await study.destroy();
      return res.json({ message: 'Estudio eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar estudio:', error);
      return res.status(500).json({ error: 'Error al eliminar el estudio', details: error.message });
    }
  }
};
