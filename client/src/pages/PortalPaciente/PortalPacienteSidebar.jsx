import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, LogOut, User, X } from 'lucide-react';
import './PortalPacienteSidebar.css';

export function PortalPacienteSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const userStr = localStorage.getItem('portal_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_user');
    setIsMobileMenuOpen(false);
    navigate('/users/login');
  };

  return (
    <>
      <button 
        className="portal-mobile-menu-btn" 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? "Cerrar Menú" : "Abrir Menú"}
      >
        {isMobileMenuOpen ? <X size={24} /> : <LayoutDashboard size={24} />}
      </button>
      <div 
        className={`portal-sidebar-overlay ${isMobileMenuOpen ? 'show' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>
      <aside className={`portal-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="portal-sidebar-header">
          <div className="portal-sidebar-logo">
            <Activity size={24} className="portal-sidebar-logo-icon" />
            <h2>SARA</h2>
          </div>
          <p className="portal-sidebar-subtitle">Portal del Paciente</p>
        </div>

        <div className="portal-sidebar-user-info">
          <div className="portal-sidebar-user-avatar">
            <User size={20} />
          </div>
          <div className="portal-sidebar-user-details">
            <span className="portal-sidebar-user-name">{user?.name || 'Paciente'}</span>
            <span className="portal-sidebar-user-role">{user?.role || 'Paciente'}</span>
          </div>
        </div>

        <nav className="portal-sidebar-nav">
          <ul>
            <li>
              <NavLink 
                to="/users/dashboard" 
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard Principal</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/users/historia-medica" 
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Activity size={20} />
                <span>Historia Médica</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="portal-sidebar-footer">
          <button onClick={handleLogout} className="portal-sidebar-logout-btn">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}

