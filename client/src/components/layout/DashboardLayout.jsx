import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardLayout({ children, activeModule }) {
  const navigate = useNavigate();
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    // TODO: Lógica de cierre de sesión
    navigate('/login');
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="sara-grid-container">
      {/* Membrete Superior: Ocupa toda la Fila 1 */}
      <header className="sara-header">
        <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>SARA</h1>
        <h2 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Sistema Administrativo y de Registro Automatizado de Pacientes</h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'capitalize' }}>
          {formatDateTime(dateTime)}
        </span>
      </header>

      {/* Sidebar Izquierdo: Ocupa Fila 2 a 4, Columna 1 */}
      <aside className="sara-sidebar">
        <h3>Menú</h3>
        {/* TODO: Agregar microfichas, filtros de búsqueda y navegación */}
      </aside>

      {/* Zona Principal: Ocupa Fila 2 a 4, Columnas 2 a 5 */}
      <main className="sara-main-zone">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <button 
            onClick={handleLogout} 
            className="gf-btn" 
            style={{ backgroundColor: '#f44336', color: '#fff' }}
          >
            SALIR
          </button>
        </div>
        {children}
      </main>

      {/* Pie de Página: Ocupa toda la Fila 5 */}
      <footer className="sara-footer">
        <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
          Producto Desarrollado por la División Tecnológica de <strong>UNICO®</strong> / 
          UNICO® es una marca registrada de UNIMECO, C.A. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}

export default DashboardLayout;
