import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

function Modulo3_RegistroCaja() {
  return (
    <DashboardLayout activeModule={3}>
      <div className="gf-card gf-primary-card">
        <h3 className="gf-label" style={{ fontSize: '1.4rem' }}>Módulo 3: Registro de Cliente y Caja</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Acceso para Asistente Administrativo, Administrador y Master. Gestiona el registro de datos del paciente,
          la agenda de citas, y la carga y facturación de servicios (dentro y fuera de consultorio).
        </p>

        {/* TODO: Lógica de ingreso de tasas de cambio diarias, calendario de citas y secciones de servicios */}
      </div>
    </DashboardLayout>
  );
}

export default Modulo3_RegistroCaja;
