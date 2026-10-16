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
    const newExpiresAt = new Date(baseDate.getTime() + keyRecord.durationDays * 24 * 60 * 60 * 1000);

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
      message: `¡Licencia activada exitosamente! Se han añadido ${keyRecord.durationDays} días de vigencia.`,
      planType: keyRecord.planType,
      addedDays: keyRecord.durationDays,
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
    const newExpiresAt = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

    clinic.expiresAt = newExpiresAt;
    clinic.licenseStatus = 'ACTIVE';
    await clinic.save();

    return {
      success: true,
      newExpiresAt,
      message: `Se han añadido ${days} días de cortesía a la clínica.`
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
}

module.exports = LicenseService;
