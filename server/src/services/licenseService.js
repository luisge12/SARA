const crypto = require('crypto');
const Clinic = require('../models/Clinic');
const LicenseKey = require('../models/LicenseKey');

class LicenseService {
  /**
   * Generar una nueva clave criptográfica de licencia SARA
   * Formato: SARA-[M|A]-[4 hex]-[4 hex]-[4 hex]
   */
  static async generateKey({ planType = 'MONTHLY', durationDays, notes = '', createdBy = 'Master' }) {
    const isAnnual = planType === 'ANNUAL';
    const finalDuration = durationDays || (isAnnual ? 365 : 30);
    const prefix = isAnnual ? 'SARA-A' : 'SARA-M';

    // Generar 3 bloques hexadecimales aleatorios de 4 caracteres en mayúscula
    const p1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const p2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const p3 = crypto.randomBytes(2).toString('hex').toUpperCase();

    const licenseKey = `${prefix}-${p1}-${p2}-${p3}`;

    const newKey = await LicenseKey.create({
      licenseKey,
      planType: isAnnual ? 'ANNUAL' : 'MONTHLY',
      durationDays: finalDuration,
      isUsed: false,
      status: 'APPROVED',
      notes,
      createdBy
    });

    return newKey;
  }

  /**
   * Obtener el estado en tiempo real de la licencia de la clínica
   */
  static async getClinicLicense(clinicId = 1) {
    let clinic = await Clinic.findByPk(clinicId);
    
    // Si la clínica no existe aún, inicializar una por defecto
    if (!clinic) {
      const trialDate = new Date();
      trialDate.setDate(trialDate.getDate() + 30);
      clinic = await Clinic.create({
        id: clinicId,
        name: 'UNIMECO - Centro Médico Principal',
        planType: 'MONTHLY',
        licenseStatus: 'ACTIVE',
        expiresAt: trialDate,
        activeLicenseKey: 'SARA-M-START-TRIAL-2026'
      });
    }

    const now = new Date();
    const expiresAt = new Date(clinic.expiresAt);
    const timeDiff = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const isExpired = expiresAt <= now;
    const isExpiringSoon = !isExpired && daysRemaining <= 7;
    const currentStatus = isExpired ? 'EXPIRED' : 'ACTIVE';

    // Sincronizar estado en BD si cambió
    if (clinic.licenseStatus !== currentStatus) {
      clinic.licenseStatus = currentStatus;
      await clinic.save();
    }

    return {
      clinicId: clinic.id,
      clinicName: clinic.name,
      planType: clinic.planType, // 'MONTHLY' o 'ANNUAL'
      licenseStatus: currentStatus,
      expiresAt: clinic.expiresAt,
      daysRemaining: isExpired ? 0 : daysRemaining,
      isExpired,
      isExpiringSoon,
      activeLicenseKey: clinic.activeLicenseKey || 'N/A'
    };
  }

  /**
   * Sumar meses calendario manteniendo el mismo día del mes exacto
   * (ej. si se activa el 12, vence exactamente el 12 del siguiente mes).
   * Maneja meses más cortos (ej. día 31 en febrero pasa al último día del mes).
   */
  static addCalendarMonths(date, months = 1) {
    const result = new Date(date);
    const targetDay = result.getDate();
    result.setMonth(result.getMonth() + months);
    if (result.getDate() !== targetDay) {
      result.setDate(0);
    }
    return result;
  }

  /**
   * Sumar años calendario manteniendo el mismo día y mes exacto.
   */
  static addCalendarYears(date, years = 1) {
    const result = new Date(date);
    const targetDay = result.getDate();
    result.setFullYear(result.getFullYear() + years);
    if (result.getDate() !== targetDay) {
      result.setDate(0);
    }
    return result;
  }

