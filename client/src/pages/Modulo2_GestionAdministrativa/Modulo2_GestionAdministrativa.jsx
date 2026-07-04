import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

function Modulo2_GestionAdministrativa() {
  return (
    <DashboardLayout activeModule={2}>
      <div className="gf-card gf-primary-card">
        <h3 className="gf-label" style={{ fontSize: '1.4rem' }}>Módulo 2: Gestión Administrativa</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Acceso exclusivo para Master/Administrador y Administrador. Contiene la gestión de usuarios,
          sedes, tablas contables históricas y resúmenes financieros consolidados.
        </p>
        
        {/* TODO: Lógica de administración de usuarios y sedes, tabla contable anual */}
      </div>
    </DashboardLayout>
  );
}

export default Modulo2_GestionAdministrativa;
