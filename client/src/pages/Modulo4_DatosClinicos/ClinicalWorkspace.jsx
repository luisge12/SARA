import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import api from '../../services/api';
import { Save, Clock, ArrowLeft, Plus, Trash } from 'lucide-react';
import { AuditLogModal } from './AuditLogModal';

export function ClinicalWorkspace({ patient, onBack }) {
  const [profile, setProfile] = useState({});
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // States for Consultation Form
  const [consultationId, setConsultationId] = useState(null);
  const [reasonForVisit, setReasonForVisit] = useState([]);
  const [physicalInspection, setPhysicalInspection] = useState('');
  const [physicalPalpation, setPhysicalPalpation] = useState('');
  const [rectalExamination, setRectalExamination] = useState('');
  const [anoscopy, setAnoscopy] = useState('');
  const [diagnoses, setDiagnoses] = useState([]);
  const [treatmentPlan, setTreatmentPlan] = useState([]);
  const [evolutionaryReport, setEvolutionaryReport] = useState('');

  const [saving, setSaving] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [patient.id]);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await api.get(`/api/patients/${patient.id}/profile`);
      setProfile(res.data.patientProfile || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        id: consultationId,
        reasonForVisit,
        physicalInspection,
        physicalPalpation,
        rectalExamination,
        anoscopy,
        diagnoses,
        treatmentPlan,
        evolutionaryReport
      };
      
      const res = await api.post(`/api/patients/${patient.id}/consultations`, payload);
      setConsultationId(res.data.consultation.id);
      alert('Consulta guardada exitosamente.');
    } catch (err) {
      console.error(err);
      alert('Error al guardar la consulta');
    } finally {
      setSaving(false);
    }
  };

  // Helpers for dynamic arrays
  const addReasonRow = () => setReasonForVisit([...reasonForVisit, { onset: '', symptom: '', complement: '', regionGeneral: '', regionSpecific: '', relatedTo: '', additionalInfo: '' }]);
  const updateReason = (idx, field, val) => { const arr = [...reasonForVisit]; arr[idx][field] = val; setReasonForVisit(arr); };
  const removeReason = (idx) => setReasonForVisit(reasonForVisit.filter((_, i) => i !== idx));

  const addDiagnosis = () => setDiagnoses([...diagnoses, { diagnosis: '', classification: '', complication: '', histologicType: '', stage: '' }]);
  const updateDiagnosis = (idx, field, val) => { const arr = [...diagnoses]; arr[idx][field] = val; setDiagnoses(arr); };
  const removeDiagnosis = (idx) => setDiagnoses(diagnoses.filter((_, i) => i !== idx));

  const addTreatment = () => setTreatmentPlan([...treatmentPlan, { medication: '', presentation: '', indication: '', duration: '' }]);
  const updateTreatment = (idx, field, val) => { const arr = [...treatmentPlan]; arr[idx][field] = val; setTreatmentPlan(arr); };
  const removeTreatment = (idx) => setTreatmentPlan(treatmentPlan.filter((_, i) => i !== idx));

  const isCancer = (diagText) => diagText.toLowerCase().includes('cáncer') || diagText.toLowerCase().includes('cancer');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', paddingBottom: '3rem' }}>
      
      {/* Header and Trazabilidad */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem', fontWeight: 'bold' }}>
            <ArrowLeft size={18} /> Volver a Lista
          </button>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-text-main)' }}>Historia Clínica: {patient.name}</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>ID: {patient.identificationNumber}</p>
        </div>
        <Button onClick={() => setShowAudit(true)} style={{ backgroundColor: 'var(--color-accent)' }}>
          <Clock size={18} /> Historial de Modificaciones
        </Button>
      </div>

      {showAudit && <AuditLogModal patientId={patient.id} onClose={() => setShowAudit(false)} />}

      {/* Read-Only Secciones 1 y 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Card title="Sección 1: Demográficos (Recepción)" className="glass-panel">
          {loadingProfile ? <p>Cargando...</p> : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <li><strong>Género:</strong> {profile.gender || '-'}</li>
              <li><strong>Teléfono:</strong> {profile.phone || '-'}</li>
              <li><strong>Sede:</strong> {patient.sedeAtencion || '-'}</li>
              <li><strong>Próxima Cita:</strong> {profile.nextAppointment ? new Date(profile.nextAppointment).toLocaleString() : '-'}</li>
            </ul>
          )}
        </Card>
        
        <Card title="Sección 2: Parámetros (Signos Vitales)" className="glass-panel">
          {loadingProfile ? <p>Cargando...</p> : (
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
              <div><strong>FC:</strong> {profile.heartRate || '-'} ppm</div>
              <div><strong>FR:</strong> {profile.respiratoryRate || '-'} rpm</div>
              <div><strong>TA:</strong> {profile.bloodPressure || '-'} mmHg</div>
              <div><strong>SatO2:</strong> {profile.oxygenSaturation || '-'} %</div>
              <div><strong>Talla:</strong> {profile.heightCm || '-'} cm</div>
              <div><strong>Peso:</strong> {profile.weightKg || '-'} Kg</div>
            </div>
          )}
        </Card>
      </div>

      <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />

      {/* SECCIÓN 3 */}
      <Card title="3. Motivo de Consulta y Enfermedad Actual" className="glass-panel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reasonForVisit.map((row, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr) auto', gap: '0.5rem', alignItems: 'center' }}>
              <Input placeholder="Inicio Síntomas" value={row.onset} onChange={e=>updateReason(idx, 'onset', e.target.value)} />
              <select className="input-field" value={row.symptom} onChange={e=>updateReason(idx, 'symptom', e.target.value)} style={{ padding: '0.5rem' }}>
                <option value="">Síntoma...</option>
                <option value="Dolor">Dolor</option>
                <option value="Ardor">Ardor</option>
                <option value="Sangrado">Sangrado</option>
                <option value="Fiebre">Fiebre</option>
                <option value="Otro">Otro</option>
              </select>
              <Input placeholder="Complemento" value={row.complement} onChange={e=>updateReason(idx, 'complement', e.target.value)} />
              <Input placeholder="Región General" value={row.regionGeneral} onChange={e=>updateReason(idx, 'regionGeneral', e.target.value)} />
              <Input placeholder="Reg. Específica" value={row.regionSpecific} onChange={e=>updateReason(idx, 'regionSpecific', e.target.value)} />
              <Input placeholder="Relacionado con" value={row.relatedTo} onChange={e=>updateReason(idx, 'relatedTo', e.target.value)} />
              <Input placeholder="Info. Adicional" value={row.additionalInfo} onChange={e=>updateReason(idx, 'additionalInfo', e.target.value)} />
              <button type="button" onClick={() => removeReason(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-alert)', cursor: 'pointer' }}><Trash size={18} /></button>
            </div>
          ))}
          <Button type="button" onClick={addReasonRow} style={{ alignSelf: 'flex-start', backgroundColor: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
            <Plus size={16} /> Añadir Fila
          </Button>
        </div>
      </Card>

      {/* SECCIÓN 4 */}
      <Card title="4. Hallazgos Clínicos (Examen Físico)" className="glass-panel">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <div>
            <label className="input-label">Inspección</label>
            <textarea className="input-field" style={{ minHeight: '80px', resize: 'vertical', width: '100%' }} value={physicalInspection} onChange={e=>setPhysicalInspection(e.target.value)} />
          </div>
          <div>
            <label className="input-label">Palpación</label>
            <textarea className="input-field" style={{ minHeight: '80px', resize: 'vertical', width: '100%' }} value={physicalPalpation} onChange={e=>setPhysicalPalpation(e.target.value)} />
          </div>
          <div>
            <label className="input-label">Tacto Rectal</label>
            <textarea className="input-field" style={{ minHeight: '80px', resize: 'vertical', width: '100%' }} value={rectalExamination} onChange={e=>setRectalExamination(e.target.value)} />
          </div>
          <div>
            <label className="input-label">Anoscopia</label>
            <textarea className="input-field" style={{ minHeight: '80px', resize: 'vertical', width: '100%' }} value={anoscopy} onChange={e=>setAnoscopy(e.target.value)} />
          </div>
        </div>
      </Card>

      {/* SECCIÓN 5 */}
      <Card title="5. Diagnósticos" className="glass-panel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {diagnoses.map((row, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: '1rem', alignItems: 'flex-start' }}>
                <Input label="Diagnóstico" value={row.diagnosis} onChange={e=>updateDiagnosis(idx, 'diagnosis', e.target.value)} />
                <Input label="Clasificación/Tipo" value={row.classification} onChange={e=>updateDiagnosis(idx, 'classification', e.target.value)} />
                <Input label="Complicado con" value={row.complication} onChange={e=>updateDiagnosis(idx, 'complication', e.target.value)} />
                <button type="button" onClick={() => removeDiagnosis(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-alert)', cursor: 'pointer', marginTop: '1.5rem' }}><Trash size={18} /></button>
              </div>
              
              {isCancer(row.diagnosis) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--color-alert)' }}>
                  <Input label="Tipo Histológico (Cáncer)" value={row.histologicType} onChange={e=>updateDiagnosis(idx, 'histologicType', e.target.value)} />
                  <Input label="Estadio (Cáncer)" value={row.stage} onChange={e=>updateDiagnosis(idx, 'stage', e.target.value)} />
                </div>
              )}
            </div>
          ))}
          <Button type="button" onClick={addDiagnosis} style={{ alignSelf: 'flex-start', backgroundColor: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
            <Plus size={16} /> Añadir Diagnóstico
          </Button>
        </div>
      </Card>

      {/* SECCIÓN 6 */}
      <Card title="6. Plan de Trabajo (Tratamiento)" className="glass-panel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {treatmentPlan.map((row, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
              <Input placeholder="Medicamento" value={row.medication} onChange={e=>updateTreatment(idx, 'medication', e.target.value)} />
              <Input placeholder="Presentación" value={row.presentation} onChange={e=>updateTreatment(idx, 'presentation', e.target.value)} />
              <Input placeholder="Indicación" value={row.indication} onChange={e=>updateTreatment(idx, 'indication', e.target.value)} />
              <Input placeholder="Duración" value={row.duration} onChange={e=>updateTreatment(idx, 'duration', e.target.value)} />
              <button type="button" onClick={() => removeTreatment(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-alert)', cursor: 'pointer' }}><Trash size={18} /></button>
            </div>
          ))}
          <Button type="button" onClick={addTreatment} style={{ alignSelf: 'flex-start', backgroundColor: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
            <Plus size={16} /> Añadir Medicamento
          </Button>
        </div>
      </Card>

      {/* SECCIÓN 7 */}
      <Card title="7. Informe Evolutivo" className="glass-panel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="input-label">Descripción General</label>
            <textarea className="input-field" style={{ minHeight: '120px', resize: 'vertical', width: '100%' }} value={evolutionaryReport} onChange={e=>setEvolutionaryReport(e.target.value)} />
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>* Recuerde que la inspección y examen físico evolutivo puede reflejarse en los campos de la Sección 4 superiores o documentarse en la descripción general.</p>
        </div>
      </Card>

      {/* SAVE BUTTON */}
      <div style={{ position: 'sticky', bottom: '2rem', display: 'flex', justifyContent: 'flex-end', zIndex: 10 }}>
        <Button onClick={handleSave} disabled={saving} style={{ padding: '1rem 3rem', fontSize: '1.2rem', boxShadow: '0 8px 16px rgba(42,183,202,0.3)' }}>
          <Save style={{ marginRight: '0.5rem' }} /> {saving ? 'Guardando...' : 'Guardar Historia Clínica'}
        </Button>
      </div>

    </div>
  );
}
