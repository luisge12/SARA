import React from 'react';
import './MedicalDocumentModal.css';
import { Esculapio } from './Esculapio';
import { Button } from './Button';
import { Printer, Download, X, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

/**
 * Modal universal para visualización, impresión y descarga de documentos médicos y administrativos
 */
export function MedicalDocumentModal({
  isOpen,
  onClose,
  type = 'prescription',
  data = {}
}) {
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

  return (
    <div className="doc-modal-overlay">
      <div className="doc-modal-container">
        
        {/* Barra de herramientas superior */}
        <div className="doc-modal-toolbar">
          <div className="doc-modal-toolbar-title">
            <FileText size={18} style={{ color: '#22505d' }} />
            <span>
              {type === 'prescription' && 'Récipe / Prescripción Médica Oficial'}
              {type === 'clinical_report' && 'Informe de Consulta Médica'}
              {type === 'study_report' && 'Informe de Estudio / Procedimiento'}
              {type === 'billing_receipt' && 'Comprobante de Caja y Facturación'}
            </span>
          </div>

          <div className="doc-modal-toolbar-actions">
            <Button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.25rem' }}>
              <Printer size={16} /> Imprimir / Guardar PDF
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
          <div className="doc-sheet" id="printable-medical-sheet">
            
            {/* 1. Encabezado Membretado */}
            <div>
              <header className="doc-header">
                <div className="doc-brand">
                  <div className="doc-logo-box">
                    <Esculapio size={30} />
                  </div>
                  <div>
                    <h1 className="doc-clinic-name">UNIMECO</h1>
                    <p className="doc-clinic-subtitle">Unidad Médica Quirúrgica Especializada | SARA Medical</p>
                  </div>
                </div>

                <div className="doc-meta">
                  <p><strong>Sede:</strong> {sede}</p>
                  <p><strong>Fecha de Emisión:</strong> {currentDate}</p>
                  <p><strong>Registro Sanitario:</strong> MPPS-SARA-0042</p>
                </div>
              </header>

              {/* Título del Documento */}
              <div className="doc-title-badge">
                <h2>
                  {type === 'prescription' && 'Rp. / Récipe Médico'}
                  {type === 'clinical_report' && 'Informe Clínico de Consulta'}
                  {type === 'study_report' && (data.studyType || 'Informe de Estudio Especializado')}
                  {type === 'billing_receipt' && 'Comprobante Oficial de Ingreso'}
                </h2>
              </div>

              {/* Datos de Identificación del Paciente */}
              <div className="doc-patient-box">
                <div className="doc-patient-item">
                  <label>Paciente</label>
                  <span>{patientName}</span>
                </div>
                <div className="doc-patient-item">
                  <label>Cédula / Documento</label>
                  <span>{patientId}</span>
                </div>
                {data.patientAge && (
                  <div className="doc-patient-item">
                    <label>Edad</label>
                    <span>{data.patientAge}</span>
                  </div>
                )}
                <div className="doc-patient-item">
                  <label>Especialista Tratante</label>
                  <span>{doctorName}</span>
                </div>
              </div>
            </div>

            {/* 2. Cuerpo Central según Tipo de Documento */}
            <div className="doc-content-body">
              
              {/* === TIPO A: PRESCRIPCIÓN / RÉCIPE MÉDICO === */}
              {type === 'prescription' && (
                <>
                  <div className="doc-section">
                    <span className="doc-section-title">Prescripción Terapéutica (Medicamentos y Pautas)</span>
                    {Array.isArray(data.treatmentPlan) && data.treatmentPlan.length > 0 ? (
                      <table className="doc-table">
                        <thead>
                          <tr>
                            <th style={{ width: '35%' }}>Medicamento</th>
                            <th style={{ width: '25%' }}>Presentación</th>
                            <th style={{ width: '25%' }}>Indicación / Posología</th>
                            <th style={{ width: '15%' }}>Duración</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.treatmentPlan.map((item, idx) => (
                            <tr key={idx}>
                              <td><strong>{item.medication || '-'}</strong></td>
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

                  {data.recommendations && (
                    <div className="doc-section" style={{ marginTop: '0.75rem' }}>
                      <span className="doc-section-title">Indicaciones Generales y Cuidados</span>
                      <p className="doc-section-text">{data.recommendations}</p>
                    </div>
                  )}

                  {data.diagnosesSummary && (
                    <div className="doc-section" style={{ marginTop: '0.5rem' }}>
                      <span className="doc-section-title">Diagnóstico de Soporte</span>
                      <p className="doc-section-text" style={{ fontSize: '0.85rem' }}>{data.diagnosesSummary}</p>
                    </div>
                  )}
                </>
              )}

              {/* === TIPO B: INFORME CLÍNICO DE CONSULTA === */}
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

              {/* === TIPO C: INFORME DE ESTUDIO / PROCEDIMIENTO === */}
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

              {/* === TIPO D: COMPROBANTE DE CAJA / RECIBO === */}
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

            {/* 3. Firmas y Pie de Página */}
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
        </div>

      </div>
    </div>
  );
}

export default MedicalDocumentModal;
