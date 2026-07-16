import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, LogOut, User } from 'lucide-react';
import './PortalPacienteSidebar.css';

export function PortalPacienteSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const userStr = localStorage.getItem('portal_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_user');
    navigate('/users/login');
  };

  return (
    <>
      <button 
        className="portal-mobile-menu-btn" 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <LayoutDashboard size={24} />
      </button>
      <div 
        className={`portal-sidebar-overlay ${isMobileMenuOpen ? 'show' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Activity size={24} className="sidebar-logo-icon" />
          <h2>SARA</h2>
        </div>
        <p className="sidebar-subtitle">Portal del Paciente</p>
      </div>

      <div className="sidebar-user-info">
        <div className="sidebar-user-avatar">
          <User size={20} />
        </div>
        <div className="sidebar-user-details">
          <span className="sidebar-user-name">{user?.name || 'Paciente'}</span>
          <span className="sidebar-user-role">{user?.role || 'Paciente'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/users/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
              <LayoutDashboard size={20} />
              <span>Dashboard Principal</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/users/historia-medica" className={({ isActive }) => (isActive ? 'active' : '')}>
              <Activity size={20} />
              <span>Historia Médica</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout-btn">
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
    </>
  );
}
