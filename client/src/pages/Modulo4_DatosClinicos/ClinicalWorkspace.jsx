import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import api from '../../services/api';
import { Save, Clock, ArrowLeft, Plus, Trash, Sparkles, FileText, Printer, UserCheck, RefreshCw, Mic } from 'lucide-react';
import { AuditLogModal } from './AuditLogModal';
import { MedicalDocumentModal } from '../../components/MedicalDocumentModal';
import { SpeechMicButton } from '../../components/SpeechMicButton';
import { 
  CLINICAL_TEMPLATES, 
  COMMON_DIAGNOSES, 
  COMMON_MEDICATIONS, 
  COMMON_PRESENTATIONS, 
  COMMON_SYMPTOMS,
  COMMON_SPECIALTIES
} from '../../data/clinicalTemplates';

export function ClinicalWorkspace({ patient, onBack }) {
  const [profile, setProfile] = useState({});
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Tramitación (Flujo de Llegada y Razón de Consulta)
  const [consultationFlow, setConsultationFlow] = useState('PRIMERA_VEZ'); // 'PRIMERA_VEZ' | 'RECONSULTA'
  const [reasonGeneral, setReasonGeneral] = useState('Dolor / Molestia');
  const [reasonSpecific, setReasonSpecific] = useState('');

  // States for Consultation Form
  const [consultationId, setConsultationId] = useState(null);
  const [reasonForVisit, setReasonForVisit] = useState([]);
  const [clinicalSummary, setClinicalSummary] = useState(''); // Gran Motivo de Consulta estructurado con IA
  const [generatingAiReason, setGeneratingAiReason] = useState(false);

  const [physicalInspection, setPhysicalInspection] = useState('');
  const [physicalPalpation, setPhysicalPalpation] = useState('');
  const [rectalExamination, setRectalExamination] = useState('');
  const [anoscopy, setAnoscopy] = useState('');
  const [diagnoses, setDiagnoses] = useState([]);
  const [treatmentPlan, setTreatmentPlan] = useState([]);
  const [evolutionaryReport, setEvolutionaryReport] = useState('');

  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [printDocType, setPrintDocType] = useState('prescription');
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Auto-fill template loader
  const handleApplyTemplate = (tmplId) => {
    const tmpl = CLINICAL_TEMPLATES.find(t => t.id === tmplId);
    if (!tmpl) return;

    if (reasonForVisit.length > 0 || diagnoses.length > 0 || physicalInspection) {
      if (!window.confirm(`¿Desea rellenar automáticamente la historia con la plantilla "${tmpl.name}"? Los datos actuales serán reemplazados.`)) {
        return;
      }
    }

    setReasonForVisit(tmpl.reasonForVisit || []);
    setPhysicalInspection(tmpl.physicalInspection || '');
    setPhysicalPalpation(tmpl.physicalPalpation || '');
    setRectalExamination(tmpl.rectalExamination || '');
    setAnoscopy(tmpl.anoscopy || '');
    setDiagnoses(tmpl.diagnoses || []);
    setTreatmentPlan(tmpl.treatmentPlan || []);
    setEvolutionaryReport(tmpl.evolutionaryReport || '');
  };

  useEffect(() => {
    fetchProfileAndHistory();
  }, [patient.id]);

  const fetchProfileAndHistory = async () => {
    try {
      setLoadingProfile(true);
      const res = await api.get(`/api/patients/${patient.id}/profile`);
      setProfile(res.data.patientProfile || {});

      // Consultar historial para auto-determinar si es Reconsulta
      const consultRes = await api.get(`/api/patients/${patient.id}/consultations`);
      if (Array.isArray(consultRes.data) && consultRes.data.length > 0) {
        setConsultationFlow('RECONSULTA');
      } else {
        setConsultationFlow('PRIMERA_VEZ');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Generación Asistida del Gran Motivo de Consulta con IA (Google Gemini + Fallback)
  const handleGenerateAiReason = async () => {
    if (reasonForVisit.length === 0 && !reasonGeneral && !clinicalSummary) {
      alert('Por favor agregue al menos un síntoma o detalle en la tabla superior para procesar.');
      return;
    }

    try {
      setGeneratingAiReason(true);
      const res = await api.post('/api/ai/clinical-reason', {
        reasonForVisit: reasonForVisit.length > 0 ? reasonForVisit : [{ symptom: reasonGeneral, complement: reasonSpecific }],
        patient: {
          name: patient.name,
          gender: profile.gender || patient.gender,
          age: profile.dateOfBirth ? `${new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()} años` : ''
        },
        additionalNotes: clinicalSummary
      });

      if (res.data && res.data.granMotivoConsulta) {
        setClinicalSummary(res.data.granMotivoConsulta);
      }
    } catch (err) {
      console.error('Error al generar resumen IA:', err);
      alert('No se pudo generar el resumen asistido con IA. Puede continuar manualmente.');
    } finally {
      setGeneratingAiReason(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        id: consultationId,
        consultationFlow,
        reasonGeneral,
        reasonSpecific,
        reasonForVisit,
        clinicalSummary,
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
    <div className="module-container" style={{ paddingBottom: '3rem' }}>
      
      {/* Header and Trazabilidad */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem', fontWeight: 'bold' }}>
            <ArrowLeft size={18} /> Volver a Lista
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {profile.photoUrl && (
              <img 
                src={profile.photoUrl} 
                alt="Foto Paciente" 
                style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #0d9488', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} 
              />
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--color-text-main)', margin: 0 }}>
                  Historia Clínica: {patient.name}
                </h2>
                <span style={{ 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem', 
                  fontWeight: 700,
                  backgroundColor: consultationFlow === 'PRIMERA_VEZ' ? '#dcfce7' : '#e0f2fe',
                  color: consultationFlow === 'PRIMERA_VEZ' ? '#166534' : '#075985',
                  border: consultationFlow === 'PRIMERA_VEZ' ? '1px solid #86efac' : '1px solid #7dd3fc'
                }}>
                  {consultationFlow === 'PRIMERA_VEZ' ? '🟢 Primera Consulta' : '🔁 Reconsulta / Seguimiento'}
                </span>
              </div>
              <p style={{ color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0' }}>ID: {patient.identificationNumber}</p>
            </div>
          </div>
        </div>
        <Button onClick={() => setShowAudit(true)} style={{ backgroundColor: 'var(--color-accent)' }}>
          <Clock size={18} /> Historial de Modificaciones
        </Button>
      </div>

      {showAudit && <AuditLogModal patient={patient} patientId={patient.id} onClose={() => setShowAudit(false)} />}

      {/* BANNER DE TRAMITACIÓN CLÍNICA: 1RA VEZ VS RECONSULTA & RAZÓN DUAL */}
      <div style={{
        marginTop: '1.25rem',
        padding: '1rem 1.25rem',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid #cbd5e1',
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Flujo de Tramitación:</span>
          <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setConsultationFlow('PRIMERA_VEZ')}
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: consultationFlow === 'PRIMERA_VEZ' ? '#10b981' : 'transparent',
                color: consultationFlow === 'PRIMERA_VEZ' ? '#ffffff' : '#64748b',
                transition: 'all 0.2s ease'
              }}
            >
              Primera Consulta
            </button>
            <button
              type="button"
              onClick={() => setConsultationFlow('RECONSULTA')}
              style={{
                padding: '0.35rem 0.85rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: consultationFlow === 'RECONSULTA' ? '#0284c7' : 'transparent',
                color: consultationFlow === 'RECONSULTA' ? '#ffffff' : '#64748b',
                transition: 'all 0.2s ease'
              }}
            >
              Reconsulta / Llegada Directa
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Razón General:</label>
            <select
              className="input-field"
              value={reasonGeneral}
              onChange={e => setReasonGeneral(e.target.value)}
              style={{ height: '36px', padding: '0.2rem 0.6rem', fontSize: '0.85rem' }}
            >
              <option value="Dolor / Molestia">Dolor / Molestia Aguda</option>
              <option value="Sangrado / Rectorragia">Sangrado / Rectorragia</option>
              <option value="Masa / Prolapso">Masa / Prolapso Anal</option>
              <option value="Trastorno Evacuatorio">Trastorno Evacuatorio</option>
              <option value="Control Postoperatorio">Control Postoperatorio</option>
              <option value="Chequeo Preventivo">Chequeo Preventivo</option>
              <option value="Control Evolutivo">Control Evolutivo</option>
              <option value="Urgencia Médica">Urgencia Médica</option>
              <option value="Otro">Otro Motivo</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '220px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Razón Específica:</label>
            <input
              type="text"
              className="input-field"
              placeholder="Detalle puntual de la consulta..."
              value={reasonSpecific}
              onChange={e => setReasonSpecific(e.target.value)}
              style={{ height: '36px', padding: '0.2rem 0.6rem', fontSize: '0.85rem', flex: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Read-Only Secciones 1 y 2 */}
      <div className="responsive-grid-1-1" style={{ marginTop: '1.25rem' }}>
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

      {/* Tarjeta de Antecedentes */}
      <Card title="Antecedentes Médicos y Quirúrgicos del Paciente" className="glass-panel" style={{ marginTop: '1rem' }}>
        {loadingProfile ? <p>Cargando antecedentes...</p> : (
          <div style={{ fontSize: '0.88rem' }}>
            <div style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
              <div><strong>Personales / Patologías / Alergias:</strong> {profile.personalHistory || 'No especificados'}</div>
              <div style={{ marginTop: '0.35rem' }}><strong>Quirúrgicos (Qx):</strong> {profile.surgicalHistory || 'No especificados'}</div>
              <div style={{ marginTop: '0.35rem' }}><strong>Familiares:</strong> {profile.familyHistory || 'No especificados'}</div>
            </div>
          </div>
        )}
      </Card>

      {/* PANEL DE RELLENADO AUTOMÁTICO Y PLANTILLAS RÁPIDAS POR ESPECIALIDAD */}
      <div style={{ 
        margin: '1.5rem 0',
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'rgba(42, 183, 202, 0.08)',
        border: '1px solid rgba(42, 183, 202, 0.3)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#fff', display: 'flex' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-primary)' }}>
              Rellenado Automático y Plantillas por Especialidad
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Cargue diagnósticos, hallazgos físicos y tratamientos frecuentes con 1-clic.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select 
            className="input-field" 
            value={selectedSpecialty} 
            onChange={(e) => { setSelectedSpecialty(e.target.value); setSelectedTemplateId(''); }}
            style={{ minWidth: '220px', height: '42px', padding: '0.5rem 1rem', backgroundColor: '#fff', fontWeight: '500' }}
          >
            <option value="">-- Especialidad Médica --</option>
            {Array.from(new Set(CLINICAL_TEMPLATES.map(t => t.specialty))).sort().map((spec, i) => (
              <option key={i} value={spec}>{spec}</option>
            ))}
          </select>

          {selectedSpecialty && (
            <select 
              className="input-field" 
              value={selectedTemplateId} 
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              style={{ minWidth: '260px', height: '42px', padding: '0.5rem 1rem', backgroundColor: '#fff', fontWeight: '500' }}
            >
              <option value="">-- Seleccionar Plantilla --</option>
              {CLINICAL_TEMPLATES.filter(t => t.specialty === selectedSpecialty).map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}

          <Button 
            type="button"
            disabled={!selectedTemplateId}
            onClick={() => handleApplyTemplate(selectedTemplateId)}
            style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FileText size={16} /> Cargar Plantilla
          </Button>
        </div>
      </div>

      {/* DATALISTS PARA AUTOCOMPLETADO */}
      <datalist id="symptoms-list">
        {COMMON_SYMPTOMS.map((sym, i) => <option key={i} value={sym} />)}
      </datalist>
      <datalist id="diagnoses-list">
        {COMMON_DIAGNOSES.map((diag, i) => <option key={i} value={diag} />)}
      </datalist>
      <datalist id="medications-list">
        {COMMON_MEDICATIONS.map((med, i) => <option key={i} value={med} />)}
      </datalist>
      <datalist id="presentations-list">
        {COMMON_PRESENTATIONS.map((pres, i) => <option key={i} value={pres} />)}
      </datalist>

      {/* SECCIÓN 3: SÍNTOMAS, SIGNOS Y BOTÓN GRAN MOTIVO DE CONSULTA IA */}
      <Card 
        title="3. Síntomas, Signos y Motivo de Consulta" 
        className="glass-panel"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Tabla dinámica de síntomas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>
                Registro de Sintomatología y Signos (Tabulados o Texto Libre):
              </span>
            </div>

            {reasonForVisit.map((row, idx) => (
              <div key={idx} className="dynamic-row-7">
                <Input placeholder="Inicio Síntomas" value={row.onset} onChange={e=>updateReason(idx, 'onset', e.target.value)} />
                <input 
                  className="input-field" 
                  list="symptoms-list"
                  placeholder="Síntoma o Signo (o escribir nuevo)..." 
                  value={row.symptom} 
                  onChange={e=>updateReason(idx, 'symptom', e.target.value)} 
                  style={{ padding: '0.5rem', height: '42px' }} 
                />
                <Input placeholder="Características" value={row.complement} onChange={e=>updateReason(idx, 'complement', e.target.value)} />
                <Input placeholder="Región General" value={row.regionGeneral} onChange={e=>updateReason(idx, 'regionGeneral', e.target.value)} />
                <Input placeholder="Reg. Específica" value={row.regionSpecific} onChange={e=>updateReason(idx, 'regionSpecific', e.target.value)} />
                <Input placeholder="Relacionado con" value={row.relatedTo} onChange={e=>updateReason(idx, 'relatedTo', e.target.value)} />
                <Input placeholder="Info. Adicional" value={row.additionalInfo} onChange={e=>updateReason(idx, 'additionalInfo', e.target.value)} />
                <button type="button" onClick={() => removeReason(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-alert)', cursor: 'pointer' }}><Trash size={18} /></button>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              <Button type="button" onClick={addReasonRow} style={{ backgroundColor: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
                <Plus size={16} /> Añadir Fila de Síntoma
              </Button>

              {/* BOTÓN PROCESAMIENTO ASISTIDO: GRAN MOTIVO DE CONSULTA CON IA */}
              <button
                type="button"
                onClick={handleGenerateAiReason}
                disabled={generatingAiReason}
                style={{
                  background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Sparkles size={18} />
                {generatingAiReason ? 'Sintetizando con IA...' : '✨ Gran Motivo de Consulta con IA'}
              </button>
            </div>
          </div>

          {/* ÁREA DEL GRAN MOTIVO DE CONSULTA Y ENFERMEDAD ACTUAL (CON DICTADO POR VOZ) */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="input-label" style={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                <span>Gran Motivo de Consulta y Enfermedad Actual (Redacción Médica Formal)</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Dictar por voz:</span>
                <SpeechMicButton
                  onAppendText={(text) => setClinicalSummary(prev => prev ? `${prev} ${text}` : text)}
                  title="Dictar motivo de consulta por voz"
                />
              </div>
            </div>

            <textarea
              className="input-field"
              placeholder="Haga clic en '✨ Gran Motivo de Consulta con IA' para redactar automáticamente a partir de los síntomas, o dicte / escriba libremente la descripción clínica formal..."
              style={{ minHeight: '110px', resize: 'vertical', width: '100%', lineHeight: '1.6', fontSize: '0.92rem' }}
              value={clinicalSummary}
              onChange={e => setClinicalSummary(e.target.value)}
            />
            <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              * Esta síntesis clínica se incluirá en el informe médico oficial y en el expediente SOAP estandarizado.
            </p>
          </div>
        </div>
      </Card>

      {/* SECCIÓN 4: HALLAZGOS CLÍNICOS CON DICTADO POR VOZ DIRECTO */}
      <Card title="4. Hallazgos Clínicos (Examen Físico)" className="glass-panel">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label className="input-label" style={{ margin: 0, fontWeight: 600 }}>Inspección</label>
              <SpeechMicButton
                onAppendText={(text) => setPhysicalInspection(prev => prev ? `${prev} ${text}` : text)}
                title="Dictar inspección por voz"
              />
            </div>
            <textarea className="input-field" style={{ minHeight: '80px', resize: 'vertical', width: '100%' }} value={physicalInspection} onChange={e=>setPhysicalInspection(e.target.value)} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label className="input-label" style={{ margin: 0, fontWeight: 600 }}>Palpación</label>
              <SpeechMicButton
                onAppendText={(text) => setPhysicalPalpation(prev => prev ? `${prev} ${text}` : text)}
                title="Dictar palpación por voz"
              />
            </div>
            <textarea className="input-field" style={{ minHeight: '80px', resize: 'vertical', width: '100%' }} value={physicalPalpation} onChange={e=>setPhysicalPalpation(e.target.value)} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label className="input-label" style={{ margin: 0, fontWeight: 600 }}>Tacto Rectal</label>
              <SpeechMicButton
                onAppendText={(text) => setRectalExamination(prev => prev ? `${prev} ${text}` : text)}
                title="Dictar tacto rectal por voz"
              />
            </div>
            <textarea className="input-field" style={{ minHeight: '80px', resize: 'vertical', width: '100%' }} value={rectalExamination} onChange={e=>setRectalExamination(e.target.value)} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label className="input-label" style={{ margin: 0, fontWeight: 600 }}>Anoscopia</label>
              <SpeechMicButton
                onAppendText={(text) => setAnoscopy(prev => prev ? `${prev} ${text}` : text)}
                title="Dictar anoscopia por voz"
              />
            </div>
            <textarea className="input-field" style={{ minHeight: '80px', resize: 'vertical', width: '100%' }} value={anoscopy} onChange={e=>setAnoscopy(e.target.value)} />
          </div>
        </div>
      </Card>

      {/* SECCIÓN 5: DIAGNÓSTICOS */}
      <Card title="5. Diagnósticos" className="glass-panel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {diagnoses.map((row, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div className="dynamic-row-4">
                <div className="input-group">
                  <label className="input-label">Diagnóstico</label>
                  <input 
                    className="input-field"
                    list="diagnoses-list"
                    placeholder="Escriba o seleccione un diagnóstico..."
                    value={row.diagnosis}
                    onChange={e=>updateDiagnosis(idx, 'diagnosis', e.target.value)}
                    style={{ height: '42px', padding: '0.5rem 1rem' }}
                  />
                </div>
                <Input label="Clasificación/Tipo" value={row.classification} onChange={e=>updateDiagnosis(idx, 'classification', e.target.value)} />
                <Input label="Complicado con" value={row.complication} onChange={e=>updateDiagnosis(idx, 'complication', e.target.value)} />
                <button type="button" onClick={() => removeDiagnosis(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-alert)', cursor: 'pointer', marginTop: '1.5rem' }}><Trash size={18} /></button>
              </div>
              
              {isCancer(row.diagnosis) && (
                <div className="responsive-grid-1-1" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--color-alert)' }}>
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

      {/* SECCIÓN 6: PLAN DE TRABAJO (TRATAMIENTO) */}
      <Card title="6. Plan de Trabajo (Tratamiento)" className="glass-panel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {treatmentPlan.map((row, idx) => (
            <div key={idx} className="dynamic-row-5">
              <input 
                className="input-field" 
                list="medications-list"
                placeholder="Medicamento / Principio Activo" 
                value={row.medication} 
                onChange={e=>updateTreatment(idx, 'medication', e.target.value)} 
                style={{ padding: '0.5rem', height: '42px' }}
              />
              <input 
                className="input-field" 
                list="presentations-list"
                placeholder="Presentación" 
                value={row.presentation} 
                onChange={e=>updateTreatment(idx, 'presentation', e.target.value)} 
                style={{ padding: '0.5rem', height: '42px' }}
              />
              <Input placeholder="Indicación / Posología" value={row.indication} onChange={e=>updateTreatment(idx, 'indication', e.target.value)} />
              <Input placeholder="Duración" value={row.duration} onChange={e=>updateTreatment(idx, 'duration', e.target.value)} />
              <button type="button" onClick={() => removeTreatment(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-alert)', cursor: 'pointer' }}><Trash size={18} /></button>
            </div>
          ))}
          <Button type="button" onClick={addTreatment} style={{ alignSelf: 'flex-start', backgroundColor: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
            <Plus size={16} /> Añadir Medicamento
          </Button>
        </div>
      </Card>

      {/* SECCIÓN 7: INFORME EVOLUTIVO */}
      <Card title="7. Informe Evolutivo" className="glass-panel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label className="input-label" style={{ margin: 0, fontWeight: 600 }}>Descripción General</label>
              <SpeechMicButton
                onAppendText={(text) => setEvolutionaryReport(prev => prev ? `${prev} ${text}` : text)}
                title="Dictar informe evolutivo por voz"
              />
            </div>
            <textarea className="input-field" style={{ minHeight: '120px', resize: 'vertical', width: '100%' }} value={evolutionaryReport} onChange={e=>setEvolutionaryReport(e.target.value)} />
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>* Recuerde que la inspección y examen físico evolutivo puede reflejarse en los campos de la Sección 4 superiores o documentarse en la descripción general.</p>
        </div>
      </Card>

      {/* ACCIONES Y BOTONES DE IMPRESIÓN Y GUARDADO */}
      <div style={{ position: 'sticky', bottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setPrintDocType('prescription');
              setShowPrintModal(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Printer size={16} /> Imprimir Récipes (Farmacia / Indicaciones)
          </Button>

          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setPrintDocType('clinical_report');
              setShowPrintModal(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FileText size={16} /> Imprimir Informe Médico de Consulta
          </Button>
        </div>

        <Button onClick={handleSave} disabled={saving} style={{ padding: '0.75rem 2.5rem', fontSize: '1.05rem', boxShadow: '0 8px 16px rgba(42,183,202,0.3)' }}>
          <Save style={{ marginRight: '0.5rem' }} /> {saving ? 'Guardando...' : 'Guardar Historia Clínica'}
        </Button>
      </div>

      {/* MODAL DE IMPRESIÓN OFICIAL UNIMECO CON SOPORTE DOBLE RÉCIPE */}
      <MedicalDocumentModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        type={printDocType}
        data={{
          patient: {
            ...patient,
            identificationNumber: patient.identificationNumber,
            name: patient.name
          },
          doctor: JSON.parse(localStorage.getItem('user') || '{}'),
          treatmentPlan: treatmentPlan,
          diagnoses: diagnoses.map(d => d.diagnosis).filter(Boolean).join(', '),
          reasonForVisit: clinicalSummary || reasonForVisit.map(r => `${r.symptom || ''} ${r.onset ? `(${r.onset})` : ''} ${r.additionalInfo || ''}`).filter(s => s.trim().length > 0).join('; '),
          physicalExam: [
            physicalInspection && `Inspección: ${physicalInspection}`,
            physicalPalpation && `Palpación: ${physicalPalpation}`,
            rectalExamination && `Tacto Rectal: ${rectalExamination}`,
            anoscopy && `Anoscopia: ${anoscopy}`
          ].filter(Boolean).join('. '),
          evolutionaryReport: evolutionaryReport,
          recommendations: evolutionaryReport,
          sede: patient.sedeAtencion || profile.sedeAtencion || 'CENTRAL'
        }}
      />

    </div>
  );
}

export default ClinicalWorkspace;
