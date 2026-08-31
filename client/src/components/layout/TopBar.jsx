import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, User } from 'lucide-react';
import './TopBar.css';

export function TopBar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Placeholder for future clinic name/logo if needed */}
      </div>
      <div className="topbar-right">
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
