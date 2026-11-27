import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ClipboardList, Calendar, LogOut, ArrowRight, ShieldCheck, FileText, Paperclip, Download, X, Image, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { portalApi } from '../../services/api';

export function PortalPacienteDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('portal_user') || '{}');
  const [studies, setStudies] = useState([]);
  const [loadingStudies, setLoadingStudies] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [viewingAttachment, setViewingAttachment] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('session_expires_at');
    navigate('/users/login');
  };

  const fetchAppointments = async () => {
    if (!user?.id) return;
    try {
      setLoadingAppointments(true);
      const res = await portalApi.get(`/api/appointments?patientId=${user.id}`);
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Error fetching patient appointments:', err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    const fetchStudies = async () => {
      try {
        const res = await portalApi.get(`/api/studies/patient/${user.id}`);
        setStudies(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.warn('Error fetching patient studies:', err);
      } finally {
        setLoadingStudies(false);
      }
    };
    fetchStudies();
    fetchAppointments();

    const handleReq = () => fetchAppointments();
    window.addEventListener('patientAppointmentRequested', handleReq);
    return () => window.removeEventListener('patientAppointmentRequested', handleReq);
  }, [user?.id]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-main)', padding: '2rem 1rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--border-color)', maxWidth: '1100px', margin: '0 auto', width: '100%', borderRadius: '16px' }}>
        
        {/* Barra superior */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              <ShieldCheck size={18} /> Portal del Paciente SARA
            </div>
            <h1 style={{ color: 'var(--color-text-main)', fontSize: '2.2rem', margin: 0, fontWeight: 800 }}>
              Bienvenido(a), {user.name || user.username}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>

        {/* Banner destacado: Llenar historia clínica */}
        <div style={{
          backgroundColor: 'rgba(42, 183, 202, 0.1)',
          border: '1px solid var(--color-primary)',
          borderRadius: '14px',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div style={{ maxWidth: '700px' }}>
            <span style={{ backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Paso Recomendado
            </span>
            <h2 style={{ color: 'var(--color-primary)', fontSize: '1.35rem', margin: '0.5rem 0 0.35rem 0' }}>
              Llena tu Historia Clínica y Anamnesis
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
              Completa tus antecedentes familiares, patologías previas, alergias, hábitos y motivo de consulta. Esta información se conectará en tiempo real con la ficha clínica de tu médico tratante.
            </p>
          </div>
          <button
            onClick={() => navigate('/users/historia-medica')}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              border: 'none',
              padding: '0.85rem 1.4rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(42, 183, 202, 0.25)',
              transition: 'all 0.2s'
            }}
          >
            Llenar mi Historia <ArrowRight size={18} />
          </button>
        </div>

        {/* Tarjetas de acceso */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '0.5rem' }}>
          
          {/* Card 1: Historia Médica */}
          <div 
            onClick={() => navigate('/users/historia-medica')}
            style={{ backgroundColor: 'var(--color-bg-card)', padding: '1.75rem', borderRadius: '14px', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.borderColor = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(42, 183, 202, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={26} color="var(--color-primary)" />
            </div>
            <h3 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.15rem' }}>Mi Ficha e Historia Clínica</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.4, flexGrow: 1 }}>
              Visualiza tus datos personales registrados, completa tus antecedentes y descarga tu resumen médico oficial.
            </p>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              Acceder a Historia <ArrowRight size={15} />
            </span>
          </div>

          {/* Card 2: Parámetros Vitales */}
          <div 
            onClick={() => navigate('/users/historia-medica')}
            style={{ backgroundColor: 'var(--color-bg-card)', padding: '1.75rem', borderRadius: '14px', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.borderColor = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={26} color="#10b981" />
            </div>
            <h3 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.15rem' }}>Signos Vitales y Parámetros</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.4, flexGrow: 1 }}>
              Consulta tu Tensión Arterial (TA), Frecuencia Cardíaca (FC), Saturación de Oxígeno (SatO2), Talla, Peso e IMC.
            </p>
            <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              Ver Parámetros <ArrowRight size={15} />
            </span>
          </div>
        </div>

        {/* Sección: Mis Citas Médicas y Consultas */}
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(42, 183, 202, 0.15)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.2rem', fontWeight: 700 }}>
                  Mis Citas Médicas y Consultas
                </h3>
                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  Estado de tus turnos programados y solicitudes de consulta enviadas
                </p>
              </div>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-primary)', backgroundColor: 'rgba(42, 183, 202, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '12px' }}>
              {appointments.length} {appointments.length === 1 ? 'cita registrada' : 'citas registradas'}
            </span>
          </div>

          {loadingAppointments ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Cargando tus citas médicas...
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--color-bg-card)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
              <Calendar size={36} style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem', opacity: 0.6 }} />
              <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                No tienes citas programadas actualmente. Puedes solicitar una consulta con tu médico desde el menú lateral.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {appointments.map(apt => {
                const isUnscheduled = !apt.appointmentDate || isNaN(new Date(apt.appointmentDate).getTime());
                const dateObj = isUnscheduled ? null : new Date(apt.appointmentDate);
                const isSolicitada = apt.status === 'Solicitada';
                const isConfirmada = apt.status === 'Confirmada';
                const isCancelada = apt.status === 'Cancelada';

                return (
                  <div 
                    key={apt.id}
                    style={{
                      backgroundColor: 'var(--color-bg-card)',
                      borderRadius: '12px',
                      border: isSolicitada ? '1px solid #fde68a' : isConfirmada ? '1px solid #bbf7d0' : '1px solid var(--border-color)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: 'var(--color-primary)'
                      }}>
                        <Calendar size={15} />
                        {isUnscheduled 
                          ? 'Fecha por coordinar' 
                          : dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
                        }
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        backgroundColor: isSolicitada ? '#fef3c7' : isConfirmada ? '#dcfce7' : isCancelada ? '#fee2e2' : '#f1f5f9',
                        color: isSolicitada ? '#92400e' : isConfirmada ? '#15803d' : isCancelada ? '#dc2626' : '#475569'
                      }}>
                        {apt.status || 'Solicitada'}
                      </span>
                    </div>

                    {!isUnscheduled && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        <Clock size={14} />
                        <span>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>• Sede {apt.sedeAtencion || 'CENTRAL'}</span>
                      </div>
                    )}

                    <div style={{ fontSize: '0.88rem', color: 'var(--color-text-main)' }}>
                      <div><strong>Médico:</strong> {apt.doctor?.name || 'Por asignar por el centro'}</div>
                      <div><strong>Motivo:</strong> {apt.reason || 'Consulta Médica General'}</div>
                    </div>

                    {isSolicitada && (
                      <div style={{
                        marginTop: 'auto',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#fffbeb',
                        borderRadius: '6px',
                        border: '1px solid #fef3c7',
                        fontSize: '0.78rem',
                        color: '#92400e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}>
                        <AlertCircle size={14} style={{ flexShrink: 0 }} />
                        <span>Solicitud recibida. Nuestro equipo confirmará tu horario a la brevedad.</span>
                      </div>
                    )}

                    {isConfirmada && (
                      <div style={{
                        marginTop: 'auto',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '6px',
                        border: '1px solid #dcfce7',
                        fontSize: '0.78rem',
                        color: '#15803d',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}>
                        <CheckCircle size={14} style={{ flexShrink: 0 }} />
                        <span>Cita confirmada en sistema. Por favor acudir 10 minutos antes.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sección: Mis Estudios y Resultados de Laboratorio */}
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '1.2rem', fontWeight: 700 }}>
                  Mis Estudios y Resultados de Laboratorio
                </h3>
                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  Descarga tus informes clínicos, pruebas de laboratorio y estudios en PDF
                </p>
              </div>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.25rem 0.75rem', borderRadius: '12px' }}>
              {studies.length} {studies.length === 1 ? 'estudio registrado' : 'estudios registrados'}
            </span>
          </div>

          {loadingStudies ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Cargando tus estudios médicos...
            </div>
          ) : studies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--color-bg-card)', borderRadius: '14px', border: '1px dashed var(--border-color)' }}>
              <FileText size={38} color="#94a3b8" style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
              <h4 style={{ margin: '0 0 0.35rem 0', color: 'var(--color-text-main)', fontSize: '1.05rem' }}>
                No tienes estudios ni laboratorios registrados aún
              </h4>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', margin: 0, maxWidth: '440px', marginInline: 'auto' }}>
                Cuando tu médico o el laboratorio cargue tus resultados y exámenes, aparecerán automáticamente aquí para que los consultes o descargues en PDF.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {studies.map(study => (
                <div key={study.id} style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '1.05rem' }}>
                        {study.studyType}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.15rem 0.5rem', borderRadius: '10px' }}>
                        {study.category || 'General'}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      <strong>Fecha:</strong> {new Date(study.date || study.created_at).toLocaleDateString()} • Sede {study.sede || 'CENTRAL'}
                    </p>
                    {study.doctor?.name && (
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        <strong>Médico:</strong> {study.doctor.name}
                      </p>
                    )}

                    {study.diagnosticImpression && (
                      <p style={{ margin: '0.35rem 0', fontSize: '0.85rem', color: 'var(--color-text-main)', background: '#f8fafc', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <strong>Impresión:</strong> {study.diagnosticImpression}
                      </p>
                    )}

                    {/* Archivos adjuntos para descargar */}
                    {study.attachments && study.attachments.length > 0 ? (
                      <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Paperclip size={13} color="#0284c7" /> Archivos disponibles para descargar:
                        </span>
                        {study.attachments.map(att => {
                          const isPdf = att.isPdf || (att.filename && att.filename.toLowerCase().endsWith('.pdf'));
                          return (
                            <div key={att.id || att.filename} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '0.82rem' }}>
                              <button
                                type="button"
                                onClick={() => setViewingAttachment(att)}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#0369a1', fontWeight: 600, padding: 0, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                title={`Ver ${att.originalName || att.filename}`}
                              >
                                {isPdf ? <FileText size={15} color="#dc2626" /> : <Image size={15} color="#0284c7" />}
                                <span style={{ textDecoration: 'underline' }}>{att.originalName || att.filename}</span>
                              </button>
                              <a
                                href={att.url}
                                download={att.originalName || att.filename}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600, fontSize: '0.78rem', textDecoration: 'none', backgroundColor: '#ffffff', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                title="Descargar archivo"
                              >
                                <Download size={13} /> Descargar
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        Sin archivos adjuntos cargados aún.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL VISOR DE ARCHIVO PARA EL PACIENTE */}
      {viewingAttachment && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1200, backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '92%', maxWidth: '1000px', height: '88vh', backgroundColor: '#ffffff', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
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
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <a
                  href={viewingAttachment.url}
                  download={viewingAttachment.originalName || viewingAttachment.filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', backgroundColor: '#0284c7', color: '#ffffff', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  <Download size={15} /> Descargar
                </a>
                <button
                  type="button"
                  onClick={() => setViewingAttachment(null)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

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
                    alt="Visor de Estudio" 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }} 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
