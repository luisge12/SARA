const LicenseService = require('../services/licenseService');
const User = require('../models/User');
const Clinic = require('../models/Clinic');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

module.exports = {
  // Obtener estado de la licencia de la clínica actual
  getStatus: async (req, res) => {
    try {
      const clinicId = req.user?.clinicId || 1;
      const licenseInfo = await LicenseService.getClinicLicense(clinicId);
      return res.json(licenseInfo);
    } catch (error) {
      console.error('Error al obtener estado de licencia:', error);
      return res.status(500).json({ error: 'Error al consultar el estado de la licencia' });
    }
  },

  // Canjear clave de licencia (Administrador o Master de la clínica)
  redeem: async (req, res) => {
    try {
      const { licenseKey } = req.body;
      const clinicId = req.user?.clinicId || 1;

      if (!licenseKey) {
        return res.status(400).json({ error: 'La clave de licencia es requerida.' });
      }

      const result = await LicenseService.redeemKey(clinicId, licenseKey);
      return res.json(result);
    } catch (error) {
      console.error('Error al canjear clave de licencia:', error.message);
      return res.status(400).json({ error: error.message });
    }
  },

  // Generar nueva clave de licencia (Solo Super Master)
  generate: async (req, res) => {
    try {
      const { planType, durationDays, notes } = req.body;
      const createdBy = req.user?.username || 'Master';

      const newKey = await LicenseService.generateKey({
        planType: planType || 'MONTHLY',
        durationDays: durationDays ? parseInt(durationDays) : undefined,
        notes: notes || '',
        createdBy
      });

      return res.status(201).json({
        success: true,
        message: 'Clave de licencia generada exitosamente.',
        key: newKey
      });
    } catch (error) {
      console.error('Error al generar clave de licencia:', error);
      return res.status(500).json({ error: 'Error al generar la clave de licencia.' });
    }
  },

  // Listar todas las claves generadas en el sistema (Solo Super Master)
  listKeys: async (req, res) => {
    try {
      const keys = await LicenseService.getAllKeys();
      return res.json(keys);
    } catch (error) {
      console.error('Error al listar claves de licencia:', error);
      return res.status(500).json({ error: 'Error al obtener la lista de claves' });
    }
  },

  // Obtener estadísticas de claves para el Super Master
  getKeyStats: async (req, res) => {
    try {
      const stats = await LicenseService.getKeyStats();
      return res.json(stats);
    } catch (error) {
      console.error('Error al obtener estadísticas de claves:', error);
      return res.status(500).json({ error: 'Error al obtener métricas de licencias' });
    }
  },

  // Revocar clave de licencia (Exclusivo Super Master)
  revokeKey: async (req, res) => {
    try {
      const { keyId, reason } = req.body;
      if (!keyId) {
        return res.status(400).json({ error: 'Debe especificar el ID o código de la clave a revocar.' });
      }
      const result = await LicenseService.revokeKey(keyId, reason);
      return res.json(result);
    } catch (error) {
      console.error('Error al revocar clave:', error.message);
      return res.status(400).json({ error: error.message });
    }
  },

  // Aprobar o reactivar clave de licencia (Exclusivo Super Master)
  approveKey: async (req, res) => {
    try {
      const { keyId } = req.body;
      if (!keyId) {
        return res.status(400).json({ error: 'Debe especificar el ID o código de la clave a aprobar.' });
      }
      const result = await LicenseService.approveKey(keyId);
      return res.json(result);
    } catch (error) {
      console.error('Error al aprobar clave:', error.message);
      return res.status(400).json({ error: error.message });
    }
  },

  // Registrar nueva clínica cliente (Solo Super Master)
  createClinic: async (req, res) => {
    try {
      const { name, rif, planType, initialDays, maxDoctors } = req.body;
      const newClinic = await LicenseService.createClinic({
        name,
        rif,
        planType,
        initialDays: initialDays ? parseInt(initialDays) : 30,
        maxDoctors: maxDoctors ? parseInt(maxDoctors) : 10
      });
      return res.status(201).json({
        success: true,
        message: 'Clínica registrada exitosamente',
        clinic: newClinic
      });
    } catch (error) {
      console.error('Error al crear clínica:', error);
      return res.status(400).json({ error: error.message });
    }
  },

  // Actualizar clínica (Solo Super Master)
  updateClinic: async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await LicenseService.updateClinic(id, req.body);
      return res.json({
        success: true,
        message: 'Clínica actualizada correctamente',
        clinic: updated
      });
    } catch (error) {
      console.error('Error al actualizar clínica:', error);
      return res.status(400).json({ error: error.message });
    }
  },

  // Información de descarga pública de la aplicación
  getDownloadInfo: async (req, res) => {
    const path = require('path');
    const fs = require('fs');
    let sizeStr = '16.4 KB';
    try {
      const filePath = path.join(__dirname, '../../public/downloads/SARA_Setup_v2.4.0.exe');
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        sizeStr = stats.size > 1024 * 1024 
          ? (stats.size / (1024 * 1024)).toFixed(1) + ' MB'
          : Math.round(stats.size / 1024) + ' KB';
      }
    } catch (e) {}

    return res.json({
      version: '2.4.0',
      build: '2026.10-PROD',
      releaseDate: 'Octubre 2026',
      appName: 'SARA Desktop - Sistema Automatizado de Registro Asistencial',
      architecture: 'Windows x64 (64-bit)',
      minOs: 'Windows 10 / Windows 11',
      fileSize: sizeStr,
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      downloadUrl: '/api/licenses/download/setup',
      portableDownloadUrl: '/api/licenses/download/setup?type=portable'
    });
  },

  // Descarga de instalador o versión portable oficial de SARA
  downloadSetup: async (req, res) => {
    try {
      const path = require('path');
      const fs = require('fs');
      const { execSync } = require('child_process');
      const downloadsDir = path.join(__dirname, '../../public/downloads');
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const downloadType = (req.query.type || 'exe').toLowerCase();

      // Opción 1: Paquete portable en archivo ZIP
      if (downloadType === 'portable' || downloadType === 'zip') {
        const zipPath = path.join(downloadsDir, 'SARA_Portable_v2.4.0.zip');
        if (fs.existsSync(zipPath)) {
          return res.download(zipPath, 'SARA_Portable_v2.4.0.zip');
        }
      }

      // Opción 2: Ejecutable directo SARA.exe (sin instalador)
      if (downloadType === 'direct' || downloadType === 'app') {
        const appPath = path.join(downloadsDir, 'SARA.exe');
        if (fs.existsSync(appPath)) {
          return res.download(appPath, 'SARA.exe');
        }
      }

      // Opción 3 (Predeterminada): Instalador asistido SARA_Setup_v2.4.0.exe
      const filePath = path.join(downloadsDir, 'SARA_Setup_v2.4.0.exe');
      if (!fs.existsSync(filePath)) {
        const csSource = path.join(__dirname, '../../scripts/SaraInstaller.cs');
        const cscCompiler = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';
        if (fs.existsSync(csSource) && fs.existsSync(cscCompiler)) {
          execSync(`"${cscCompiler}" /target:winexe /out:"${filePath}" /r:System.Windows.Forms.dll /r:System.Drawing.dll "${csSource}"`);
        }
      }

      return res.download(filePath, 'SARA_Setup_v2.4.0.exe');
    } catch (error) {
      console.error('Error al descargar instalador:', error);
      return res.status(500).json({ error: 'Error al procesar la descarga del instalador' });
    }
  },

  // Crear usuario con rol Master y asignar/crear la clínica correspondiente (Exclusivo para Super Master)
  createMasterUser: async (req, res) => {
    try {
      const { username, password, name, clinicName, clinicRif, clinicId, initialDays } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'El nombre de usuario y la contraseña son requeridos.' });
      }

      const existingUser = await User.findOne({ where: { username: username.trim() } });
      if (existingUser) {
        return res.status(400).json({ error: `El nombre de usuario "${username}" ya está registrado en el sistema.` });
      }

      let targetClinic = null;

      // 1. Si se especificó el nombre de la clínica (permite crear una clínica nueva sobre la marcha)
      if (clinicName && clinicName.trim()) {
        const cleanClinicName = clinicName.trim();
        targetClinic = await Clinic.findOne({
          where: {
            name: {
              [Op.iLike]: cleanClinicName
            }
          }
        });

        // Si la clínica no existe, la creamos automáticamente
        if (!targetClinic) {
          const days = parseInt(initialDays) || 30;
          const initialExpiration = new Date();
          initialExpiration.setDate(initialExpiration.getDate() + days);

          targetClinic = await Clinic.create({
            name: cleanClinicName,
            rif: clinicRif ? clinicRif.trim() : null,
            planType: 'MONTHLY',
            licenseStatus: 'ACTIVE',
            expiresAt: initialExpiration,
            activeLicenseKey: `SARA-NEW-${Date.now().toString(36).toUpperCase()}`,
            maxDoctors: 15
          });
          console.log(`[SuperMaster] Nueva clínica creada: "${targetClinic.name}" (ID: ${targetClinic.id})`);
        } else if (clinicRif && clinicRif.trim() && !targetClinic.rif) {
          // Si existía pero no tenía RIF, actualizamos su RIF
          targetClinic.rif = clinicRif.trim();
          await targetClinic.save();
        }
      } else if (clinicId) {
        targetClinic = await Clinic.findByPk(parseInt(clinicId));
      }

      if (!targetClinic) {
        return res.status(400).json({ 
          error: 'Debes indicar el nombre de la clínica a la que se le asignará este usuario Master.' 
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newMaster = await User.create({
        username: username.trim(),
        passwordHash,
        role: 'Master',
        name: name ? name.trim() : `Director / Master ${username.trim()}`,
        sedeAtencion: 'CENTRAL',
        clinicId: targetClinic.id
      });

      return res.status(201).json({
        success: true,
        message: `¡Usuario Master "${newMaster.username}" creado y asignado exitosamente a la clínica "${targetClinic.name}"!`,
        user: {
          id: newMaster.id,
          username: newMaster.username,
          name: newMaster.name,
          role: newMaster.role,
          clinicId: newMaster.clinicId
        },
        clinic: {
          id: targetClinic.id,
          name: targetClinic.name,
          rif: targetClinic.rif,
          expiresAt: targetClinic.expiresAt
        }
      });
    } catch (error) {
      console.error('Error al crear usuario Master:', error);
      return res.status(500).json({ error: error.message || 'Error interno al crear el usuario Master.' });
    }
  },

  // Listar usuarios Master registrados (Exclusivo para Super Master)
  listMasterUsers: async (req, res) => {
    try {
      const masters = await User.findAll({
        where: { role: 'Master' },
        attributes: ['id', 'username', 'name', 'role', 'clinicId', 'createdAt'],
        order: [['id', 'ASC']]
      });

      const clinics = await Clinic.findAll({ attributes: ['id', 'name', 'rif'] });
      const clinicMap = {};
      clinics.forEach(c => { clinicMap[c.id] = c; });

      const formatted = masters.map(m => ({
        id: m.id,
        username: m.username,
        name: m.name,
        role: m.role,
        clinicId: m.clinicId,
        clinicName: clinicMap[m.clinicId]?.name || `Clínica #${m.clinicId}`,
        clinicRif: clinicMap[m.clinicId]?.rif || '—',
        createdAt: m.createdAt
      }));

      return res.json(formatted);
    } catch (error) {
      console.error('Error al listar usuarios Master:', error);
      return res.status(500).json({ error: 'Error al obtener la lista de usuarios Master.' });
    }
  },

  // Listar clínicas registradas (Exclusivo para Super Master)
  listClinicsSummary: async (req, res) => {
    try {
      const clinics = await Clinic.findAll({
        attributes: ['id', 'name', 'rif', 'planType', 'licenseStatus', 'expiresAt', 'maxDoctors'],
        order: [['id', 'ASC']]
      });
      return res.json(clinics);
    } catch (error) {
      console.error('Error al listar clínicas:', error);
      return res.status(500).json({ error: 'Error al obtener el listado de clínicas.' });
    }
  }
};
