import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

function Modulo4_DatosClinicos() {
  return (
    <DashboardLayout activeModule={4}>
      <div className="gf-card gf-primary-card">
        <h3 className="gf-label" style={{ fontSize: '1.4rem' }}>Módulo 4: Datos Clínicos del Paciente</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Acceso para Médicos Tratantes, Asistentes Médicos y Director Médico. Contiene el historial de signos vitales,
          motivos de consulta asistidos por IA, hallazgos, diagnósticos detallados, planes de trabajo y documentos adjuntos.
        </p>

        {/* TODO: Lógica de secciones clínicas, cálculos de IMC, integración con Gemini para resumen clínico e informes en PDF */}
      </div>
    </DashboardLayout>
  );
}

export default Modulo4_DatosClinicos;
