import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, User, AlertCircle } from 'lucide-react';
import { portalApi } from '../../services/api';

const MedicalCrossBg = () => (
  <svg style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '150%', height: '150%', zIndex: 0, pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M35,10 h30 v25 h25 v30 h-25 v25 h-30 v-25 h-25 v-30 h25 z" 
      fill="rgba(42, 183, 202, 0.04)" 
    />
  </svg>
);

const CornerCircles = () => (
  <svg style={{ position: 'absolute', top: 0, left: 0, width: '500px', height: '500px', zIndex: 0, pointerEvents: 'none' }} viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
    <circle cx="0" cy="0" r="220" fill="rgba(42, 183, 202, 0.08)" />
    <circle cx="60" cy="60" r="140" fill="rgba(34, 80, 93, 0.05)" />
    <circle cx="0" cy="0" r="160" fill="rgba(42, 183, 202, 0.1)" />
  </svg>
);

export function PortalPacienteLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await portalApi.post('/api/users/login', { username, password });
      const { token, user } = response.data;
      
      if (user.role !== 'Paciente') {
        setErrorMsg('Acceso exclusivo para pacientes.');
        return;
      }
      
      localStorage.setItem('portal_token', token);
      localStorage.setItem('portal_user', JSON.stringify(user));
      navigate('/users/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.message || 'Error de conexión');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-main)', position: 'relative', overflow: 'hidden' }}>
      <MedicalCrossBg />
      <CornerCircles />

      <div style={{ zIndex: 1, textAlign: 'center', marginBottom: '2rem', maxWidth: '600px', padding: '0 1rem' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--color-text-main)', margin: '0 0 0.5rem 0', letterSpacing: '2px' }}>
          S.A.R.A.
        </h1>
        <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--color-text-muted)', lineHeight: 1.4, margin: 0 }}>
          Sistema Administrativo y de Registro Automatizado de Pacientes
        </p>
      </div>

      <div className="glass-panel" style={{ maxWidth: '400px', width: '90%', padding: '2.5rem', textAlign: 'center', zIndex: 1, backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--color-primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(34, 80, 93, 0.2)' }}>
            <Activity size={32} color="var(--color-accent)" />
          </div>
        </div>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text-main)', marginBottom: '0.25rem', fontWeight: 700 }}>Portal del Paciente</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>Acceso exclusivo</p>
        
        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: 'var(--color-alert)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
              <User size={18} />
            </div>
            <input 
              placeholder="Usuario" 
              value={username} 
              onChange={e => { setUsername(e.target.value); setErrorMsg(''); }} 
              required 
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-main)' }}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
              <Lock size={18} />
            </div>
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password} 
              onChange={e => { setPassword(e.target.value); setErrorMsg(''); }} 
              required 
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-main)' }}
            />
          </div>
          
          <button type="submit" style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontSize: '1rem' }}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
