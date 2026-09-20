import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import api from '../../services/api';
import { Save, Clock, ArrowLeft, Plus, Trash, Sparkles, FileText, Printer, UserCheck, RefreshCw, Mic, Bookmark, Pill } from 'lucide-react';
import { AuditLogModal } from './AuditLogModal';
import { MedicalDocumentModal } from '../../components/MedicalDocumentModal';
import { SpeechMicButton } from '../../components/SpeechMicButton';
import { 
  CLINICAL_TEMPLATES, 
  COMMON_DIAGNOSES, 
  COMMON_MEDICATIONS, 
  COMMON_PRESENTATIONS, 
  COMMON_SYMPTOMS,
  COMMON_SPECIALTIES,
  PHARMACOLOGICAL_GUIDE
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

  // Pautas farmacológicas y esquemas personalizados
  const [savedSchemes, setSavedSchemes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sara_saved_treatment_schemes') || '[]');
    } catch {
      return [];
    }
  });

  const handleSelectPharmGuide = (e) => {
    const val = e.target.value;
    if (val === '') return;
    const item = PHARMACOLOGICAL_GUIDE[Number(val)];
    if (!item) return;

    const newRow = {
      medication: `${item.brandName} (${item.activeIngredient})`,
      presentation: item.presentation,
      indication: item.defaultIndication,
      duration: item.defaultDuration
    };

    setTreatmentPlan(prev => {
      if (prev.length === 1 && !prev[0].medication) {
        return [newRow];
      }
      return [...prev, newRow];
    });
    e.target.value = '';
  };

  const handleSaveCustomScheme = () => {
    if (treatmentPlan.length === 0 || !treatmentPlan.some(t => t.medication)) {
      alert('Agregue al menos un medicamento antes de guardar como pauta personalizada.');
      return;
    }
    const schemeName = prompt('Nombre para esta pauta de tratamiento (ej. Pauta Fisura Aguda / Pauta Hemorroides):');
    if (!schemeName || !schemeName.trim()) return;
    const updated = [...savedSchemes, { id: Date.now().toString(), name: schemeName.trim(), items: treatmentPlan }];
    setSavedSchemes(updated);
    localStorage.setItem('sara_saved_treatment_schemes', JSON.stringify(updated));
    alert(`Plantilla "${schemeName}" guardada correctamente.`);
  };

  const handleLoadCustomScheme = (e) => {
    const id = e.target.value;
    if (!id) return;
    const found = savedSchemes.find(s => s.id === id);
    if (!found) return;
    setTreatmentPlan(found.items || []);
    e.target.value = '';
  };

  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateLoadedMessage, setTemplateLoadedMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [printDocType, setPrintDocType] = useState('prescription');
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Auto-fill template loader
  const handleApplyTemplate = (tmplId) => {
    if (!tmplId) {
      alert('Por favor seleccione una plantilla clínica del listado desplegable.');
      return;
    }

    const tmpl = CLINICAL_TEMPLATES.find(t => t.id === tmplId);
    if (!tmpl) {
      alert('No se encontró la plantilla seleccionada.');
      return;
    }

    const hasExistingData = reasonForVisit.length > 0 || diagnoses.length > 0 || physicalInspection || clinicalSummary;
    if (hasExistingData) {
      if (!window.confirm(`¿Desea rellenar automáticamente la historia con la plantilla "${tmpl.name}"? Los datos actuales serán reemplazados.`)) {
        return;
      }
    }

    // Copias profundas para evitar mutaciones de memoria
    const clonedReasons = (tmpl.reasonForVisit || []).map(r => ({
      onset: r.onset || '',
      symptom: r.symptom || '',
      complement: r.complement || '',
      regionGeneral: r.regionGeneral || '',
      regionSpecific: r.regionSpecific || '',
      relatedTo: r.relatedTo || '',
      additionalInfo: r.additionalInfo || ''
    }));

    const clonedDiagnoses = (tmpl.diagnoses || []).map(d => ({
      diagnosis: d.diagnosis || '',
      classification: d.classification || '',
      complication: d.complication || '',
      histologicType: d.histologicType || '',
      stage: d.stage || ''
    }));

    const clonedTreatments = (tmpl.treatmentPlan || [])
      .filter(t => t.medication && t.medication.trim() !== '' && t.medication !== 'Indicaciones Generales')
      .map(t => ({
        medication: t.medication || '',
        presentation: t.presentation || '',
        indication: t.indication || '',
        duration: t.duration || ''
      }));

    setReasonForVisit(clonedReasons);
    setPhysicalInspection(tmpl.physicalInspection || '');
    setPhysicalPalpation(tmpl.physicalPalpation || '');
    setRectalExamination(tmpl.rectalExamination || '');
    setAnoscopy(tmpl.anoscopy || '');
    setDiagnoses(clonedDiagnoses);
    setTreatmentPlan(clonedTreatments);
    setEvolutionaryReport(tmpl.evolutionaryReport || '');

    // Gran Motivo de Consulta y Redacción Médica
    if (tmpl.description) {
      setClinicalSummary(tmpl.description);
    } else if (clonedReasons.length > 0 && clonedReasons[0].symptom) {
      setClinicalSummary(`${clonedReasons[0].symptom}: ${clonedReasons[0].complement || ''}`);
    }

    // Razón General y Razón Específica de Tramitación
    if (clonedReasons.length > 0) {
      if (clonedReasons[0].symptom) {
        setReasonGeneral(clonedReasons[0].symptom);
      }
      if (clonedReasons[0].complement) {
        setReasonSpecific(clonedReasons[0].complement);
      }
    }

    setTemplateLoadedMessage(`Plantilla "${tmpl.name}" cargada correctamente con diagnósticos, motivo de consulta y tratamiento.`);
    setTimeout(() => {
      setTemplateLoadedMessage('');
    }, 6000);
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
                <h2 style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: 700, margin: 0 }}>
                  Historia Clínica: {patient.name}
                </h2>
                <span style={{ 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '20px', 
                  fontSize: '0.82rem', 
                  fontWeight: 700,
                  backgroundColor: consultationFlow === 'PRIMERA_VEZ' ? '#dcfce7' : '#e0f2fe',
                  color: consultationFlow === 'PRIMERA_VEZ' ? '#14532d' : '#0369a1',
                  border: consultationFlow === 'PRIMERA_VEZ' ? '1px solid #86efac' : '1px solid #7dd3fc'
                }}>
                  {consultationFlow === 'PRIMERA_VEZ' ? '🟢 Primera Consulta' : '🔁 Reconsulta / Seguimiento'}
                </span>
              </div>
              <p style={{ color: '#334155', fontWeight: 600, margin: '0.25rem 0 0 0' }}>ID: <strong style={{ color: '#0f172a' }}>{patient.identificationNumber}</strong></p>
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
        border: '1px solid #94a3b8',
        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Flujo de Tramitación:</span>
          <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#e2e8f0', padding: '3px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setConsultationFlow('PRIMERA_VEZ')}
              style={{
                padding: '0.4rem 0.85rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: consultationFlow === 'PRIMERA_VEZ' ? '#059669' : 'transparent',
                color: consultationFlow === 'PRIMERA_VEZ' ? '#ffffff' : '#1e293b',
                transition: 'all 0.2s ease'
              }}
            >
              Primera Consulta
            </button>
            <button
              type="button"
              onClick={() => setConsultationFlow('RECONSULTA')}
              style={{
                padding: '0.4rem 0.85rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: consultationFlow === 'RECONSULTA' ? '#0284c7' : 'transparent',
                color: consultationFlow === 'RECONSULTA' ? '#ffffff' : '#1e293b',
                transition: 'all 0.2s ease'
              }}
            >
              Reconsulta / Llegada Directa
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Razón General:</label>
            <select
              className="input-field"
              value={reasonGeneral}
              onChange={e => setReasonGeneral(e.target.value)}
              style={{ height: '38px', padding: '0.2rem 0.6rem', fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', backgroundColor: '#ffffff', borderColor: '#94a3b8' }}
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
            <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Razón Específica:</label>
            <input
              type="text"
              className="input-field"
              placeholder="Detalle puntual de la consulta..."
              value={reasonSpecific}
              onChange={e => setReasonSpecific(e.target.value)}
              style={{ height: '38px', padding: '0.2rem 0.6rem', fontSize: '0.88rem', fontWeight: 500, color: '#0f172a', backgroundColor: '#ffffff', borderColor: '#94a3b8', flex: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Read-Only Secciones 1 y 2 */}
      <div className="responsive-grid-1-1" style={{ marginTop: '1.25rem' }}>
        <Card title="Sección 1: Demográficos (Recepción)" className="glass-panel">
          {loadingProfile ? <p style={{ color: '#0f172a' }}>Cargando...</p> : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.92rem', color: '#1e293b', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <li><strong style={{ color: '#0f172a' }}>Género:</strong> <span>{profile.gender || '-'}</span></li>
              <li><strong style={{ color: '#0f172a' }}>Teléfono:</strong> <span>{profile.phone || '-'}</span></li>
              <li><strong style={{ color: '#0f172a' }}>Sede:</strong> <span>{patient.sedeAtencion || '-'}</span></li>
              <li><strong style={{ color: '#0f172a' }}>Próxima Cita:</strong> <span>{profile.nextAppointment ? new Date(profile.nextAppointment).toLocaleString() : '-'}</span></li>
            </ul>
          )}
        </Card>
        
        <Card title="Sección 2: Parámetros (Signos Vitales)" className="glass-panel">
          {loadingProfile ? <p style={{ color: '#0f172a' }}>Cargando...</p> : (
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.92rem', color: '#1e293b' }}>
              <div><strong style={{ color: '#0f172a' }}>FC:</strong> <span style={{ color: '#0f172a', fontWeight: 600 }}>{profile.heartRate || '-'}</span> ppm</div>
              <div><strong style={{ color: '#0f172a' }}>FR:</strong> <span style={{ color: '#0f172a', fontWeight: 600 }}>{profile.respiratoryRate || '-'}</span> rpm</div>
              <div><strong style={{ color: '#0f172a' }}>TA:</strong> <span style={{ color: '#0f172a', fontWeight: 600 }}>{profile.bloodPressure || '-'}</span> mmHg</div>
              <div><strong style={{ color: '#0f172a' }}>SatO2:</strong> <span style={{ color: '#0f172a', fontWeight: 600 }}>{profile.oxygenSaturation || '-'}</span> %</div>
              <div><strong style={{ color: '#0f172a' }}>Talla:</strong> <span style={{ color: '#0f172a', fontWeight: 600 }}>{profile.heightCm || '-'}</span> cm</div>
              <div><strong style={{ color: '#0f172a' }}>Peso:</strong> <span style={{ color: '#0f172a', fontWeight: 600 }}>{profile.weightKg || '-'}</span> Kg</div>
            </div>
          )}
        </Card>
      </div>

      {/* Tarjeta de Antecedentes */}
      <Card title="Antecedentes Médicos y Quirúrgicos del Paciente" className="glass-panel" style={{ marginTop: '1rem' }}>
        {loadingProfile ? <p style={{ color: '#0f172a' }}>Cargando antecedentes...</p> : (
          <div style={{ fontSize: '0.92rem', color: '#1e293b', lineHeight: '1.7' }}>
            <div><strong style={{ color: '#0f172a' }}>Personales / Patologías / Alergias:</strong> <span>{profile.personalHistory || 'No especificados'}</span></div>
            <div style={{ marginTop: '0.35rem' }}><strong style={{ color: '#0f172a' }}>Quirúrgicos (Qx):</strong> <span>{profile.surgicalHistory || 'No especificados'}</span></div>
            <div style={{ marginTop: '0.35rem' }}><strong style={{ color: '#0f172a' }}>Familiares:</strong> <span>{profile.familyHistory || 'No especificados'}</span></div>
          </div>
        )}
      </Card>

      {/* PANEL DE RELLENADO AUTOMÁTICO Y PLANTILLAS RÁPIDAS POR ESPECIALIDAD */}
      <div style={{ 
        margin: '1.5rem 0',
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: '#f0fdf4',
        border: '1px solid #86efac',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: '#059669', color: '#fff', display: 'flex' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#065f46' }}>
                Plantillas Clínicas Rápidas y Rellenado Automático
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#1e293b', fontWeight: '500' }}>
                Cargue diagnósticos, motivos de consulta, examen físico y tratamientos frecuentes con 1-clic.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Filtro opcional por Especialidad */}
            <select 
              className="input-field" 
              value={selectedSpecialty} 
              onChange={(e) => { 
                setSelectedSpecialty(e.target.value); 
                setSelectedTemplateId(''); 
              }}
              style={{ minWidth: '200px', height: '42px', padding: '0.5rem 1rem', backgroundColor: '#fff', fontWeight: '600', color: '#0f172a', borderColor: '#94a3b8' }}
              title="Filtrar plantillas por especialidad médica"
            >
              <option value="">-- Todas las Especialidades ({Array.from(new Set(CLINICAL_TEMPLATES.map(t => t.specialty))).length}) --</option>
              {Array.from(new Set(CLINICAL_TEMPLATES.map(t => t.specialty))).sort().map((spec, i) => (
                <option key={i} value={spec}>{spec}</option>
              ))}
            </select>

            {/* Selector de Plantilla (Siempre disponible para selección inmediata) */}
            <select 
              className="input-field" 
              value={selectedTemplateId} 
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              style={{ minWidth: '260px', maxWidth: '400px', height: '42px', padding: '0.5rem 1rem', backgroundColor: '#fff', fontWeight: '600', color: '#0f172a', borderColor: selectedTemplateId ? '#059669' : '#94a3b8' }}
            >
              <option value="">-- Seleccionar Plantilla Clínica --</option>
              {selectedSpecialty ? (
                CLINICAL_TEMPLATES.filter(t => t.specialty === selectedSpecialty).map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))
              ) : (
                Array.from(new Set(CLINICAL_TEMPLATES.map(t => t.specialty))).sort().map((spec) => (
                  <optgroup key={spec} label={`-- ${spec} --`}>
                    {CLINICAL_TEMPLATES.filter(t => t.specialty === spec).map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </optgroup>
                ))
              )}
            </select>

            <button 
              type="button"
              onClick={() => handleApplyTemplate(selectedTemplateId)}
              style={{ 
                height: '42px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontWeight: '700',
                padding: '0 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: selectedTemplateId ? '#059669' : '#0284c7',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                transition: 'all 0.2s'
              }}
              title="Cargar la plantilla seleccionada en la historia clínica"
            >
              <FileText size={16} /> Cargar Plantilla
            </button>
          </div>
        </div>

        {templateLoadedMessage && (
          <div style={{
            padding: '0.65rem 1rem',
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: '8px',
            color: '#14532d',
            fontWeight: '600',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>✅ {templateLoadedMessage}</span>
          </div>
        )}
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
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
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
                  style={{ padding: '0.5rem', height: '42px', color: '#0f172a', fontWeight: '500', borderColor: '#94a3b8' }} 
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
              <Button type="button" onClick={addReasonRow} style={{ backgroundColor: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', fontWeight: '600' }}>
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
            backgroundColor: '#ffffff',
            border: '1px solid #94a3b8',
            borderRadius: '10px',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="input-label" style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                <span>Gran Motivo de Consulta y Enfermedad Actual (Redacción Médica Formal)</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#1e293b', fontWeight: '600' }}>Dictar por voz:</span>
                <SpeechMicButton
                  onAppendText={(text) => setClinicalSummary(prev => prev ? `${prev} ${text}` : text)}
                  title="Dictar motivo de consulta por voz"
                />
              </div>
            </div>

            <textarea
              className="input-field"
              placeholder="Haga clic en '✨ Gran Motivo de Consulta con IA' para redactar automáticamente a partir de los síntomas, o dicte / escriba libremente la descripción clínica formal..."
              style={{ minHeight: '110px', resize: 'vertical', width: '100%', lineHeight: '1.6', fontSize: '0.92rem', color: '#0f172a', fontWeight: '500', backgroundColor: '#ffffff', borderColor: '#94a3b8' }}
              value={clinicalSummary}
              onChange={e => setClinicalSummary(e.target.value)}
            />
            <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.82rem', color: '#334155', fontWeight: '500' }}>
              * Esta síntesis clínica se incluirá en el informe médico oficial y en el expediente SOAP estandarizado.
            </p>
          </div>
        </div>
      </Card>

      {/* SECCIÓN 4: DIAGNÓSTICOS */}
      <Card title="4. Diagnósticos" className="glass-panel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {diagnoses.map((row, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff' }}>
              <div className="dynamic-row-4">
                <div className="input-group">
                  <label className="input-label" style={{ fontWeight: 700, color: '#0f172a' }}>Diagnóstico</label>
                  <input 
                    className="input-field"
                    list="diagnoses-list"
                    placeholder="Escriba o seleccione un diagnóstico..."
                    value={row.diagnosis}
                    onChange={e=>updateDiagnosis(idx, 'diagnosis', e.target.value)}
                    style={{ height: '42px', padding: '0.5rem 1rem', color: '#0f172a', fontWeight: '500', borderColor: '#94a3b8' }}
                  />
                </div>
                <Input label="Clasificación/Tipo" value={row.classification} onChange={e=>updateDiagnosis(idx, 'classification', e.target.value)} />
                <Input label="Complicado con" value={row.complication} onChange={e=>updateDiagnosis(idx, 'complication', e.target.value)} />
                <button type="button" onClick={() => removeDiagnosis(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-alert)', cursor: 'pointer', marginTop: '1.5rem' }}><Trash size={18} /></button>
              </div>
              
              {isCancer(row.diagnosis) && (
                <div className="responsive-grid-1-1" style={{ backgroundColor: '#fff1f2', padding: '1rem', borderRadius: '8px', border: '1px dashed #e11d48' }}>
                  <Input label="Tipo Histológico (Cáncer)" value={row.histologicType} onChange={e=>updateDiagnosis(idx, 'histologicType', e.target.value)} />
                  <Input label="Estadio (Cáncer)" value={row.stage} onChange={e=>updateDiagnosis(idx, 'stage', e.target.value)} />
                </div>
              )}
            </div>
          ))}
          <Button type="button" onClick={addDiagnosis} style={{ alignSelf: 'flex-start', backgroundColor: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', fontWeight: '600' }}>
            <Plus size={16} /> Añadir Diagnóstico
          </Button>
        </div>
      </Card>

      {/* SECCIÓN 5: PLAN DE TRABAJO (TRATAMIENTO) */}
      <Card title="5. Plan de Trabajo (Tratamiento)" className="glass-panel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* BARRA DE HERRAMIENTAS: GUÍA FARMACOLÓGICA Y PAUTAS FAVORITAS */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            border: '1px solid #cbd5e1'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Pill size={18} color="var(--color-primary)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                Guía Rápida:
              </span>
              <select
                onChange={handleSelectPharmGuide}
                defaultValue=""
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #94a3b8',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  maxWidth: '300px'
                }}
              >
                <option value="">-- Insertar Fármaco Frecuente --</option>
                {PHARMACOLOGICAL_GUIDE.map((med, i) => (
                  <option key={i} value={i}>
                    {med.brandName} ({med.activeIngredient.slice(0, 32)}...)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {savedSchemes.length > 0 && (
                <select
                  onChange={handleLoadCustomScheme}
                  defaultValue=""
                  style={{
                    padding: '0.45rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #94a3b8',
                    backgroundColor: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#0f172a'
                  }}
                >
                  <option value="">-- Cargar Mi Pauta --</option>
                  {savedSchemes.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={handleSaveCustomScheme}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-primary)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Bookmark size={15} /> Guardar como Mi Pauta
              </button>
            </div>
          </div>

          {treatmentPlan.map((row, idx) => (
            <div key={idx} className="dynamic-row-5">
              <input 
                className="input-field" 
                list="medications-list"
                placeholder="Medicamento / Principio Activo" 
                value={row.medication} 
                onChange={e=>updateTreatment(idx, 'medication', e.target.value)} 
                style={{ padding: '0.5rem', height: '42px', color: '#0f172a', fontWeight: '500', borderColor: '#94a3b8' }} 
              />
              <input 
                className="input-field" 
                list="presentations-list"
                placeholder="Presentación" 
                value={row.presentation} 
                onChange={e=>updateTreatment(idx, 'presentation', e.target.value)} 
                style={{ padding: '0.5rem', height: '42px', color: '#0f172a', fontWeight: '500', borderColor: '#94a3b8' }} 
              />
              <Input placeholder="Indicación / Posología" value={row.indication} onChange={e=>updateTreatment(idx, 'indication', e.target.value)} />
              <Input placeholder="Duración" value={row.duration} onChange={e=>updateTreatment(idx, 'duration', e.target.value)} />
              <button type="button" onClick={() => removeTreatment(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-alert)', cursor: 'pointer' }}><Trash size={18} /></button>
            </div>
          ))}

          <Button type="button" onClick={addTreatment} style={{ alignSelf: 'flex-start', backgroundColor: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', fontWeight: '600' }}>
            <Plus size={16} /> Añadir Medicamento
          </Button>
        </div>
      </Card>

      {/* SECCIÓN 6: INFORME EVOLUTIVO */}
      <Card title="6. Informe Evolutivo" className="glass-panel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label className="input-label" style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>Descripción General</label>
              <SpeechMicButton
                onAppendText={(text) => setEvolutionaryReport(prev => prev ? `${prev} ${text}` : text)}
                title="Dictar informe evolutivo por voz"
              />
            </div>
            <textarea className="input-field" style={{ minHeight: '120px', resize: 'vertical', width: '100%', color: '#0f172a', fontWeight: '500', borderColor: '#94a3b8' }} value={evolutionaryReport} onChange={e=>setEvolutionaryReport(e.target.value)} />
          </div>
          <p style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '500' }}>* Recuerde que la evolución clínica y observaciones adicionales pueden documentarse en la descripción general o en el motivo de consulta.</p>
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
