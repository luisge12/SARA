import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { AppointmentModal } from '../../components/AppointmentModal';
import api from '../../services/api';
import { 
  Calendar, CalendarPlus, CheckCircle, Clock, XCircle, Filter, Search, 
  Trash2, Building2, User, Activity, AlertCircle, RefreshCw, Edit3, CreditCard, DollarSign 
} from 'lucide-react';

function Modulo_CitasMedicas() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);

  // Filtros
  const [selectedSede, setSelectedSede] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <DashboardLayout>
      <div className="module-container">
        
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
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="outline" onClick={fetchAppointments} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RefreshCw size={16} /> Refrescar
            </Button>
            <Button onClick={() => { setSelectedPatientId(null); setAppointmentToEdit(null); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarPlus size={18} /> Agendar Nueva Cita
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
                <p className="kpi-label">Citas Completadas</p>
                <h3 className="kpi-value">{loading ? '...' : completedCount}</h3>
                <p className="kpi-trend neutral"><Activity size={14} /> Atendidas con éxito</p>
              </div>
              <div className="kpi-icon-wrapper alert-light">
                <Activity size={24} className="kpi-icon" />
              </div>
            </div>
          </Card>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <Card className="glass-panel" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Buscar por Paciente, Médico o Motivo..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2.5rem', height: '40px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={16} style={{ color: 'var(--color-text-muted)' }} />
                <select 
                  className="input-field" 
                  value={selectedSede} 
                  onChange={(e) => setSelectedSede(e.target.value)}
                  style={{ height: '40px', padding: '0.4rem 0.8rem' }}
                >
                  <option value="Todas">Todas las Sedes</option>
                  <option value="CENTRAL">CENTRAL</option>
                  <option value="GMSP">GMSP</option>
                  <option value="CCMLA">CCMLA</option>
                  <option value="PLA">PLA</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select 
                  className="input-field" 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{ height: '40px', padding: '0.4rem 0.8rem' }}
                >
                  <option value="Todas">Todos los Estados</option>
                  <option value="Confirmada">Confirmadas</option>
                  <option value="Pendiente">Pendientes</option>
                  <option value="Completada">Completadas</option>
                  <option value="Cancelada">Canceladas</option>
                </select>
              </div>
            </div>

          </div>
        </Card>

        {/* Listado Principal de Citas Médicas */}
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
                const dateObj = new Date(apt.appointmentDate);
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
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>
                          {dateObj.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                        </span>
                        <span style={{ fontSize: '1.05rem', fontWeight: '800' }}>
                          {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div>
                        <h4 style={{ fontWeight: '700', color: 'var(--color-text-main)', fontSize: '1.05rem', margin: 0 }}>
                          {patientName} {apt.patient?.identificationNumber && `(C.I: ${apt.patient.identificationNumber})`}
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

      </div>

      {showModal && (
        <AppointmentModal 
          initialPatientId={selectedPatientId}
          appointmentToEdit={appointmentToEdit}
          onClose={() => { setShowModal(false); setAppointmentToEdit(null); }}
          onSuccess={() => {
            fetchAppointments();
          }}
        />
      )}
    </DashboardLayout>
  );
}

export default Modulo_CitasMedicas;