  /**
   * Canjear una clave de licencia para la clínica
   */
  static async redeemKey(clinicId = 1, rawKey) {
    if (!rawKey || typeof rawKey !== 'string') {
      throw new Error('Debe proporcionar una clave de licencia válida.');
    }

    const cleanedKey = rawKey.trim().toUpperCase();

    const keyRecord = await LicenseKey.findOne({ where: { licenseKey: cleanedKey } });
    if (!keyRecord) {
      throw new Error('La clave de licencia ingresada no es válida o no existe en los registros de SARA.');
    }

    if (keyRecord.status === 'REVOKED') {
      const reasonText = keyRecord.revokedReason ? ` Motivo: "${keyRecord.revokedReason}"` : '';
      throw new Error(`Esta clave de licencia fue revocada o suspendida por el Super Master.${reasonText} No puede ser utilizada.`);
    }

    if (keyRecord.isUsed) {
      const dateUsed = keyRecord.usedAt ? new Date(keyRecord.usedAt).toLocaleDateString() : '';
      throw new Error(`Esta clave de licencia ya fue canjeada anteriormente${dateUsed ? ` el ${dateUsed}` : ''}.`);
    }

    let clinic = await Clinic.findByPk(clinicId);
    if (!clinic) {
      clinic = await Clinic.create({
        id: clinicId,
        name: 'Clínica Principal',
        planType: keyRecord.planType,
        licenseStatus: 'ACTIVE',
        expiresAt: new Date()
      });
    }

    const now = new Date();
    const currentExpiry = new Date(clinic.expiresAt);

    // Si aún está vigente, se suma a la fecha restante. Si ya venció, se suma desde hoy.
    const baseDate = currentExpiry > now ? currentExpiry : now;
    
    // Cálculo exacto de mes calendario (mismo día de corte, ej. día 12) o año calendario
    let newExpiresAt;
    if (keyRecord.planType === 'MONTHLY' && (keyRecord.durationDays === 30 || !keyRecord.durationDays)) {
      newExpiresAt = LicenseService.addCalendarMonths(baseDate, 1);
    } else if (keyRecord.planType === 'ANNUAL' && (keyRecord.durationDays === 365 || !keyRecord.durationDays)) {
      newExpiresAt = LicenseService.addCalendarYears(baseDate, 1);
    } else {
      newExpiresAt = new Date(baseDate.getTime() + keyRecord.durationDays * 24 * 60 * 60 * 1000);
    }

    const addedDays = Math.round((newExpiresAt.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

    // Actualizar clínica
    clinic.expiresAt = newExpiresAt;
    clinic.planType = keyRecord.planType;
    clinic.licenseStatus = 'ACTIVE';
    clinic.activeLicenseKey = keyRecord.licenseKey;
    await clinic.save();

    // Marcar clave como usada
    keyRecord.isUsed = true;
    keyRecord.usedByClinicId = clinic.id;
    keyRecord.usedAt = now;
    await keyRecord.save();

    return {
      success: true,
      message: `¡Licencia activada exitosamente! Se renovó el servicio hasta el ${newExpiresAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
      planType: keyRecord.planType,
      addedDays,
      newExpiresAt,
      clinic: {
        id: clinic.id,
        name: clinic.name,
        expiresAt: clinic.expiresAt,
        status: clinic.licenseStatus
      }
    };
  }

  /**
   * Extensión manual de días (Cortesía de Super Master)
   */
  static async manualExtend(clinicId = 1, days = 30, notes = 'Cortesía Super Master') {
    const clinic = await Clinic.findByPk(clinicId);
    if (!clinic) throw new Error('Clínica no encontrada');

    const now = new Date();
    const currentExpiry = new Date(clinic.expiresAt);
    const baseDate = currentExpiry > now ? currentExpiry : now;

    let newExpiresAt;
    if (days === 30) {
      newExpiresAt = LicenseService.addCalendarMonths(baseDate, 1);
    } else if (days === 365) {
      newExpiresAt = LicenseService.addCalendarYears(baseDate, 1);
    } else {
      newExpiresAt = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
    }

    clinic.expiresAt = newExpiresAt;
    clinic.licenseStatus = 'ACTIVE';
    await clinic.save();

    return {
      success: true,
      newExpiresAt,
      message: `Se ha extendido el servicio hasta el ${newExpiresAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.`
    };
  }

  /**
   * Listar todas las claves de licencia generadas (Solo Super Master)
   */
  static async getAllKeys() {
    return await LicenseKey.findAll({
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Revocar o anular una clave de licencia (Exclusivo Super Master)
   */
  static async revokeKey(keyIdentifier, reason = 'Revocada por Super Master') {
    let keyRecord;
    if (!isNaN(Number(keyIdentifier))) {
      keyRecord = await LicenseKey.findByPk(Number(keyIdentifier));
    }
    if (!keyRecord) {
      keyRecord = await LicenseKey.findOne({ where: { licenseKey: String(keyIdentifier).trim().toUpperCase() } });
    }
    if (!keyRecord) {
      throw new Error('La clave de licencia especificada no existe.');
    }

    keyRecord.status = 'REVOKED';
    keyRecord.revokedAt = new Date();
    keyRecord.revokedReason = reason || 'Revocada por Super Master';
    await keyRecord.save();

    // Si la clave ya fue canjeada en una clínica y está activa, suspender la licencia de esa clínica
    if (keyRecord.isUsed && keyRecord.usedByClinicId) {
      const clinic = await Clinic.findByPk(keyRecord.usedByClinicId);
      if (clinic && clinic.activeLicenseKey === keyRecord.licenseKey) {
        clinic.licenseStatus = 'REVOKED';
        await clinic.save();
      }
    }

    return {
      success: true,
      message: `Clave ${keyRecord.licenseKey} revocada exitosamente.`,
      key: keyRecord
    };
  }

  /**
   * Aprobar o reactivar una clave de licencia (Exclusivo Super Master)
   */
  static async approveKey(keyIdentifier) {
    let keyRecord;
    if (!isNaN(Number(keyIdentifier))) {
      keyRecord = await LicenseKey.findByPk(Number(keyIdentifier));
    }
    if (!keyRecord) {
      keyRecord = await LicenseKey.findOne({ where: { licenseKey: String(keyIdentifier).trim().toUpperCase() } });
    }
    if (!keyRecord) {
      throw new Error('La clave de licencia especificada no existe.');
    }

    keyRecord.status = 'APPROVED';
    keyRecord.revokedAt = null;
    keyRecord.revokedReason = null;
    await keyRecord.save();

    // Si la clave ya estaba canjeada en una clínica y su fecha de expiración es futura, rehabilitar clínica
    if (keyRecord.isUsed && keyRecord.usedByClinicId) {
      const clinic = await Clinic.findByPk(keyRecord.usedByClinicId);
      if (clinic && clinic.activeLicenseKey === keyRecord.licenseKey) {
        const now = new Date();
        clinic.licenseStatus = new Date(clinic.expiresAt) > now ? 'ACTIVE' : 'EXPIRED';
        await clinic.save();
      }
    }

    return {
      success: true,
      message: `Clave ${keyRecord.licenseKey} aprobada y restablecida con éxito.`,
      key: keyRecord
    };
  }

  /**
   * Obtener métricas resumidas de licencias exclusivamente (sin datos clínicos)
   */
  static async getKeyStats() {
    const totalKeys = await LicenseKey.count();
    const revokedKeys = await LicenseKey.count({ where: { status: 'REVOKED' } });
    const usedKeys = await LicenseKey.count({ where: { isUsed: true, status: 'APPROVED' } });
    const availableKeys = await LicenseKey.count({ where: { isUsed: false, status: 'APPROVED' } });

    return {
      totalKeys,
      availableKeys,
      usedKeys,
      revokedKeys
    };
  }

  /**
   * Obtener todas las clínicas registradas con estadísticas para el Super Master
   */
  static async getAllClinics() {
    let clinics = await Clinic.findAll({
      order: [['id', 'ASC']]
    });

    if (clinics.length === 0) {
      // Inicializar clínica por defecto si está vacía
      await LicenseService.getClinicLicense(1);
      clinics = await Clinic.findAll({ order: [['id', 'ASC']] });
    }

    const now = new Date();
    const enrichedClinics = clinics.map(clinic => {
      const expiresAt = new Date(clinic.expiresAt);
      const timeDiff = expiresAt.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      const isExpired = expiresAt <= now;
      const isExpiringSoon = !isExpired && daysRemaining <= 7;
      const currentStatus = isExpired ? 'EXPIRED' : 'ACTIVE';

      return {
        id: clinic.id,
        name: clinic.name,
        rif: clinic.rif || 'N/A',
        planType: clinic.planType,
        licenseStatus: currentStatus,
        expiresAt: clinic.expiresAt,
        activeLicenseKey: clinic.activeLicenseKey || 'N/A',
        maxDoctors: clinic.maxDoctors || 10,
        daysRemaining: isExpired ? 0 : daysRemaining,
        isExpired,
        isExpiringSoon,
        createdAt: clinic.created_at || clinic.createdAt,
        updatedAt: clinic.updated_at || clinic.updatedAt
      };
    });

    const totalKeys = await LicenseKey.count();
    const usedKeys = await LicenseKey.count({ where: { isUsed: true } });
    const availableKeys = totalKeys - usedKeys;

    const stats = {
      totalClinics: enrichedClinics.length,
      activeClinics: enrichedClinics.filter(c => !c.isExpired).length,
      expiringSoonClinics: enrichedClinics.filter(c => c.isExpiringSoon).length,
      expiredClinics: enrichedClinics.filter(c => c.isExpired).length,
      totalKeys,
      usedKeys,
      availableKeys
    };

    return {
      clinics: enrichedClinics,
      stats
    };
  }

  /**
   * Crear nueva clínica institucional
   */
  static async createClinic({ name, rif, planType = 'MONTHLY', initialDays = 30, maxDoctors = 10 }) {
    if (!name) throw new Error('El nombre de la clínica es requerido');
    const now = new Date();
    let expiresAt;
    if (planType === 'ANNUAL') {
      expiresAt = LicenseService.addCalendarYears(now, 1);
    } else {
      expiresAt = LicenseService.addCalendarMonths(now, 1);
    }
    if (initialDays && initialDays !== 30 && initialDays !== 365) {
      expiresAt = new Date(now.getTime() + initialDays * 24 * 60 * 60 * 1000);
    }

    const clinic = await Clinic.create({
      name,
      rif: rif || null,
      planType,
      licenseStatus: 'ACTIVE',
      expiresAt,
      maxDoctors: parseInt(maxDoctors) || 10
    });

    return clinic;
  }

  /**
   * Actualizar datos de una clínica
   */
  static async updateClinic(id, data) {
    const clinic = await Clinic.findByPk(id);
    if (!clinic) throw new Error('Clínica no encontrada');

    if (data.name !== undefined) clinic.name = data.name;
    if (data.rif !== undefined) clinic.rif = data.rif;
    if (data.planType !== undefined) clinic.planType = data.planType;
    if (data.maxDoctors !== undefined) clinic.maxDoctors = parseInt(data.maxDoctors) || clinic.maxDoctors;
    if (data.licenseStatus !== undefined) clinic.licenseStatus = data.licenseStatus;
    if (data.expiresAt !== undefined) clinic.expiresAt = new Date(data.expiresAt);

    await clinic.save();
    return clinic;
  }
}

module.exports = LicenseService;
