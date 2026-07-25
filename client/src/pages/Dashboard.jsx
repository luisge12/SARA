import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/Card';
import { Users, Activity, CalendarCheck, FileText, Calendar } from 'lucide-react';
import api from '../services/api';
import './Dashboard.css';

export function Dashboard() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    totalConsultations: 0,
    upcomingAppointments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchDashboardStats();

    window.addEventListener('appointmentCreated', fetchDashboardStats);
    return () => {
      window.removeEventListener('appointmentCreated', fetchDashboardStats);
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="module-container" style={{ padding: 0 }}>
        <header className="dashboard-header" style={{ flexWrap: 'wrap' }}>
          <div>
            <h1 className="dashboard-title">Resumen General SARA</h1>
            <p className="dashboard-subtitle">Bienvenido de nuevo, <strong>{user.name || 'Usuario'}</strong>. Rol: <strong>{user.role || 'Sin rol'}</strong>. Sede: <strong>{user.sedeAtencion || 'No especificada'}</strong>.</p>
          </div>
          <div className="dashboard-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <span className="current-date">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
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

        <div className="kpi-grid">
          <Card className="kpi-card">
            <div className="kpi-content">
              <div>
                <p className="kpi-label">Pacientes Registrados</p>
                <h3 className="kpi-value">{loading ? '...' : stats.totalPatients}</h3>
                <p className="kpi-trend positive">Datos en tiempo real (BD)</p>
              </div>
              <div className="kpi-icon-wrapper primary-light">
                <Users size={24} className="kpi-icon" />
              </div>
            </div>
          </Card>

          <Card className="kpi-card">
            <div className="kpi-content">
              <div>
                <p className="kpi-label">Citas para Hoy</p>
                <h3 className="kpi-value">{loading ? '...' : stats.todayAppointments}</h3>
                <p className="kpi-trend neutral">Agendadas hoy</p>
              </div>
              <div className="kpi-icon-wrapper accent-light">
                <CalendarCheck size={24} className="kpi-icon" />
              </div>
            </div>
          </Card>

          <Card className="kpi-card">
            <div className="kpi-content">
              <div>
                <p className="kpi-label">Historias / Consultas</p>
                <h3 className="kpi-value">{loading ? '...' : stats.totalConsultations}</h3>
                <p className="kpi-trend positive">Registros médicos</p>
              </div>
              <div className="kpi-icon-wrapper alert-light">
                <FileText size={24} className="kpi-icon" />
              </div>
            </div>
          </Card>
        </div>

        <div style={{ width: '100%' }}>
          <Card title="Próximas Citas Médicas">
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
                      <div className={`appointment-status status-${(apt.status || 'confirmada').toLowerCase()}`}>
                        {apt.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

