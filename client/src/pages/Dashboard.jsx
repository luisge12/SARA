import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { 
  Users, Activity, CalendarCheck, FileText, Calendar, Edit3, 
  ArrowRight, Search, Phone, Mail, MapPin, User, Stethoscope, 
  Clock, X, CalendarPlus, FileSpreadsheet, ShieldAlert
} from 'lucide-react';
import { AppointmentModal } from '../components/AppointmentModal';
import api from '../services/api';
import './Dashboard.css';

export function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Roles autorizados para ver datos de pacientes: Master, Administrador, Médico, Recepcionista
  const userRole = (user.role || '').toUpperCase();
  const canViewPatients = ['MASTER', 'ADMINISTRADOR', 'MEDICO', 'MÉDICO', 'RECEPCIONISTA'].includes(userRole);

  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    totalConsultations: 0,
    upcomingAppointments: []
  });
  const [loading, setLoading] = useState(true);

  // Estados de citas
  const [showModal, setShowModal] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);
  const [appointmentPatientId, setAppointmentPatientId] = useState(null);

  // Estados de Pacientes (Modal y Detalle)
  const [showPatientsModal, setShowPatientsModal] = useState(false);
  const [patientsList, setPatientsList] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [selectedPatientDetail, setSelectedPatientDetail] = useState(null);
  const [patientSedeFilter, setPatientSedeFilter] = useState('Todas');

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/stats/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Error al cargar estadísticas del dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const res = await api.get('/api/patients');
      setPatientsList(res.data || []);
    } catch (err) {
      console.error('Error al obtener lista de pacientes:', err);
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();

    window.addEventListener('appointmentCreated', fetchDashboardStats);
    return () => {
      window.removeEventListener('appointmentCreated', fetchDashboardStats);
    };
  }, []);

  const handleOpenPatientsModal = () => {
    if (!canViewPatients) {
      alert('No tienes los permisos requeridos para consultar el listado de pacientes.');
      return;
    }
    fetchPatients();
    setShowPatientsModal(true);
  };

  // Filtrado de pacientes en el modal
  const filteredPatients = patientsList.filter(p => {
    const profile = p.patientProfile || {};
    const name = (p.name || p.username || '').toLowerCase();
    const cedula = (p.identificationNumber || '').toLowerCase();
    const phone = (profile.phone || p.phone || '').toLowerCase();
    const email = (profile.email || p.email || '').toLowerCase();
    const doctor = (profile.treatingDoctor || '').toLowerCase();
    const sede = profile.defaultSede || p.sedeAtencion || 'CENTRAL';

    const matchesSede = patientSedeFilter === 'Todas' || sede === patientSedeFilter;
    const query = patientSearchTerm.toLowerCase();
    const matchesSearch = 
      name.includes(query) || 
      cedula.includes(query) || 
      phone.includes(query) || 
      email.includes(query) ||
      doctor.includes(query);

    return matchesSede && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="module-container" style={{ padding: 0 }}>
        
        {/* Encabezado del Dashboard */}
        <header className="dashboard-header" style={{ flexWrap: 'wrap' }}>
          <div>
            <h1 className="dashboard-title">Resumen General SARA</h1>
            <p className="dashboard-subtitle">
              Bienvenido de nuevo, <strong>{user.name || 'Usuario'}</strong>. Rol: <strong>{user.role || 'Sin rol'}</strong>. Sede: <strong>{user.sedeAtencion || 'No especificada'}</strong>.
            </p>
          </div>
          <div className="dashboard-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <span className="current-date">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            {token ? (
              <div style={{ fontSize: '0.7rem', color: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={token}>
                Sesión Activa: {user.username} ({user.role})
              </div>
            ) : (
              <div style={{ fontSize: '0.7rem', color: 'var(--color-alert)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                No se detectó token de sesión.
              </div>
            )}
          </div>
        </header>

        {/* Tarjetas KPI Interactivas */}
        <div className="kpi-grid">
          
          {/* KPI: PACIENTES REGISTRADOS (CLICKABLE) */}
          <div 
            onClick={handleOpenPatientsModal}
            style={{ cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            title="Haz clic para ver la lista y datos completos de los pacientes"
          >
            <Card className="kpi-card" style={{ border: '2px solid rgba(34, 80, 93, 0.2)', position: 'relative' }}>
              <div className="kpi-content">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <p className="kpi-label" style={{ margin: 0 }}>Pacientes Registrados</p>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      backgroundColor: 'rgba(34, 80, 93, 0.12)', 
                      color: 'var(--color-primary)', 
                      padding: '0.15rem 0.45rem', 
                      borderRadius: '10px', 
                      fontWeight: '700' 
                    }}>
                      Ver Fichas ↗
                    </span>
                  </div>
                  <h3 className="kpi-value">{loading ? '...' : stats.totalPatients}</h3>
                  <p className="kpi-trend positive">
                    <Users size={14} /> Haz clic para ver detalles de pacientes
                  </p>
                </div>
                <div className="kpi-icon-wrapper primary-light">
                  <Users size={24} className="kpi-icon" />
                </div>
              </div>
            </Card>
          </div>

          {/* KPI: CITAS PARA HOY (CLICKABLE -> /citas) */}
          <div 
            onClick={() => navigate('/citas')}
            style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
            title="Haz clic para ir a la agenda de Citas Médicas"
          >
            <Card className="kpi-card" style={{ position: 'relative' }}>
              <div className="kpi-content">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <p className="kpi-label" style={{ margin: 0 }}>Citas para Hoy</p>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      backgroundColor: 'rgba(42, 183, 202, 0.15)', 
                      color: 'var(--color-accent)', 
                      padding: '0.15rem 0.45rem', 
                      borderRadius: '10px', 
                      fontWeight: '700' 
                    }}>
                      Ver Agenda ↗
                    </span>
                  </div>
                  <h3 className="kpi-value">{loading ? '...' : stats.todayAppointments}</h3>
                  <p className="kpi-trend neutral">
                    <CalendarCheck size={14} /> Agendadas para hoy
                  </p>
                </div>
                <div className="kpi-icon-wrapper accent-light">
                  <CalendarCheck size={24} className="kpi-icon" />
                </div>
              </div>
            </Card>
          </div>

          {/* KPI: HISTORIAS / CONSULTAS (CLICKABLE -> /modulo4) */}
          <div 
            onClick={() => navigate('/modulo4')}
            style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
            title="Haz clic para ir a Datos Clínicos e Historias Médicas"
          >
            <Card className="kpi-card" style={{ position: 'relative' }}>
              <div className="kpi-content">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <p className="kpi-label" style={{ margin: 0 }}>Historias / Consultas</p>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      backgroundColor: 'rgba(239, 68, 68, 0.12)', 
                      color: 'var(--color-alert)', 
                      padding: '0.15rem 0.45rem', 
                      borderRadius: '10px', 
                      fontWeight: '700' 
                    }}>
                      Ver Historias ↗
                    </span>
                  </div>
                  <h3 className="kpi-value">{loading ? '...' : stats.totalConsultations}</h3>
                  <p className="kpi-trend positive">
                    <FileText size={14} /> Registros médicos
                  </p>
                </div>
                <div className="kpi-icon-wrapper alert-light">
                  <FileText size={24} className="kpi-icon" />
                </div>
              </div>
            </Card>
          </div>

        </div>

        {/* Listado de Próximas Citas Médicas */}
        <div style={{ width: '100%' }}>
          <Card 
            title="Próximas Citas Médicas" 
            action={
              <Link 
                to="/citas" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  fontSize: '0.85rem', 
                  fontWeight: '600', 
                  color: 'var(--color-primary)', 
                  textDecoration: 'none' 
                }}
              >
                Ver Agenda Completa <ArrowRight size={15} />
              </Link>
            }
          >
            {loading ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando citas...</div>
            ) : !stats.upcomingAppointments || stats.upcomingAppointments.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <Calendar size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <p>No hay citas agendadas próximamente en la base de datos.</p>
              </div>
            ) : (
              <div className="appointment-list">
                {stats.upcomingAppointments.map((apt) => {
                  const aptDate = new Date(apt.appointmentDate);
                  return (
                    <div key={apt.id} className="appointment-item">
                      <div className="appointment-time">
                        <span className="time">{aptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="duration">{aptDate.toLocaleDateString()}</span>
                      </div>
                      <div className="appointment-details">
                        <h4>{apt.patient?.name || apt.patient?.username || 'Paciente Desconocido'}</h4>
                        <p>{apt.reason || 'Consulta Médica'} | Dr: {apt.doctor?.name || 'Por asignar'}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className={`appointment-status status-${(apt.status || 'confirmada').toLowerCase()}`}>
                          {apt.status}
                        </div>
                        <button
                          onClick={() => {
                            setAppointmentToEdit(apt);
                            setShowModal(true);
                          }}
                          style={{
                            backgroundColor: 'var(--color-accent)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.4rem 0.75rem',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                          title="Editar Cita / Pagos"
                        >
                          <Edit3 size={14} /> Editar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: PACIENTES REGISTRADOS (ACCESIBLE PARA MASTER, ADMIN, MEDICO, RECP) */}
      {/* ========================================================================= */}
      {showPatientsModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '1000px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            
            {/* Header del Modal */}
            <div style={{
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--color-bg-main)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  padding: '0.6rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(34, 80, 93, 0.12)',
                  color: 'var(--color-primary)'
                }}>
                  <Users size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--color-primary)', margin: 0 }}>
                    Pacientes Registrados en SARA
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Consulta directa de fichas y datos para {user.role}: <strong>{user.name}</strong>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowPatientsModal(false);
                    navigate('/modulo2');
                  }}
                  style={{ fontSize: '0.85rem' }}
                >
                  Ir a Módulo 2 (Gestión)
                </Button>
                <button 
                  onClick={() => {
                    setShowPatientsModal(false);
                    setSelectedPatientDetail(null);
                  }}
                  style={{ background: 'none', border: 'none', fontSize: '1.75rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                  aria-label="Cerrar modal"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div style={{
              padding: '1rem 1.75rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Buscar paciente por nombre, cédula, teléfono o médico..." 
                  value={patientSearchTerm}
                  onChange={(e) => setPatientSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2.5rem', height: '40px', width: '100%' }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select 
                  className="input-field" 
                  value={patientSedeFilter} 
                  onChange={(e) => setPatientSedeFilter(e.target.value)}
                  style={{ height: '40px', padding: '0.4rem 0.8rem' }}
                >
                  <option value="Todas">Todas las Sedes</option>
                  <option value="CENTRAL">CENTRAL</option>
                  <option value="GMSP">GMSP</option>
                  <option value="CCMLA">CCMLA</option>
                  <option value="PLA">PLA</option>
                </select>
              </div>
            </div>

            {/* Cuerpo del Modal: Lista de Pacientes o Detalle */}
            <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
              
              {loadingPatients ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  Cargando pacientes desde la base de datos...
                </div>
              ) : selectedPatientDetail ? (
                
                /* VISTA DETALLADA DEL PACIENTE SELECCIONADO */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button 
                      onClick={() => setSelectedPatientDetail(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      ← Volver a la lista de pacientes
                    </button>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Button 
                        onClick={() => {
                          setShowPatientsModal(false);
                          navigate('/modulo4');
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                      >
                        <FileText size={15} /> Abrir Historia Clínica (M4)
                      </Button>

                      <Button 
                        variant="outline"
                        onClick={() => {
                          setAppointmentPatientId(selectedPatientDetail.id);
                          setAppointmentToEdit(null);
                          setShowModal(true);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                      >
                        <CalendarPlus size={15} /> Agendar Cita
                      </Button>
                    </div>
                  </div>

                  {/* Ficha Principal del Paciente */}
                  <div style={{
                    backgroundColor: 'var(--color-bg-main)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
                          Ficha Médica y Administrativa del Paciente
                        </span>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)', margin: '0.2rem 0' }}>
                          {selectedPatientDetail.name || selectedPatientDetail.username}
                        </h3>
                        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-main)', margin: 0, fontWeight: '600' }}>
                          Cédula / Identificación: <span style={{ color: 'var(--color-primary)' }}>{selectedPatientDetail.identificationNumber || 'No registrada'}</span>
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <span style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.12)',
                          color: 'var(--color-success)',
                          padding: '0.35rem 0.85rem',
                          borderRadius: '20px',
                          fontWeight: '700',
                          fontSize: '0.85rem'
                        }}>
                          Sede: {selectedPatientDetail.patientProfile?.defaultSede || selectedPatientDetail.sedeAtencion || 'CENTRAL'}
                        </span>
                      </div>
                    </div>

                    {/* Grilla con Datos de Contacto y Médicos */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', fontSize: '0.9rem' }}>
                      <div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>Género</p>
                        <p style={{ fontWeight: '600', color: 'var(--color-text-main)', margin: '0.15rem 0' }}>
                          {selectedPatientDetail.patientProfile?.gender || 'No especificado'}
                        </p>
                      </div>

                      <div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>Fecha de Nacimiento</p>
                        <p style={{ fontWeight: '600', color: 'var(--color-text-main)', margin: '0.15rem 0' }}>
                          {selectedPatientDetail.patientProfile?.dateOfBirth || selectedPatientDetail.patientProfile?.birthDate || 'No registrada'}
                        </p>
                      </div>

                      <div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>Teléfono de Contacto</p>
                        <p style={{ fontWeight: '600', color: 'var(--color-text-main)', margin: '0.15rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Phone size={14} color="var(--color-primary)" />
                          {selectedPatientDetail.patientProfile?.phone || selectedPatientDetail.phone || 'No registrado'}
                        </p>
                      </div>

                      <div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>Correo Electrónico</p>
                        <p style={{ fontWeight: '600', color: 'var(--color-text-main)', margin: '0.15rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Mail size={14} color="var(--color-primary)" />
                          {selectedPatientDetail.patientProfile?.email || selectedPatientDetail.email || 'No registrado'}
                        </p>
                      </div>

                      <div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>Médico Tratante Asignado</p>
                        <p style={{ fontWeight: '600', color: 'var(--color-text-main)', margin: '0.15rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Stethoscope size={14} color="var(--color-accent)" />
                          Dr. {selectedPatientDetail.patientProfile?.treatingDoctor || 'Sin asignar'}
                        </p>
                      </div>

                      <div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>Entidad Remitente</p>
                        <p style={{ fontWeight: '600', color: 'var(--color-text-main)', margin: '0.15rem 0' }}>
                          {selectedPatientDetail.patientProfile?.referringEntity || selectedPatientDetail.patientProfile?.referer || 'Directo / Ninguna'}
                        </p>
                      </div>

                      <div>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>Próxima Cita Pautada</p>
                        <p style={{ fontWeight: '600', color: 'var(--color-text-main)', margin: '0.15rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={14} color="var(--color-success)" />
                          {selectedPatientDetail.patientProfile?.nextAppointment || 'Sin cita programada'}
                        </p>
                      </div>

                      <div style={{ gridColumn: '1 / -1' }}>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>Dirección de Residencia</p>
                        <p style={{ fontWeight: '600', color: 'var(--color-text-main)', margin: '0.15rem 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={14} color="var(--color-primary)" />
                          {selectedPatientDetail.patientProfile?.address || 'No especificada'}
                        </p>
                      </div>
                    </div>

                    {/* Constantes / Signos si están registrados */}
                    {(selectedPatientDetail.patientProfile?.bloodPressure || selectedPatientDetail.patientProfile?.heartRate || selectedPatientDetail.patientProfile?.weightKg) && (
                      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                          Últimos Signos Vitales Registrados:
                        </h4>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                          {selectedPatientDetail.patientProfile?.bloodPressure && (
                            <span style={{ background: '#fff', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                              TA: <strong>{selectedPatientDetail.patientProfile.bloodPressure}</strong>
                            </span>
                          )}
                          {selectedPatientDetail.patientProfile?.heartRate && (
                            <span style={{ background: '#fff', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                              FC: <strong>{selectedPatientDetail.patientProfile.heartRate} lpm</strong>
                            </span>
                          )}
                          {selectedPatientDetail.patientProfile?.weightKg && (
                            <span style={{ background: '#fff', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                              Peso: <strong>{selectedPatientDetail.patientProfile.weightKg} kg</strong>
                            </span>
                          )}
                          {selectedPatientDetail.patientProfile?.heightCm && (
                            <span style={{ background: '#fff', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                              Altura: <strong>{selectedPatientDetail.patientProfile.heightCm} cm</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

              ) : filteredPatients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  <Users size={40} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: '600' }}>No se encontraron pacientes con los criterios de búsqueda.</p>
                </div>
              ) : (

                /* LISTADO DE PACIENTES */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                      Mostrando {filteredPatients.length} paciente(s):
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '600' }}>
                      Selecciona un paciente para ver su ficha completa
                    </span>
                  </div>

                  {filteredPatients.map(patient => {
                    const profile = patient.patientProfile || {};
                    const patientName = patient.name || patient.username || 'Sin Nombre';
                    const cedula = patient.identificationNumber || 'S/N';
                    const phone = profile.phone || patient.phone || 'Sin teléfono';
                    const email = profile.email || patient.email || 'Sin correo';
                    const doctor = profile.treatingDoctor || 'Sin asignar';
                    const sede = profile.defaultSede || patient.sedeAtencion || 'CENTRAL';

                    return (
                      <div 
                        key={patient.id}
                        onClick={() => setSelectedPatientDetail(patient)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1rem 1.25rem',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--color-bg-main)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          flexWrap: 'wrap',
                          gap: '0.75rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                      >
                        <div style={{ flex: 1, minWidth: '240px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h4 style={{ margin: 0, fontWeight: '700', color: 'var(--color-text-main)', fontSize: '1.05rem' }}>
                              {patientName}
                            </h4>
                            <span style={{ 
                              backgroundColor: 'rgba(34, 80, 93, 0.1)', 
                              color: 'var(--color-primary)', 
                              padding: '0.15rem 0.5rem', 
                              borderRadius: '12px', 
                              fontWeight: '700', 
                              fontSize: '0.75rem' 
                            }}>
                              C.I: {cedula}
                            </span>
                          </div>

                          <p style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>
                            📞 {phone} | ✉️ {email} | Dr. {doctor} | Sede: <strong>{sede}</strong>
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPatientDetail(patient);
                            }}
                            style={{
                              backgroundColor: 'var(--color-primary)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.45rem 0.85rem',
                              fontWeight: '600',
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            Ver Datos <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              )}

            </div>

            {/* Footer del Modal */}
            <div style={{
              padding: '1rem 1.75rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--color-bg-main)'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                SARA - Registro Automatizado de Pacientes
              </span>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPatientsModal(false);
                  setSelectedPatientDetail(null);
                }}
              >
                Cerrar
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE AGENDAR / EDITAR CITAS */}
      {showModal && (
        <AppointmentModal 
          initialPatientId={appointmentPatientId}
          appointmentToEdit={appointmentToEdit}
          onClose={() => {
            setShowModal(false);
            setAppointmentToEdit(null);
            setAppointmentPatientId(null);
          }}
          onSuccess={() => {
            window.dispatchEvent(new Event('appointmentCreated'));
          }}
        />
      )}

    </DashboardLayout>
  );
}

export default Dashboard;
