import React from 'react';
import { PortalPacienteSidebar } from './PortalPacienteSidebar';
import './PortalPacienteLayout.css';

export function PortalPacienteLayout({ children }) {
  return (
    <div className="layout-container">
      <PortalPacienteSidebar />
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
}
