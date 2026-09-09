import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import api from '../../services/api';
import { User, Activity, X, Clock } from 'lucide-react';
import { AuditLogModal } from '../Modulo4_DatosClinicos/AuditLogModal';

export function PatientProfileEditor({ patient, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

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

  const imc = (weightKg && heightCm) ? (weightKg / Math.pow(heightCm / 100, 2)).toFixed(1) : '-';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', backgroundColor: 'var(--color-bg-main)', borderRadius: '12px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User /> Expediente: {patient.username}
            </h2>
            <p style={{ color: 'var(--color-text-muted)' }}>Módulo de Ingreso de Datos (Sección 1 y 2)</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

            {/* SECCIÓN 1 */}
            <Card title="1. Datos del Cliente / Paciente" style={{ marginBottom: '1.5rem' }}>
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
                      label="Edad."
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
            </Card>

            {/* SECCIÓN ANTECEDENTES */}
            <Card title="Antecedentes Médicos y Quirúrgicos" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Antecedentes Personales / Patologías de Base / Alergias</label>
                  <textarea
                    className="input-field"
                    rows="2"
                    placeholder="Ej. Niega patologías de base, alergias a medicamentos..."
                    value={personalHistory}
                    onChange={(e) => setPersonalHistory(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Antecedentes Quirúrgicos (Qx)</label>
                  <textarea
                    className="input-field"
                    rows="2"
                    placeholder="Ej. Cirugía en rodilla derecha por traumatismo (nov 2024), mamoplastia de aumento (2007) sin complicaciones..."
                    value={surgicalHistory}
                    onChange={(e) => setSurgicalHistory(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Antecedentes Familiares</label>
                  <input
                    className="input-field"
                    placeholder="Ej. Madre (+) APS, padre (+) no precisa"
                    value={familyHistory}
                    onChange={(e) => setFamilyHistory(e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* SECCIÓN 2 */}
            <Card title="2. Parámetros Generales (Signos Vitales)" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <Input label="FC (ppm)" type="number" value={heartRate} onChange={e => setHeartRate(e.target.value)} />
                <Input label="FR (rpm)" type="number" value={respiratoryRate} onChange={e => setRespiratoryRate(e.target.value)} />
                <Input label="TA (mmHg)" placeholder="120/80" value={bloodPressure} onChange={e => setBloodPressure(e.target.value)} />
                <Input label="SatO2 (%)" type="number" value={oxygenSaturation} onChange={e => setOxygenSaturation(e.target.value)} />
                <Input label="Talla (cm)" type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} />
                <Input label="Peso (Kg)" type="number" step="0.1" value={weightKg} onChange={e => setWeightKg(e.target.value)} />

                <div className="input-group">
                  <label className="input-label" style={{ color: 'var(--color-primary)' }}>IMC (Calc.)</label>
                  <div className="input-field" style={{ backgroundColor: 'rgba(42, 183, 202, 0.1)', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    {imc}
                  </div>
                </div>
              </div>
            </Card>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button type="button" onClick={onClose} style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--border-color)' }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Datos del Paciente'}
              </Button>
            </div>
          </form>
        )}

        {showAudit && (
          <AuditLogModal
            patient={patient}
            onClose={() => setShowAudit(false)}
          />
        )}
      </div>
    </div>
  );
}
