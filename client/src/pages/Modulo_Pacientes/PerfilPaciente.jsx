import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, Upload, Calendar, Activity, DollarSign, User, Phone, Droplet, Ruler, Scale } from 'lucide-react';
import MedicalImageViewer from '../../components/MedicalImageViewer';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { AppointmentModal } from '../../components/AppointmentModal';
import { PatientRegistrationModal } from '../../components/PatientRegistrationModal';
import { ClinicalWorkspace } from '../Modulo4_DatosClinicos/ClinicalWorkspace';
import api from '../../services/api';
import html2pdf from 'html2pdf.js';
import './PerfilPaciente.css';

export default function PerfilPaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('historia');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState([]);
  const [studies, setStudies] = useState([]);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState(null); // Para ver el informe
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null); // Para ver la factura
  const [isCreatingConsultation, setIsCreatingConsultation] = useState(false);

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

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const [profileRes, consultationsRes, studiesRes, invoicesRes] = await Promise.all([
        api.get(`/api/patients/${id}/profile`),
        api.get(`/api/patients/${id}/consultations`),
        api.get(`/api/studies/patient/${id}`),
        api.get(`/api/billing/transactions?patientId=${id}`)
      ]);
      setPatient(profileRes.data);
      setConsultations(consultationsRes.data);
      setStudies(studiesRes.data);
      setInvoices(invoicesRes.data);
    } catch (err) {
      console.error('Error fetching patient profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [id]);

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
              <span className="tag green"><Phone size={14} style={{display: 'inline', marginRight: '4px'}}/> {profile.phone || 'No registrado'}</span>
              <span className="tag purple"><User size={14} style={{display: 'inline', marginRight: '4px'}}/> {profile.gender || 'No especificado'} - {calculateAge(profile.dateOfBirth)} años</span>
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
        </div>
        
        <div className="tabs-container">
          <div className="tabs-header">
            <button className={`tab-btn ${activeTab === 'historia' ? 'active' : ''}`} onClick={() => setActiveTab('historia')}>
              <Activity size={18} /> Historia Clínica
            </button>
            <button className={`tab-btn ${activeTab === 'estudios' ? 'active' : ''}`} onClick={() => setActiveTab('estudios')}>
              <FileText size={18} /> Estudios y Órdenes
            </button>
            <button className={`tab-btn ${activeTab === 'citas' ? 'active' : ''}`} onClick={() => setActiveTab('citas')}>
              <Calendar size={18} /> Citas
            </button>
            <button className={`tab-btn ${activeTab === 'facturacion' ? 'active' : ''}`} onClick={() => setActiveTab('facturacion')}>
              <DollarSign size={18} /> Facturación
            </button>
          </div>

          <div className="tab-content">
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
                <div className="upload-actions">
                  <label className="btn-upload">
                    <Upload size={18} /> Subir Orden (PDF)
                    <input type="file" accept="application/pdf" hidden />
                  </label>
                  <button className="btn-upload" onClick={() => setShowImageUpload(!showImageUpload)}>
                    <Upload size={18} /> Subir Imagen (DICOM/JPG/PNG)
                  </button>
                </div>

                {showImageUpload && (
                  <div className="image-upload-area mt-4">
                    <input type="file" accept=".dcm,image/jpeg,image/png" onChange={handleImageUpload} />
                    {selectedImage && (
                      <div className="viewer-wrapper mt-4">
                        <MedicalImageViewer imageUrl={selectedImage} />
                      </div>
                    )}
                  </div>
                )}

                <div className="estudios-list mt-4">
                  <h3>Órdenes Previas y Estudios</h3>
                  {!(studies && Array.isArray(studies) && studies.length > 0) ? (
                    <p>No hay estudios o procedimientos registrados para este paciente.</p>
                  ) : (
                    <div className="studies-grid">
                      {studies.map(study => (
                        <div key={study.id} className="study-card">
                          <div className="study-header">
                            <span className="study-type">{study.studyType}</span>
                            <span className={`study-status ${study.status?.toLowerCase()}`}>{study.status || 'Completado'}</span>
                          </div>
                          <p className="study-date"><strong>Fecha:</strong> {new Date(study.date || study.created_at).toLocaleDateString()} - Sede {study.sede}</p>
                          <p><strong>Médico:</strong> {study.doctor?.name || 'No especificado'}</p>
                          <p className="study-preview"><strong>Impresión Diagnóstica:</strong> {study.diagnosticImpression || 'No especificada'}</p>
                          <button 
                            className="btn-secondary btn-small mt-2" 
                            style={{ width: '100%', marginTop: '1rem' }}
                            onClick={() => setSelectedStudy(study)}
                          >
                            <FileText size={16} /> Ver Informe Completo
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'citas' && (
              <div className="citas-section">
                <button className="btn-primary mb-4" onClick={() => setShowAppointmentModal(true)}>
                  Agendar Nueva Cita
                </button>
                <p>Historial de citas aparecerá aquí.</p>
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
          onClose={() => setShowAppointmentModal(false)}
          onSuccess={() => {
            setShowAppointmentModal(false);
            window.dispatchEvent(new Event('appointmentCreated'));
          }}
          initialPatientId={patient?.id}
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

      {selectedStudy && (
        <div className="report-modal-overlay">
          <div className="report-modal">
            <div className="report-modal-header">
              <h2>Informe Médico: {selectedStudy.studyType}</h2>
              <button className="btn-close" onClick={() => setSelectedStudy(null)}>&times;</button>
            </div>
            <div className="report-modal-body">
              <div className="report-meta">
                <p><strong>Paciente:</strong> {patient.name || patient.username}</p>
                <p><strong>Médico:</strong> {selectedStudy.doctor?.name || 'No especificado'}</p>
                <p><strong>Fecha:</strong> {new Date(selectedStudy.date || selectedStudy.created_at).toLocaleDateString()}</p>
                <p><strong>Sede:</strong> {selectedStudy.sede}</p>
                <p><strong>Estado:</strong> <span className={`study-status ${selectedStudy.status?.toLowerCase()}`}>{selectedStudy.status}</span></p>
              </div>

              <div className="report-section">
                <h3>Muestra de Biopsia</h3>
                <p>{selectedStudy.biopsySample || 'No se tomó muestra'}</p>
              </div>

              <div className="report-section">
                <h3>Hallazgos</h3>
                <p>{selectedStudy.findings || 'Sin hallazgos reportados'}</p>
              </div>

              <div className="report-section">
                <h3>Impresión Diagnóstica</h3>
                <p>{selectedStudy.diagnosticImpression || 'Sin impresión diagnóstica reportada'}</p>
              </div>

              <div className="report-section">
                <h3>Recomendaciones</h3>
                <p>{selectedStudy.recommendations || 'Sin recomendaciones'}</p>
              </div>
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
                <h1 style={{ margin: '0 0 0.5rem 0', color: '#22505d' }}>SARA Clínicas</h1>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Sistema Administrativo y de Registro Automatizado</p>
                <p style={{ margin: '0.5rem 0 0 0', color: '#4b5563', fontWeight: '500' }}>Sede: {selectedInvoice.sedeAtencion}</p>
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
    </DashboardLayout>
  );
}
