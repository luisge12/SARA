import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ClipboardList, Calendar, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';

export function PortalPacienteDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('portal_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_user');
    navigate('/users/login');
  };

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
      </div>
    </div>
  );
}
