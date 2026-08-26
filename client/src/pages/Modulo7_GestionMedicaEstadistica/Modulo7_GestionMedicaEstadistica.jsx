import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/Card';
import { BarChart3, Users, FileText, Calendar, Building2, ShieldCheck, Activity } from 'lucide-react';
import api from '../../services/api';

function Modulo7_GestionMedicaEstadistica() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalConsultations: 0,
    totalAppointments: 0,
    patientsBySede: [],
    appointmentsByStatus: [],
    usersByRole: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoricalStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/stats/historical');
        setStats(res.data);
      } catch (err) {
        console.error('Error al cargar estadísticas históricas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalStats();
  }, []);

  return (
    <DashboardLayout activeModule={7}>
      <div className="module-container">
        
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
              Módulo 7: Gestión Médica y Estadística Histórica
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Consola del Director Médico para el análisis estadístico real de pacientes, distribución por sedes y rendimiento clínico.
            </p>
          </div>
        </header>

        {/* Tarjetas KPI Principales (BD Real) */}
        <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
          <Card className="kpi-card">
            <div className="kpi-content">
              <div>
                <p className="kpi-label">Pacientes en Base de Datos</p>
                <h3 className="kpi-value">{loading ? '...' : stats.totalPatients}</h3>
                <p className="kpi-trend positive"><Activity size={14} /> Pacientes verificados</p>
              </div>
              <div className="kpi-icon-wrapper primary-light">
                <Users size={24} className="kpi-icon" />
              </div>
            </div>
          </Card>

          <Card className="kpi-card">
            <div className="kpi-content">
              <div>
                <p className="kpi-label">Historias Clínicas / Consultas</p>
                <h3 className="kpi-value">{loading ? '...' : stats.totalConsultations}</h3>
                <p className="kpi-trend neutral">Registros médicos totales</p>
              </div>
              <div className="kpi-icon-wrapper accent-light">
                <FileText size={24} className="kpi-icon" />
              </div>
            </div>
          </Card>

          <Card className="kpi-card">
            <div className="kpi-content">
              <div>
                <p className="kpi-label">Total Citas Registradas</p>
                <h3 className="kpi-value">{loading ? '...' : stats.totalAppointments}</h3>
                <p className="kpi-trend positive">Histórico de agenda</p>
              </div>
              <div className="kpi-icon-wrapper alert-light">
                <Calendar size={24} className="kpi-icon" />
              </div>
            </div>
          </Card>
        </div>

        {/* Desglose Estadístico por Sedes y Roles */}
        <div className="responsive-grid-1-1" style={{ marginBottom: '1.5rem' }}>
          
          {/* Distribución por Sede de Atención */}
          <Card title="Distribución de Pacientes por Sede" action={<Building2 size={20} style={{ color: 'var(--color-primary)' }} className="glass-panel" />}>
            {loading ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando datos...</div>
            ) : !stats.patientsBySede || stats.patientsBySede.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No hay registros de sede en la base de datos (Total: 0).
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.patientsBySede.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>Sede {item.sedeAtencion || 'No Especificada'}</span>
                    <span style={{ fontWeight: '700', color: 'var(--color-accent)', background: 'rgba(42, 183, 202, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '12px' }}>
                      {item.count} pacientes
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Distribución por Rol de Usuarios */}
          <Card title="Usuarios Registrados por Rol" action={<ShieldCheck size={20} style={{ color: 'var(--color-accent)' }} className="glass-panel" />}>
            {loading ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando datos...</div>
            ) : !stats.usersByRole || stats.usersByRole.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No hay usuarios registrados (Total: 0).
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.usersByRole.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{item.role}</span>
                    <span style={{ fontWeight: '700', color: 'var(--color-primary)', background: 'rgba(34, 80, 93, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '12px' }}>
                      {item.count} usuarios
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default Modulo7_GestionMedicaEstadistica;

