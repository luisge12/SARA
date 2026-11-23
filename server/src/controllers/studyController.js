const path = require('path');
const fs = require('fs');
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
        category,
        techniqueOrRegion,
        sede,
        date,
        findings,
        biopsySample,
        diagnosticImpression,
        recommendations,
        status,
        totalAmount,
        paidAmount,
        paymentStatus,
        metadata,
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
        category: category || 'General',
        techniqueOrRegion: techniqueOrRegion || null,
        sede: sede || 'CENTRAL',
        date,
        findings,
        biopsySample: biopsySample || 'No se tomó muestra',
        diagnosticImpression,
        recommendations,
        status: status || 'Completado',
        totalAmount: totalAmount ? parseFloat(totalAmount) : 0.00,
        paidAmount: paidAmount ? parseFloat(paidAmount) : 0.00,
        paymentStatus: paymentStatus || 'Pendiente',
        metadata: metadata || {},
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
            attributes: ['id', 'name', 'username', 'mppsNumber', 'medicalCollegeNumber', 'specialty']
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
      const { category } = req.query;
      const whereClause = {};
      if (category && category !== 'Todos') {
        whereClause.category = category;
      }

      const studies = await Study.findAll({
        where: whereClause,
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
            attributes: ['id', 'name', 'username', 'mppsNumber', 'medicalCollegeNumber', 'specialty']
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

      // Validación de seguridad para rol Paciente: solo puede consultar sus propios estudios
      if (req.user && (req.user.role === 'Paciente' || req.user.role === 'PACIENTE') && String(req.user.id) !== String(patientId)) {
        return res.status(403).json({ error: 'No tienes autorización para consultar los estudios de otro usuario.' });
      }

      const { category } = req.query;
      const whereClause = { patientId };
      if (category && category !== 'Todos') {
        whereClause.category = category;
      }

      const studies = await Study.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'doctor',
            attributes: ['id', 'name', 'username', 'mppsNumber', 'medicalCollegeNumber', 'specialty']
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

  // Actualizar un estudio médico
  updateStudy: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        patientId,
        doctorId,
        studyType,
        category,
        techniqueOrRegion,
        sede,
        date,
        findings,
        biopsySample,
        diagnosticImpression,
        recommendations,
        status,
        totalAmount,
        paidAmount,
        paymentStatus,
        metadata,
        attachments
      } = req.body;

      const study = await Study.findByPk(id);
      if (!study) {
        return res.status(404).json({ error: 'Estudio no encontrado' });
      }

      if (patientId) study.patientId = patientId;
      if (doctorId) study.doctorId = doctorId;
      if (studyType) study.studyType = studyType;
      if (category !== undefined) study.category = category;
      if (techniqueOrRegion !== undefined) study.techniqueOrRegion = techniqueOrRegion;
      if (sede) study.sede = sede;
      if (date) study.date = date;
      if (findings !== undefined) study.findings = findings;
      if (biopsySample !== undefined) study.biopsySample = biopsySample;
      if (diagnosticImpression !== undefined) study.diagnosticImpression = diagnosticImpression;
      if (recommendations !== undefined) study.recommendations = recommendations;
      if (status) study.status = status;
      if (totalAmount !== undefined) study.totalAmount = parseFloat(totalAmount) || 0;
      if (paidAmount !== undefined) study.paidAmount = parseFloat(paidAmount) || 0;
      if (paymentStatus) study.paymentStatus = paymentStatus;
      if (metadata !== undefined) study.metadata = metadata;
      if (attachments !== undefined) study.attachments = attachments;

      await study.save();

      const updatedStudy = await Study.findByPk(study.id, {
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
            attributes: ['id', 'name', 'username', 'mppsNumber', 'medicalCollegeNumber', 'specialty']
          }
        ]
      });

      return res.json({ message: 'Estudio actualizado exitosamente', study: updatedStudy });
    } catch (error) {
      console.error('Error al actualizar estudio:', error);
      return res.status(500).json({ error: 'Error al actualizar el estudio', details: error.message });
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

      // Eliminar archivos físicos adjuntos si existen
      if (Array.isArray(study.attachments)) {
        for (const att of study.attachments) {
          if (att.filename) {
            const filePath = path.join(__dirname, '../../uploads/studies', att.filename);
            if (fs.existsSync(filePath)) {
              try { fs.unlinkSync(filePath); } catch (_) {}
            }
          }
        }
      }

      await study.destroy();
      return res.json({ message: 'Estudio eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar estudio:', error);
      return res.status(500).json({ error: 'Error al eliminar el estudio', details: error.message });
    }
  },

  // Subir y asociar archivos adjuntos a un estudio
  uploadAttachments: async (req, res) => {
    try {
      const { id } = req.params;
      const study = await Study.findByPk(id);

      if (!study) {
        // Si no existe el estudio, limpiar archivos recién subidos
        if (req.files && Array.isArray(req.files)) {
          req.files.forEach(f => {
            try { fs.unlinkSync(f.path); } catch (_) {}
          });
        }
        return res.status(404).json({ error: 'Estudio no encontrado' });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No se recibió ningún archivo para adjuntar' });
      }

      const newAttachments = req.files.map(f => {
        const isPdf = f.mimetype === 'application/pdf' || f.originalname.toLowerCase().endsWith('.pdf');
        return {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          originalName: f.originalname,
          filename: f.filename,
          mimetype: f.mimetype,
          size: f.size,
          isPdf,
          url: `/api/uploads/studies/${f.filename}`,
          uploadedAt: new Date().toISOString(),
          uploadedBy: req.user ? (req.user.name || req.user.username) : 'Personal Médico'
        };
      });

      const currentAttachments = Array.isArray(study.attachments) ? study.attachments : [];
      study.attachments = [...currentAttachments, ...newAttachments];
      await study.save();

      return res.status(200).json({
        message: 'Archivos adjuntados con éxito',
        attachments: study.attachments,
        newAttachments
      });
    } catch (error) {
      console.error('Error al subir adjuntos a estudio:', error);
      return res.status(500).json({ error: 'Error al procesar archivos adjuntos', details: error.message });
    }
  },

  // Eliminar un archivo adjunto específico de un estudio
  deleteAttachment: async (req, res) => {
    try {
      const { id, attachmentId } = req.params;
      const study = await Study.findByPk(id);

      if (!study) {
        return res.status(404).json({ error: 'Estudio no encontrado' });
      }

      const currentAttachments = Array.isArray(study.attachments) ? study.attachments : [];
      const target = currentAttachments.find(a => a.id === attachmentId || a.filename === attachmentId);

      if (!target) {
        return res.status(404).json({ error: 'Archivo adjunto no encontrado en este estudio' });
      }

      // Eliminar archivo físico de disco
      if (target.filename) {
        const filePath = path.join(__dirname, '../../uploads/studies', target.filename);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (_) {}
        }
      }

      // Actualizar registro en base de datos
      study.attachments = currentAttachments.filter(a => a.id !== attachmentId && a.filename !== attachmentId);
      await study.save();

      return res.json({
        message: 'Archivo adjunto eliminado con éxito',
        attachments: study.attachments
      });
    } catch (error) {
      console.error('Error al eliminar archivo adjunto:', error);
      return res.status(500).json({ error: 'Error al eliminar archivo adjunto', details: error.message });
    }
  }
};
