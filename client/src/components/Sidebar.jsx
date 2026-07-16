import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { hasAccess } from './ProtectedRoute';
import { LayoutDashboard, ShieldCheck, Wallet, Activity, BarChart3, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import './Sidebar.css';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);

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
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button 
        className="sidebar-toggle" 
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label="Toggle Sidebar"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="sidebar-header">
        <span className="sidebar-logo-text" style={{ fontSize: isCollapsed ? '1.5rem' : '1.75rem' }}>
          {isCollapsed ? 'S' : 'SARA'}
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
              title={isCollapsed ? item.name : ''}
            >
              <Icon size={20} className="sidebar-icon" />
              <span className="link-text">{item.name}</span>
            </NavLink>
          );
        })}
        
        {!isCollapsed && (
          <div className="sidebar-acronym" style={{ marginTop: 'auto', padding: '1rem 0.5rem 0' }}>
            <p><strong>SARA</strong></p>
            <p style={{ fontSize: '0.65rem' }}>Sistema Administrativo y de Registro Automatizado</p>
          </div>
        )}
      </nav>
      
      <div className="sidebar-footer">
        <NavLink to="/login" className="sidebar-link logout" title={isCollapsed ? "Cerrar Sesión" : ""}>
          <LogOut size={20} className="sidebar-icon" />
          <span className="link-text">Cerrar Sesión</span>
        </NavLink>
      </div>
    </aside>
  );
}
