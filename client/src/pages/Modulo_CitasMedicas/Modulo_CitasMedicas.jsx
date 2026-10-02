import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { AppointmentModal } from '../../components/AppointmentModal';
import api from '../../services/api';
import { 
  Calendar, CalendarPlus, CheckCircle, Clock, XCircle, Filter, Search, 
  Trash2, Building2, User, Users, Activity, AlertCircle, RefreshCw, Edit3, CreditCard, DollarSign, List, Calendar as CalendarIcon, ChevronLeft, ChevronRight 
} from 'lucide-react';

function Modulo_CitasMedicas() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);
  const [newAppointmentPrefill, setNewAppointmentPrefill] = useState({ date: null, doctorName: null });

  // Filtros
  const [selectedSede, setSelectedSede] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');

  // Open Dental Calendar View State
  const [viewMode, setViewMode] = useState('calendar'); // 'list' o 'calendar'
  const [calendarDate, setCalendarDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error('Error al obtener citas médicas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    window.addEventListener('appointmentCreated', fetchAppointments);
    return () => {
      window.removeEventListener('appointmentCreated', fetchAppointments);
    };
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/api/appointments/${id}`, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      console.error('Error al actualizar estado de la cita:', err);
      alert('Error al actualizar el estado de la cita.');
    }
  };

  const handleDeleteAppointment = async (id, patientName) => {
    if (!window.confirm(`¿Estás seguro de que deseas cancelar/eliminar la cita de ${patientName || 'este paciente'}?`)) {
      return;
    }
    try {
      await api.delete(`/api/appointments/${id}`);
      fetchAppointments();
    } catch (err) {
      console.error('Error al eliminar la cita:', err);
      alert('Error al eliminar la cita médica.');
    }
  };

  // Filtrado dinámico de citas
  const filteredAppointments = appointments.filter(apt => {
    const matchesSede = selectedSede === 'Todas' || apt.sedeAtencion === selectedSede;
    const matchesStatus = selectedStatus === 'Todas' || apt.status === selectedStatus;
    const patientName = (apt.patient?.name || apt.patient?.username || '').toLowerCase();
    const doctorName = (apt.doctor?.name || apt.doctor?.username || '').toLowerCase();
    const reasonText = (apt.reason || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = patientName.includes(query) || doctorName.includes(query) || reasonText.includes(query);

    return matchesSede && matchesStatus && matchesSearch;
  });

  // Métricas para tarjetas KPI
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const todayCount = appointments.filter(apt => {
    const d = new Date(apt.appointmentDate);
    return d >= startOfDay && d <= endOfDay && apt.status !== 'Cancelada';
  }).length;

  const confirmedCount = appointments.filter(apt => apt.status === 'Confirmada').length;
  const pendingCount = appointments.filter(apt => apt.status === 'Pendiente').length;
  const completedCount = appointments.filter(apt => apt.status === 'Completada').length;
  const solicitadasCount = appointments.filter(apt => apt.status === 'Solicitada').length;

  return (
    <DashboardLayout>
      <div className="module-container" style={{ maxWidth: '100%' }}>
        
        {/* Cabecera Principal */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-primary)' }}>
              Gestión de Citas Médicas
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Módulo de agendamiento, control de agenda diaria y estado de citas para pacientes.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', backgroundColor: 'var(--color-bg-main)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <button 
                onClick={() => setViewMode('list')} 
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', backgroundColor: viewMode === 'list' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--color-text-muted)', cursor: 'pointer', fontWeight: '600' }}
              >
                <List size={16} /> Lista
              </button>
              <button 
                onClick={() => setViewMode('calendar')} 
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', backgroundColor: viewMode === 'calendar' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'calendar' ? 'white' : 'var(--color-text-muted)', cursor: 'pointer', fontWeight: '600' }}
              >
                <CalendarIcon size={16} /> Calendario
              </button>
            </div>
            <Button variant="outline" onClick={fetchAppointments} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RefreshCw size={16} /> Refrescar
            </Button>
            <Button onClick={() => { setSelectedPatientId(null); setAppointmentToEdit(null); setNewAppointmentPrefill({ date: null, doctorName: null }); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarPlus size={18} /> Nueva Cita
            </Button>
          </div>
        </header>

        {/* Resumen KPI de Citas */}
        <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
          <Card className="kpi-card">
            <div className="kpi-content">
              <div>
                <p className="kpi-label">Citas para Hoy</p>
                <h3 className="kpi-value">{loading ? '...' : todayCount}</h3>
                <p className="kpi-trend positive"><Clock size={14} /> Agenda del día</p>
              </div>
              <div className="kpi-icon-wrapper accent-light">
                <Calendar size={24} className="kpi-icon" />
              </div>
            </div>
          </Card>

          <Card className="kpi-card">
            <div className="kpi-content">
              <div>
                <p className="kpi-label">Citas Confirmadas</p>
                <h3 className="kpi-value">{loading ? '...' : confirmedCount}</h3>
                <p className="kpi-trend positive"><CheckCircle size={14} /> Asistencia en espera</p>
              </div>
              <div className="kpi-icon-wrapper primary-light">
                <CheckCircle size={24} className="kpi-icon" />
              </div>
            </div>
          </Card>

          <Card className="kpi-card">
            <div className="kpi-content">
              <div>
                <p className="kpi-label">Completadas</p>
                <h3 className="kpi-value">{loading ? '...' : completedCount}</h3>
                <p className="kpi-trend neutral"><Activity size={14} /> Atendidas con éxito</p>
              </div>
              <div className="kpi-icon-wrapper alert-light">
                <Activity size={24} className="kpi-icon" />
              </div>
            </div>
          </Card>

          <Card className="kpi-card" style={{ borderColor: 'var(--color-accent)' }}>
            <div className="kpi-content">
              <div>
                <p className="kpi-label">Solicitudes Web</p>
                <h3 className="kpi-value">{loading ? '...' : solicitadasCount}</h3>
                <p className="kpi-trend positive"><AlertCircle size={14} /> Por agendar</p>
              </div>
              <div className="kpi-icon-wrapper accent-light">
                <CalendarPlus size={24} className="kpi-icon" />
              </div>
            </div>
          </Card>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <Card className="glass-panel" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Buscador de Citas */}
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Buscar por Paciente, Médico o Motivo..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem', height: '42px', width: '100%' }}
              />
            </div>

            {/* Filtros */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                <Filter size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                <select 
                  className="input-field" 
                  value={selectedSede} 
                  onChange={(e) => setSelectedSede(e.target.value)}
                  style={{ height: '42px', padding: '0.4rem 0.8rem', width: '100%' }}
                >
                  <option value="Todas">Todas las Sedes</option>
                  <option value="CENTRAL">CENTRAL</option>
                  <option value="GMSP">GMSP</option>
                  <option value="CCMLA">CCMLA</option>
                  <option value="PLA">PLA</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                <Activity size={16} style={{ color: 'transparent', flexShrink: 0 }} />
                <select 
                  className="input-field" 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{ height: '42px', padding: '0.4rem 0.8rem', width: '100%' }}
                >
                  <option value="Todas">Todos los Estados</option>
                  <option value="Solicitada">Solicitadas (Web)</option>
                  <option value="Confirmada">Confirmadas</option>
                  <option value="En Sala de Espera">En Sala de Espera</option>
                  <option value="Pendiente">Pendientes</option>
                  <option value="Completada">Completadas</option>
                  <option value="Cancelada">Canceladas</option>
                </select>
              </div>
            </div>

          </div>
        </Card>

        {viewMode === 'list' ? (
          /* Listado Principal de Citas Médicas */
          <Card title={`Listado de Citas Médicas (${filteredAppointments.length})`} action={<Calendar size={20} style={{ color: 'var(--color-primary)' }} />} className="glass-panel">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-muted)' }}>
                Cargando agenda de citas médicas...
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                <Calendar size={42} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                <p style={{ fontSize: '1rem', fontWeight: '500' }}>No se encontraron citas médicas con los filtros seleccionados.</p>
                <Button onClick={() => { setSelectedSede('Todas'); setSelectedStatus('Todas'); setSearchTerm(''); }} variant="outline" style={{ marginTop: '1rem' }}>
                  Limpiar Filtros
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredAppointments.map(apt => {
                  const isUnscheduled = !apt.appointmentDate || apt.status === 'Solicitada';
                  const dateObj = isUnscheduled ? null : new Date(apt.appointmentDate);
                  const patientName = apt.patient?.name || apt.patient?.username || 'Paciente Desconocido';
                  const doctorName = apt.doctor?.name || apt.doctor?.username || 'Por Asignar / Guardia';

                  return (
                    <div 
                      key={apt.id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '1.1rem 1.25rem', 
                        borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--border-color)', 
                        backgroundColor: 'var(--color-bg-main)',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Información de la Cita */}
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: 1, minWidth: '280px' }}>
                        <div style={{ 
                          padding: '0.75rem', 
                          borderRadius: 'var(--radius-md)', 
                          backgroundColor: 'rgba(34, 80, 93, 0.1)', 
                          color: 'var(--color-primary)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '90px'
                        }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>
                            {isUnscheduled ? 'Por Agendar' : dateObj.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                          </span>
                          {!isUnscheduled && (
                            <span style={{ fontSize: '1.05rem', fontWeight: '800' }}>
                              {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 style={{ fontWeight: '700', color: 'var(--color-text-main)', fontSize: '1.05rem', margin: 0 }}>
                            {patientName} {apt.patient?.identificationNumber && `(C.I: ${apt.patient.identificationNumber})`}
                            {apt.priority === 'Alta' || apt.priority === 'Emergencia' ? (
                              <span style={{ marginLeft: '0.5rem', color: 'var(--color-alert)', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', border: '1px solid currentColor' }}>
                                {apt.priority}
                              </span>
                            ) : null}
                          </h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                            Médico Tratante: <strong>Dr. {doctorName}</strong> | Sede: <strong>{apt.sedeAtencion}</strong>
                          </p>
                          {apt.reason && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-main)', marginTop: '0.2rem', fontStyle: 'italic' }}>
                              Motivo: "{apt.reason}"
                            </p>
                          )}
                          {apt.notes && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                              Notas: {apt.notes}
                            </p>
                          )}

                          {/* RESUMEN FINANCIERO / PAGO */}
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem', alignItems: 'center', fontSize: '0.78rem' }}>
                            <span style={{ 
                              padding: '0.2rem 0.55rem', 
                              borderRadius: '12px', 
                              backgroundColor: 'rgba(34, 80, 93, 0.08)', 
                              color: 'var(--color-primary)', 
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <CreditCard size={13} /> {apt.paymentMethod || 'Efectivo'}
                            </span>

                            <span style={{ 
                              padding: '0.2rem 0.55rem', 
                              borderRadius: '12px', 
                              backgroundColor: 'rgba(0, 0, 0, 0.05)', 
                              color: 'var(--color-text-main)', 
                              fontWeight: '600'
                            }}>
                              Total: ${parseFloat(apt.totalAmount || 0).toFixed(2)}
                            </span>

                            <span style={{ 
                              padding: '0.2rem 0.55rem', 
                              borderRadius: '12px', 
                              backgroundColor: 'rgba(16, 185, 129, 0.12)', 
                              color: 'var(--color-success)', 
                              fontWeight: '600'
                            }}>
                              Abonado: ${parseFloat(apt.paidAmount || 0).toFixed(2)}
                            </span>

                            {parseFloat(apt.pendingAmount || 0) > 0 ? (
                              <span style={{ 
                                padding: '0.2rem 0.55rem', 
                                borderRadius: '12px', 
                                backgroundColor: 'rgba(239, 68, 68, 0.15)', 
                                color: 'var(--color-alert)', 
                                fontWeight: '700'
                              }}>
                                Pendiente: ${parseFloat(apt.pendingAmount).toFixed(2)}
                              </span>
                            ) : (
                              <span style={{ 
                                padding: '0.2rem 0.55rem', 
                                borderRadius: '12px', 
                                backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                                color: 'var(--color-success)', 
                                fontWeight: '700'
                              }}>
                                ✓ Pagado Totalmente
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Acciones y Estado */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        
                        <div className="input-group" style={{ margin: 0 }}>
                          <select 
                            className="input-field"
                            value={apt.status}
                            onChange={(e) => handleUpdateStatus(apt.id, e.target.value)}
                            style={{ 
                              height: '36px', 
                              padding: '0.25rem 0.65rem', 
                              fontSize: '0.85rem', 
                              fontWeight: '600',
                              borderRadius: '8px',
                              backgroundColor: 
                                apt.status === 'Confirmada' ? 'rgba(16, 185, 129, 0.15)' :
                                apt.status === 'Completada' ? 'rgba(42, 183, 202, 0.15)' :
                                apt.status === 'Cancelada' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: 
                                apt.status === 'Confirmada' ? 'var(--color-success)' :
                                apt.status === 'Completada' ? 'var(--color-accent)' :
                                apt.status === 'Cancelada' ? 'var(--color-alert)' : '#d97706',
                              border: '1px solid currentColor'
                            }}
                          >
                            <option value="Solicitada">Solicitada</option>
                            <option value="Confirmada">Confirmada</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Completada">Completada</option>
                            <option value="Cancelada">Cancelada</option>
                          </select>
                        </div>

                        <button 
                          onClick={() => { setAppointmentToEdit(apt); setShowModal(true); }}
                          style={{ 
                            backgroundColor: 'var(--color-primary)', 
                            border: 'none', 
                            color: '#ffffff', 
                            cursor: 'pointer',
                            padding: '0.5rem 0.9rem',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontWeight: '700',
                            fontSize: '0.88rem',
                            boxShadow: '0 4px 10px rgba(34, 80, 93, 0.25)',
                            transition: 'all 0.2s ease'
                          }}
                          title="Editar Cita / Registrar Pagos"
                        >
                          <Edit3 size={16} /> Editar Cita
                        </button>

                        <button 
                          onClick={() => handleDeleteAppointment(apt.id, patientName)}
                          style={{ 
                            backgroundColor: 'rgba(239, 68, 68, 0.12)', 
                            border: '1px solid rgba(239, 68, 68, 0.3)', 
                            color: 'var(--color-alert)', 
                            cursor: 'pointer',
                            padding: '0.5rem 0.8rem',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s ease'
                          }}
                          title="Cancelar / Eliminar Cita Médica"
                        >
                          <Trash2 size={16} /> Eliminar
                        </button>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        ) : (
          /* VISTA CALENDARIO OPEN DENTAL STYLE */
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            
            {/* Panel Izquierdo: Sala de Espera y Solicitudes Web */}
            <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* MINI CALENDARIO / SELECTOR DE FECHA */}
              <Card className="glass-panel" style={{ padding: '1rem', borderTop: '4px solid var(--color-primary)' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', textTransform: 'capitalize' }}>
                  <CalendarIcon size={18} /> {new Date(calendarDate + 'T00:00:00').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input 
                    type="date" 
                    className="input-field"
                    value={calendarDate}
                    onChange={(e) => setCalendarDate(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button 
                      onClick={() => {
                        const d = new Date(calendarDate);
                        d.setDate(d.getDate() - 1);
                        setCalendarDate(d.toISOString().split('T')[0]);
                      }}
                      style={{ flex: 1, padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--color-bg-main)', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                    >
                      <ChevronLeft size={16} /> Ayer
                    </button>
                    <button 
                      onClick={() => {
                        const d = new Date();
                        setCalendarDate(d.toISOString().split('T')[0]);
                      }}
                      style={{ flex: 1, padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--color-bg-main)', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Hoy
                    </button>
                    <button 
                      onClick={() => {
                        const d = new Date(calendarDate);
                        d.setDate(d.getDate() + 1);
                        setCalendarDate(d.toISOString().split('T')[0]);
                      }}
                      style={{ flex: 1, padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--color-bg-main)', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                    >
                      Mñn <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </Card>

              {/* SALA DE ESPERA */}
              <Card className="glass-panel" style={{ padding: '1rem', borderTop: '4px solid #3b82f6' }}>
                <h3 style={{ fontSize: '1rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Users size={18} /> Sala de Espera ({appointments.filter(a => a.status === 'En Sala de Espera').length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {appointments.filter(a => a.status === 'En Sala de Espera').map(apt => (
                    <div 
                      key={apt.id} 
                      onClick={() => { setAppointmentToEdit(apt); setShowModal(true); }}
                      style={{ 
                        padding: '0.75rem', 
                        backgroundColor: 'rgba(59, 130, 246, 0.05)', 
                        borderLeft: '4px solid #3b82f6',
                        borderRadius: '0 4px 4px 0',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'}
                    >
                      <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1e3a8a' }}>{apt.patient?.name || apt.patient?.username}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Dr. {apt.doctor?.name || apt.doctor?.username || 'General'}</span>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: 'var(--color-text-main)' }}>{apt.reason}</div>
                    </div>
                  ))}
                  {appointments.filter(a => a.status === 'En Sala de Espera').length === 0 && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>No hay pacientes esperando.</p>
                  )}
                </div>
              </Card>

              {/* SOLICITUDES WEB */}
              <Card className="glass-panel" style={{ padding: '1rem', borderTop: '4px solid #f59e0b' }}>
                <h3 style={{ fontSize: '1rem', color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <AlertCircle size={18} /> Solicitudes Web ({appointments.filter(a => a.status === 'Solicitada').length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '600px', overflowY: 'auto' }}>
                  {appointments.filter(a => a.status === 'Solicitada').map(apt => (
                    <div 
                      key={apt.id} 
                      onClick={() => { setAppointmentToEdit(apt); setShowModal(true); }}
                      style={{ 
                        padding: '0.75rem', 
                        backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                        borderLeft: '4px solid #f59e0b',
                        borderRadius: '0 4px 4px 0',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.2)'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.1)'}
                    >
                      <strong style={{ display: 'block', fontSize: '0.9rem' }}>{apt.patient?.name || apt.patient?.username}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{apt.reason}</span>
                      {apt.priority === 'Alta' || apt.priority === 'Emergencia' ? (
                        <div style={{ color: 'var(--color-alert)', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '0.2rem' }}>Prioridad: {apt.priority}</div>
                      ) : null}
                    </div>
                  ))}
                  {appointments.filter(a => a.status === 'Solicitada').length === 0 && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>No hay solicitudes pendientes.</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Panel Derecho: Calendario Grid */}
            <Card className="glass-panel" style={{ flex: 1, overflowX: 'auto', padding: '1.5rem' }}>
              {(() => {
                const dayAppointments = appointments.filter(a => a.appointmentDate && a.appointmentDate.startsWith(calendarDate) && a.status !== 'Cancelada');
                const doctors = Array.from(new Set(dayAppointments.map(a => a.doctor?.name || 'Sin Asignar')));
                if (doctors.length === 0) doctors.push('General');

                const timeSlots = [];
                for (let h = 0; h <= 23; h++) {
                  timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
                  timeSlots.push(`${h.toString().padStart(2, '0')}:10`);
                  timeSlots.push(`${h.toString().padStart(2, '0')}:20`);
                  timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
                  timeSlots.push(`${h.toString().padStart(2, '0')}:40`);
                  timeSlots.push(`${h.toString().padStart(2, '0')}:50`);
                }

                // Cálculo de la línea de tiempo actual
                const nowTime = new Date();
                const isToday = nowTime.toISOString().split('T')[0] === calendarDate;
                const currentMinutesFrom0 = nowTime.getHours() * 60 + nowTime.getMinutes();
                const showCurrentTimeLine = isToday;
                
                // Header height: 45px. Time slot height: 30px (10 mins).
                // 10 mins = 30px -> 1 min = 3px
                const timeLineTop = 45 + (currentMinutesFrom0 * 3);

                return (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: `80px repeat(${doctors.length}, minmax(300px, 1fr))`,
                    gridAutoRows: 'minmax(30px, auto)',
                    borderTop: '1px solid var(--border-color)',
                    borderLeft: '1px solid var(--border-color)',
                    position: 'relative'
                  }}>
                    {showCurrentTimeLine && (
                      <div style={{
                        position: 'absolute',
                        top: `${timeLineTop}px`,
                        left: 0,
                        right: 0,
                        height: '2px',
                        backgroundColor: '#ef4444',
                        zIndex: 10,
                        pointerEvents: 'none',
                        boxShadow: '0 0 4px rgba(239,68,68,0.5)'
                      }}>
                        <div style={{
                          position: 'absolute',
                          left: '0',
                          top: '-4px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: '#ef4444'
                        }}></div>
                      </div>
                    )}

                    {/* Header Row */}
                    <div style={{ height: '45px', padding: '0.5rem', backgroundColor: 'var(--color-bg-main)', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Hora
                    </div>
                    {doctors.map(doc => (
                      <div key={doc} style={{ height: '45px', padding: '0.5rem', backgroundColor: 'var(--color-bg-main)', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', textAlign: 'center', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {doc === 'General' ? 'Citas' : doc === 'Sin Asignar' ? 'Citas Por Asignar' : `Dr(a). ${doc}`}
                      </div>
                    ))}

                    {/* Time Slots Rows */}
                    {timeSlots.map((time, idx) => {
                      return (
                        <React.Fragment key={time}>
                          <div style={{ height: '30px', padding: '0.2rem', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.75rem', color: time.endsWith('00') ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: time.endsWith('00') ? 'bold' : 'normal', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {time}
                          </div>
                          {doctors.map(doc => {
                            const aptsInSlot = dayAppointments.filter(a => {
                              const d = new Date(a.appointmentDate);
                              const h = d.getHours().toString().padStart(2, '0');
                              // Redondeamos hacia el múltiplo de 10 inferior
                              const mRaw = d.getMinutes();
                              const m = (Math.floor(mRaw / 10) * 10).toString().padStart(2, '0');
                              const aTime = `${h}:${m}`;
                              const aDoc = a.doctor?.name || 'Sin Asignar';
                              return aDoc === doc && aTime === time;
                            });

                            return (
                              <div 
                                key={`${time}-${doc}`} 
                                style={{ 
                                  borderRight: '1px solid var(--border-color)', 
                                  borderBottom: '1px solid var(--border-color)',
                                  position: 'relative',
                                  height: '30px',
                                  backgroundColor: '#fff',
                                  transition: 'background 0.2s ease',
                                  display: 'flex',
                                  gap: '2px',
                                  cursor: 'pointer'
                                }}
                                onMouseOver={e => { e.currentTarget.style.backgroundColor = '#f0f9ff' }}
                                onMouseOut={e => { e.currentTarget.style.backgroundColor = '#fff' }}
                                onClick={() => {
                                  // Set prefill data
                                  setNewAppointmentPrefill({
                                    date: `${calendarDate}T${time}:00`,
                                    doctorName: doc === 'General' || doc === 'Sin Asignar' ? null : doc
                                  });
                                  setAppointmentToEdit(null);
                                  setShowModal(true);
                                }}
                              >
                                {aptsInSlot.map((aptInSlot, i) => {
                                  // Height: 10 mins = 100% height (20px). So duration 30 = 300%
                                  const durationMins = aptInSlot.duration || 30;
                                  const heightPercent = (durationMins / 10) * 100;
                                  
                                  return (
                                    <div 
                                      key={aptInSlot.id}
                                      onClick={(e) => { e.stopPropagation(); setAppointmentToEdit(aptInSlot); setShowModal(true); }}
                                      style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: `${(i / aptsInSlot.length) * 100}%`,
                                        width: `${100 / aptsInSlot.length}%`,
                                        height: `${heightPercent}%`,
                                        zIndex: 5,
                                        backgroundColor: 
                                          aptInSlot.status === 'En Sala de Espera' ? 'rgba(239, 246, 255, 0.95)' :
                                          aptInSlot.status === 'Confirmada' ? 'rgba(236, 253, 245, 0.95)' : 
                                          aptInSlot.status === 'Completada' ? 'rgba(224, 242, 254, 0.95)' : 
                                          'rgba(254, 243, 199, 0.95)',
                                        borderTop: `4px solid ${
                                          aptInSlot.status === 'En Sala de Espera' ? '#3b82f6' :
                                          aptInSlot.status === 'Confirmada' ? '#10b981' : 
                                          aptInSlot.status === 'Completada' ? '#0ea5e9' : 
                                          '#f59e0b'
                                        }`,
                                        borderRight: '1px solid rgba(0,0,0,0.05)',
                                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                                        borderRadius: '2px',
                                        padding: '0.2rem',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                                        overflow: 'hidden'
                                      }}
                                    >
                                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {aptInSlot.patient?.name || aptInSlot.patient?.username}
                                      </div>
                                      {durationMins >= 20 && (
                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {aptInSlot.reason}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </div>
                );
              })()}
            </Card>

          </div>
        )}

      </div>

      {showModal && (
        <AppointmentModal 
          initialPatientId={selectedPatientId}
          appointmentToEdit={appointmentToEdit}
          initialDate={newAppointmentPrefill.date}
          initialDoctorName={newAppointmentPrefill.doctorName}
          onClose={() => { setShowModal(false); setAppointmentToEdit(null); setNewAppointmentPrefill({ date: null, doctorName: null }); }}
          onSuccess={() => {
            fetchAppointments();
          }}
        />
      )}
    </DashboardLayout>
  );
}

export default Modulo_CitasMedicas;
