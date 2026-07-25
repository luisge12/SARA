import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { hasAccess } from './ProtectedRoute';
import { LayoutDashboard, ShieldCheck, Wallet, Activity, BarChart3, LogOut, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import './Sidebar.css';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Registro de Usuarios/Pacientes', path: '/modulo2', icon: ShieldCheck, allowedGroups: ['ADMINISTRADOR', 'RECEPCIONISTA', 'MEDICO'] },
    { name: 'Gestión Administrativa', path: '/modulo3', icon: Wallet, allowedGroups: ['RECEPCIONISTA', 'ADMINISTRADOR', 'MASTER'] },
    { name: 'Datos Clínicos (M4)', path: '/modulo4', icon: Activity, allowedGroups: ['MEDICO', 'RECEPCIONISTA'] },
    { name: 'Estadísticas (M7)', path: '/modulo7', icon: BarChart3, allowedGroups: ['ADMINISTRADOR'] },
  ];
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const visibleNavItems = navItems.filter(item => 
    !item.allowedGroups || hasAccess(user.role, item.allowedGroups)
  );

  return (
    <>
      {/* Botón de hamburguesa exclusivo para móvil */}
      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label={isMobileOpen ? "Cerrar Menú" : "Abrir Menú"}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para móvil cuando el menú está abierto */}
      <div 
        className={`sidebar-overlay ${isMobileOpen ? 'show' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      ></div>

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <button 
          className="sidebar-toggle desktop-only" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="sidebar-header">
          <span className="sidebar-logo-text">
            {isCollapsed && !isMobileOpen ? 'S' : 'SARA'}
          </span>
        </div>
        
        <nav className="sidebar-nav">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.name} 
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                title={isCollapsed && !isMobileOpen ? item.name : ''}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon size={20} className="sidebar-icon" />
                <span className="link-text">{item.name}</span>
              </NavLink>
            );
          })}
          
          {(!isCollapsed || isMobileOpen) && (
            <div className="sidebar-acronym" style={{ marginTop: 'auto', padding: '1rem 0.5rem 0' }}>
              <p><strong>SARA</strong></p>
              <p style={{ fontSize: '0.65rem' }}>Sistema Administrativo y de Registro Automatizado</p>
            </div>
          )}
        </nav>
        
        <div className="sidebar-footer">
          <NavLink 
            to="/login" 
            className="sidebar-link logout" 
            title={isCollapsed && !isMobileOpen ? "Cerrar Sesión" : ""}
            onClick={() => setIsMobileOpen(false)}
          >
            <LogOut size={20} className="sidebar-icon" />
            <span className="link-text">Cerrar Sesión</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}

