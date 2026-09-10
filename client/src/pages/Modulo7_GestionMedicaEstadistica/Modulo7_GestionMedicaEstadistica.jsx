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

        {/* MÓDULO DE FRECUENTOLOGÍA Y SEGUIMIENTO DE RECURRENCIA */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Card 
            title="Módulo de Frecuentología: Recurrencia e Historial de Consultas" 
            action={<Activity size={20} style={{ color: '#0d9488' }} />}
            className="glass-panel"
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.25rem' }}>
              
              {/* Métrica: Tasa de Retorno / Recurrencia */}
              <div style={{ padding: '1.25rem', backgroundColor: 'rgba(13, 148, 136, 0.08)', borderRadius: '12px', border: '1px solid rgba(13, 148, 136, 0.2)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f766e' }}>Tasa de Recurrencia de Pacientes</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f766e', marginTop: '0.35rem' }}>
                  {stats.frecuentologia?.recurrenceRate || '0'}%
                </div>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Proporción de reconsultas sobre el total de atenciones
                </p>
              </div>

              {/* Métrica: Primeras Consultas */}
              <div style={{ padding: '1.25rem', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#047857' }}>Primeras Consultas (Nuevos)</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#047857', marginTop: '0.35rem' }}>
                  {stats.frecuentologia?.firstTimeConsults || 0}
                </div>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Pacientes que ingresaron por primera vez
                </p>
              </div>

              {/* Métrica: Reconsultas */}
              <div style={{ padding: '1.25rem', backgroundColor: 'rgba(2, 132, 199, 0.08)', borderRadius: '12px', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0369a1' }}>Reconsultas y Controles</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0369a1', marginTop: '0.35rem' }}>
                  {stats.frecuentologia?.reconsults || 0}
                </div>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Visitas de seguimiento, control o llegada directa
                </p>
              </div>
            </div>

            {/* Razones de Consulta más Frecuentes */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', color: '#1e293b', fontWeight: 700 }}>
                Razones de Consulta más Frecuentes (Clasificación General):
              </h4>
              
              {stats.frecuentologia?.reasonsBreakdown && stats.frecuentologia.reasonsBreakdown.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {stats.frecuentologia.reasonsBreakdown.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>{r.reason || 'General'}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, backgroundColor: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '10px' }}>
                        {r.count} consultas
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Aún no hay razones de consulta tipificadas en el nuevo flujo. Se acumularán automáticamente conforme se registren historias.
                </p>
              )}
            </div>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default Modulo7_GestionMedicaEstadistica;

