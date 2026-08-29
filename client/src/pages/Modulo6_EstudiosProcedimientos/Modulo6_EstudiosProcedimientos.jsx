import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import api from '../../services/api';
import { 
  FileText, Plus, Search, Filter, Calendar, User, 
  Upload, CheckCircle, AlertCircle, Eye, Printer, Trash2, Edit,
  FileCheck, Shield, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { hasAccess } from '../../components/ProtectedRoute';
import { MedicalDocumentModal } from '../../components/MedicalDocumentModal';

export function Modulo6_EstudiosProcedimientos({ isOpen, onClose, patientId: propPatientId }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthorized = hasAccess(user.role, ['MEDICO', 'ADMINISTRADOR', 'MASTER', 'RECEPCIONISTA']);

  const isModalMode = typeof isOpen === 'boolean';

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(propPatientId || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingStudyId, setEditingStudyId] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingStudies, setLoadingStudies] = useState(true);
  const [savingStudy, setSavingStudy] = useState(false);

  // Lista de estudios y procedimientos
  const [studies, setStudies] = useState([]);

  // Formulario nuevo / editar estudio
  const [formData, setFormData] = useState({
    patientId: propPatientId || '',
    studyType: '',
    doctorName: user.name || '',
    sede: user.sedeAtencion || 'CENTRAL',
    date: new Date().toISOString().split('T')[0],
    findings: '',
    biopsySample: '',
    diagnosticImpression: '',
    recommendations: '',
    status: 'Completado'
  });

  useEffect(() => {
    fetchPatients();
    fetchStudies();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/api/patients');
      setPatients(res.data || []);
      if (propPatientId) {
        setSelectedPatientId(propPatientId);
        setFormData(prev => ({ ...prev, patientId: propPatientId }));
      }
    } catch (err) {
      console.error('Error al cargar lista de pacientes:', err);
    }
  };

  const fetchStudies = async () => {
    try {
      setLoadingStudies(true);
      const res = await api.get('/api/studies');
      setStudies(res.data || []);
    } catch (err) {
      console.error('Error al cargar estudios desde el servidor:', err);
    } finally {
      setLoadingStudies(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingStudyId(null);
    setFormData({
      patientId: propPatientId || '',
      studyType: '',
      doctorName: user.name || '',
      sede: user.sedeAtencion || 'CENTRAL',
      date: new Date().toISOString().split('T')[0],
      findings: '',
      biopsySample: '',
      diagnosticImpression: '',
      recommendations: '',
      status: 'Completado'
    });
    setShowNewModal(true);
  };

  const handleOpenEditModal = (study) => {
    setEditingStudyId(study.id);
    setFormData({
      patientId: study.patientId || study.patient?.id || '',
      studyType: study.studyType || '',
      doctorName: study.doctor?.name || user.name || '',
      sede: study.sede || user.sedeAtencion || 'CENTRAL',
      date: study.date ? String(study.date).split('T')[0] : new Date().toISOString().split('T')[0],
      findings: study.findings || '',
      biopsySample: study.biopsySample || '',
      diagnosticImpression: study.diagnosticImpression || '',
      recommendations: study.recommendations || '',
      status: study.status || 'Completado'
    });
    setShowNewModal(true);
  };

  const handleDeleteStudy = async (studyId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este estudio médico? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      await api.delete(`/api/studies/${studyId}`);
      setStudies(prev => prev.filter(s => s.id !== studyId));
      alert('Estudio eliminado exitosamente.');
    } catch (err) {
      console.error('Error al eliminar estudio:', err);
      alert('Error al eliminar el estudio: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSaveStudy = async (e) => {
    e.preventDefault();
    if (!formData.patientId) {
      alert('Por favor seleccione un paciente.');
      return;
    }

    try {
      setSavingStudy(true);
      const payload = {
        patientId: parseInt(formData.patientId),
        studyType: formData.studyType,
        sede: formData.sede,
        date: formData.date,
        findings: formData.findings,
        biopsySample: formData.biopsySample || 'No se tomó muestra',
        diagnosticImpression: formData.diagnosticImpression,
        recommendations: formData.recommendations,
        status: formData.status,
        attachments: []
      };

      if (editingStudyId) {
        const res = await api.put(`/api/studies/${editingStudyId}`, payload);
        if (res.data && res.data.study) {
          setStudies(prev => prev.map(s => s.id === editingStudyId ? res.data.study : s));
          setShowNewModal(false);
          setEditingStudyId(null);
          alert('¡Estudio médico actualizado exitosamente!');
        }
      } else {
        const res = await api.post('/api/studies', payload);
        if (res.data && res.data.study) {
          setStudies(prev => [res.data.study, ...prev]);
          setShowNewModal(false);
          setFormData({
            patientId: '',
            studyType: '',
            doctorName: user.name || '',
            sede: user.sedeAtencion || 'CENTRAL',
            date: new Date().toISOString().split('T')[0],
            findings: '',
            biopsySample: '',
            diagnosticImpression: '',
            recommendations: '',
            status: 'Completado'
          });
          alert('¡Estudio / Procedimiento registrado exitosamente en la base de datos!');
        }
      }
    } catch (err) {
      console.error('Error al guardar estudio:', err);
      alert('Error al guardar el estudio: ' + (err.response?.data?.error || err.message));
    } finally {
      setSavingStudy(false);
    }
  };

  const filteredStudies = studies.filter(item => {
    const pName = item.patient?.name || item.patientName || '';
    const pCedula = item.patient?.identificationNumber || item.patientCedula || '';
    const dName = item.doctor?.name || item.doctorName || '';
    const sType = item.studyType || '';
    const dImpression = item.diagnosticImpression || '';

    const matchesType = filterType === 'Todos' || sType.toLowerCase().includes(filterType.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || item.status === filterStatus;
    const query = searchTerm.toLowerCase();
    const matchesSearch = 
      pName.toLowerCase().includes(query) ||
      pCedula.toLowerCase().includes(query) ||
      sType.toLowerCase().includes(query) ||
      dImpression.toLowerCase().includes(query) ||
      dName.toLowerCase().includes(query);

    return matchesType && matchesStatus && matchesSearch;
  });

  const content = (
    <div className="module-container">
      {/* Cabecera */}
      <header className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
            Módulo 6: Estudios y Procedimientos Médicos
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Registro y consulta de notas operatorias, endoscopias, biopsias, ecografías y anexos diagnósticos.
          </p>
        </div>
        <div className="dashboard-actions">
          <Button 
            onClick={handleOpenCreateModal} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={18} /> Registrar Nuevo Estudio
          </Button>
          {isModalMode && (
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          )}
        </div>
      </header>

      {/* Barra de Filtros */}
      <Card className="glass-panel" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', width: '100%' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Buscar por paciente, cédula, estudio o diagnóstico..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem', height: '40px', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flex: '1 1 200px', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
            <select 
              className="input-field" 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              style={{ height: '40px', padding: '0.4rem 0.8rem', width: '100%' }}
            >
              <option value="Todos">Todos los Procedimientos</option>
              <option value="Endoscopia">Endoscopia</option>
              <option value="Colonoscopia">Colonoscopia</option>
              <option value="Biopsia">Biopsia / Citología</option>
              <option value="Ecografía">Ecografía / Ultrasonido</option>
              <option value="Cirugía">Cirugía / Nota Operatoria</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Listado de Estudios */}
      <Card title={`Estudios Registrados (${filteredStudies.length})`} action={<FileText size={20} style={{ color: 'var(--color-primary)' }} />} className="glass-panel">
        {filteredStudies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            <FileText size={42} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <p style={{ fontSize: '1rem', fontWeight: '500' }}>No se encontraron estudios o procedimientos registrados.</p>
            <Button onClick={handleOpenCreateModal} style={{ marginTop: '1rem' }}>
              <Plus size={16} /> Crear el Primer Registro
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredStudies.map(study => (
              <div 
                key={study.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  padding: '1.25rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--color-bg-main)',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ 
                      backgroundColor: 'rgba(34, 80, 93, 0.1)', 
                      color: 'var(--color-primary)', 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '12px', 
                      fontWeight: '700',
                      fontSize: '0.75rem'
                    }}>
                      {study.studyType}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      Fecha: {study.date} | Sede: {study.sede}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text-main)', margin: '0.25rem 0' }}>
                    {study.patient?.name || study.patientName || 'Paciente'} 
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                      ({study.patient?.identificationNumber || study.patientCedula || 'S/N'})
                    </span>
                  </h3>

                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-main)', marginTop: '0.5rem' }}>
                    <strong>Hallazgos:</strong> {study.findings}
                  </p>

                  <p style={{ fontSize: '0.88rem', color: 'var(--color-primary)', marginTop: '0.25rem', fontWeight: '600' }}>
                    <strong>Impresión Diagnóstica:</strong> {study.diagnosticImpression}
                  </p>

                  {study.biopsySample && (
                    <p style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.25rem' }}>
                      <strong>Muestra de Biopsia:</strong> {study.biopsySample}
                    </p>
                  )}

                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    Especialista: <strong>{study.doctor?.name || study.doctorName || 'Médico Tratante'}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedReport(study)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}
                  >
                    <Eye size={15} /> Ver Informe
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleOpenEditModal(study)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: '#0284c7', borderColor: '#bae6fd' }}
                  >
                    <Edit size={15} /> Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleDeleteStudy(study.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: '#ef4444', borderColor: '#fca5a5' }}
                  >
                    <Trash2 size={15} /> Borrar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* MODAL: NUEVO O EDITAR ESTUDIO / PROCEDIMIENTO */}
      {showNewModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '750px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                {editingStudyId ? 'Editar Estudio / Procedimiento Médico' : 'Registrar Estudio / Procedimiento Médico'}
              </h2>
              <button 
                onClick={() => setShowNewModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveStudy} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    Paciente *
                  </label>
                  <select 
                    className="input-field" 
                    value={formData.patientId} 
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    required
                  >
                    <option value="">Seleccione un paciente...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.identificationNumber || 'S/N'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    Tipo de Procedimiento / Estudio *
                  </label>
                  <input 
                    type="text"
                    list="procedure-types-list"
                    className="input-field" 
                    placeholder="Escriba o seleccione un procedimiento..."
                    value={formData.studyType} 
                    onChange={(e) => setFormData({ ...formData, studyType: e.target.value })}
                    required
                  />
                  <datalist id="procedure-types-list">
                    <option value="Endoscopia Digestiva Superior" />
                    <option value="Colonoscopia Diagnóstica y Terapéutica" />
                    <option value="Rectosigmoidoscopia" />
                    <option value="Ecografía Abdominal / Pélvica" />
                    <option value="Toma de Biopsia / Citología" />
                    <option value="Procedimiento Quirúrgico Menor" />
                    <option value="Anoscopia de Alta Resolución" />
                    <option value="Polipectomía Endoscópica" />
                    <option value="Ligadura de Hemorroides" />
                    <option value="Biopsia Guiada por Ecografía" />
                    <option value="Drenaje de Absceso" />
                    <option value="Laparoscopia Exploratoria" />
                  </datalist>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    Fecha del Procedimiento
                  </label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={formData.date} 
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                    required 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    Sede de Atención
                  </label>
                  <select 
                    className="input-field" 
                    value={formData.sede} 
                    onChange={(e) => setFormData({ ...formData, sede: e.target.value })}
                  >
                    <option value="CENTRAL">CENTRAL</option>
                    <option value="GMSP">GMSP</option>
                    <option value="CCMLA">CCMLA</option>
                    <option value="PLA">PLA</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    Médico Responsable
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formData.doctorName} 
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })} 
                    placeholder="Nombre del especialista" 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  Hallazgos y Descripción del Procedimiento *
                </label>
                <textarea 
                  className="input-field" 
                  rows="3" 
                  value={formData.findings} 
                  onChange={(e) => setFormData({ ...formData, findings: e.target.value })} 
                  placeholder="Describa los hallazgos endoscópicos, quirúrgicos o ecográficos observados..."
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    Impresión Diagnóstica *
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formData.diagnosticImpression} 
                    onChange={(e) => setFormData({ ...formData, diagnosticImpression: e.target.value })} 
                    placeholder="Diagnóstico post-estudio..."
                    required 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    Muestra de Biopsia (Si aplica)
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formData.biopsySample} 
                    onChange={(e) => setFormData({ ...formData, biopsySample: e.target.value })} 
                    placeholder="Ej. Frasco 1: Mucosa gástrica" 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  Conducta / Recomendaciones Post-Procedimiento
                </label>
                <textarea 
                  className="input-field" 
                  rows="2" 
                  value={formData.recommendations} 
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })} 
                  placeholder="Indicaciones médicas, dieta, tratamiento o fecha de control..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <Button variant="outline" type="button" onClick={() => setShowNewModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={savingStudy}>
                  {savingStudy ? 'Guardando...' : (editingStudyId ? 'Actualizar Estudio' : 'Guardar Procedimiento')}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: INFORME MÉDICO OFICIAL UNIMECO */}
      <MedicalDocumentModal
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        type="study_report"
        data={{
          studyType: selectedReport?.studyType,
          patient: selectedReport?.patient || {
            name: selectedReport?.patientName,
            identificationNumber: selectedReport?.patientCedula
          },
          doctor: selectedReport?.doctor || {
            name: selectedReport?.doctorName
          },
          date: selectedReport?.date,
          sede: selectedReport?.sede,
          findings: selectedReport?.findings,
          biopsySample: selectedReport?.biopsySample,
          diagnosticImpression: selectedReport?.diagnosticImpression,
          recommendations: selectedReport?.recommendations
        }}
      />

    </div>
  );

  if (isModalMode) {
    if (!isOpen) return null;
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem'
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          width: '95%', maxWidth: '1000px',
          maxHeight: '92vh', overflowY: 'auto',
          padding: '2rem'
        }}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {content}
    </DashboardLayout>
  );
}

export default Modulo6_EstudiosProcedimientos;
