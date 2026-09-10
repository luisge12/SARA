import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import api from '../../services/api';
import { User, Activity, X, Clock, Camera, Trash2, Plus, Check } from 'lucide-react';
import { AuditLogModal } from '../Modulo4_DatosClinicos/AuditLogModal';
import { PatientCameraCaptureModal } from '../../components/PatientCameraCaptureModal';

export function PatientProfileEditor({ patient, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Módulo Visual & Tramitación
  const [photoUrl, setPhotoUrl] = useState('');
  const [flowType, setFlowType] = useState('PRIMERA_VEZ');
  const [customFields, setCustomFields] = useState({});
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  // Demográficos (Sección 1)
  const [name, setName] = useState(patient.name || '');
  const [identificationNumber, setIdentificationNumber] = useState(patient.identificationNumber || '');
  const [sedeAtencion, setSedeAtencion] = useState(patient.sedeAtencion || 'CENTRAL');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [treatingDoctor, setTreatingDoctor] = useState('');
  const [referringEntity, setReferringEntity] = useState('');
  const [nextAppointment, setNextAppointment] = useState('');
  const [address, setAddress] = useState('');

  // Antecedentes Médicos y Quirúrgicos
  const [personalHistory, setPersonalHistory] = useState('');
  const [surgicalHistory, setSurgicalHistory] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');

  // Parámetros Generales (Sección 2)
  const [heartRate, setHeartRate] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [oxygenSaturation, setOxygenSaturation] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [patient.id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/patients/${patient.id}/profile`);
      const data = res.data;

      const p = data.patientProfile || {};
      setPhotoUrl(p.photoUrl || p.photo_url || '');
      setFlowType(p.flowType || p.flow_type || 'PRIMERA_VEZ');
      setCustomFields(p.customFields || p.custom_fields || {});

      setGender(p.gender || data.gender || patient.gender || '');

      const rawDob = p.dateOfBirth || data.date_of_birth || data.dateOfBirth || patient.date_of_birth || patient.dateOfBirth;
      const cleanDob = rawDob && !isNaN(new Date(rawDob).getTime())
        ? String(rawDob).slice(0, 10)
        : '';
      setDateOfBirth(cleanDob);

      setPhone(p.phone || data.phone || patient.phone || '');
      setEmail(p.email || data.email || patient.email || '');
      setTreatingDoctor(p.treatingDoctor || '');
      setReferringEntity(p.referringEntity || '');

      const cleanNextApp = p.nextAppointment && !isNaN(new Date(p.nextAppointment).getTime())
        ? new Date(p.nextAppointment).toISOString().slice(0, 16)
        : '';
      setNextAppointment(cleanNextApp);
      setAddress(p.address || '');

      setPersonalHistory(p.personalHistory || '');
      setSurgicalHistory(p.surgicalHistory || '');
      setFamilyHistory(p.familyHistory || '');

      setHeartRate(p.heartRate || '');
      setRespiratoryRate(p.respiratoryRate || '');
      setBloodPressure(p.bloodPressure || '');
      setOxygenSaturation(p.oxygenSaturation || '');
      setHeightCm(p.heightCm || '');
      setWeightKg(p.weightKg || '');

      setProfile(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomField = () => {
    if (!newKey.trim()) return;
    setCustomFields(prev => ({
      ...prev,
      [newKey.trim()]: newVal.trim()
    }));
    setNewKey('');
    setNewVal('');
  };

  const handleRemoveCustomField = (keyToRemove) => {
    setCustomFields(prev => {
      const updated = { ...prev };
      delete updated[keyToRemove];
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const validDob = dateOfBirth && !isNaN(new Date(dateOfBirth).getTime()) ? dateOfBirth : null;
      const validNextApp = nextAppointment && !isNaN(new Date(nextAppointment).getTime()) ? nextAppointment : null;

      await api.put(`/api/patients/${patient.id}/profile`, {
        name,
        identificationNumber,
        sedeAtencion,
        photoUrl,
        flowType,
        customFields,
        gender,
        dateOfBirth: validDob,
        phone,
        email,
        treatingDoctor,
        referringEntity,
        nextAppointment: validNextApp,
        address,
        personalHistory: personalHistory || null,
        surgicalHistory: surgicalHistory || null,
        familyHistory: familyHistory || null,
        heartRate: heartRate || null,
        respiratoryRate: respiratoryRate || null,
        bloodPressure,
        oxygenSaturation: oxygenSaturation || null,
        heightCm: heightCm || null,
        weightKg: weightKg || null
      });
      alert('Perfil de paciente guardado exitosamente.');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el perfil del paciente.');
    } finally {
      setSaving(false);
    }
  };

  const calcularEdad = (dob) => {
    if (!dob) return '';
    const parts = String(dob).slice(0, 10).split('-');
    if (parts.length !== 3) return '';
    const [year, month, day] = parts.map(Number);
    if (!year || !month || !day) return '';

    const hoy = new Date();
    let edad = hoy.getFullYear() - year;
    const mesDiff = (hoy.getMonth() + 1) - month;
    if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < day)) {
      edad--;
    }
    return edad >= 0 ? `${edad} años` : '';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-xl)',
        padding: '2rem',
        border: '1px solid var(--border-color)'
      }}>
        {/* Cabecera del Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-main)', margin: 0 }}>
              Ficha del Paciente: {name}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.88rem' }}>
              Gestión de Ficha Técnica, Parámetros y Validación Visual
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAudit(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
            >
              <Clock size={15} /> Historial de Cambios
            </Button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <X size={24} />
            </button>
          </div>
        </div>

        {loading ? (
          <p>Cargando datos del paciente...</p>
        ) : (
          <form onSubmit={handleSave}>

            {/* SECCIÓN 1: DATOS Y MÓDULO VISUAL */}
            <Card title="1. Identificación y Validación Visual (Módulo Fotográfico)" style={{ marginBottom: '1.5rem' }}>
              
              {/* Tarjeta de Fotografía y Tramitación */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                backgroundColor: '#f8fafc',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '1.25rem',
                flexWrap: 'wrap'
              }}>
                {/* Avatar / Fotografía */}
                <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Selfie del Paciente"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '3px solid #0d9488',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      backgroundColor: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8'
                    }}>
                      <User size={40} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCameraModal(true)}
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      backgroundColor: '#0d9488',
                      color: '#ffffff',
                      border: '2px solid #ffffff',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}
                    title="Tomar selfie o cargar foto del paciente"
                  >
                    <Camera size={15} />
                  </button>
                </div>

                {/* Datos del Módulo Visual y Flujo */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>
                        Validación de Identidad e Historial Visual
                      </h4>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                        {photoUrl ? 'Fotografía biométrica registrada.' : 'Sin fotografía registrada. Tome una selfie con la cámara web para verificación.'}
                      </p>
                    </div>

                    {photoUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Trash2 size={13} /> Eliminar foto
                      </button>
                    )}
                  </div>

                  {/* Selector de Flujo */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Condición de Ingreso:</span>
                    <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#e2e8f0', padding: '3px', borderRadius: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setFlowType('PRIMERA_VEZ')}
                        style={{
                          padding: '0.25rem 0.65rem',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: flowType === 'PRIMERA_VEZ' ? '#10b981' : 'transparent',
                          color: flowType === 'PRIMERA_VEZ' ? '#ffffff' : '#475569'
                        }}
                      >
                        🟢 Primera Consulta
                      </button>
                      <button
                        type="button"
                        onClick={() => setFlowType('RECONSULTA')}
                        style={{
                          padding: '0.25rem 0.65rem',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: flowType === 'RECONSULTA' ? '#0284c7' : 'transparent',
                          color: flowType === 'RECONSULTA' ? '#ffffff' : '#475569'
                        }}
                      >
                        🔁 Reconsulta / Llegada
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campos Demográficos estándar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <Input label="Nombre y Apellido" value={name} onChange={e => setName(e.target.value)} required />
                <Input label="Nro Identificación" value={identificationNumber} onChange={e => setIdentificationNumber(e.target.value)} required />

                <div className="input-group">
                  <label className="input-label">Género</label>
                  <select className="input-field" value={gender} onChange={e => setGender(e.target.value)}>
                    <option value="">Seleccione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 2 }}><Input label="Fecha Nacimiento" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} /></div>
                  <div style={{ flex: 1 }}>
                    <Input
                      label="Edad"
                      value={calcularEdad(dateOfBirth)}
                      placeholder="0"
                      readOnly
                      style={{
                        backgroundColor: 'rgba(42, 183, 202, 0.08)',
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                        cursor: 'default'
                      }}
                    />
                  </div>
                </div>

                <Input label="Teléfono" value={phone} onChange={e => setPhone(e.target.value)} />
                <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                <Input label="Sede de Atención" value={sedeAtencion} onChange={e => setSedeAtencion(e.target.value)} />
                <Input label="Médico Tratante" value={treatingDoctor} onChange={e => setTreatingDoctor(e.target.value)} />
                <Input label="Referente" value={referringEntity} onChange={e => setReferringEntity(e.target.value)} />
                <Input label="Próxima Cita" type="datetime-local" value={nextAppointment} onChange={e => setNextAppointment(e.target.value)} />
              </div>
              <div style={{ marginTop: '1rem' }}>
                <Input label="Dirección de Habitación" value={address} onChange={e => setAddress(e.target.value)} />
              </div>

              {/* CAMPOS PERSONALIZADOS DINÁMICOS (RIPS / EXTENSIBILIDAD CLÍNICA) */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                  Campos Personalizados Clínicos (RIPS / Especialidad):
                </label>

                {Object.keys(customFields).length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {Object.entries(customFields).map(([k, v]) => (
                      <span key={k} style={{
                        backgroundColor: '#e0f2fe',
                        border: '1px solid #bae6fd',
                        borderRadius: '6px',
                        padding: '0.25rem 0.6rem',
                        fontSize: '0.82rem',
                        color: '#0369a1',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}>
                        <strong>{k}:</strong> {v}
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(k)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0 }}
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Nombre del campo (ej. Aseguradora, Ocupación)..."
                    value={newKey}
                    onChange={e => setNewKey(e.target.value)}
                    style={{ height: '36px', minWidth: '220px', fontSize: '0.85rem' }}
                  />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Valor..."
                    value={newVal}
                    onChange={e => setNewVal(e.target.value)}
                    style={{ height: '36px', minWidth: '180px', fontSize: '0.85rem' }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCustomField}
                    style={{ height: '36px', padding: '0 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}
                  >
                    <Plus size={15} /> Añadir Campo
                  </Button>
                </div>
              </div>
            </Card>

            {/* SECCIÓN 2: PARÁMETROS GENERALES */}
            <Card title="2. Parámetros Generales (Signos Vitales - Triaje)" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                <Input label="FC (ppm)" type="number" value={heartRate} onChange={e => setHeartRate(e.target.value)} />
                <Input label="FR (rpm)" type="number" value={respiratoryRate} onChange={e => setRespiratoryRate(e.target.value)} />
                <Input label="TA (mmHg)" placeholder="120/80" value={bloodPressure} onChange={e => setBloodPressure(e.target.value)} />
                <Input label="SatO2 (%)" type="number" value={oxygenSaturation} onChange={e => setOxygenSaturation(e.target.value)} />
                <Input label="Talla (cm)" type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} />
                <Input label="Peso (Kg)" type="number" step="0.1" value={weightKg} onChange={e => setWeightKg(e.target.value)} />
              </div>
            </Card>

            {/* SECCIÓN ANTECEDENTES */}
            <Card title="Antecedentes Médicos y Quirúrgicos" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Personales (Patologías previas / Alergias)</label>
                  <textarea
                    className="input-field"
                    style={{ minHeight: '60px', resize: 'vertical', width: '100%' }}
                    value={personalHistory}
                    onChange={e => setPersonalHistory(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Quirúrgicos (Cirugías previas)</label>
                  <textarea
                    className="input-field"
                    style={{ minHeight: '60px', resize: 'vertical', width: '100%' }}
                    value={surgicalHistory}
                    onChange={e => setSurgicalHistory(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Familiares (Cáncer / Cardiopatías / DM)</label>
                  <textarea
                    className="input-field"
                    style={{ minHeight: '60px', resize: 'vertical', width: '100%' }}
                    value={familyHistory}
                    onChange={e => setFamilyHistory(e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* Botón Guardar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} style={{ padding: '0.6rem 2rem' }}>
                {saving ? 'Guardando...' : 'Guardar Ficha del Paciente'}
              </Button>
            </div>

          </form>
        )}

        {/* Modal de Cámara Web para Selfie / Fotografía del Paciente */}
        <PatientCameraCaptureModal
          isOpen={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          onCapturePhoto={(photoData) => setPhotoUrl(photoData)}
        />

        {showAudit && (
          <AuditLogModal
            patient={patient}
            patientId={patient.id}
            onClose={() => setShowAudit(false)}
          />
        )}
      </div>
    </div>
  );
}

export default PatientProfileEditor;
