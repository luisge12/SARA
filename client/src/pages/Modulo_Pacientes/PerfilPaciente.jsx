import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, FileText, Upload, Calendar, CalendarPlus, Activity, DollarSign, User, Phone, 
  Droplet, Ruler, Scale, Mail, MapPin, Building2, CheckCircle, Clock, Plus, 
  Shield, Sparkles, AlertCircle, Heart, Stethoscope, Trash2, ClipboardList,
  Paperclip, Image, Download, X, Eye, Edit3, XCircle
} from 'lucide-react';
import MedicalImageViewer from '../../components/MedicalImageViewer';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { AppointmentModal } from '../../components/AppointmentModal';
import { PatientRegistrationModal } from '../../components/PatientRegistrationModal';
import { ClinicalWorkspace } from '../Modulo4_DatosClinicos/ClinicalWorkspace';
import { CustomFormTemplateManager } from '../../components/CustomFormTemplates/CustomFormTemplateManager';
import { DynamicFormRenderer } from '../../components/CustomFormTemplates/DynamicFormRenderer';
import api from '../../services/api';
import html2pdf from 'html2pdf.js';
import { getClinicSettings } from '../../services/clinicSettings';
import './PerfilPaciente.css';

export default function PerfilPaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ficha');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState([]);
  const [studies, setStudies] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointmentForEdit, setSelectedAppointmentForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState(null); // Para ver el informe
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null); // Para ver la factura
  const [isCreatingConsultation, setIsCreatingConsultation] = useState(false);

  // Rol y Permisos de Estudios Médicos: Exclusivo Médicos y Master
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = (currentUser.role || '').toUpperCase();
  const canManageStudies = ['MASTER', 'ADMINISTRADOR', 'MEDICO', 'MÉDICO', 'DIRECTOR MÉDICO', 'MÉDICO TRATANTE'].includes(userRole);
  const canAttachFiles = ['MASTER', 'ADMINISTRADOR', 'MEDICO', 'MÉDICO', 'DIRECTOR MÉDICO', 'MÉDICO TRATANTE', 'RECEPCIONISTA', 'ASISTENTE ADMINISTRATIVO', 'ASISTENTE MEDICO'].includes(userRole);

  // Estados para Archivos Adjuntos (PDFs y Fotos) de Estudios
  const [uploadingAttachmentStudyId, setUploadingAttachmentStudyId] = useState(null);
  const [viewingAttachment, setViewingAttachment] = useState(null);
  const [showQuickUploadModal, setShowQuickUploadModal] = useState(false);
  const [quickUploadForm, setQuickUploadForm] = useState({
    category: 'Laboratorio Clínico',
    studyType: '',
    date: new Date().toISOString().split('T')[0],
    diagnosticImpression: '',
    file: null
  });
  const [isSubmittingQuickUpload, setIsSubmittingQuickUpload] = useState(false);

  // Catálogo de Especialidades y Estudios Médicos Universales
  const STUDY_CATEGORIES = {
    'Imagenología y Radiología': {
      badgeColor: '#0284c7',
      badgeBg: '#e0f2fe',
      studies: [
        'Ultrasonido Abdominal / Pélvico',
        'Ecografía Doppler Venosa / Arterial',
        'Rayos X de Tórax (PA / Lateral)',
        'Rayos X de Columna / Extremidades',
        'Tomografía Computarizada (TAC) Simple',
        'Tomografía Computarizada (TAC) con Contraste',
        'Resonancia Magnética Nuclear (RMN)',
        'Mamografía Bilateral'
      ],
      regionPlaceholder: 'Ej: Tórax PA y Lateral, Abdomen Superior, Rodilla Derecha',
      showSample: false
    },
    'Cardiología': {
      badgeColor: '#dc2626',
      badgeBg: '#fee2e2',
      studies: [
        'Electrocardiograma (ECG) 12 Derivaciones',
        'Ecocardiograma Transtorácico Doppler',
        'Holter de Ritmo Cardíaco 24 Horas',
        'Monitoreo Ambulatorio de Presión Arterial (MAPA)',
        'Prueba de Esfuerzo / Ergometría',
        'Ecocardiograma Transesofágico'
      ],
      regionPlaceholder: 'Ej: 12 derivaciones estándar, Protocolo de Bruce',
      showSample: false
    },
    'Laboratorio Clínico': {
      badgeColor: '#7c3aed',
      badgeBg: '#ede9fe',
      studies: [
        'Hematología Completa (Hemograma)',
        'Perfil Bioquímico / Química Sanguínea (Perfil 20)',
        'Perfil Lipídico (Colesterol, Triglicéridos, HDL/LDL)',
        'Pruebas de Función Hepática (TGO, TGP, Bilirrubinas)',
        'Pruebas de Función Renal (Urea, Creatinina)',
        'Uroanálisis y Sedimento Urinario',
        'Urocultivo con Antibiograma',
        'Perfil Tiroideo (TSH, T3, T4 Libre)',
        'Hemoglobina Glicosilada (HbA1c)',
        'Electrolitos Séricos (Na, K, Cl)'
      ],
      regionPlaceholder: 'Ej: Muestra en ayuno 12h, Suero / Plasma, Primera orina',
      showSample: true,
      samplePlaceholder: 'Ej: Sangre venosa periférica, Orina matutina'
    },
    'Gastroenterología y Endoscopia': {
      badgeColor: '#0d9488',
      badgeBg: '#ccfbf1',
      studies: [
        'Endoscopia Digestiva Superior (Gastroscopia)',
        'Colonoscopia Total con Sedación',
        'Rectosigmoidoscopia',
        'Biopsia Gástrica / Esofágica',
        'Polipectomía Endoscópica',
        'Test de Aliento para Helicobacter Pylori',
        'Manometría Esofágica / Anorrectal',
        'pH-metría de 24 horas',
        'CPRE (Colangiopancreatografía Retrógrada)'
      ],
      regionPlaceholder: 'Ej: Esófago, estómago, duodeno (D2), Colon hasta ciego',
      showSample: true,
      samplePlaceholder: 'Ej: Biopsia de antro y cuerpo gástrico en formol al 10%'
    },
    'Neurología': {
      badgeColor: '#059669',
      badgeBg: '#d1fae5',
      studies: [
        'Electroencefalograma Digital (EEG)',
        'Potenciales Evocados Auditivos / Visuales',
        'Electromiografía y Velocidad de Conducción Nerviosa',
        'Polisomnografía Nocturna'
      ],
      regionPlaceholder: 'Ej: Sistema internacional 10-20, Miembro superior derecho',
      showSample: false
    },
    'Oftalmología': {
      badgeColor: '#d97706',
      badgeBg: '#fef3c7',
      studies: [
        'Fondo de Ojo con Dilatación Pupilar',
        'Campimetría Computarizada',
        'Tomografía de Coherencia Óptica (OCT)',
        'Paquimetría Corneal Ultrasónica',
        'Tonometría de Aplanación'
      ],
      regionPlaceholder: 'Ej: Ojo Derecho (OD), Ojo Izquierdo (OI), Ambos Ojos (AO)',
      showSample: false
    },
    'General / Otra Especialidad': {
      badgeColor: '#475569',
      badgeBg: '#f1f5f9',
      studies: [
        'Espirometría Simple y con Broncodilatador',
        'Audiometría Tonal y Logoaudiometría',
        'Densitometría Ósea (DEXA)',
        'Biopsia Cutánea por Punch / Escisión',
        'Evaluación de Riesgo Preoperatorio'
      ],
      regionPlaceholder: 'Ej: Columna lumbar y fémur proximal, Tórax',
      showSample: true,
      samplePlaceholder: 'Ej: Muestra de tejido cutáneo remitida a patología'
    }
  };

  const getCategoryBadgeStyle = (cat) => {
    const c = STUDY_CATEGORIES[cat];
    if (c) {
      return { color: c.badgeColor, backgroundColor: c.badgeBg, border: `1px solid ${c.badgeColor}33` };
    }
    return { color: '#475569', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' };
  };

  const [doctors, setDoctors] = useState([]);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [savingStudy, setSavingStudy] = useState(false);
  const [studyFilterCategory, setStudyFilterCategory] = useState('Todos');
  const [studyForm, setStudyForm] = useState({
    category: 'Imagenología y Radiología',
    studyType: 'Ultrasonido Abdominal / Pélvico',
    techniqueOrRegion: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    sede: 'CENTRAL',
    status: 'Completado',
    biopsySample: '',
    findings: '',
    diagnosticImpression: '',
    recommendations: ''
  });

  // Estados de Formularios Personalizados para Estudios
  const [showCustomTemplateManager, setShowCustomTemplateManager] = useState(false);
  const [patientStudyTemplates, setPatientStudyTemplates] = useState([]);
  const [selectedStudyTemplate, setSelectedStudyTemplate] = useState(null);
  const [customStudyValues, setCustomStudyValues] = useState({});

  const fetchPatientStudyTemplates = async () => {
    try {
      const res = await api.get('/api/form-templates', { params: { targetModule: 'STUDY' } });
      setPatientStudyTemplates(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Error al cargar plantillas de estudio:', e);
    }
  };

  const filteredStudies = (Array.isArray(studies) ? studies : []).filter(study => {
    if (studyFilterCategory === 'Todos') return true;
    return (study.category || 'General') === studyFilterCategory;
  });

  const handleDownloadPDF = () => {
    const element = document.getElementById('invoice-pdf-content');
    if (!element) return;
    const opt = {
      margin:       0.5,
      filename:     `Factura_${String(selectedInvoice.id).padStart(6, '0')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/api/users');
      const doctorList = (res.data || []).filter(u => {
        const r = (u.role || '').toUpperCase();
        return r.includes('MÉD') || r.includes('MED') || r === 'MASTER' || r === 'ADMINISTRADOR';
      });
      setDoctors(doctorList);
    } catch (e) {
      console.error('Error fetching doctors:', e);
    }
  };

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const [profileRes, consultationsRes, studiesRes, invoicesRes, appointmentsRes] = await Promise.all([
        api.get(`/api/patients/${id}/profile`),
        api.get(`/api/patients/${id}/consultations`),
        api.get(`/api/studies/patient/${id}`),
        api.get(`/api/billing/transactions?patientId=${id}`),
        api.get(`/api/appointments?patientId=${id}`)
      ]);
      setPatient(profileRes.data);
      setConsultations(consultationsRes.data || []);
      setStudies(studiesRes.data || []);
      setInvoices(invoicesRes.data || []);
      setAppointments(appointmentsRes.data || []);
    } catch (err) {
      console.error('Error fetching patient profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm('¿Estás seguro de cancelar o rechazar esta cita médica?')) return;
    try {
      await api.put(`/api/appointments/${apptId}`, { status: 'Cancelada' });
      fetchPatientData();
      window.dispatchEvent(new Event('appointmentCreated'));
    } catch (err) {
      console.error('Error al cancelar cita:', err);
      alert('Error al cancelar la cita médica.');
    }
  };

  useEffect(() => {
    fetchPatientData();
    fetchDoctors();
    fetchPatientStudyTemplates();
  }, [id]);

  // Handlers para archivos adjuntos de estudios (PDFs y Fotos)
  const handleUploadToStudy = async (studyId, fileList) => {
    if (!fileList || fileList.length === 0) return;
    const formData = new FormData();
    for (let i = 0; i < fileList.length; i++) {
      formData.append('files', fileList[i]);
    }

    try {
      setUploadingAttachmentStudyId(studyId);
      const res = await api.post(`/api/studies/${studyId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStudies(prev => prev.map(s => {
        if (s.id === studyId) {
          return { ...s, attachments: res.data.attachments };
        }
        return s;
      }));
    } catch (err) {
      console.error('Error al subir adjunto:', err);
      alert(err.response?.data?.error || 'Error al subir el archivo al estudio');
    } finally {
      setUploadingAttachmentStudyId(null);
    }
  };

  const handleDeleteAttachment = async (studyId, attachmentId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este archivo adjunto?')) return;
    try {
      const res = await api.delete(`/api/studies/${studyId}/attachments/${attachmentId}`);
      setStudies(prev => prev.map(s => {
        if (s.id === studyId) {
          return { ...s, attachments: res.data.attachments };
        }
        return s;
      }));
    } catch (err) {
      console.error('Error al eliminar adjunto:', err);
      alert(err.response?.data?.error || 'Error al eliminar el archivo adjunto');
    }
  };

  const handleQuickUploadSubmit = async (e) => {
    e.preventDefault();
    if (!quickUploadForm.file) {
      alert('Por favor selecciona un archivo PDF o imagen.');
      return;
    }
    if (!quickUploadForm.studyType.trim()) {
      alert('Por favor indica el nombre o tipo de estudio (ej: Hematología Completa).');
      return;
    }

    try {
      setIsSubmittingQuickUpload(true);
      // 1. Registrar estudio base
      const studyPayload = {
        patientId: id,
        studyType: quickUploadForm.studyType.trim(),
        category: quickUploadForm.category,
        date: quickUploadForm.date || new Date().toISOString().split('T')[0],
        status: 'Completado',
        diagnosticImpression: quickUploadForm.diagnosticImpression || 'Resultado adjunto en expediente',
        findings: 'Resultado escaneado / PDF adjuntado directamente al expediente.',
        recommendations: 'Consultar archivo adjunto original.'
      };

      const createRes = await api.post('/api/studies', studyPayload);
      const createdStudy = createRes.data.study;

      // 2. Subir archivo adjunto al estudio creado
      const formData = new FormData();
      formData.append('files', quickUploadForm.file);

      const attachRes = await api.post(`/api/studies/${createdStudy.id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const finalStudy = {
        ...createdStudy,
        attachments: attachRes.data.attachments
      };

      setStudies(prev => [finalStudy, ...prev]);
      setShowQuickUploadModal(false);
      setQuickUploadForm({
        category: 'Laboratorio Clínico',
        studyType: '',
        date: new Date().toISOString().split('T')[0],
        diagnosticImpression: '',
        file: null
      });
    } catch (err) {
      console.error('Error al guardar estudio con adjunto:', err);
      alert(err.response?.data?.error || 'Error al procesar la subida del estudio');
    } finally {
      setIsSubmittingQuickUpload(false);
    }
  };

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    const catData = STUDY_CATEGORIES[newCat];
    const defaultStudy = (catData && catData.studies && catData.studies[0]) || '';
    setStudyForm(prev => ({
      ...prev,
      category: newCat,
      studyType: defaultStudy,
      biopsySample: catData?.showSample ? prev.biopsySample : ''
    }));
  };

  const handleOpenStudyModal = () => {
    const isDoc = userRole.includes('MED') || userRole === 'MASTER';
    const defaultDocId = isDoc ? currentUser.id : (doctors.length > 0 ? doctors[0].id : '');
    setSelectedStudyTemplate(null);
    setCustomStudyValues({});
    setStudyForm({
      category: 'Imagenología y Radiología',
      studyType: 'Ultrasonido Abdominal / Pélvico',
      techniqueOrRegion: '',
      doctorId: defaultDocId,
      date: new Date().toISOString().split('T')[0],
      sede: patient?.patientProfile?.sedeAtencion || 'CENTRAL',
      status: 'Completado',
      biopsySample: '',
      findings: '',
      diagnosticImpression: '',
      recommendations: ''
    });
    setShowStudyModal(true);
  };

  const handleSaveStudy = async (e) => {
    e.preventDefault();
    if (!studyForm.studyType.trim()) {
      alert('Por favor especifique el tipo de estudio o procedimiento.');
      return;
    }
    try {
      setSavingStudy(true);
      await api.post('/api/studies', {
        patientId: patient.id,
        doctorId: studyForm.doctorId ? parseInt(studyForm.doctorId, 10) : currentUser.id,
        studyType: studyForm.studyType,
        category: studyForm.category || 'General',
        techniqueOrRegion: studyForm.techniqueOrRegion || '',
        sede: studyForm.sede,
        date: studyForm.date,
        findings: studyForm.findings,
        biopsySample: studyForm.biopsySample || 'No aplica',
        diagnosticImpression: studyForm.diagnosticImpression,
        recommendations: studyForm.recommendations,
        status: studyForm.status,
        metadata: {
          customForm: selectedStudyTemplate ? {
            templateId: selectedStudyTemplate.id,
            templateTitle: selectedStudyTemplate.title,
            fields: selectedStudyTemplate.fields,
            values: customStudyValues
          } : null
        }
      });
      setShowStudyModal(false);
      await fetchPatientData();
    } catch (err) {
      console.error('Error al registrar estudio médico:', err);
      alert(err.response?.data?.error || 'Error al registrar el estudio médico.');
    } finally {
      setSavingStudy(false);
    }
  };

  const handleDeleteStudy = async (studyId) => {
    if (!window.confirm('¿Está seguro de eliminar este estudio médico? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      await api.delete(`/api/studies/${studyId}`);
      await fetchPatientData();
    } catch (err) {
      console.error('Error al eliminar estudio:', err);
      alert(err.response?.data?.error || 'Error al eliminar el estudio.');
    }
  };

  // Calculate age from dateOfBirth
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="perfil-container">
          <p>Cargando datos del paciente...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="perfil-container">
          <button className="btn-back" onClick={() => navigate('/pacientes')}>
            <ArrowLeft size={20} /> Volver a Pacientes
          </button>
          <p>Paciente no encontrado.</p>
        </div>
      </DashboardLayout>
    );
  }

  const profile = patient.patientProfile || {};

  // Calcular IMC
  const calculateIMC = (weightKg, heightCm) => {
    if (!weightKg || !heightCm || parseFloat(heightCm) === 0) return null;
    const heightM = parseFloat(heightCm) / 100;
    const val = (parseFloat(weightKg) / (heightM * heightM)).toFixed(1);
    return isNaN(val) ? null : val;
  };
  const imcVal = calculateIMC(profile.weightKg, profile.heightCm);

  return (
    <DashboardLayout>
      <div className="perfil-container">
        <button className="btn-back" onClick={() => navigate('/pacientes')}>
          <ArrowLeft size={20} /> Volver a Pacientes
        </button>

        <div className="perfil-header">
          <div className="perfil-info-main">
            <h1>{patient.name || patient.username}</h1>
            <p className="doc">C.I / Pasaporte: {patient.identificationNumber || 'No registrado'}</p>
            <div className="tags">
              <span className="tag blue">{profile.referringEntity || 'Sin seguro/entidad'}</span>
              <span className="tag green"><Phone size={14} style={{display: 'inline', marginRight: '4px'}}/> {profile.phone || patient.phone || 'No registrado'}</span>
              <span className="tag purple"><User size={14} style={{display: 'inline', marginRight: '4px'}}/> {profile.gender || 'No especificado'} {profile.dateOfBirth ? `- ${calculateAge(profile.dateOfBirth)} años` : ''}</span>
            </div>
          </div>
          <div className="perfil-actions">
            <button className="btn-secondary" onClick={() => setShowEditModal(true)}>
              <Edit size={18} /> Editar Datos
            </button>
          </div>
        </div>

        {/* Vital Signs / Extra Info Section */}
        <div className="vital-signs-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ flex: '1 1 120px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Droplet size={18} color="#ef4444" /> 
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Presión Arterial</div>
              <div style={{ fontWeight: '600', color: '#111827' }}>{profile.bloodPressure || '--/--'}</div>
            </div>
          </div>
          <div style={{ flex: '1 1 120px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="#3b82f6" /> 
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Frec. Cardíaca</div>
              <div style={{ fontWeight: '600', color: '#111827' }}>{profile.heartRate || '--'} bpm</div>
            </div>
          </div>
          <div style={{ flex: '1 1 120px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Ruler size={18} color="#8b5cf6" /> 
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Estatura</div>
              <div style={{ fontWeight: '600', color: '#111827' }}>{profile.heightCm ? `${profile.heightCm} cm` : '--'}</div>
            </div>
          </div>
          <div style={{ flex: '1 1 120px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scale size={18} color="#10b981" /> 
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Peso</div>
              <div style={{ fontWeight: '600', color: '#111827' }}>{profile.weightKg ? `${profile.weightKg} kg` : '--'}</div>
            </div>
          </div>
          <div style={{ flex: '1 1 120px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={18} color="#f59e0b" /> 
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>IMC</div>
              <div style={{ fontWeight: '600', color: '#111827' }}>{imcVal ? `${imcVal} kg/m²` : '--'}</div>
            </div>
          </div>
        </div>
        
        <div className="tabs-container">
          <div className="tabs-header">
            <button className={`tab-btn ${activeTab === 'ficha' ? 'active' : ''}`} onClick={() => setActiveTab('ficha')}>
              <User size={18} /> Ficha y Antecedentes
            </button>
            <button className={`tab-btn ${activeTab === 'historia' ? 'active' : ''}`} onClick={() => setActiveTab('historia')}>
              <Activity size={18} /> Historia Clínica ({consultations.length})
            </button>
            <button className={`tab-btn ${activeTab === 'citas' ? 'active' : ''}`} onClick={() => setActiveTab('citas')}>
              <Calendar size={18} /> Citas ({appointments.length})
            </button>
            <button className={`tab-btn ${activeTab === 'estudios' ? 'active' : ''}`} onClick={() => setActiveTab('estudios')}>
              <FileText size={18} /> Estudios ({studies.length})
            </button>
            <button className={`tab-btn ${activeTab === 'facturacion' ? 'active' : ''}`} onClick={() => setActiveTab('facturacion')}>
              <DollarSign size={18} /> Facturación ({invoices.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'ficha' && (
              <div className="ficha-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>Ficha Integral del Paciente</h2>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                      Datos de identificación, contacto, antecedentes clínicos y parámetros basales.
                    </p>
                  </div>
                  <button className="btn-primary" onClick={() => setShowEditModal(true)}>
                    <Edit size={16} style={{ display: 'inline', marginRight: '6px' }} />
                    Editar Ficha del Paciente
                  </button>
                </div>

                <div className="ficha-grid">
                  {/* Tarjeta 1: Identificación y Contacto */}
                  <div className="ficha-card">
                    <div className="ficha-card-header">
                      <User size={20} color="#3b82f6" />
                      <h3>Identificación y Contacto</h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                      {profile.photoUrl ? (
                        <img src={profile.photoUrl} alt="Foto del Paciente" className="ficha-photo-box" />
                      ) : (
                        <div className="ficha-photo-placeholder">
                          <User size={36} />
                        </div>
                      )}
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>{patient.name || patient.username}</h4>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Cédula: <strong>{patient.identificationNumber || 'S/N'}</strong></span>
                        <div style={{ marginTop: '0.35rem' }}>
                          {(() => {
                            const isFirstTime = (profile.flowType || 'PRIMERA_VEZ') === 'PRIMERA_VEZ' && !(consultations && consultations.length > 0);
                            return (
                              <span style={{ 
                                fontSize: '0.75rem', 
                                padding: '0.2rem 0.6rem', 
                                borderRadius: '12px', 
                                fontWeight: '600', 
                                backgroundColor: isFirstTime ? '#e0f2fe' : '#dcfce7',
                                color: isFirstTime ? '#0369a1' : '#15803d'
                              }}>
                                {isFirstTime ? 'Primera Vez (Apertura)' : 'Reconsulta (Seguimiento)'}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="ficha-items-list">
                      <div className="ficha-item">
                        <Phone size={16} className="ficha-item-icon" />
                        <div className="ficha-item-content">
                          <span className="ficha-item-label">Teléfono</span>
                          <span className="ficha-item-value">{profile.phone || patient.phone || 'No registrado'}</span>
                        </div>
                      </div>

                      <div className="ficha-item">
                        <Mail size={16} className="ficha-item-icon" />
                        <div className="ficha-item-content">
                          <span className="ficha-item-label">Correo Electrónico</span>
                          <span className="ficha-item-value">{profile.email || patient.email || 'No registrado'}</span>
                        </div>
                      </div>

                      <div className="ficha-item">
                        <Calendar size={16} className="ficha-item-icon" />
                        <div className="ficha-item-content">
                          <span className="ficha-item-label">Fecha de Nacimiento</span>
                          <span className="ficha-item-value">
                            {profile.dateOfBirth ? `${profile.dateOfBirth} (${calculateAge(profile.dateOfBirth)} años)` : 'No registrada'}
                          </span>
                        </div>
                      </div>

                      <div className="ficha-item">
                        <MapPin size={16} className="ficha-item-icon" />
                        <div className="ficha-item-content">
                          <span className="ficha-item-label">Dirección de Residencia</span>
                          <span className="ficha-item-value">{profile.address || 'No registrada'}</span>
                        </div>
                      </div>

                      <div className="ficha-item">
                        <Building2 size={16} className="ficha-item-icon" />
                        <div className="ficha-item-content">
                          <span className="ficha-item-label">Sede de Atención Habitual</span>
                          <span className="ficha-item-value">{patient.sedeAtencion || profile.defaultSede || 'CENTRAL'}</span>
                        </div>
                      </div>

                      <div className="ficha-item">
                        <Stethoscope size={16} className="ficha-item-icon" />
                        <div className="ficha-item-content">
                          <span className="ficha-item-label">Médico Tratante Asignado</span>
                          <span className="ficha-item-value">{profile.treatingDoctor || 'Sin asignar'}</span>
                        </div>
                      </div>

                      <div className="ficha-item">
                        <Shield size={16} className="ficha-item-icon" />
                        <div className="ficha-item-content">
                          <span className="ficha-item-label">Entidad Referente / Seguro</span>
                          <span className="ficha-item-value">{profile.referringEntity || 'Particular / Sin seguro'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta 2: Antecedentes Clínicos */}
                  <div className="ficha-card">
                    <div className="ficha-card-header">
                      <Activity size={20} color="#10b981" />
                      <h3>Antecedentes Médicos</h3>
                    </div>

                    <div className="ficha-items-list">
                      <div>
                        <span className="ficha-item-label">Antecedentes Personales Patológicos</span>
                        <p style={{ margin: '0.35rem 0', color: '#1e293b', background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '60px' }}>
                          {profile.personalHistory || 'Sin antecedentes patológicos reportados (Alergias, HTA, Diabetes, etc.)'}
                        </p>
                      </div>

                      <div>
                        <span className="ficha-item-label">Antecedentes Quirúrgicos</span>
                        <p style={{ margin: '0.35rem 0', color: '#1e293b', background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '50px' }}>
                          {profile.surgicalHistory || 'Niega intervenciones quirúrgicas previas.'}
                        </p>
                      </div>

                      <div>
                        <span className="ficha-item-label">Antecedentes Familiares</span>
                        <p style={{ margin: '0.35rem 0', color: '#1e293b', background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '50px' }}>
                          {profile.familyHistory || 'Sin antecedentes familiares de relevancia reportados.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta 3: Anamnesis e Historia Reportada por el Paciente en el Portal */}
                  <div className="ficha-card" style={{ gridColumn: '1 / -1' }}>
                    <div className="ficha-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ClipboardList size={20} color="#2ab7ca" />
                        <h3>Anamnesis e Historia Reportada por el Paciente (Portal Web)</h3>
                      </div>
                      {profile.customFields && Object.keys(profile.customFields).length > 0 && (
                        <span style={{ fontSize: '0.78rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>
                          Completada por el Paciente
                        </span>
                      )}
                    </div>

                    <div className="ficha-items-list">
                      {/* Padecimiento Actual / Motivo */}
                      <div>
                        <span className="ficha-item-label">Motivo de Consulta y Padecimiento Actual</span>
                        <p style={{ margin: '0.35rem 0', color: '#1e293b', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '45px' }}>
                          {profile.customFields?.padecimientoActual || profile.motivoConsulta || 'El paciente aún no ha reportado motivo previo en el portal.'}
                        </p>
                      </div>

                      {/* Datos Sociodemográficos */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div><strong style={{ fontSize: '0.8rem', color: '#64748b' }}>Ocupación:</strong> <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>{profile.ocupacion || '-'}</div></div>
                        <div><strong style={{ fontSize: '0.8rem', color: '#64748b' }}>Estado Civil:</strong> <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>{profile.customFields?.estadoCivil || '-'}</div></div>
                        <div><strong style={{ fontSize: '0.8rem', color: '#64748b' }}>Nacionalidad:</strong> <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>{profile.customFields?.nacionalidad || '-'}</div></div>
                        <div><strong style={{ fontSize: '0.8rem', color: '#64748b' }}>Residencia:</strong> <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>{profile.customFields?.residencia || '-'}</div></div>
                        <div><strong style={{ fontSize: '0.8rem', color: '#64748b' }}>Escolaridad:</strong> <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>{profile.customFields?.escolaridad || '-'}</div></div>
                        <div><strong style={{ fontSize: '0.8rem', color: '#64748b' }}>Religión:</strong> <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>{profile.customFields?.religion || '-'}</div></div>
                      </div>

                      {/* Hábitos No Patológicos */}
                      <div>
                        <span className="ficha-item-label">Hábitos Tóxicos y Fisiológicos</span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div>
                            <strong style={{ fontSize: '0.8rem', color: '#64748b' }}>Hábitos Tóxicos:</strong>
                            <div style={{ fontSize: '0.88rem', color: '#1e293b', marginTop: '0.2rem' }}>
                              Alcohol: {profile.customFields?.noPatologicos?.toxicos?.alcohol || 'No reportado'} • Tabaco: {profile.customFields?.noPatologicos?.toxicos?.tabaco || 'No'} • Drogas: {profile.customFields?.noPatologicos?.toxicos?.drogas || 'No'}
                            </div>
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.8rem', color: '#64748b' }}>Fisiológicos:</strong>
                            <div style={{ fontSize: '0.88rem', color: '#1e293b', marginTop: '0.2rem' }}>
                              Alimentación: {profile.customFields?.noPatologicos?.fisiologicos?.alimentacion || '-'} • Diuresis: {profile.customFields?.noPatologicos?.fisiologicos?.diuresis || '-'} • Sueño: {profile.customFields?.noPatologicos?.fisiologicos?.somnia || '-'}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'historia' && (
              <div className="historia-section">
                {isCreatingConsultation ? (
                  <ClinicalWorkspace 
                    patient={patient} 
                    onBack={() => {
                      setIsCreatingConsultation(false);
                      fetchPatientData(); // Reload consultations after creation
                    }} 
                  />
                ) : (
                  <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h2 style={{ margin: 0 }}>Historial de Consultas</h2>
                      <button className="btn-primary" onClick={() => setIsCreatingConsultation(true)}>
                        <Activity size={18} style={{ display: 'inline', marginRight: '6px' }} />
                        Nueva Consulta
                      </button>
                    </div>
                    
                    <div className="notas-list mt-4">
                  {!(consultations && Array.isArray(consultations) && consultations.length > 0) ? (
                    <p>No hay notas de evolución previas.</p>
                  ) : (
                    consultations.map(c => {
                      const renderField = (field, type) => {
                        if (!field) return 'No especificado';
                        if (typeof field === 'string') {
                          // Try to parse stringified JSON just in case
                          try {
                            const parsed = JSON.parse(field);
                            if (typeof parsed === 'object') field = parsed;
                          } catch(e) {}
                        }
                        
                        if (typeof field === 'string') return <span>{field}</span>;
                        
                        if (Array.isArray(field)) {
                          return (
                            <ul className="clinical-data-list">
                              {field.map((item, idx) => (
                                <li key={idx} className="clinical-data-item">
                                  {type === 'reason' && (
                                    <>
                                      <strong>{item.symptom || 'Síntoma'}</strong> {item.onset && <span className="badge-time">{item.onset}</span>}
                                      {item.regionGeneral && <span> - <em>{item.regionGeneral} {item.regionSpecific ? `(${item.regionSpecific})` : ''}</em></span>}
                                      {item.relatedTo && <div className="sub-detail">Relacionado con: {item.relatedTo}</div>}
                                      {item.complement && <div className="sub-detail">Complemento: {item.complement}</div>}
                                      {item.additionalInfo && <div className="sub-detail alert">Info adicional: {item.additionalInfo}</div>}
                                    </>
                                  )}
                                  {type === 'diagnosis' && (
                                    <>
                                      <strong>{item.diagnosis || item.classification || 'Diagnóstico'}</strong>
                                      {item.stage && <span className="badge-stage">{item.stage}</span>}
                                      {item.histologicType && <div className="sub-detail">Histología: {item.histologicType}</div>}
                                      {item.complication && <div className="sub-detail warn">Complicación: {item.complication}</div>}
                                    </>
                                  )}
                                  {type === 'plan' && (
                                    <>
                                      <strong>{item.medication || item.treatment || 'Tratamiento'}</strong>
                                      {item.presentation && <span className="badge-pill">{item.presentation}</span>}
                                      {item.duration && <span className="badge-time">{item.duration}</span>}
                                      {item.indication && <div className="sub-detail">Indicación: {item.indication}</div>}
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          );
                        }

                        if (typeof field === 'object') {
                          return <pre className="raw-json">{JSON.stringify(field, null, 2)}</pre>;
                        }
                        return String(field);
                      };

                      return (
                        <div key={c.id} className="nota-card">
                          <span className="nota-date">{c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Sin fecha'} - {c.doctor?.name || 'Dr.'}</span>
                          <div className="nota-section">
                            <h4>Motivo de Consulta</h4>
                            {renderField(c.reasonForVisit, 'reason')}
                          </div>
                          <div className="nota-section">
                            <h4>Diagnóstico</h4>
                            {renderField(c.diagnoses, 'diagnosis')}
                          </div>
                          <div className="nota-section">
                            <h4>Plan de Tratamiento</h4>
                            {renderField(c.treatmentPlan, 'plan')}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                </>
                )}
              </div>
            )}

            {activeTab === 'estudios' && (
              <div className="estudios-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>Estudios y Procedimientos Médicos</h2>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                      Informes endoscópicos, biopsias, ecografías y resultados clínicos especializados.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {canManageStudies && (
                      <button 
                        className="btn-primary" 
                        onClick={handleOpenStudyModal}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0284c7', borderColor: '#0284c7' }}
                      >
                        <Plus size={18} /> Redactar Informe Clínico
                      </button>
                    )}
                    {canAttachFiles && (
                      <button
                        className="btn-upload"
                        onClick={() => setShowQuickUploadModal(true)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#059669', borderColor: '#059669', color: '#ffffff' }}
                      >
                        <Paperclip size={18} /> Adjuntar Estudio / Laboratorio Externo
                      </button>
                    )}
                  </div>
                </div>

                <div className="estudios-list mt-4">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: '#334155' }}>Historial de Procedimientos y Estudios Realizados</h3>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {filteredStudies.length} {filteredStudies.length === 1 ? 'estudio encontrado' : 'estudios encontrados'}
                    </span>
                  </div>

                  {/* Barra de Filtros por Especialidad / Categoría */}
                  <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.6rem', marginBottom: '1.25rem' }}>
                    {['Todos', ...Object.keys(STUDY_CATEGORIES)].map(cat => {
                      const isActive = studyFilterCategory === cat;
                      const count = cat === 'Todos' ? studies.length : studies.filter(s => (s.category || 'General') === cat).length;
                      if (cat !== 'Todos' && count === 0) return null;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setStudyFilterCategory(cat)}
                          style={{
                            padding: '0.35rem 0.85rem',
                            borderRadius: '20px',
                            fontSize: '0.82rem',
                            fontWeight: isActive ? '600' : '500',
                            cursor: 'pointer',
                            border: isActive ? '1px solid #0284c7' : '1px solid #e2e8f0',
                            backgroundColor: isActive ? '#0284c7' : '#ffffff',
                            color: isActive ? '#ffffff' : '#475569',
                            whiteSpace: 'nowrap',
                            boxShadow: isActive ? '0 2px 4px rgba(2,132,199,0.2)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {!(filteredStudies && Array.isArray(filteredStudies) && filteredStudies.length > 0) ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                      <FileText size={48} color="#94a3b8" style={{ marginBottom: '0.75rem', opacity: 0.7 }} />
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>
                        {studyFilterCategory === 'Todos' ? 'No hay estudios registrados' : `No hay estudios en ${studyFilterCategory}`}
                      </h4>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                        {studyFilterCategory === 'Todos'
                          ? 'Este paciente aún no tiene estudios o procedimientos asentados en su expediente.'
                          : `No se encontraron estudios bajo la categoría seleccionada.`}
                      </p>
                      {canManageStudies && (
                        <button className="btn-primary" onClick={handleOpenStudyModal} style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}>
                          <Plus size={16} style={{ display: 'inline', marginRight: '6px' }} />
                          Registrar Nuevo Estudio
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="studies-grid">
                      {filteredStudies.map(study => (
                        <div key={study.id} className="study-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div className="study-header">
                              <span className="study-type" style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                                {study.studyType}
                              </span>
                              <span className={`study-status ${study.status?.toLowerCase()}`}>{study.status || 'Completado'}</span>
                            </div>

                            {/* Badge de Especialidad / Categoría */}
                            <div style={{ marginTop: '0.35rem', marginBottom: '0.5rem' }}>
                              <span style={{
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '12px',
                                fontWeight: '600',
                                display: 'inline-block',
                                ...getCategoryBadgeStyle(study.category || 'General')
                              }}>
                                {study.category || 'General'}
                              </span>
                            </div>

                            <p className="study-date">
                              <strong>Fecha:</strong> {new Date(study.date || study.created_at).toLocaleDateString()} - Sede {study.sede || 'CENTRAL'}
                            </p>
                            <p><strong>Médico:</strong> {study.doctor?.name || 'No especificado'}</p>
                            
                            {study.techniqueOrRegion && (
                              <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0.35rem 0' }}>
                                <strong>Región / Técnica:</strong> {study.techniqueOrRegion}
                              </p>
                            )}

                            {study.biopsySample && study.biopsySample !== 'No se tomó muestra' && study.biopsySample !== 'No aplica' && (
                              <p style={{ fontSize: '0.85rem', color: '#0369a1', margin: '0.35rem 0' }}>
                                <strong>Muestra:</strong> {study.biopsySample}
                              </p>
                            )}
                            <p className="study-preview"><strong>Impresión Diagnóstica:</strong> {study.diagnosticImpression || 'Sin impresión registrada'}</p>

                            {/* Sección de Documentos y Archivos Adjuntos */}
                            {study.attachments && study.attachments.length > 0 && (
                              <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem', padding: '0.6rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <Paperclip size={14} color="#0284c7" /> Archivos Adjuntos ({study.attachments.length}):
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                  {study.attachments.map(att => {
                                    const isPdf = att.isPdf || (att.filename && att.filename.toLowerCase().endsWith('.pdf'));
                                    return (
                                      <div key={att.id || att.filename} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                                        <button 
                                          type="button"
                                          onClick={() => setViewingAttachment(att)}
                                          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#0369a1', fontWeight: 600, padding: 0, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                          title={`Ver ${att.originalName || att.filename}`}
                                        >
                                          {isPdf ? (
                                            <FileText size={15} color="#dc2626" style={{ flexShrink: 0 }} />
                                          ) : (
                                            <Image size={15} color="#0284c7" style={{ flexShrink: 0 }} />
                                          )}
                                          <span style={{ textDecoration: 'underline' }}>{att.originalName || att.filename}</span>
                                        </button>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                            {att.size ? `${(att.size / 1024).toFixed(0)} KB` : ''}
                                          </span>
                                          <a 
                                            href={att.url} 
                                            download={att.originalName || att.filename}
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ color: '#0284c7', display: 'flex', alignItems: 'center', padding: '2px' }}
                                            title="Descargar archivo"
                                          >
                                            <Download size={13} />
                                          </a>
                                          {canAttachFiles && (
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteAttachment(study.id, att.id || att.filename)}
                                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                                              title="Eliminar adjunto"
                                            >
                                              <Trash2 size={13} />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                            <button 
                              className="btn-secondary btn-small" 
                              style={{ flex: 1, minWidth: '100px' }}
                              onClick={() => setSelectedStudy(study)}
                            >
                              <FileText size={15} /> Ver Informe
                            </button>
                            {canAttachFiles && (
                              <label 
                                className="btn-secondary btn-small"
                                style={{
                                  cursor: uploadingAttachmentStudyId === study.id ? 'wait' : 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  color: '#059669',
                                  borderColor: '#a7f3d0',
                                  backgroundColor: '#f0fdf4'
                                }}
                                title="Adjuntar PDF de laboratorio o foto a este estudio"
                              >
                                <Paperclip size={14} /> {uploadingAttachmentStudyId === study.id ? 'Subiendo...' : 'Adjuntar'}
                                <input 
                                  type="file" 
                                  accept=".pdf,.png,.jpg,.jpeg,.webp,.dcm" 
                                  hidden 
                                  disabled={uploadingAttachmentStudyId === study.id}
                                  onChange={(e) => {
                                    handleUploadToStudy(study.id, e.target.files);
                                    e.target.value = '';
                                  }} 
                                />
                              </label>
                            )}
                            {canManageStudies && (
                              <button
                                className="btn-secondary btn-small"
                                style={{ color: '#ef4444', borderColor: '#fca5a5', padding: '0.4rem 0.6rem' }}
                                onClick={() => handleDeleteStudy(study.id)}
                                title="Eliminar estudio médico"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'citas' && (
              <div className="citas-container-perfil">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#1e293b' }}>Agenda de Citas del Paciente</h3>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                      Citas programadas, turnos anteriores y estado de confirmación.
                    </p>
                  </div>
                  <button className="btn-primary" onClick={() => setShowAppointmentModal(true)}>
                    <CalendarPlus size={16} style={{ display: 'inline', marginRight: '6px' }} />
                    Agendar Nueva Cita
                  </button>
                </div>

                {!(appointments && appointments.length > 0) ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <Calendar size={48} color="#94a3b8" style={{ marginBottom: '0.75rem', opacity: 0.7 }} />
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>No hay citas registradas</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                      Este paciente aún no posee turnos agendados en el sistema. Puedes programar su próxima cita con un clic.
                    </p>
                    <button className="btn-primary" onClick={() => setShowAppointmentModal(true)}>
                      <CalendarPlus size={16} style={{ display: 'inline', marginRight: '6px' }} />
                      Agendar Primera Cita
                    </button>
                  </div>
                ) : (
                  <div className="citas-list-grid">
                    {appointments.map(apt => {
                      const isUnscheduled = !apt.appointmentDate || isNaN(new Date(apt.appointmentDate).getTime());
                      const aptDate = isUnscheduled ? null : new Date(apt.appointmentDate);
                      const statusClass = (apt.status || 'confirmada').toLowerCase().replace(/\s+/g, '-');
                      return (
                        <div key={apt.id} className="cita-card-perfil" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          <div className="cita-card-header">
                            <span className="cita-date-badge">
                              <Calendar size={15} color="#3b82f6" />
                              {isUnscheduled 
                                ? 'Fecha por coordinar' 
                                : aptDate.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
                              }
                            </span>
                            <span className={`cita-status-tag ${statusClass}`}>
                              {apt.status || 'Confirmada'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem' }}>
                            <Clock size={14} />
                            <span>
                              {isUnscheduled 
                                ? 'Horario pendiente' 
                                : aptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              }
                            </span>
                            <span>• Sede {apt.sedeAtencion || 'CENTRAL'}</span>
                          </div>

                          <div style={{ marginTop: '0.25rem' }}>
                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.92rem', color: '#1e293b' }}>
                              <strong>Médico:</strong> {apt.doctor?.name || 'Por asignar'}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>
                              <strong>Motivo:</strong> {apt.reason || 'Consulta Médica General'}
                            </p>
                            {apt.priority && apt.priority !== 'Normal' && (
                              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: apt.priority === 'Emergencia' || apt.priority === 'Alta' ? '#dc2626' : '#ea580c', fontWeight: 600 }}>
                                Prioridad: {apt.priority}
                              </p>
                            )}
                          </div>

                          {apt.totalAmount > 0 && (
                            <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                              <span style={{ color: '#64748b' }}>Monto: ${parseFloat(apt.totalAmount).toFixed(2)}</span>
                              <span style={{ fontWeight: 600, color: apt.paymentStatus === 'Pagado' ? '#16a34a' : '#ea580c' }}>
                                {apt.paymentStatus || 'Pendiente'}
                              </span>
                            </div>
                          )}

                          {/* Acciones de Cita (Aceptar, Agendar, Rechazar o Cancelar) */}
                          <div style={{ marginTop: 'auto', paddingTop: '0.6rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {apt.status === 'Solicitada' ? (
                              <>
                                <button
                                  className="btn-outline"
                                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem', color: '#dc2626', borderColor: '#fca5a5' }}
                                  onClick={() => handleCancelAppointment(apt.id)}
                                >
                                  <XCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                  Rechazar
                                </button>
                                <button
                                  className="btn-primary"
                                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', backgroundColor: '#10b981', borderColor: '#10b981' }}
                                  onClick={() => {
                                    setSelectedAppointmentForEdit(apt);
                                    setShowAppointmentModal(true);
                                  }}
                                >
                                  <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                  Aceptar / Agendar
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn-outline"
                                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                                  onClick={() => {
                                    setSelectedAppointmentForEdit(apt);
                                    setShowAppointmentModal(true);
                                  }}
                                >
                                  <Edit3 size={13} style={{ display: 'inline', marginRight: '4px' }} />
                                  Editar / Reprogramar
                                </button>
                                {apt.status !== 'Cancelada' && apt.status !== 'Completada' && (
                                  <button
                                    className="btn-outline"
                                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem', color: '#dc2626', borderColor: '#fca5a5' }}
                                    onClick={() => handleCancelAppointment(apt.id)}
                                  >
                                    <XCircle size={13} style={{ display: 'inline', marginRight: '4px' }} />
                                    Cancelar
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'facturacion' && (
              <div className="facturacion-section">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0 }}>Historial de Pagos y Facturas</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <button className="btn-primary" disabled style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#003087', borderColor: '#003087' }} title="Esta función estará disponible próximamente">
                      Pagar con PayPal
                    </button>
                    <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', fontWeight: '500' }}>Inhabilitado por ahora</span>
                  </div>
                </div>
                {!(invoices && invoices.length > 0) ? (
                  <p>No hay facturas registradas para este paciente.</p>
                ) : (
                  <div className="studies-grid">
                    {invoices.map(inv => (
                      <div key={inv.id} className="study-card">
                        <div className="study-header">
                          <span className="study-type">{inv.serviceType}</span>
                          <span className="study-status completado">Pagado</span>
                        </div>
                        <p><strong>Total:</strong> ${parseFloat(inv.totalAmountUSD).toFixed(2)}</p>
                        <p><strong>Fecha:</strong> {new Date(inv.created_at).toLocaleDateString()}</p>
                        <p><strong>Médico:</strong> {inv.doctor?.name || 'No especificado'}</p>
                        <button 
                          className="btn-secondary btn-small mt-2" 
                          style={{ width: '100%', marginTop: '1rem' }}
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          <FileText size={16} /> Ver Factura (PDF)
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAppointmentModal && (
        <AppointmentModal
          onClose={() => {
            setShowAppointmentModal(false);
            setSelectedAppointmentForEdit(null);
          }}
          onSuccess={() => {
            setShowAppointmentModal(false);
            setSelectedAppointmentForEdit(null);
            fetchPatientData();
            window.dispatchEvent(new Event('appointmentCreated'));
          }}
          initialPatientId={patient?.id}
          appointmentToEdit={selectedAppointmentForEdit}
        />
      )}

      {showEditModal && (
        <PatientRegistrationModal
          initialData={patient}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchPatientData(); // Recargar datos del paciente
          }}
        />
      )}

      {showStudyModal && canManageStudies && (
        <div className="report-modal-overlay">
          <div className="report-modal" style={{ maxWidth: '780px', maxHeight: '92vh' }}>
            <div className="report-modal-header" style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
              <div>
                <h2 style={{ color: '#166534', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.35rem' }}>
                  <Stethoscope size={22} color="#16a34a" /> Registrar Estudio o Procedimiento Médico
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#15803d' }}>
                  Paciente: <strong>{patient?.name || patient?.username}</strong> {patient?.identificationNumber ? `(C.I. ${patient.identificationNumber})` : ''}
                </span>
              </div>
              <button className="btn-close" onClick={() => setShowStudyModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleSaveStudy} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="report-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', overflowY: 'auto' }}>
                
                {/* Fila 1: Especialidad y Tipo de Estudio */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                      Especialidad / Categoría *
                    </label>
                    <select
                      value={studyForm.category}
                      onChange={handleCategoryChange}
                      style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: '500' }}
                    >
                      {Object.keys(STUDY_CATEGORIES).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                      Nombre del Estudio / Procedimiento *
                    </label>
                    <input
                      type="text"
                      list="dynamic-study-types"
                      required
                      placeholder="Ej: Electrocardiograma, TAC de Tórax, etc."
                      value={studyForm.studyType}
                      onChange={(e) => setStudyForm({ ...studyForm, studyType: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    />
                    <datalist id="dynamic-study-types">
                      {(STUDY_CATEGORIES[studyForm.category]?.studies || []).map((s, idx) => (
                        <option key={idx} value={s} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Fila 2: Región/Técnica, Fecha y Sede */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                      Región Anatómica / Técnica / Protocolo (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder={STUDY_CATEGORIES[studyForm.category]?.regionPlaceholder || 'Ej: Tórax PA, 12 derivaciones, Abdomen'}
                      value={studyForm.techniqueOrRegion}
                      onChange={(e) => setStudyForm({ ...studyForm, techniqueOrRegion: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                      Fecha de Realización *
                    </label>
                    <input
                      type="date"
                      required
                      value={studyForm.date}
                      onChange={(e) => setStudyForm({ ...studyForm, date: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                      Sede de Atención *
                    </label>
                    <select
                      value={studyForm.sede}
                      onChange={(e) => setStudyForm({ ...studyForm, sede: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    >
                      <option value="CENTRAL">Sede CENTRAL</option>
                      <option value="NORTE">Sede NORTE</option>
                      <option value="SUR">Sede SUR</option>
                    </select>
                  </div>
                </div>

                {/* Fila 3: Médico, Estado y Muestra Biológica */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                      Médico Responsable *
                    </label>
                    <select
                      value={studyForm.doctorId}
                      onChange={(e) => setStudyForm({ ...studyForm, doctorId: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name || d.username} ({d.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                      Estado del Procedimiento
                    </label>
                    <select
                      value={studyForm.status}
                      onChange={(e) => setStudyForm({ ...studyForm, status: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    >
                      <option value="Completado">Completado</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Pendiente">Pendiente</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                      Muestra Biológica / Espécimen (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder={STUDY_CATEGORIES[studyForm.category]?.samplePlaceholder || 'No aplica / No se tomó muestra'}
                      value={studyForm.biopsySample}
                      onChange={(e) => setStudyForm({ ...studyForm, biopsySample: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                    Hallazgos y Descripción del Estudio / Prueba
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Detalle los hallazgos observados, mediciones, ritmo, densidades o parámetros clínicos..."
                    value={studyForm.findings}
                    onChange={(e) => setStudyForm({ ...studyForm, findings: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                    Impresión Diagnóstica / Conclusión
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Conclusión diagnóstica, interpretación clínica o resultado..."
                    value={studyForm.diagnosticImpression}
                    onChange={(e) => setStudyForm({ ...studyForm, diagnosticImpression: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', resize: 'vertical' }}
                  />
                </div>

                {/* Selector de Plantilla Personalizada para el Estudio */}
                <div style={{
                  background: '#f8fafc', padding: '1rem', borderRadius: '10px',
                  border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                      Plantilla / Formulario Dinámico (Opcional):
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCustomTemplateManager(true)}
                      style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Sparkles size={14} /> Crear o Subir Plantilla
                    </button>
                  </div>

                  <select
                    value={selectedStudyTemplate?.id || ''}
                    onChange={(e) => {
                      const id = parseInt(e.target.value);
                      if (!id) {
                        setSelectedStudyTemplate(null);
                        setCustomStudyValues({});
                      } else {
                        const found = patientStudyTemplates.find(t => t.id === id);
                        if (found) {
                          setSelectedStudyTemplate(found);
                          setCustomStudyValues({});
                        }
                      }
                    }}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 500 }}
                  >
                    <option value="">-- Sin Formulario Personalizado --</option>
                    {patientStudyTemplates.map(tmpl => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.title} ({tmpl.category || 'General'})
                      </option>
                    ))}
                  </select>

                  {selectedStudyTemplate && (
                    <div style={{
                      background: '#ffffff', padding: '1rem', borderRadius: '8px',
                      border: '1px solid #bae6fd', marginTop: '0.25rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0369a1' }}>
                          Campos de {selectedStudyTemplate.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => { setSelectedStudyTemplate(null); setCustomStudyValues({}); }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Quitar
                        </button>
                      </div>
                      <DynamicFormRenderer
                        fields={selectedStudyTemplate.fields || []}
                        values={customStudyValues}
                        onChange={(k, v) => setCustomStudyValues(prev => ({ ...prev, [k]: v }))}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                    Recomendaciones Médicas y Plan de Seguimiento
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Conducta médica, tratamiento, estudios complementarios, controles..."
                    value={studyForm.recommendations}
                    onChange={(e) => setStudyForm({ ...studyForm, recommendations: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="report-modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowStudyModal(false)}
                  disabled={savingStudy}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={savingStudy}
                  style={{ background: '#16a34a', borderColor: '#16a34a', minWidth: '150px' }}
                >
                  {savingStudy ? 'Guardando...' : 'Guardar Estudio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedStudy && (
        <div className="report-modal-overlay">
          <div className="report-modal">
            <div className="report-modal-header">
              <h2>Informe Médico: {selectedStudy.studyType}</h2>
              <button className="btn-close" onClick={() => setSelectedStudy(null)}>&times;</button>
            </div>
            <div className="report-modal-body">
              {/* Encabezado Institucional Dinámico de Clínica */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '1rem' }}>
                {getClinicSettings().logoUrl && (
                  <img src={getClinicSettings().logoUrl} alt="Logo" style={{ maxHeight: '48px', marginBottom: '0.5rem', objectFit: 'contain' }} />
                )}
                <h3 style={{ margin: '0 0 0.2rem 0', color: getClinicSettings().primaryColor || '#22505d', fontSize: '1.3rem' }}>{getClinicSettings().name || 'SARA Clínicas'}</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>{getClinicSettings().subtitle || 'Informe Especializado de Procedimientos y Estudios'} {getClinicSettings().rif ? `| RIF: ${getClinicSettings().rif}` : ''}</p>
                <p style={{ margin: '0.25rem 0 0 0', color: '#4b5563', fontSize: '0.82rem' }}>Sede: {selectedStudy.sede || 'CENTRAL'} {getClinicSettings().phone ? `• Tel: ${getClinicSettings().phone}` : ''}</p>
              </div>

              <div className="report-meta">
                <p><strong>Paciente:</strong> {patient.name || patient.username}</p>
                <p><strong>Especialidad:</strong> {selectedStudy.category || 'General'}</p>
                <p><strong>Médico:</strong> {selectedStudy.doctor?.name || 'No especificado'}</p>
                <p><strong>Fecha:</strong> {new Date(selectedStudy.date || selectedStudy.created_at).toLocaleDateString()}</p>
                <p><strong>Sede:</strong> {selectedStudy.sede || 'CENTRAL'}</p>
                <p><strong>Estado:</strong> <span className={`study-status ${selectedStudy.status?.toLowerCase()}`}>{selectedStudy.status}</span></p>
              </div>

              {selectedStudy.techniqueOrRegion && (
                <div className="report-section">
                  <h3>Región Anatómica / Técnica / Protocolo</h3>
                  <p>{selectedStudy.techniqueOrRegion}</p>
                </div>
              )}

              {selectedStudy.biopsySample && selectedStudy.biopsySample !== 'No se tomó muestra' && selectedStudy.biopsySample !== 'No aplica' && (
                <div className="report-section">
                  <h3>Muestra Biológica / Espécimen Obtenido</h3>
                  <p>{selectedStudy.biopsySample}</p>
                </div>
              )}

              <div className="report-section">
                <h3>Hallazgos y Descripción</h3>
                <p>{selectedStudy.findings || 'Sin hallazgos reportados'}</p>
              </div>

              <div className="report-section">
                <h3>Impresión Diagnóstica / Conclusión</h3>
                <p>{selectedStudy.diagnosticImpression || 'Sin impresión diagnóstica reportada'}</p>
              </div>

              <div className="report-section">
                <h3>Recomendaciones y Plan</h3>
                <p>{selectedStudy.recommendations || 'Sin recomendaciones'}</p>
              </div>

              {selectedStudy.metadata?.customForm && selectedStudy.metadata.customForm.fields && selectedStudy.metadata.customForm.fields.length > 0 && (
                <div className="report-section" style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                  <h3 style={{ color: '#0369a1' }}>{selectedStudy.metadata.customForm.templateTitle || 'Parámetros Específicos del Estudio'}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginTop: '0.5rem' }}>
                    {selectedStudy.metadata.customForm.fields.map(f => {
                      const val = selectedStudy.metadata.customForm.values?.[f.id];
                      if (val === undefined || val === '') return null;
                      return (
                        <div key={f.id} style={{ background: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>{f.label}:</span>
                          <span style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 600 }}>
                            {typeof val === 'boolean' ? (val ? 'Sí' : 'No') : String(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="report-modal-footer">
              <button className="btn-primary" onClick={() => window.print()}>Imprimir Informe</button>
              <button className="btn-secondary" onClick={() => setSelectedStudy(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {selectedInvoice && (
        <div className="report-modal-overlay">
          <div className="report-modal invoice-modal">
            <div className="report-modal-header">
              <h2>Factura: #{String(selectedInvoice.id).padStart(6, '0')}</h2>
              <button className="btn-close" onClick={() => setSelectedInvoice(null)}>&times;</button>
            </div>
            <div id="invoice-pdf-content" className="report-modal-body" style={{ padding: '2rem 3rem', backgroundColor: 'white' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '1.5rem' }}>
                {getClinicSettings().logoUrl && (
                  <img src={getClinicSettings().logoUrl} alt="Logo" style={{ maxHeight: '50px', marginBottom: '0.5rem', objectFit: 'contain' }} />
                )}
                <h1 style={{ margin: '0 0 0.25rem 0', color: getClinicSettings().primaryColor || '#22505d' }}>{getClinicSettings().name || 'SARA Clínicas'}</h1>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>{getClinicSettings().subtitle || 'Sistema Administrativo y de Registro Automatizado'} {getClinicSettings().rif ? `| RIF: ${getClinicSettings().rif}` : ''}</p>
                <p style={{ margin: '0.35rem 0 0 0', color: '#4b5563', fontWeight: '500', fontSize: '0.85rem' }}>Sede: {selectedInvoice.sedeAtencion} {getClinicSettings().phone ? `• Tel: ${getClinicSettings().phone}` : ''}</p>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#3b82f6', textTransform: 'uppercase', fontSize: '0.85rem' }}>Datos del Paciente</h4>
                  <p style={{ margin: '0.2rem 0', color: '#1f2937' }}><strong>Nombre:</strong> {patient.name || patient.username}</p>
                  <p style={{ margin: '0.2rem 0', color: '#1f2937' }}><strong>C.I / Pasaporte:</strong> {patient.identificationNumber || 'No registrado'}</p>
                  <p style={{ margin: '0.2rem 0', color: '#1f2937' }}><strong>Seguro:</strong> {profile.referringEntity || 'Particular'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#3b82f6', textTransform: 'uppercase', fontSize: '0.85rem' }}>Detalles de Factura</h4>
                  <p style={{ margin: '0.2rem 0', color: '#1f2937' }}><strong>Fecha Emisión:</strong> {new Date(selectedInvoice.created_at).toLocaleDateString()}</p>
                  <p style={{ margin: '0.2rem 0', color: '#1f2937' }}><strong>Médico Tratante:</strong> {selectedInvoice.doctor?.name || 'N/A'}</p>
                  <p style={{ margin: '0.2rem 0', color: '#1f2937' }}><strong>Tasa BCV:</strong> Bs {parseFloat(selectedInvoice.exchangeRate).toFixed(2)}</p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2.5rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: '#475569' }}>Descripción del Servicio</th>
                    <th style={{ padding: '1rem', textAlign: 'right', color: '#475569' }}>Monto (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1.5rem 1rem', color: '#1e293b', fontWeight: '500' }}>{selectedInvoice.serviceType}</td>
                    <td style={{ padding: '1.5rem 1rem', textAlign: 'right', color: '#1e293b', fontWeight: '600' }}>${parseFloat(selectedInvoice.totalAmountUSD).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '300px', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <span>Subtotal:</span>
                    <span>${parseFloat(selectedInvoice.totalAmountUSD).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a' }}>
                    <span>Total Pagado:</span>
                    <span>${parseFloat(selectedInvoice.totalAmountUSD).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                    <span>Equivalente en Bs:</span>
                    <span>Bs {(parseFloat(selectedInvoice.totalAmountUSD) * parseFloat(selectedInvoice.exchangeRate)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '4rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', borderTop: '1px dashed #e2e8f0', paddingTop: '1.5rem' }}>
                Este es un comprobante de pago generado electrónicamente por SARA.
                <br />No requiere firma física.
              </div>
            </div>
            <div className="report-modal-footer">
              <button className="btn-primary" onClick={handleDownloadPDF}>Descargar PDF</button>
              <button className="btn-secondary" onClick={() => setSelectedInvoice(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA SUBIDA RÁPIDA DE ESTUDIOS / LABORATORIOS EXTERNOS */}
      {showQuickUploadModal && (
        <div className="report-modal-overlay" style={{ zIndex: 1100, backgroundColor: 'rgba(15, 23, 42, 0.65)' }}>
          <div className="report-modal-content" style={{ maxWidth: '560px', width: '92%', borderRadius: '16px', padding: '1.75rem', backgroundColor: '#ffffff', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Paperclip size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>Adjuntar Estudio o Laboratorio</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Carga el resultado en PDF o imagen al expediente</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowQuickUploadModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleQuickUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Selector de Archivo */}
              <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', backgroundColor: '#f8fafc', transition: 'border-color 0.2s' }}>
                <input 
                  type="file" 
                  id="quick-study-file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.dcm"
                  required
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    if (f) {
                      setQuickUploadForm(prev => ({
                        ...prev,
                        file: f,
                        studyType: prev.studyType || f.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
                      }));
                    }
                  }}
                />
                <label htmlFor="quick-study-file" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <Upload size={28} color="#0284c7" />
                  {quickUploadForm.file ? (
                    <div>
                      <span style={{ fontWeight: 600, color: '#0369a1', fontSize: '0.9rem', display: 'block' }}>
                        {quickUploadForm.file.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {(quickUploadForm.file.size / 1024).toFixed(0)} KB • Haz clic para cambiar archivo
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem', display: 'block' }}>
                        Haz clic aquí para seleccionar el archivo
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Formatos soportados: PDF, JPG, PNG, WEBP (Hasta 25 MB)
                      </span>
                    </div>
                  )}
                </label>
              </div>

              {/* Categoría */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Categoría del Estudio:
                </label>
                <select 
                  className="hm-input"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  value={quickUploadForm.category}
                  onChange={(e) => setQuickUploadForm({ ...quickUploadForm, category: e.target.value })}
                >
                  {Object.keys(STUDY_CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Laboratorio Clínico">Laboratorio Clínico</option>
                  <option value="Otros Estudios">Otros Estudios</option>
                </select>
              </div>

              {/* Nombre / Tipo de Estudio */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Nombre / Tipo de Estudio:
                </label>
                <input 
                  type="text" 
                  placeholder="Ej: Hematología Completa, Perfil Lipídico, Rayos X de Tórax..."
                  required
                  className="hm-input"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  value={quickUploadForm.studyType}
                  onChange={(e) => setQuickUploadForm({ ...quickUploadForm, studyType: e.target.value })}
                />
              </div>

              {/* Fecha */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Fecha de Realización o Emisión:
                </label>
                <input 
                  type="date" 
                  className="hm-input"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  value={quickUploadForm.date}
                  onChange={(e) => setQuickUploadForm({ ...quickUploadForm, date: e.target.value })}
                />
              </div>

              {/* Observación / Impresión */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                  Nota u Observación Breve (Opcional):
                </label>
                <textarea 
                  rows={2}
                  placeholder="Ej: Paciente presenta valores normales / Valores de plaquetas en seguimiento..."
                  className="hm-textarea"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  value={quickUploadForm.diagnosticImpression}
                  onChange={(e) => setQuickUploadForm({ ...quickUploadForm, diagnosticImpression: e.target.value })}
                />
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button 
                  type="button" 
                  className="btn-secondary"
                  disabled={isSubmittingQuickUpload}
                  onClick={() => setShowQuickUploadModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isSubmittingQuickUpload}
                  style={{ backgroundColor: '#059669', borderColor: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {isSubmittingQuickUpload ? 'Subiendo archivo...' : 'Guardar y Adjuntar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VISOR DE ARCHIVOS ADJUNTOS (PDFs E IMÁGENES) */}
      {viewingAttachment && (
        <div className="report-modal-overlay" style={{ zIndex: 1200, backgroundColor: 'rgba(15, 23, 42, 0.85)' }}>
          <div style={{ width: '92%', maxWidth: '1100px', height: '90vh', backgroundColor: '#ffffff', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            {/* Header del visor */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                {viewingAttachment.isPdf || (viewingAttachment.filename && viewingAttachment.filename.toLowerCase().endsWith('.pdf')) ? (
                  <FileText size={20} color="#dc2626" style={{ flexShrink: 0 }} />
                ) : (
                  <Image size={20} color="#0284c7" style={{ flexShrink: 0 }} />
                )}
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {viewingAttachment.originalName || viewingAttachment.filename}
                </span>
                {viewingAttachment.size && (
                  <span style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: '#e2e8f0', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                    {(viewingAttachment.size / 1024).toFixed(0)} KB
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <a
                  href={viewingAttachment.url}
                  download={viewingAttachment.originalName || viewingAttachment.filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary btn-small"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                >
                  <Download size={15} /> Descargar
                </a>
                <button
                  type="button"
                  onClick={() => setViewingAttachment(null)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                  title="Cerrar visor"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Contenido del visor */}
            <div style={{ flex: 1, backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {viewingAttachment.isPdf || (viewingAttachment.filename && viewingAttachment.filename.toLowerCase().endsWith('.pdf')) ? (
                <iframe 
                  src={viewingAttachment.url} 
                  title="Visor de PDF" 
                  style={{ width: '100%', height: '100%', border: 'none' }} 
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflow: 'auto' }}>
                  <img 
                    src={viewingAttachment.url} 
                    alt="Visor de Imagen de Estudio" 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }} 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL GESTOR DE PLANTILLAS Y FORMULARIOS PERSONALIZADOS */}
      <CustomFormTemplateManager
        isOpen={showCustomTemplateManager}
        onClose={() => {
          setShowCustomTemplateManager(false);
          fetchPatientStudyTemplates();
        }}
        targetModule="STUDY"
        onSelectTemplate={(tmpl) => {
          setSelectedStudyTemplate(tmpl);
          setCustomStudyValues({});
        }}
      />
    </DashboardLayout>
  );
}
