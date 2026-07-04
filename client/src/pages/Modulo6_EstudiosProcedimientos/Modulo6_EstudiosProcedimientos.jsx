import React from 'react';

function Modulo6_EstudiosProcedimientos({ isOpen, onClose, patientId }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="gf-card gf-primary-card" style={{ width: '80%', maxWidth: '700px', backgroundColor: '#fff' }}>
        <button className="gf-btn-close" onClick={onClose}>&times;</button>
        <h3 className="gf-label" style={{ fontSize: '1.4rem' }}>Módulo 6: Estudios y Procedimientos Médicos</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Ventana emergente para cargar nota operatoria, informe evolutivo y subir archivos adjuntos del paciente {patientId}.
        </p>

        {/* TODO: Lógica para agregar notas operatorias, adjuntos y estudios médicos */}
      </div>
    </div>
  );
}

export default Modulo6_EstudiosProcedimientos;
