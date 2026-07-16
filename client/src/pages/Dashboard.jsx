import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/Card';
import { Users, Activity, CalendarCheck, TrendingUp } from 'lucide-react';
import './Dashboard.css';

export function Dashboard() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
              Token detectado: {token.substring(0, 20)}...
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
              <p className="kpi-label">Pacientes Totales</p>
              <h3 className="kpi-value">1,248</h3>
              <p className="kpi-trend positive"><TrendingUp size={14} /> +12% este mes</p>
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
              <h3 className="kpi-value">24</h3>
              <p className="kpi-trend neutral">4 restantes</p>
            </div>
            <div className="kpi-icon-wrapper accent-light">
              <CalendarCheck size={24} className="kpi-icon" />
            </div>
          </div>
        </Card>

        <Card className="kpi-card">
          <div className="kpi-content">
            <div>
              <p className="kpi-label">Alertas Críticas</p>
              <h3 className="kpi-value">3</h3>
              <p className="kpi-trend negative">Requiere atención</p>
            </div>
            <div className="kpi-icon-wrapper alert-light">
              <Activity size={24} className="kpi-icon" />
            </div>
          </div>
        </Card>
      </div>

      <div className={`responsive-grid-1-2 ${user.role === 'Recepcionista' ? 'single-column' : ''}`}>
        {user.role !== 'Recepcionista' && (
          <Card title="Evolución de Pacientes" className="patient-overview-card">
            <div className="placeholder-chart">
               <div className="chart-bars">
                 <div className="chart-bar" style={{height: '60%'}}></div>
                 <div className="chart-bar" style={{height: '80%'}}></div>
                 <div className="chart-bar" style={{height: '40%'}}></div>
                 <div className="chart-bar" style={{height: '90%'}}></div>
                 <div className="chart-bar" style={{height: '70%'}}></div>
                 <div className="chart-bar" style={{height: '100%', backgroundColor: 'var(--color-accent)'}}></div>
                 <div className="chart-bar" style={{height: '50%'}}></div>
               </div>
               <p className="chart-caption">Afluencia Semanal de Pacientes</p>
            </div>
          </Card>
        )}

        <Card title="Próximas Citas" action={<button className="btn btn-outline" style={{padding: '0.25rem 0.75rem', fontSize: '0.75rem'}}>Ver Todas</button>}>
          <div className="appointment-list">
            {[1, 2, 3].map(i => (
              <div key={i} className="appointment-item">
                <div className="appointment-time">
                  <span className="time">09:{i * 15} AM</span>
                  <span className="duration">30 min</span>
                </div>
                <div className="appointment-details">
                  <h4>Paciente Demo {i}</h4>
                  <p>Chequeo General</p>
                </div>
                <div className="appointment-status status-confirmed">Confirmada</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  );
}
