import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

function Modulo7_GestionMedicaEstadistica() {
  return (
    <DashboardLayout activeModule={7}>
      <div className="gf-card gf-primary-card">
        <h3 className="gf-label" style={{ fontSize: '1.4rem' }}>Módulo 7: Gestión Médica y Estadística</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Acceso exclusivo para el Director Médico. Visualiza la tabla estadística histórica de pacientes
          y permite realizar análisis avanzados mediante solicitudes de texto a la IA Generativa.
        </p>

        {/* TODO: Lógica para revisión de datos históricos con filtros y campo de consultas estadísticas para IA */}
      </div>
    </DashboardLayout>
  );
}

export default Modulo7_GestionMedicaEstadistica;
