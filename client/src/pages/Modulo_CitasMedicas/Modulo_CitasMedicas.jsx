import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { AppointmentModal } from '../../components/AppointmentModal';
import api from '../../services/api';
import { 
  Calendar, CalendarPlus, CheckCircle, Clock, XCircle, Filter, Search, 
  Trash2, Building2, User, Users, Activity, AlertCircle, RefreshCw, Edit3, CreditCard, DollarSign, List, Calendar as CalendarIcon, ChevronLeft, ChevronRight, X,
  Lock, Unlock, Sliders
} from 'lucide-react';

const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function Modulo_CitasMedicas() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);
  const [newAppointmentPrefill, setNewAppointmentPrefill] = useState({ date: null, doctorName: null });

  // Filtros y Búsqueda
  const [selectedSede, setSelectedSede] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm.trim());
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveSearchTerm('');
  };

  const handleJumpToCalendarDate = (dateStr) => {
    if (!dateStr) return;
    const targetDate = dateStr.split('T')[0];
    setCalendarDate(targetDate);
    setViewMode('calendar');
    setTimeout(() => {
      const calendarEl = document.getElementById('calendar-grid-section');
      if (calendarEl) {
        calendarEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  // Open Dental Calendar View State
  const [viewMode, setViewMode] = useState('calendar'); // 'list' o 'calendar'
  const [calendarDate, setCalendarDate] = useState(getLocalDateString());

  // Configuración de Horas Visibles del Calendario (Persistente)
  const [startHour, setStartHour] = useState(() => parseInt(localStorage.getItem('sara_calendar_start_hour') || '7', 10));
  const [endHour, setEndHour] = useState(() => parseInt(localStorage.getItem('sara_calendar_end_hour') || '19', 10));
  const [slotInterval, setSlotInterval] = useState(() => parseInt(localStorage.getItem('sara_calendar_slot_interval') || '10', 10));
  const [showScheduleSettings, setShowScheduleSettings] = useState(false);

  // Bloqueo de Celdas / Horarios (Persistente)
  const [blockedSlots, setBlockedSlots] = useState(() => {
    try {
      const saved = localStorage.getItem('sara_calendar_blocked_slots');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modales de Bloqueo y Acciones en Celda
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({
    date: getLocalDateString(),
    startTime: '12:00',
    duration: 60,
    doctorName: 'Todos',
    reason: 'Almuerzo / Descanso',
    customReason: '',
    notes: ''
  });
  const [selectedBlockToView, setSelectedBlockToView] = useState(null);
  const [cellActionData, setCellActionData] = useState(null);
  const [availableDoctors, setAvailableDoctors] = useState([]);

  // Configuración de Roles y Columnas Visibles del Calendario (Persistente)
  const [selectedDoctorNames, setSelectedDoctorNames] = useState(() => {
    try {
      const saved = localStorage.getItem('sara_calendar_selected_doctors');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showRoleSettings, setShowRoleSettings] = useState(false);
  const [filterRoleCategory, setFilterRoleCategory] = useState('Todos');
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);

  const handleUpdateSelectedDoctors = (newList) => {
    setSelectedDoctorNames(newList);
    try {
      if (newList === null) {
        localStorage.removeItem('sara_calendar_selected_doctors');
      } else {
        localStorage.setItem('sara_calendar_selected_doctors', JSON.stringify(newList));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/api/users');
        const docs = res.data.filter(u => u.role !== 'Paciente');
        setAvailableDoctors(docs);
      } catch (err) {
        console.warn('No se pudieron obtener médicos para la lista de bloqueo:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleUpdateSchedule = (newStart, newEnd, newInterval) => {
    const s = parseInt(newStart, 10);
    const e = parseInt(newEnd, 10);
    const i = parseInt(newInterval, 10);
    setStartHour(s);
    setEndHour(e);
    setSlotInterval(i);
    try {
      localStorage.setItem('sara_calendar_start_hour', s.toString());
      localStorage.setItem('sara_calendar_end_hour', e.toString());
      localStorage.setItem('sara_calendar_slot_interval', i.toString());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBlock = () => {
    if (!blockForm.date || !blockForm.startTime) {
      alert('Por favor selecciona fecha y hora de inicio.');
      return;
    }
    const finalReason = blockForm.reason === 'Otro' 
      ? (blockForm.customReason.trim() || 'Bloqueo de horario') 
      : blockForm.reason;

    const newBlock = {
      id: 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      date: blockForm.date,
      startTime: blockForm.startTime,
      duration: parseInt(blockForm.duration || 60, 10),
      doctorName: blockForm.doctorName || 'Todos',
      reason: finalReason,
      notes: blockForm.notes || '',
      createdAt: new Date().toISOString()
    };

    const updated = [...blockedSlots, newBlock];
    setBlockedSlots(updated);
    try {
      localStorage.setItem('sara_calendar_blocked_slots', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setShowBlockModal(false);
  };

  const handleDeleteBlock = (blockId) => {
    if (!window.confirm('¿Deseas desbloquear y liberar este horario?')) return;
    const updated = blockedSlots.filter(b => b.id !== blockId);
    setBlockedSlots(updated);
    try {
      localStorage.setItem('sara_calendar_blocked_slots', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setSelectedBlockToView(null);
  };

  const handleOpenBlockModalForCell = (date, time, doctorName) => {
    setBlockForm({
      date: date || calendarDate,
      startTime: time || '12:00',
      duration: 60,
      doctorName: doctorName || 'Todos',
      reason: 'Almuerzo / Descanso',
      customReason: '',
      notes: ''
    });
    setCellActionData(null);
    setShowBlockModal(true);
  };

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

  // Citas encontradas por el buscador (para mostrar encima del calendario)
  const searchResults = !activeSearchTerm.trim() ? [] : appointments.filter(apt => {
    const query = activeSearchTerm.toLowerCase();
    const patientName = (apt.patient?.name || apt.patient?.username || '').toLowerCase();
    const patientCedula = (apt.patient?.identificationNumber || '').toLowerCase();
    const doctorName = (apt.doctor?.name || apt.doctor?.username || '').toLowerCase();
    const reasonText = (apt.reason || '').toLowerCase();
    const sedeText = (apt.sedeAtencion || '').toLowerCase();
    const notesText = (apt.notes || '').toLowerCase();
    const statusText = (apt.status || '').toLowerCase();

    const matchesSearch = 
      patientName.includes(query) || 
      patientCedula.includes(query) || 
      doctorName.includes(query) || 
      reasonText.includes(query) || 
      sedeText.includes(query) || 
      notesText.includes(query) ||
      statusText.includes(query);

    const matchesSede = selectedSede === 'Todas' || apt.sedeAtencion === selectedSede;
    const matchesStatus = selectedStatus === 'Todas' || apt.status === selectedStatus;

    return matchesSearch && matchesSede && matchesStatus;
  });

  // Filtrado dinámico de citas para la vista de lista
  const filteredAppointments = appointments.filter(apt => {
    const matchesSede = selectedSede === 'Todas' || apt.sedeAtencion === selectedSede;
    const matchesStatus = selectedStatus === 'Todas' || apt.status === selectedStatus;
    const query = (activeSearchTerm || searchTerm).toLowerCase().trim();

    if (!query) {
      return matchesSede && matchesStatus;
    }

    const patientName = (apt.patient?.name || apt.patient?.username || '').toLowerCase();
    const patientCedula = (apt.patient?.identificationNumber || '').toLowerCase();
    const doctorName = (apt.doctor?.name || apt.doctor?.username || '').toLowerCase();
    const reasonText = (apt.reason || '').toLowerCase();
    const sedeText = (apt.sedeAtencion || '').toLowerCase();

    const matchesSearch = 
      patientName.includes(query) || 
      patientCedula.includes(query) || 
      doctorName.includes(query) || 
      reasonText.includes(query) || 
      sedeText.includes(query);

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
            
            {/* Buscador de Citas con Botón Buscar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              style={{ 
                display: 'flex', 
                gap: '0.75rem', 
                alignItems: 'center', 
                width: '100%',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ position: 'relative', flex: '1 1 320px' }}>
                <Search 
                  size={18} 
                  style={{ 
                    position: 'absolute', 
                    left: '0.85rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--color-primary)',
                    pointerEvents: 'none'
                  }} 
                />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Buscar citas por Paciente, C.I., Médico, Sede o Motivo..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  style={{ 
                    paddingLeft: '2.6rem', 
                    paddingRight: searchTerm ? '2.5rem' : '1rem',
                    height: '44px', 
                    width: '100%',
                    fontSize: '0.92rem'
                  }}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      opacity: 0.7
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                    title="Borrar texto"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <Button 
                type="submit" 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  height: '44px', 
                  padding: '0 1.5rem',
                  fontWeight: '700',
                  fontSize: '0.92rem',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 3px 8px rgba(34, 80, 93, 0.25)',
                  flexShrink: 0
                }}
              >
                <Search size={16} /> Buscar
              </Button>

              {activeSearchTerm && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleClearSearch}
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.4rem', 
                    height: '44px', 
                    padding: '0 1rem',
                    fontSize: '0.88rem',
                    color: 'var(--color-text-muted)',
                    flexShrink: 0
                  }}
                >
                  <RefreshCw size={14} /> Limpiar Búsqueda
                </Button>
              )}
            </form>

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

        {/* Panel de Citas Encontradas (Encima del Calendario) */}
        {activeSearchTerm && (
          <Card 
            className="glass-panel" 
            style={{ 
              marginBottom: '1.5rem', 
              border: '2px solid var(--color-primary)',
              boxShadow: '0 8px 24px rgba(34, 80, 93, 0.12)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden'
            }}
          >
            {/* Header del Panel de Resultados */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.85rem 1.25rem',
              backgroundColor: 'rgba(34, 80, 93, 0.06)',
              borderBottom: '1px solid var(--border-color)',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  padding: '0.4rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Search size={18} />
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '700', 
                    color: 'var(--color-primary)', 
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    Citas que coinciden con: <span style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>"{activeSearchTerm}"</span>
                  </h3>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Resultados encontrados. Puedes ver el día en el calendario, editar los detalles o gestionar pagos.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ 
                  backgroundColor: searchResults.length > 0 ? 'var(--color-primary)' : '#64748b', 
                  color: 'white', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '20px', 
                  fontSize: '0.85rem', 
                  fontWeight: '700',
                  letterSpacing: '0.3px'
                }}>
                  {searchResults.length} {searchResults.length === 1 ? 'Cita encontrada' : 'Citas encontradas'}
                </span>
                <button
                  onClick={handleClearSearch}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: '0.35rem 0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}
                  title="Cerrar resultados de búsqueda"
                >
                  <X size={15} /> Cerrar
                </button>
              </div>
            </div>

            {/* Contenido de Resultados */}
            <div style={{ padding: '1.25rem' }}>
              {searchResults.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2.5rem 1rem', 
                  backgroundColor: 'var(--color-bg-main)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-color)'
                }}>
                  <AlertCircle size={40} style={{ color: '#d97706', marginBottom: '0.75rem', opacity: 0.8 }} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-text-main)', marginBottom: '0.3rem' }}>
                    No se encontraron citas que coincidan con "{activeSearchTerm}"
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '520px', margin: '0 auto 1rem auto' }}>
                    Verifica la ortografía o intenta buscar por otro criterio (nombre, apellido, cédula de identidad, médico o motivo de consulta).
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleClearSearch}
                    style={{ fontSize: '0.85rem' }}
                  >
                    Mostrar todas las citas
                  </Button>
                </div>
              ) : (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
                  gap: '1rem',
                  maxHeight: '480px',
                  overflowY: 'auto',
                  paddingRight: '0.3rem'
                }}>
                  {searchResults.map(apt => {
                    const isUnscheduled = !apt.appointmentDate || apt.status === 'Solicitada';
                    const dateObj = isUnscheduled ? null : new Date(apt.appointmentDate);
                    const dateStr = isUnscheduled ? null : apt.appointmentDate.split('T')[0];
                    const isToday = isUnscheduled ? false : dateStr === getLocalDateString();
                    const patientName = apt.patient?.name || apt.patient?.username || 'Paciente Desconocido';
                    const patientCedula = apt.patient?.identificationNumber;
                    const doctorName = apt.doctor?.name || apt.doctor?.username || 'Sin Asignar';

                    const statusColors = {
                      'Confirmada': { bg: 'rgba(16, 185, 129, 0.12)', text: 'var(--color-success)', border: '#10b981' },
                      'En Sala de Espera': { bg: 'rgba(59, 130, 246, 0.12)', text: '#2563eb', border: '#3b82f6' },
                      'Solicitada': { bg: 'rgba(245, 158, 11, 0.12)', text: '#d97706', border: '#f59e0b' },
                      'Pendiente': { bg: 'rgba(217, 119, 6, 0.12)', text: '#d97706', border: '#f59e0b' },
                      'Completada': { bg: 'rgba(42, 183, 202, 0.12)', text: 'var(--color-accent)', border: '#2ab7ca' },
                      'Cancelada': { bg: 'rgba(239, 68, 68, 0.12)', text: 'var(--color-alert)', border: '#ef4444' },
                    };
                    const currentStatusColor = statusColors[apt.status] || { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748b', border: '#94a3b8' };

                    return (
                      <div 
                        key={apt.id}
                        style={{
                          backgroundColor: 'var(--color-bg-card)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          borderLeft: `5px solid ${currentStatusColor.border}`,
                          padding: '1.1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.85rem',
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.08)';
                          e.currentTarget.style.borderColor = 'var(--color-accent)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                          e.currentTarget.style.borderLeft = `5px solid ${currentStatusColor.border}`;
                        }}
                      >
                        {/* Cabecera de la tarjeta: Paciente y Estado */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(34, 80, 93, 0.12)',
                                color: 'var(--color-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                fontSize: '0.9rem'
                              }}>
                                {patientName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '700', color: 'var(--color-text-main)' }}>
                                  {patientName}
                                </h4>
                                {patientCedula && (
                                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                    C.I: <strong>{patientCedula}</strong>
                                  </span>
                                )}
                              </div>
                            </div>

                            <span style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              backgroundColor: currentStatusColor.bg,
                              color: currentStatusColor.text,
                              border: `1px solid ${currentStatusColor.border}`,
                              whiteSpace: 'nowrap'
                            }}>
                              {apt.status}
                            </span>
                          </div>

                          {/* Prioridad si aplica */}
                          {(apt.priority === 'Alta' || apt.priority === 'Emergencia') && (
                            <div style={{ marginBottom: '0.4rem' }}>
                              <span style={{
                                color: 'var(--color-alert)',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)'
                              }}>
                                Prioridad: {apt.priority}
                              </span>
                            </div>
                          )}

                          {/* Fecha y Hora */}
                          <div style={{ 
                            backgroundColor: 'var(--color-bg-main)', 
                            padding: '0.5rem 0.75rem', 
                            borderRadius: '6px', 
                            margin: '0.5rem 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem',
                            fontSize: '0.83rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: '600' }}>
                              <CalendarIcon size={15} />
                              <span>
                                {isUnscheduled 
                                  ? 'Fecha pendiente por agendar' 
                                  : dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            {!isUnscheduled && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700', color: 'var(--color-text-main)' }}>
                                <Clock size={14} style={{ color: 'var(--color-text-muted)' }} />
                                <span>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {isToday && (
                                  <span style={{ backgroundColor: 'var(--color-alert)', color: 'white', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>
                                    HOY
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Médico y Sede */}
                          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <User size={13} style={{ color: 'var(--color-primary)' }} />
                              <span>Médico: <strong style={{ color: 'var(--color-text-main)' }}>Dr(a). {doctorName}</strong></span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Building2 size={13} style={{ color: 'var(--color-accent)' }} />
                              <span>Sede: <strong>{apt.sedeAtencion || 'CENTRAL'}</strong></span>
                            </div>
                          </div>

                          {/* Motivo */}
                          {apt.reason && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-main)', marginTop: '0.4rem', fontStyle: 'italic', backgroundColor: 'rgba(0,0,0,0.02)', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
                              Motivo: "{apt.reason}"
                            </div>
                          )}

                          {/* Resumen de pago si existe */}
                          {apt.totalAmount > 0 && (
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem', fontSize: '0.74rem' }}>
                              <span style={{ padding: '0.15rem 0.45rem', borderRadius: '10px', backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--color-text-main)', fontWeight: '600' }}>
                                Total: ${parseFloat(apt.totalAmount).toFixed(2)}
                              </span>
                              {parseFloat(apt.pendingAmount || 0) > 0 ? (
                                <span style={{ padding: '0.15rem 0.45rem', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: 'var(--color-alert)', fontWeight: '700' }}>
                                  Pendiente: ${parseFloat(apt.pendingAmount).toFixed(2)}
                                </span>
                              ) : (
                                <span style={{ padding: '0.15rem 0.45rem', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)', fontWeight: '700' }}>
                                  ✓ Pagado
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Acciones de la tarjeta */}
                        <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                          {dateStr && (
                            <button
                              onClick={() => handleJumpToCalendarDate(dateStr)}
                              style={{
                                flex: 1,
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.45rem 0.6rem',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.35rem',
                                transition: 'background 0.2s'
                              }}
                              title="Ver este día en el calendario"
                            >
                              <CalendarIcon size={14} /> Ver en Calendario
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setAppointmentToEdit(apt);
                              setShowModal(true);
                            }}
                            style={{
                              flex: dateStr ? '0 0 auto' : 1,
                              backgroundColor: 'transparent',
                              color: 'var(--color-primary)',
                              border: '1px solid var(--color-primary)',
                              borderRadius: '6px',
                              padding: '0.45rem 0.75rem',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem'
                            }}
                            title="Editar cita o registrar pagos"
                          >
                            <Edit3 size={14} /> Editar
                          </button>

                          <button
                            onClick={() => handleDeleteAppointment(apt.id, patientName)}
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.08)',
                              color: 'var(--color-alert)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              borderRadius: '6px',
                              padding: '0.45rem 0.55rem',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Eliminar cita"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        )}

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
                <Button onClick={() => { setSelectedSede('Todas'); setSelectedStatus('Todas'); setSearchTerm(''); setActiveSearchTerm(''); }} variant="outline" style={{ marginTop: '1rem' }}>
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
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', width: '100%', minWidth: 0 }}>
            
            {/* Panel Izquierdo: Sala de Espera y Solicitudes Web */}
            {showLeftSidebar && (
              <div style={{ width: '260px', minWidth: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
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
                        const d = new Date(calendarDate + 'T00:00:00');
                        d.setDate(d.getDate() - 1);
                        setCalendarDate(getLocalDateString(d));
                      }}
                      style={{ flex: 1, padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--color-bg-main)', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                    >
                      <ChevronLeft size={16} /> Ayer
                    </button>
                    <button 
                      onClick={() => {
                        setCalendarDate(getLocalDateString());
                      }}
                      style={{ flex: 1, padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--color-bg-main)', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Hoy
                    </button>
                    <button 
                      onClick={() => {
                        const d = new Date(calendarDate + 'T00:00:00');
                        d.setDate(d.getDate() + 1);
                        setCalendarDate(getLocalDateString(d));
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
          )}

          {/* Panel Derecho: Calendario Grid */}
          <Card 
            id="calendar-grid-section" 
            className="glass-panel" 
            style={{ 
              flex: '1 1 0%', 
              minWidth: 0, 
              width: '100%', 
              overflowX: 'hidden', 
              padding: '1.25rem' 
            }}
          >
            {(() => {
              const dayAppointments = appointments.filter(a => a.appointmentDate && a.appointmentDate.startsWith(calendarDate) && a.status !== 'Cancelada');
              const dayBlockedSlots = blockedSlots.filter(b => b.date === calendarDate);

              // Doctores presentes en citas, bloqueos o doctores disponibles del staff
              const docNamesFromAppointments = dayAppointments.map(a => a.doctor?.name || (a.doctor?.username ? a.doctor.username : 'Sin Asignar'));
              const docNamesFromBlocks = dayBlockedSlots.filter(b => b.doctorName && b.doctorName !== 'Todos').map(b => b.doctorName);
              const docNamesFromAvailable = availableDoctors.map(d => d.name || d.username).filter(Boolean);

              // Lista consolidada de todos los posibles doctores / columnas
              const allCandidateNames = Array.from(new Set([
                ...docNamesFromAppointments,
                ...docNamesFromBlocks,
                ...docNamesFromAvailable
              ])).filter(Boolean);

              if (allCandidateNames.length === 0) {
                allCandidateNames.push('General');
              }

              // Metadata de roles y citas para cada doctor candidato
              const candidateMetadata = allCandidateNames.map(name => {
                const staffObj = availableDoctors.find(u => u.name === name || u.username === name);
                const aptCount = dayAppointments.filter(a => (a.doctor?.name || a.doctor?.username || 'Sin Asignar') === name).length;
                const blkCount = dayBlockedSlots.filter(b => b.doctorName === name).length;

                let role = 'Médico';
                let specialty = '';
                if (name === 'Sin Asignar') {
                  role = 'Por Asignar';
                } else if (name === 'General') {
                  role = 'General';
                } else if (staffObj) {
                  role = staffObj.role || 'Médico';
                  specialty = staffObj.specialty || '';
                }

                return {
                  name,
                  role,
                  specialty,
                  appointmentsCount: aptCount,
                  blocksCount: blkCount,
                  hasActivityToday: aptCount > 0 || blkCount > 0
                };
              });

              // Categorías de roles únicas para el filtro rápido
              const availableRoleCategories = ['Todos', ...Array.from(new Set(candidateMetadata.map(c => c.role))).filter(Boolean)];

              // Determinar columnas efectivas visibles
              let effectiveDoctors = [];
              if (selectedDoctorNames && Array.isArray(selectedDoctorNames) && selectedDoctorNames.length > 0) {
                effectiveDoctors = selectedDoctorNames.filter(name => allCandidateNames.includes(name));
                if (effectiveDoctors.length === 0) {
                  effectiveDoctors = allCandidateNames.slice(0, 4);
                }
              } else {
                // Modo inteligente automático
                const withActivity = candidateMetadata.filter(c => c.hasActivityToday).map(c => c.name);
                if (withActivity.length > 0) {
                  effectiveDoctors = withActivity;
                } else {
                  effectiveDoctors = allCandidateNames.slice(0, 4);
                }
              }
              if (effectiveDoctors.length === 0) {
                effectiveDoctors = ['General'];
              }

              // Rango horario dinámico
              const effectiveStart = Math.min(startHour, endHour);
              const effectiveEnd = Math.max(startHour, endHour);

              const timeSlots = [];
              for (let h = effectiveStart; h <= effectiveEnd; h++) {
                for (let m = 0; m < 60; m += slotInterval) {
                  if (h === effectiveEnd && m > 0) break;
                  timeSlots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
                }
              }

              // Cálculo de la línea de tiempo actual y horas pasadas
              const nowTime = new Date();
              const todayStr = getLocalDateString(nowTime);
              const isToday = calendarDate === todayStr;
              const isPastDay = calendarDate < todayStr;
              const currentMinutesFrom0 = nowTime.getHours() * 60 + nowTime.getMinutes();

              const startMinutesFrom0 = effectiveStart * 60;
              const endMinutesFrom0 = (effectiveEnd * 60) + (effectiveEnd === 23 ? 59 : 0);
              const isWithinView = currentMinutesFrom0 >= startMinutesFrom0 && currentMinutesFrom0 <= endMinutesFrom0;
              const showCurrentTimeLine = isToday && isWithinView;
              
              // Header height: 50px. Slot height: 30px per slotInterval minutes -> 1 min = (30 / slotInterval) px
              const headerHeight = 50;
              const timeLineTop = headerHeight + ((currentMinutesFrom0 - startMinutesFrom0) * (30 / slotInterval));

              return (
                <div>
                  {/* Barra informativa de la agenda, controles de horario, roles y bloqueo */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <CalendarIcon size={18} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ fontWeight: '700', color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
                        Agenda: {new Date(calendarDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      {isToday && (
                        <span style={{ backgroundColor: 'var(--color-alert)', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>
                          HOY
                        </span>
                      )}
                      {isPastDay && (
                        <span style={{ backgroundColor: '#64748b', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                          HISTÓRICO
                        </span>
                      )}
                    </div>

                    {/* Botones de Acción: Barra Lateral, Roles/Columnas, Ajustar Horas y Bloquear */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {/* Botón para alternar visibilidad de panel lateral */}
                      <button
                        onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.45rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--color-bg-main)',
                          color: 'var(--color-text-muted)',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: '600',
                          transition: 'all 0.2s ease'
                        }}
                        title={showLeftSidebar ? "Ocultar panel lateral para ampliar el calendario al ancho completo" : "Mostrar panel lateral"}
                      >
                        {showLeftSidebar ? '◀ Ocultar Barra' : '▶ Ver Barra'}
                      </button>

                      {/* Botón para Ajustar Roles / Columnas */}
                      <button
                        onClick={() => {
                          setShowRoleSettings(!showRoleSettings);
                          if (showScheduleSettings) setShowScheduleSettings(false);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          border: showRoleSettings ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                          backgroundColor: showRoleSettings ? 'var(--color-primary)' : 'var(--color-bg-main)',
                          color: showRoleSettings ? 'white' : 'var(--color-text-main)',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                          boxShadow: showRoleSettings ? '0 0 0 2px rgba(59, 130, 246, 0.25)' : 'none'
                        }}
                        title="Ajustar y seleccionar qué roles o doctores se muestran como columnas"
                      >
                        <Users size={14} />
                        Roles / Columnas ({effectiveDoctors.length})
                      </button>

                      {/* Botón para Ajustar Horas */}
                      <button
                        onClick={() => {
                          setShowScheduleSettings(!showScheduleSettings);
                          if (showRoleSettings) setShowRoleSettings(false);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          border: showScheduleSettings ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                          backgroundColor: showScheduleSettings ? 'var(--color-primary)' : 'var(--color-bg-main)',
                          color: showScheduleSettings ? 'white' : 'var(--color-text-main)',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: '600',
                          transition: 'all 0.2s ease'
                        }}
                        title="Ajustar horas visibles e intervalo del calendario"
                      >
                        <Sliders size={14} />
                        Horas: {startHour.toString().padStart(2, '0')}:00 - {endHour.toString().padStart(2, '0')}:00 ({slotInterval}m)
                      </button>

                      {/* Botón Bloquear Horario */}
                      <button
                        onClick={() => handleOpenBlockModalForCell(calendarDate, '12:00', 'Todos')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '6px',
                          border: '1px solid #d97706',
                          backgroundColor: 'rgba(245, 158, 11, 0.12)',
                          color: '#b45309',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          transition: 'all 0.2s ease'
                        }}
                        title="Bloquear un horario (almuerzo, descanso, reunión, etc.)"
                      >
                        <Lock size={14} />
                        Bloquear Horario
                      </button>

                      {dayBlockedSlots.length > 0 && (
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '12px',
                          border: '1px solid #fde68a',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}>
                          🔒 {dayBlockedSlots.length} bloqueo{dayBlockedSlots.length !== 1 ? 's' : ''} hoy
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Panel Desplegable: Configuración de Roles y Columnas */}
                  {showRoleSettings && (
                    <div style={{
                      backgroundColor: 'var(--color-bg-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Users size={16} /> Ajustar Roles y Columnas Visibles del Calendario
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Selecciona qué roles o profesionales mostrar como columnas. Todas se adaptan automáticamente a la pantalla sin scroll horizontal.
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleUpdateSelectedDoctors(allCandidateNames)}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer', fontWeight: '600' }}
                            title="Mostrar todos los roles y profesionales registrados"
                          >
                            Ver Todos ({allCandidateNames.length})
                          </button>
                          <button
                            onClick={() => {
                              const withAppts = candidateMetadata.filter(c => c.hasActivityToday).map(c => c.name);
                              handleUpdateSelectedDoctors(withAppts.length > 0 ? withAppts : allCandidateNames.slice(0, 3));
                            }}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer', fontWeight: '600' }}
                            title="Mostrar únicamente los doctores que tienen citas hoy"
                          >
                            Solo Activos Hoy
                          </button>
                          <button
                            onClick={() => handleUpdateSelectedDoctors(null)}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: '#f1f5f9', color: '#475569', cursor: 'pointer', fontWeight: '600' }}
                            title="Volver a la selección automática según actividad diaria"
                          >
                            Restablecer Automático
                          </button>
                          <button 
                            onClick={() => setShowRoleSettings(false)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '2px', display: 'flex' }}
                            title="Cerrar panel de roles"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Filtro por Categoría de Rol */}
                      {availableRoleCategories.length > 2 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', paddingTop: '0.35rem', borderTop: '1px dashed var(--border-color)' }}>
                          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Filtrar por rol:</span>
                          {availableRoleCategories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => setFilterRoleCategory(cat)}
                              style={{
                                padding: '0.2rem 0.55rem',
                                fontSize: '0.72rem',
                                borderRadius: '12px',
                                border: filterRoleCategory === cat ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                                backgroundColor: filterRoleCategory === cat ? 'var(--color-primary)' : 'white',
                                color: filterRoleCategory === cat ? 'white' : 'var(--color-text-main)',
                                cursor: 'pointer',
                                fontWeight: filterRoleCategory === cat ? '700' : '500'
                              }}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Grilla de Checkboxes de Doctores / Roles */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', 
                        gap: '0.5rem', 
                        maxHeight: '190px', 
                        overflowY: 'auto',
                        padding: '0.3rem 0'
                      }}>
                        {candidateMetadata
                          .filter(c => filterRoleCategory === 'Todos' || c.role === filterRoleCategory)
                          .map(c => {
                            const isChecked = effectiveDoctors.includes(c.name);
                            return (
                              <label 
                                key={c.name}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.45rem 0.65rem',
                                  borderRadius: '6px',
                                  border: isChecked ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                                  backgroundColor: isChecked ? 'rgba(59, 130, 246, 0.08)' : 'white',
                                  cursor: 'pointer',
                                  userSelect: 'none',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    let updated;
                                    if (isChecked) {
                                      if (effectiveDoctors.length <= 1) {
                                        alert('Debe quedar al menos una columna visible en el calendario.');
                                        return;
                                      }
                                      updated = effectiveDoctors.filter(d => d !== c.name);
                                    } else {
                                      updated = [...effectiveDoctors, c.name];
                                    }
                                    handleUpdateSelectedDoctors(updated);
                                  }}
                                  style={{ cursor: 'pointer' }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {c.name === 'General' ? 'Citas Generales' : c.name === 'Sin Asignar' ? 'Por Asignar' : `Dr(a). ${c.name}`}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '1px' }}>
                                    <span style={{ fontSize: '0.64rem', color: '#1e40af', backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: '0 4px', borderRadius: '3px' }}>
                                      {c.role}
                                    </span>
                                    {c.appointmentsCount > 0 && (
                                      <span style={{ fontSize: '0.64rem', color: '#047857', fontWeight: '600' }}>
                                        • {c.appointmentsCount} cita{c.appointmentsCount !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Panel Desplegable: Ajustes de Horario */}
                  {showScheduleSettings && (
                    <div style={{
                      backgroundColor: 'var(--color-bg-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={16} /> Ajustar Rango Horario e Intervalo Visible
                        </span>
                        <button 
                          onClick={() => setShowScheduleSettings(false)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                        >
                          <X size={15} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', alignItems: 'flex-end' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                            Hora de Inicio
                          </label>
                          <select
                            value={startHour}
                            onChange={(e) => handleUpdateSchedule(e.target.value, endHour, slotInterval)}
                            className="input-field"
                            style={{ height: '36px', padding: '0.3rem 0.6rem', fontSize: '0.85rem', width: '100%' }}
                          >
                            {Array.from({ length: 24 }).map((_, i) => (
                              <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                            Hora de Fin
                          </label>
                          <select
                            value={endHour}
                            onChange={(e) => handleUpdateSchedule(startHour, e.target.value, slotInterval)}
                            className="input-field"
                            style={{ height: '36px', padding: '0.3rem 0.6rem', fontSize: '0.85rem', width: '100%' }}
                          >
                            {Array.from({ length: 24 }).map((_, i) => (
                              <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                            Intervalo de Celdas
                          </label>
                          <select
                            value={slotInterval}
                            onChange={(e) => handleUpdateSchedule(startHour, endHour, e.target.value)}
                            className="input-field"
                            style={{ height: '36px', padding: '0.3rem 0.6rem', fontSize: '0.85rem', width: '100%' }}
                          >
                            <option value="10">Cada 10 minutos (Detalle fino)</option>
                            <option value="15">Cada 15 minutos (Estándar)</option>
                            <option value="20">Cada 20 minutos</option>
                            <option value="30">Cada 30 minutos (Compacto)</option>
                            <option value="60">Cada 1 hora (Resumido)</option>
                          </select>
                        </div>

                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleUpdateSchedule(7, 19, 15)}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer', fontWeight: '600' }}
                            title="07:00 a 19:00, cada 15 min"
                          >
                            Clínico (07-19h)
                          </button>
                          <button
                            onClick={() => handleUpdateSchedule(8, 20, 20)}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer', fontWeight: '600' }}
                            title="08:00 a 20:00, cada 20 min"
                          >
                            Comercial (08-20h)
                          </button>
                          <button
                            onClick={() => handleUpdateSchedule(0, 23, 30)}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer', fontWeight: '600' }}
                            title="24 Horas completo, cada 30 min"
                          >
                            24 Horas
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Leyenda Visual */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'repeating-linear-gradient(45deg, #f8fafc, #f8fafc 3px, #cbd5e1 3px, #cbd5e1 6px)', border: '1px solid #cbd5e1', display: 'inline-block' }}></span>
                      Horas pasadas (bloqueadas)
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'repeating-linear-gradient(45deg, #fef3c7, #fef3c7 3px, #fde68a 3px, #fde68a 6px)', border: '1px solid #d97706', display: 'inline-block' }}></span>
                      Horario bloqueado (pausa/almuerzo)
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#fff', border: '1px solid var(--border-color)', display: 'inline-block' }}></span>
                      Disponible para agendar
                    </span>
                  </div>

                  {/* Grilla Principal del Calendario - Se ajusta al 100% de la pantalla sin scroll horizontal */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: `60px repeat(${effectiveDoctors.length}, minmax(0, 1fr))`,
                    gridAutoRows: 'minmax(30px, auto)',
                    borderTop: '1px solid var(--border-color)',
                    borderLeft: '1px solid var(--border-color)',
                    position: 'relative',
                    width: '100%',
                    boxSizing: 'border-box'
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
                    <div style={{ 
                      height: '50px', 
                      padding: '0.25rem', 
                      backgroundColor: 'var(--color-bg-main)', 
                      borderRight: '1px solid var(--border-color)', 
                      borderBottom: '1px solid var(--border-color)', 
                      fontWeight: 'bold', 
                      textAlign: 'center', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.76rem',
                      color: 'var(--color-text-muted)'
                    }}>
                      Hora
                    </div>
                    {effectiveDoctors.map(doc => {
                      const meta = candidateMetadata.find(c => c.name === doc);
                      const roleText = meta ? meta.role : (doc === 'General' ? 'General' : doc === 'Sin Asignar' ? 'Por Asignar' : 'Médico');
                      const displayName = doc === 'General' ? 'Citas Generales' : doc === 'Sin Asignar' ? 'Por Asignar' : `Dr(a). ${doc}`;
                      const aptCount = meta ? meta.appointmentsCount : 0;
                      const isManyColumns = effectiveDoctors.length > 4;

                      return (
                        <div 
                          key={doc} 
                          style={{ 
                            height: '50px', 
                            padding: '0.3rem 0.25rem', 
                            backgroundColor: 'var(--color-bg-main)', 
                            borderRight: '1px solid var(--border-color)', 
                            borderBottom: '1px solid var(--border-color)', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            overflow: 'hidden',
                            minWidth: 0,
                            boxSizing: 'border-box'
                          }}
                          title={`${displayName} — Rol: ${roleText} (${aptCount} cita${aptCount !== 1 ? 's' : ''} hoy)`}
                        >
                          <div style={{ 
                            fontWeight: '700', 
                            textAlign: 'center', 
                            color: 'var(--color-primary)', 
                            fontSize: isManyColumns ? '0.74rem' : '0.82rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: '100%'
                          }}>
                            {displayName}
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.25rem', 
                            marginTop: '2px', 
                            maxWidth: '100%',
                            justifyContent: 'center' 
                          }}>
                            <span style={{ 
                              fontSize: '0.62rem', 
                              fontWeight: '600',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              backgroundColor: roleText === 'Médico' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                              color: roleText === 'Médico' ? '#1d4ed8' : '#475569',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '90px'
                            }}>
                              {roleText}
                            </span>
                            {aptCount > 0 && (
                              <span style={{ 
                                fontSize: '0.62rem', 
                                fontWeight: '700', 
                                backgroundColor: '#10b981', 
                                color: 'white', 
                                borderRadius: '8px', 
                                padding: '0px 4px',
                                flexShrink: 0
                              }} title={`${aptCount} citas hoy`}>
                                {aptCount}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Time Slots Rows */}
                    {timeSlots.map((time, idx) => {
                      const [slotH, slotM] = time.split(':').map(Number);
                      const slotMinutes = slotH * 60 + slotM;
                      const isPastSlot = isPastDay || (isToday && slotMinutes < currentMinutesFrom0);

                      return (
                        <React.Fragment key={time}>
                          <div style={{ 
                            height: '30px', 
                            padding: '0.15rem', 
                            borderRight: '1px solid var(--border-color)', 
                            borderBottom: '1px solid var(--border-color)', 
                            textAlign: 'center', 
                            fontSize: '0.72rem', 
                            color: isPastSlot ? '#94a3b8' : (time.endsWith('00') ? 'var(--color-primary)' : 'var(--color-text-muted)'), 
                            fontWeight: time.endsWith('00') ? 'bold' : 'normal', 
                            backgroundColor: isPastSlot ? '#f1f5f9' : '#fafafa', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            userSelect: 'none',
                            overflow: 'hidden',
                            boxSizing: 'border-box'
                          }}>
                            {time}
                          </div>
                          {effectiveDoctors.map(doc => {
                            const aptsInSlot = dayAppointments.filter(a => {
                              const d = new Date(a.appointmentDate);
                              const h = d.getHours().toString().padStart(2, '0');
                              const mRaw = d.getMinutes();
                              const m = (Math.floor(mRaw / slotInterval) * slotInterval).toString().padStart(2, '0');
                              const aTime = `${h}:${m}`;
                              const aDoc = a.doctor?.name || (a.doctor?.username ? a.doctor.username : 'Sin Asignar');
                              return aDoc === doc && aTime === time;
                            });

                            // Bloqueos que inician en este horario
                            const blocksStartingHere = dayBlockedSlots.filter(b => {
                              const matchesDoc = b.doctorName === 'Todos' || b.doctorName === doc;
                              if (!matchesDoc) return false;
                              const [bH, bM] = b.startTime.split(':').map(Number);
                              const bMin = bH * 60 + bM;
                              const roundedBMin = Math.floor(bMin / slotInterval) * slotInterval;
                              const rTime = `${Math.floor(roundedBMin / 60).toString().padStart(2, '0')}:${(roundedBMin % 60).toString().padStart(2, '0')}`;
                              return rTime === time;
                            });

                            // ¿La celda está cubierta por un bloqueo activo?
                            const coveringBlock = dayBlockedSlots.find(b => {
                              const matchesDoc = b.doctorName === 'Todos' || b.doctorName === doc;
                              if (!matchesDoc) return false;
                              const [bH, bM] = b.startTime.split(':').map(Number);
                              const bStart = bH * 60 + bM;
                              const bEnd = bStart + b.duration;
                              return slotMinutes >= bStart && slotMinutes < bEnd;
                            });
                            const isCoveredByBlock = Boolean(coveringBlock);

                            return (
                              <div 
                                key={`${time}-${doc}`} 
                                style={{ 
                                  borderRight: '1px solid var(--border-color)', 
                                  borderBottom: '1px solid var(--border-color)', 
                                  position: 'relative', 
                                  height: '30px', 
                                  minWidth: 0,
                                  backgroundColor: isPastSlot ? '#f8fafc' : isCoveredByBlock ? '#fffbeb' : '#fff', 
                                  backgroundImage: isPastSlot 
                                    ? 'repeating-linear-gradient(45deg, #f8fafc, #f8fafc 8px, #f1f5f9 8px, #f1f5f9 16px)' 
                                    : isCoveredByBlock 
                                    ? 'repeating-linear-gradient(45deg, rgba(254, 243, 199, 0.4), rgba(254, 243, 199, 0.4) 8px, rgba(253, 230, 138, 0.4) 8px, rgba(253, 230, 138, 0.4) 16px)'
                                    : 'none',
                                  transition: 'background 0.2s ease', 
                                  display: 'flex', 
                                  gap: '2px', 
                                  cursor: isPastSlot ? 'not-allowed' : isCoveredByBlock ? 'pointer' : 'pointer',
                                  opacity: isPastSlot ? 0.8 : 1,
                                  boxSizing: 'border-box'
                                }} 
                                title={
                                  isPastSlot 
                                    ? `Horario pasado (${time}) - Bloqueado para nuevas citas` 
                                    : isCoveredByBlock 
                                    ? `🔒 Bloqueado: ${coveringBlock.reason} (${coveringBlock.duration}m) - Clic para ver o desbloquear` 
                                    : `Clic para agendar cita o bloquear horario (${time} - ${doc})`
                                }
                                onMouseOver={e => { 
                                  if (!isPastSlot && !isCoveredByBlock) {
                                    e.currentTarget.style.backgroundColor = '#f0f9ff'; 
                                  }
                                }} 
                                onMouseOut={e => { 
                                  if (!isPastSlot && !isCoveredByBlock) {
                                    e.currentTarget.style.backgroundColor = '#fff'; 
                                  }
                                }} 
                                onClick={() => { 
                                  if (isPastSlot) return;
                                  if (isCoveredByBlock) {
                                    setSelectedBlockToView(coveringBlock);
                                    return;
                                  }
                                  setCellActionData({
                                    date: calendarDate,
                                    time,
                                    doctorName: doc === 'General' || doc === 'Sin Asignar' ? null : doc
                                  });
                                }} 
                              > 
                                {/* Bloqueos superpuestos */}
                                {blocksStartingHere.map(block => {
                                  const heightPercent = (block.duration / slotInterval) * 100;
                                  return (
                                    <div
                                      key={block.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedBlockToView(block);
                                      }}
                                      style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: `${heightPercent}%`,
                                        zIndex: 6,
                                        background: 'repeating-linear-gradient(45deg, rgba(254, 243, 199, 0.96), rgba(254, 243, 199, 0.96) 8px, rgba(253, 230, 138, 0.96) 8px, rgba(253, 230, 138, 0.96) 16px)',
                                        border: '1px solid #d97706',
                                        borderLeft: '4px solid #b45309',
                                        borderRadius: '3px',
                                        padding: '0.15rem 0.35rem',
                                        boxShadow: '0 2px 4px rgba(217, 119, 6, 0.2)',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        boxSizing: 'border-box',
                                        color: '#78350f'
                                      }}
                                      title={`🔒 Bloqueado: ${block.reason} (${block.duration} min) - ${block.startTime} - Clic para ver o desbloquear`}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.2rem' }}>
                                        <span style={{ fontWeight: '800', fontSize: effectiveDoctors.length > 5 ? '0.66rem' : '0.72rem', display: 'flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          🔒 {block.reason}
                                        </span>
                                        {heightPercent >= 120 && (
                                          <span style={{ fontSize: '0.62rem', fontWeight: '800', backgroundColor: 'rgba(180, 83, 9, 0.2)', padding: '1px 4px', borderRadius: '4px', flexShrink: 0 }}>
                                            {block.duration}m
                                          </span>
                                        )}
                                      </div>
                                      {heightPercent >= 150 && (
                                        <div style={{ fontSize: '0.65rem', color: '#92400e', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {block.startTime} • {block.doctorName === 'Todos' ? 'Todos' : `Dr. ${block.doctorName}`}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}

                                {/* Citas médicas */}
                                {aptsInSlot.map((aptInSlot, i) => {
                                  const durationMins = aptInSlot.duration || 30;
                                  const heightPercent = (durationMins / slotInterval) * 100;
                                  
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
                                        cursor: 'pointer',
                                        backgroundColor: 
                                          aptInSlot.status === 'En Sala de Espera' ? 'rgba(239, 246, 255, 0.98)' :
                                          aptInSlot.status === 'Confirmada' ? 'rgba(236, 253, 245, 0.98)' : 
                                          aptInSlot.status === 'Completada' ? 'rgba(224, 242, 254, 0.98)' : 
                                          'rgba(254, 243, 199, 0.98)',
                                        borderTop: `3px solid ${
                                          aptInSlot.status === 'En Sala de Espera' ? '#3b82f6' :
                                          aptInSlot.status === 'Confirmada' ? '#10b981' : 
                                          aptInSlot.status === 'Completada' ? '#0ea5e9' : 
                                          '#f59e0b'
                                        }`,
                                        borderRight: '1px solid rgba(0,0,0,0.08)',
                                        borderBottom: '1px solid rgba(0,0,0,0.08)',
                                        borderRadius: '3px',
                                        padding: '0.15rem 0.25rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                                        overflow: 'hidden',
                                        boxSizing: 'border-box'
                                      }}
                                      title={`Cita: ${aptInSlot.patient?.name || aptInSlot.patient?.username} | Dr(a). ${doc} | Hora: ${time} (${durationMins}m) | Estado: ${aptInSlot.status} | Motivo: ${aptInSlot.reason || 'Sin motivo'}`}
                                    >
                                      <div style={{ 
                                        fontSize: effectiveDoctors.length > 5 ? '0.68rem' : '0.74rem', 
                                        fontWeight: 'bold', 
                                        color: 'var(--color-text-main)', 
                                        whiteSpace: 'nowrap', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis' 
                                      }}>
                                        {aptInSlot.patient?.name || aptInSlot.patient?.username}
                                      </div>
                                      {durationMins >= 20 && heightPercent >= 140 && (
                                        <div style={{ 
                                          fontSize: '0.65rem', 
                                          color: 'var(--color-text-muted)', 
                                          marginTop: '1px', 
                                          whiteSpace: 'nowrap', 
                                          overflow: 'hidden', 
                                          textOverflow: 'ellipsis' 
                                        }}>
                                          {aptInSlot.reason}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </Card>

          </div>
        )}

      </div>

      {/* MODAL 1: Selector de Acción en Celda (Agendar vs Bloquear) */}
      {cellActionData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '460px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid var(--border-color)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-primary)', margin: 0 }}>
                  Gestión de Horario ({cellActionData.time})
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Fecha: <strong>{cellActionData.date}</strong> {cellActionData.doctorName ? `• Dr(a). ${cellActionData.doctorName}` : ''}
                </p>
              </div>
              <button
                onClick={() => setCellActionData(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', marginBottom: '1.25rem' }}>
              ¿Qué acción deseas realizar en este espacio del calendario?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <button
                onClick={() => {
                  setNewAppointmentPrefill({
                    date: `${cellActionData.date}T${cellActionData.time}:00`,
                    doctorName: cellActionData.doctorName
                  });
                  setAppointmentToEdit(null);
                  setCellActionData(null);
                  setShowModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: 'rgba(34, 80, 93, 0.05)',
                  border: '1.5px solid var(--color-primary)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(34, 80, 93, 0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(34, 80, 93, 0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.65rem', borderRadius: '8px', display: 'flex' }}>
                  <CalendarPlus size={22} />
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-primary)' }}>Agendar Cita Médica</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Registrar un paciente para consulta o procedimiento dental/médico.</span>
                </div>
              </button>

              <button
                onClick={() => {
                  handleOpenBlockModalForCell(cellActionData.date, cellActionData.time, cellActionData.doctorName || 'Todos');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  border: '1.5px solid #d97706',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.16)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ backgroundColor: '#d97706', color: 'white', padding: '0.65rem', borderRadius: '8px', display: 'flex' }}>
                  <Lock size={22} />
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: '#b45309' }}>Bloquear Horario (Cierto tiempo)</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Inhabilitar celda para almuerzo, descanso, reunión o mantenimiento.</span>
                </div>
              </button>
            </div>

            <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
              <Button variant="outline" onClick={() => setCellActionData(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Formulario para Bloquear Horario con Cierto Tiempo */}
      {showBlockModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '520px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            border: '1px solid var(--border-color)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
                  <Lock size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-primary)', margin: 0 }}>
                    Bloquear Horario en Calendario
                  </h3>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    Inhabilita celdas por un tiempo determinado (almuerzo, reuniones, descansos, etc.)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBlockModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Fecha y Profesional */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
                    Fecha
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={blockForm.date}
                    onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })}
                    style={{ height: '38px', width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
                    Profesional / Consultorio
                  </label>
                  <select
                    className="input-field"
                    value={blockForm.doctorName}
                    onChange={(e) => setBlockForm({ ...blockForm, doctorName: e.target.value })}
                    style={{ height: '38px', width: '100%' }}
                  >
                    <option value="Todos">Todos los consultorios (General)</option>
                    {availableDoctors.map(d => (
                      <option key={d.id} value={d.name}>Dr(a). {d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hora de Inicio */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  className="input-field"
                  value={blockForm.startTime}
                  onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })}
                  style={{ height: '38px', width: '100%', fontWeight: '700' }}
                />
              </div>

              {/* Duración / Cierto Tiempo */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
                  Duración del Bloqueo: <strong style={{ color: '#b45309' }}>{blockForm.duration} minutos</strong>
                </label>
                
                {/* Botones rápidos de duración */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {[15, 30, 45, 60, 90, 120, 180].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setBlockForm({ ...blockForm, duration: mins })}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: blockForm.duration === mins ? '#d97706' : 'var(--border-color)',
                        backgroundColor: blockForm.duration === mins ? '#fef3c7' : 'var(--color-bg-main)',
                        color: blockForm.duration === mins ? '#b45309' : 'var(--color-text-main)',
                        fontWeight: blockForm.duration === mins ? '800' : '600',
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min="5"
                    max="720"
                    step="5"
                    className="input-field"
                    value={blockForm.duration}
                    onChange={(e) => setBlockForm({ ...blockForm, duration: parseInt(e.target.value, 10) || 15 })}
                    style={{ height: '38px', width: '110px' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>minutos de bloqueo</span>
                </div>
              </div>

              {/* Motivo del Bloqueo */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
                  Motivo del Bloqueo
                </label>
                <select
                  className="input-field"
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  style={{ height: '38px', width: '100%', marginBottom: blockForm.reason === 'Otro' ? '0.5rem' : 0 }}
                >
                  <option value="Almuerzo / Descanso">Almuerzo / Descanso</option>
                  <option value="Reunión Médica / Personal">Reunión Médica / Personal</option>
                  <option value="Pausa Activa">Pausa Activa</option>
                  <option value="Procedimiento / Quirófano">Procedimiento / Quirófano</option>
                  <option value="Capacitación / Docencia">Capacitación / Docencia</option>
                  <option value="Mantenimiento de Consultorio">Mantenimiento de Consultorio</option>
                  <option value="Permiso Personal / Ausencia">Permiso Personal / Ausencia</option>
                  <option value="Otro">Otro motivo personalizado...</option>
                </select>

                {blockForm.reason === 'Otro' && (
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Escribe el motivo del bloqueo..."
                    value={blockForm.customReason}
                    onChange={(e) => setBlockForm({ ...blockForm, customReason: e.target.value })}
                    style={{ height: '38px', width: '100%' }}
                  />
                )}
              </div>

              {/* Notas opcionales */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
                  Notas Adicionales (Opcional)
                </label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Detalles sobre este bloqueo de horario..."
                  value={blockForm.notes}
                  onChange={(e) => setBlockForm({ ...blockForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>

              {/* Botones de acción */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button variant="outline" onClick={() => setShowBlockModal(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveBlock}
                  style={{
                    backgroundColor: '#d97706',
                    color: '#ffffff',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Lock size={16} /> Confirmar Bloqueo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Detalle y Desbloqueo de Horario */}
      {selectedBlockToView && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '440px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
                  <Lock size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#b45309', margin: 0 }}>
                    Horario Bloqueado
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    Celdas inhabilitadas para citas
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBlockToView(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#fffbeb', borderRadius: '8px', borderLeft: '4px solid #d97706' }}>
                <strong style={{ display: 'block', fontSize: '1.05rem', color: '#92400e', marginBottom: '0.2rem' }}>
                  {selectedBlockToView.reason}
                </strong>
                <span style={{ fontSize: '0.85rem', color: '#b45309' }}>
                  Duración: <strong>{selectedBlockToView.duration} minutos</strong>
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', display: 'block' }}>Fecha y Hora de Inicio:</span>
                <strong>{selectedBlockToView.date} a las {selectedBlockToView.startTime}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', display: 'block' }}>Profesional / Consultorio:</span>
                <strong>{selectedBlockToView.doctorName === 'Todos' ? 'Todos los consultorios (General)' : `Dr(a). ${selectedBlockToView.doctorName}`}</strong>
              </div>

              {selectedBlockToView.notes && (
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', display: 'block' }}>Notas adicionales:</span>
                  <p style={{ margin: '0.2rem 0 0 0', fontStyle: 'italic', color: 'var(--color-text-main)' }}>
                    "{selectedBlockToView.notes}"
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <Button variant="outline" onClick={() => setSelectedBlockToView(null)}>
                Cerrar
              </Button>
              <button
                onClick={() => handleDeleteBlock(selectedBlockToView.id)}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
                }}
              >
                <Unlock size={16} /> Desbloquear Horario
              </button>
            </div>
          </div>
        </div>
      )}

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
