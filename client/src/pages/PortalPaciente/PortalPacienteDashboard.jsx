import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

export function PortalPacienteDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('portal_user') || '{}');

  return (
    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border-color)', maxWidth: '1200px', margin: '0 auto', width: '100%', alignSelf: 'center' }}>
      <h1 style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '1rem' }}>Bienvenido al Portal, {user.name}</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>
        En este portal podrás consultar toda tu información médica, parámetros vitales y próximas citas de manera segura y confidencial.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div 
          onClick={() => navigate('/users/historia-medica')}
          style={{ backgroundColor: 'var(--color-bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Activity size={32} color="var(--color-accent)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Historia Médica</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Consulta tus datos clínicos y últimos parámetros registrados en tu consulta.</p>
        </div>
      </div>
    </div>
  );
}
