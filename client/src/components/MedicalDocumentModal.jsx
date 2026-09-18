import React, { useState } from 'react';
import './MedicalDocumentModal.css';
import { Esculapio } from './Esculapio';
import { Button } from './Button';
import { Printer, X, FileText, CheckCircle2, Pill, ClipboardList, Layers } from 'lucide-react';
import { getClinicSettings } from '../services/clinicSettings';

/**
 * Modal universal para visualización, impresión y descarga de documentos médicos y administrativos
 * Con soporte para Duplicidad de Récipes (Farmacia formal vs. Guía de Indicaciones al Paciente)
 */
export function MedicalDocumentModal({
  isOpen,
  onClose,
  type = 'prescription',
  data = {}
}) {
  const [recipeMode, setRecipeMode] = useState('meds'); // 'meds' (Récipe 2: Farmacia) | 'instructions' (Récipe 1: Guía Paciente) | 'dual' (Ambos)

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = data.date || new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const sede = data.sede || data.patient?.sedeAtencion || 'CENTRAL';
  const patientName = data.patient?.name || data.patientName || 'Paciente No Especificado';
  const patientId = data.patient?.identificationNumber || data.patientCedula || 'S/N';
  const doctorName = data.doctor?.name || data.doctorName || 'Dr. Médico Especialista';
  const doctorMpps = data.doctor?.mppsNumber || data.doctorMpps || 'MPPS: En Trámite';
  const doctorCollege = data.doctor?.medicalCollegeNumber || data.doctorCollege || 'CMDMC: Registrado';
  const patientAge = data.patient?.age || data.patientAge || (data.patient?.birth_date ? `${new Date().getFullYear() - new Date(data.patient.birth_date).getFullYear()} años` : '');

  const clinic = getClinicSettings();
  const clinicName = clinic.name || 'UNIMECO';
  const clinicSubtitle = clinic.subtitle || 'Unidad Médica Quirúrgica Especializada';
  const clinicRif = clinic.rif || '';
  const clinicLogo = clinic.logoUrl || null;

  // Renderizador individual de Récipe Farmacéutico (Medicamentos)
  const renderMedsPrescription = (isDualHalf = false) => (
    <div className={`recipe-sheet-content ${isDualHalf ? 'dual-half' : ''}`}>
      <header className="doc-header">
        <div className="doc-brand">
          <div className="doc-logo-box">
            {clinicLogo ? (
              <img src={clinicLogo} alt={clinicName} style={{ maxHeight: '28px', maxWidth: '36px', objectFit: 'contain' }} />
            ) : (
              <Esculapio size={24} />
            )}
          </div>
          <div>
            <h1 className="doc-clinic-name">{clinicName}</h1>
            <p className="doc-clinic-subtitle">{clinicSubtitle} {clinicRif ? `| RIF: ${clinicRif}` : ''}</p>
          </div>
        </div>
        <div className="doc-meta">
          <p><strong>Sede:</strong> {sede}</p>
          <p><strong>Fecha:</strong> {currentDate}</p>
          <p><strong>Doc:</strong> Rp. Farmacia</p>
        </div>
      </header>

      <div className="doc-title-badge">
        <h2>Rp. / Prescripción Farmacológica</h2>
        <span className="doc-badge-pill">Uso Exclusivo Dispensación Farmacéutica</span>
      </div>

      <div className="doc-patient-box">
        <div className="doc-patient-item">
          <label>Paciente</label>
          <span>{patientName}</span>
        </div>
        <div className="doc-patient-item">
          <label>Cédula / ID</label>
          <span>{patientId}</span>
        </div>
        {patientAge && (
          <div className="doc-patient-item">
            <label>Edad</label>
            <span>{patientAge}</span>
          </div>
        )}
        <div className="doc-patient-item">
          <label>Especialista Tratante</label>
          <span>{doctorName}</span>
        </div>
      </div>

      <div className="doc-content-body">
        <div className="doc-section">
          <span className="doc-section-title">Medicamentos Prescritos</span>
          {Array.isArray(data.treatmentPlan) && data.treatmentPlan.length > 0 ? (
            <table className="doc-table">
              <thead>
                <tr>
                  <th style={{ width: '38%' }}>Medicamento / P. Activo</th>
                  <th style={{ width: '22%' }}>Presentación</th>
                  <th style={{ width: '25%' }}>Posología</th>
                  <th style={{ width: '15%' }}>Duración</th>
                </tr>
              </thead>
              <tbody>
                {data.treatmentPlan.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{item.medication || '-'}</strong>
                      {item.activeIngredient && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          P.A.: {item.activeIngredient}
                        </div>
                      )}
                    </td>
                    <td>{item.presentation || '-'}</td>
                    <td>{item.indication || '-'}</td>
                    <td>{item.duration || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="doc-section-text" style={{ fontStyle: 'italic', color: '#64748b' }}>
              {data.customPrescriptionText || 'Sin medicamentos prescritos registrados.'}
            </p>
          )}
        </div>
      </div>

      <footer className="doc-footer" style={{ marginTop: 'auto', paddingTop: '1.25rem' }}>
        <div className="doc-signatures">
          <div className="doc-sig-box">
            <div className="doc-sig-line"></div>
            <div className="doc-sig-name">{doctorName}</div>
            <div className="doc-sig-details">{doctorMpps} • {doctorCollege}</div>
            <div className="doc-sig-details">Firma y Sello del Especialista</div>
          </div>
        </div>
        <div className="doc-footer-notice">
          Documento farmacológico oficial generado por Sistema SARA (UNIMECO). No contiene signos vitales ni antecedentes por confidencialidad.
        </div>
      </footer>
    </div>
  );

  // Renderizador individual de Guía de Indicaciones al Paciente
  const renderPatientInstructions = (isDualHalf = false) => (
    <div className={`recipe-sheet-content ${isDualHalf ? 'dual-half' : ''}`}>
      <header className="doc-header">
        <div className="doc-brand">
          <div className="doc-logo-box" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)' }}>
            {clinicLogo ? (
              <img src={clinicLogo} alt={clinicName} style={{ maxHeight: '28px', maxWidth: '36px', objectFit: 'contain' }} />
            ) : (
              <Esculapio size={24} />
            )}
          </div>
          <div>
            <h1 className="doc-clinic-name">{clinicName}</h1>
            <p className="doc-clinic-subtitle">Guía de Atención y Cuidados al Paciente</p>
          </div>
        </div>
        <div className="doc-meta">
          <p><strong>Sede:</strong> {sede}</p>
          <p><strong>Fecha:</strong> {currentDate}</p>
          <p><strong>Doc:</strong> Guía de Cuidados</p>
        </div>
      </header>

      <div className="doc-title-badge" style={{ backgroundColor: 'rgba(20, 184, 166, 0.08)', borderColor: '#14b8a6' }}>
        <h2 style={{ color: '#0f766e' }}>Guía Paso a Paso de Tratamiento</h2>
        <span className="doc-badge-pill" style={{ backgroundColor: '#0f766e', color: '#ffffff' }}>Indicaciones para el Paciente</span>
      </div>

      <div className="doc-patient-box">
        <div className="doc-patient-item">
          <label>Estimado(a) Paciente</label>
          <span style={{ fontWeight: 700, color: '#0f766e' }}>{patientName}</span>
        </div>
        <div className="doc-patient-item">
          <label>Cédula / ID</label>
          <span>{patientId}</span>
        </div>
        <div className="doc-patient-item">
          <label>Médico Especialista</label>
          <span>{doctorName}</span>
        </div>
      </div>

      <div className="doc-content-body">
        <div className="doc-section">
          <span className="doc-section-title" style={{ borderLeftColor: '#14b8a6', color: '#0f766e' }}>
            Pauta de Medicación
          </span>
          {Array.isArray(data.treatmentPlan) && data.treatmentPlan.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
              {data.treatmentPlan.map((item, idx) => (
                <div key={idx} className="instruction-step-card">
                  <div className="instruction-step-badge">{idx + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{item.medication || 'Medicamento'}</strong>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{item.presentation}</span>
                    </div>
                    <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#334155', lineHeight: '1.4' }}>
                      <strong>Instrucción:</strong> {item.indication || 'Tomar según lo explicado en consulta.'}
                    </div>
                    {item.duration && (
                      <div style={{ marginTop: '0.2rem', fontSize: '0.78rem', color: '#0d9488', fontWeight: 600 }}>
                        ⏱ Duración: {item.duration}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="doc-section-text">Siga las medidas generales indicadas por su especialista.</p>
          )}
        </div>

        <div className="doc-section" style={{ marginTop: '0.75rem' }}>
          <span className="doc-section-title" style={{ borderLeftColor: '#14b8a6', color: '#0f766e' }}>
            Cuidados Generales y Recomendaciones
          </span>
          <p className="doc-section-text" style={{ whiteSpace: 'pre-line', fontSize: '0.84rem' }}>
            {data.recommendations || 
              "• Mantenga una adecuada hidratación diaria (mínimo 2 litros de agua).\n• Respete los horarios fijados para cada toma farmacológica.\n• Si presenta molestias estomacales, consuma los comprimidos junto con alimentos."}
          </p>
        </div>

        <div className="alarm-box">
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem', fontSize: '0.82rem' }}>
            ⚠️ Signos de Alerta (Consultar de Inmediato):
          </div>
          <div style={{ fontSize: '0.78rem' }}>Fiebre mayor a 38.5°C persistente, sangrado activo o dolor abdominal intenso que no ceda.</div>
        </div>
      </div>

      <footer className="doc-footer" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        <div className="doc-signatures">
          <div className="doc-sig-box">
            <div className="doc-sig-line"></div>
            <div className="doc-sig-name">{doctorName}</div>
            <div className="doc-sig-details">{doctorMpps} • {doctorCollege}</div>
            <div className="doc-sig-details">Firma del Especialista</div>
          </div>
        </div>
        <div className="doc-footer-notice">
          Guía personalizada para el paciente • UNIMECO SARA
        </div>
      </footer>
    </div>
  );

  return (
    <div className="doc-modal-overlay">
      <div className="doc-modal-container">
        
        {/* Barra de herramientas superior */}
        <div className="doc-modal-toolbar">
          <div className="doc-modal-toolbar-title">
            <FileText size={18} style={{ color: '#22505d' }} />
            <span>
              {type === 'prescription' && 'Récipes Médicos UNIMECO'}
              {type === 'clinical_report' && 'Informe de Consulta Médica'}
              {type === 'study_report' && 'Informe de Estudio / Procedimiento'}
              {type === 'billing_receipt' && 'Comprobante de Caja y Facturación'}
            </span>
          </div>

          {/* Selector de sub-modo de Récipe cuando type === 'prescription' */}
          {type === 'prescription' && (
            <div className="recipe-mode-tabs">
              <button 
                type="button" 
                className={`recipe-tab-btn ${recipeMode === 'meds' ? 'active' : ''}`}
                onClick={() => setRecipeMode('meds')}
              >
                <Pill size={15} /> Récipe Farmacia
              </button>
              <button 
                type="button" 
                className={`recipe-tab-btn ${recipeMode === 'instructions' ? 'active' : ''}`}
                onClick={() => setRecipeMode('instructions')}
              >
                <ClipboardList size={15} /> Guía Paciente
              </button>
              <button 
                type="button" 
                className={`recipe-tab-btn ${recipeMode === 'dual' ? 'active' : ''}`}
                onClick={() => setRecipeMode('dual')}
              >
                <Layers size={15} /> Ambos (Hoja Dual)
              </button>
            </div>
          )}

          <div className="doc-modal-toolbar-actions">
            <Button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.25rem' }}>
              <Printer size={16} /> Imprimir / PDF
            </Button>
            <button 
              onClick={onClose} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.25rem' }}
              title="Cerrar vista previa"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Área imprimible */}
        <div className="doc-modal-scroll-area">
          {type === 'prescription' ? (
            recipeMode === 'dual' ? (
              <div className="doc-sheet doc-sheet-dual" id="printable-medical-sheet">
                {renderMedsPrescription(true)}
                <div className="dual-cut-divider">
                  <span>✂️ Corte aquí — Entregar sección superior a Farmacia y sección inferior al Paciente</span>
                </div>
                {renderPatientInstructions(true)}
              </div>
            ) : recipeMode === 'instructions' ? (
              <div className="doc-sheet" id="printable-medical-sheet">
                {renderPatientInstructions(false)}
              </div>
            ) : (
              <div className="doc-sheet" id="printable-medical-sheet">
                {renderMedsPrescription(false)}
              </div>
            )
          ) : (
            /* Documentos No-Prescripción (Informe Clínico, Estudio, Recibo de Caja) */
            <div className="doc-sheet" id="printable-medical-sheet">
              <header className="doc-header">
                <div className="doc-brand">
                  <div className="doc-logo-box">
                    {clinicLogo ? (
                      <img src={clinicLogo} alt={clinicName} style={{ maxHeight: '34px', maxWidth: '44px', objectFit: 'contain' }} />
                    ) : (
                      <Esculapio size={30} />
                    )}
                  </div>
                  <div>
                    <h1 className="doc-clinic-name">{clinicName}</h1>
                    <p className="doc-clinic-subtitle">{clinicSubtitle} {clinicRif ? `| RIF: ${clinicRif}` : ''}</p>
                  </div>
                </div>

                <div className="doc-meta">
                  <p><strong>Sede:</strong> {sede}</p>
                  <p><strong>Fecha de Emisión:</strong> {currentDate}</p>
                  <p><strong>Registro Sanitario:</strong> MPPS-SARA-0042</p>
                </div>
              </header>

              <div className="doc-title-badge">
                <h2>
                  {type === 'clinical_report' && 'Informe Clínico de Consulta'}
                  {type === 'study_report' && (data.studyType || 'Informe de Estudio Especializado')}
                  {type === 'billing_receipt' && 'Comprobante Oficial de Ingreso'}
                </h2>
              </div>

              <div className="doc-patient-box">
                <div className="doc-patient-item">
                  <label>Paciente</label>
                  <span>{patientName}</span>
                </div>
                <div className="doc-patient-item">
                  <label>Cédula / Documento</label>
                  <span>{patientId}</span>
                </div>
                {patientAge && (
                  <div className="doc-patient-item">
                    <label>Edad</label>
                    <span>{patientAge}</span>
                  </div>
                )}
                <div className="doc-patient-item">
                  <label>Especialista Tratante</label>
                  <span>{doctorName}</span>
                </div>
              </div>

              <div className="doc-content-body">
                {type === 'clinical_report' && (
                  <>
                    {data.reasonForVisit && (
                      <div className="doc-section">
                        <span className="doc-section-title">Motivo de Consulta y Resumen Clínico</span>
                        <p className="doc-section-text">{data.reasonForVisit}</p>
                      </div>
                    )}

                    {data.physicalExam && (
                      <div className="doc-section">
                        <span className="doc-section-title">Hallazgos del Examen Físico</span>
                        <p className="doc-section-text">{data.physicalExam}</p>
                      </div>
                    )}

                    {data.diagnoses && (
                      <div className="doc-section">
                        <span className="doc-section-title">Impresión Diagnóstica (CIE)</span>
                        <p className="doc-section-text" style={{ fontWeight: '600', color: '#22505d' }}>
                          {data.diagnoses}
                        </p>
                      </div>
                    )}

                    {data.evolutionaryReport && (
                      <div className="doc-section">
                        <span className="doc-section-title">Evolución y Conducta Médica</span>
                        <p className="doc-section-text">{data.evolutionaryReport}</p>
                      </div>
                    )}
                  </>
                )}

                {type === 'study_report' && (
                  <>
                    {data.findings && (
                      <div className="doc-section">
                        <span className="doc-section-title">Hallazgos del Procedimiento</span>
                        <p className="doc-section-text" style={{ whiteSpace: 'pre-line' }}>{data.findings}</p>
                      </div>
                    )}

                    {data.biopsySample && data.biopsySample !== 'No se tomó muestra' && (
                      <div className="doc-section">
                        <span className="doc-section-title" style={{ color: '#b45309', borderLeftColor: '#f59e0b' }}>
                          Muestras de Biopsia / Tejido
                        </span>
                        <p className="doc-section-text" style={{ fontWeight: '600' }}>{data.biopsySample}</p>
                      </div>
                    )}

                    {data.diagnosticImpression && (
                      <div className="doc-section">
                        <span className="doc-section-title">Impresión Diagnóstica</span>
                        <p className="doc-section-text" style={{ fontWeight: '700', color: '#22505d' }}>
                          {data.diagnosticImpression}
                        </p>
                      </div>
                    )}

                    {data.recommendations && (
                      <div className="doc-section">
                        <span className="doc-section-title">Recomendaciones y Plan de Seguimiento</span>
                        <p className="doc-section-text">{data.recommendations}</p>
                      </div>
                    )}
                  </>
                )}

                {type === 'billing_receipt' && (
                  <>
                    <div className="doc-section">
                      <span className="doc-section-title">Detalle del Servicio Facturado</span>
                      <table className="doc-table" style={{ marginTop: '0.75rem' }}>
                        <thead>
                          <tr>
                            <th>Concepto del Servicio</th>
                            <th>Médico Tratante</th>
                            <th style={{ textAlign: 'right' }}>Monto (USD)</th>
                            <th style={{ textAlign: 'right' }}>Total (Bs.)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>{data.serviceType || 'Servicio de Consulta Especializada'}</strong></td>
                            <td>{doctorName}</td>
                            <td style={{ textAlign: 'right', fontWeight: '700' }}>
                              ${parseFloat(data.totalAmountUSD || 0).toFixed(2)}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: '700' }}>
                              Bs. {parseFloat(data.totalAmountLocal || 0).toFixed(2)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                        <span>Tasa Oficial BCV Aplicada:</span>
                        <strong>Bs. {parseFloat(data.exchangeRate || 1).toFixed(4)} / USD</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem', color: '#22505d' }}>
                        <strong>Total Cancelado:</strong>
                        <strong>Bs. {parseFloat(data.totalAmountLocal || 0).toFixed(2)} (${parseFloat(data.totalAmountUSD || 0).toFixed(2)} USD)</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: '#16a34a', fontSize: '0.88rem', fontWeight: '600' }}>
                      <CheckCircle2 size={18} />
                      <span>Pago verificado y registrado en el sistema administrativo SARA.</span>
                    </div>
                  </>
                )}
              </div>

              <footer className="doc-footer">
                <div className="doc-signatures">
                  <div className="doc-sig-box">
                    <div className="doc-sig-line"></div>
                    <div className="doc-sig-name">{doctorName}</div>
                    <div className="doc-sig-details">{doctorMpps} | {doctorCollege}</div>
                    <div className="doc-sig-details">Firma y Sello del Especialista</div>
                  </div>

                  {type === 'billing_receipt' && (
                    <div className="doc-sig-box">
                      <div className="doc-sig-line"></div>
                      <div className="doc-sig-name">{data.creatorName || 'Caja / Recepción'}</div>
                      <div className="doc-sig-details">Responsable de Caja UNIMECO</div>
                    </div>
                  )}
                </div>

                <div className="doc-footer-notice">
                  Documento médico generado y auditado por el Sistema SARA (UNIMECO) • Válido para trámites asistenciales y farmacéuticos.
                </div>
              </footer>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default MedicalDocumentModal;
