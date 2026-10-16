import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, User, Home, ShieldCheck } from 'lucide-react';
import licenseService from '../../services/licenseService';
import './TopBar.css';

export function TopBar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [license, setLicense] = useState(null);

  useEffect(() => {
    licenseService.getStatus().then(setLicense).catch(() => {});
    const update = () => licenseService.getStatus().then(setLicense).catch(() => {});
    window.addEventListener('sara_license_updated', update);
    return () => window.removeEventListener('sara_license_updated', update);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button 
          className="home-btn" 
          onClick={() => navigate('/dashboard')}
          title="Inicio"
        >
          <Home size={22} />
        </button>
      </div>
      <div className="topbar-right">
        {license && (
          <div 
            onClick={() => navigate('/configuracion')}
            style={{
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              backgroundColor: license.isExpired 
                ? 'rgba(239, 68, 68, 0.15)' 
                : license.isExpiringSoon 
                  ? 'rgba(245, 158, 11, 0.15)' 
                  : 'rgba(34, 80, 93, 0.1)',
              color: license.isExpired 
                ? '#dc2626' 
                : license.isExpiringSoon 
                  ? '#d97706' 
                  : '#22505d',
              border: `1px solid ${license.isExpired ? 'rgba(239, 68, 68, 0.3)' : license.isExpiringSoon ? 'rgba(245, 158, 11, 0.3)' : 'rgba(34, 80, 93, 0.2)'}`
            }}
            title="Estado de la licencia de la clínica (Clic para gestionar)"
          >
            <ShieldCheck size={14} />
            <span>{license.isExpired ? 'Vencida' : `${license.planType === 'ANNUAL' ? 'Anual' : 'Mensual'} • ${license.daysRemaining}d`}</span>
          </div>
        )}
        <div className="user-info">
          <span className="user-name">{user.name || user.username || 'Usuario'}</span>
          <span className="user-role">{user.role || 'Rol'}</span>
        </div>
        <div className="avatar-circle">
          <User size={20} />
        </div>
        <button 
          className="settings-btn" 
          onClick={() => navigate('/configuracion')}
          title="Configuración Administrativa"
        >
          <Settings size={22} />
        </button>
      </div>
    </header>
  );
}
