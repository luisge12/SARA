// Servicio Centralizado de Auditoría y Trazabilidad para SARA
const { Op } = require('sequelize');
const AuditLog = require('../models/AuditLog');
const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');

// Diccionario de etiquetas amigables en español para campos de pacientes
const FIELD_LABELS = {
  // Datos personales / Demográficos
  name: 'Nombre y Apellido',
  identificationNumber: 'Cédula / Nro de Identificación',
  sedeAtencion: 'Sede de Atención',
  gender: 'Género',
  dateOfBirth: 'Fecha de Nacimiento',
  phone: 'Teléfono',
  email: 'Correo Electrónico',
  treatingDoctor: 'Médico Tratante',
  referringEntity: 'Ente Referente',
  nextAppointment: 'Próxima Cita',
  address: 'Dirección de Habitación',
  
  // Antecedentes y Hábito Evacuatorio (Coloproctología)
  personalHistory: 'Antecedentes Personales / Alergias',
  surgicalHistory: 'Antecedentes Quirúrgicos (Qx)',
  familyHistory: 'Antecedentes Familiares',
  menarcheAge: 'Menarquia (edad)',
  menopauseAge: 'Menopausia (edad)',
  obstetricFormula: 'Fórmula Obstétrica (G, P, A, C)',
  bristolType: 'Escala de Bristol',
  bowelFrequency: 'Frecuencia Evacuatoria',
  strainToEvacuate: 'Pujo al Evacuar',
  incompleteEvacuation: 'Sensación Evacuación Incompleta / Tenesmo',
  bowelNotes: 'Observaciones de Hábito Evacuatorio',

  // Signos Vitales / Parámetros Generales
  heartRate: 'Frecuencia Cardíaca (ppm)',
  respiratoryRate: 'Frecuencia Respiratoria (rpm)',
  bloodPressure: 'Tensión Arterial (mmHg)',
  oxygenSaturation: 'Saturación de Oxígeno (%)',
  heightCm: 'Talla (cm)',
  weightKg: 'Peso (Kg)',

  // Consultas Clínicas
  reasonForVisit: 'Motivo de Consulta',
  physicalInspection: 'Inspección Física',
  physicalPalpation: 'Palpación Física',
  rectalExamination: 'Tacto Rectal',
  anoscopy: 'Anoscopia',
  diagnoses: 'Diagnósticos',
  treatmentPlan: 'Plan de Tratamiento / Medicación',
  evolutionaryReport: 'Informe Evolutivo'
};

/**
 * Normaliza valores para comparación justa
 */
function normalizeValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'number') return String(val);
  if (val instanceof Date) return val.toISOString();
  if (Array.isArray(val)) return JSON.stringify(val);
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

/**
 * Formatea un valor para presentación amigable
 */
function formatDisplayValue(val) {
  if (val === null || val === undefined || val === '') return '(vacío)';
  if (Array.isArray(val)) {
    if (val.length === 0) return '(ninguno)';
    return val.map(item => {
      if (typeof item === 'string') return item;
      if (item.diagnosis) return `${item.diagnosis} (${item.classification || 'Sin clasificar'})`;
      if (item.medication) return `${item.medication} ${item.presentation || ''} - ${item.indication || ''}`.trim();
      if (item.symptom) return `${item.symptom}${item.onset ? ` (${item.onset})` : ''}`;
      return JSON.stringify(item);
    }).join('; ');
  }
  if (typeof val === 'object') {
    return JSON.stringify(val);
  }
  return String(val);
}

/**
 * Compara dos objetos y devuelve un array de diferencias detalladas
 */
function calculateDiff(oldObj = {}, newObj = {}, fieldsToCheck = []) {
  const diffs = [];
  const fields = fieldsToCheck.length > 0 ? fieldsToCheck : Object.keys({ ...oldObj, ...newObj });

  for (const key of fields) {
    const oldNorm = normalizeValue(oldObj[key]);
    const newNorm = normalizeValue(newObj[key]);

    if (oldNorm !== newNorm) {
      diffs.push({
        field: key,
        label: FIELD_LABELS[key] || key,
        oldValue: formatDisplayValue(oldObj[key]),
        newValue: formatDisplayValue(newObj[key])
      });
    }
  }

  return diffs;
}

/**
 * Registra un evento de auditoría para un paciente
 */
async function logPatientAudit({
  patientId, // Puede ser el id de User (rol Paciente) o el id de PatientProfile
  userId, // ID del usuario que realizó la acción
  actionType, // 'UPDATE_DEMOGRAPHICS', 'CREATE_PATIENT', 'CREATE_CONSULTATION', 'UPDATE_CONSULTATION', etc.
  summary,
  diffs = [],
  metadata = {}
}) {
  try {
    if (!patientId) {
      console.warn('logPatientAudit: No se proporcionó patientId');
      return null;
    }

    // Resolver el perfil del paciente
    let profile = await PatientProfile.findOne({
      where: {
        [Op.or]: [{ userId: patientId }, { id: patientId }]
      }
    });

    if (!profile) {
      // Si el paciente no tiene perfil aún, verificar si existe el usuario paciente y crearlo
      const user = await User.findByPk(patientId);
      if (user && user.role === 'Paciente') {
        profile = await PatientProfile.create({ userId: user.id });
      } else {
        console.warn(`logPatientAudit: No se encontró perfil de paciente para ID: ${patientId}`);
        return null;
      }
    }

    // Construir la descripción estructurada
    const finalSummary = summary || (
      diffs.length > 0 
        ? `Se modificaron ${diffs.length} campo(s): ${diffs.map(d => d.label).join(', ')}`
        : 'Actualización de expediente registrada'
    );

    const changesDescription = {
      summary: finalSummary,
      diffs,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    const logEntry = await AuditLog.create({
      patientId: profile.id,
      modifiedByUserId: userId || null,
      actionType,
      changesDescription
    });

    return logEntry;
  } catch (error) {
    console.error('Error al registrar log de auditoría médica:', error);
    return null;
  }
}

module.exports = {
  FIELD_LABELS,
  calculateDiff,
  logPatientAudit,
  formatDisplayValue
};
