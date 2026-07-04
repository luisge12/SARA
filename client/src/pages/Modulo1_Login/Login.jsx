import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sede, setSede] = useState('CENTRAL');
  const [dateTime, setDateTime] = useState(new Date());

  // Actualizar la fecha y hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Credenciales por defecto (Requerimiento 3.1.2)
    if (username === 'UNIMECO' && password === '18992791') {
      alert('Ingreso exitoso como Master/Administrador');
      // Redirigir temporalmente a la gestión administrativa (Módulo 2)
      navigate('/modulo2');
    } else {
      alert('Credenciales incorrectas. Intente con UNIMECO / 18992791');
    }
  };

  // Formateador de fecha/hora en español
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
    <div className="login-container">
      {/* Membrete Superior (4.1.2) */}
      <header className="login-header">
        <h1 className="brand-title">SARA</h1>
        <h2 className="brand-subtitle">Sistema Administrativo y de Registro Automatizado de Pacientes</h2>
        <p className="live-clock">{formatDateTime(dateTime)}</p>
      </header>

      {/* Centro de la pantalla: Formulario de Login (4.1.4) */}
      <main className="login-main">
        <form onSubmit={handleLogin} className="gf-card gf-primary-card login-card">
          <h3 className="login-card-title">Iniciar Sesión</h3>
          
          {/* Campo Usuario */}
          <div className="gf-input-group">
            <label className="gf-label" htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              className="gf-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              required
            />
          </div>

          {/* Campo Contraseña */}
          <div className="gf-input-group">
            <label className="gf-label" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="gf-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
            />
          </div>

          {/* Campo Sede de Atención (Desplegable) */}
          <div className="gf-input-group">
            <label className="gf-label" htmlFor="sede">Sede de Atención</label>
            <select
              id="sede"
              className="gf-input select-input"
              value={sede}
              onChange={(e) => setSede(e.target.value)}
            >
              <option value="CENTRAL">CENTRAL</option>
              <option value="GMSP">GMSP</option>
              <option value="CCMLA">CCMLA</option>
              <option value="PLA">PLA</option>
            </select>
          </div>

          {/* Botón Entrar */}
          <button type="submit" className="login-submit-btn">
            ENTRAR
          </button>
        </form>
      </main>

      {/* Pie de Página Centrado y Fijo (4.1.3) */}
      <footer className="login-footer">
        <p>
          Producto Desarrollado por la División Tecnológica de <strong>UNICO®</strong> / 
          UNICO® es una marca registrada de UNIMECO, C.A. Todos los derechos reservados.
        </p>
      </footer>

      {/* Estilos locales para ajustar la pantalla de Login en el centro */}
      <style dangerouslySetInnerHTML={{__html: `
        .login-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: var(--bg-app);
          justify-content: space-between;
          padding: 20px;
        }

        .login-header {
          text-align: center;
          margin-top: 20px;
        }

        .brand-title {
          font-size: 3rem;
          color: var(--primary-color);
          font-weight: 700;
          margin-bottom: 5px;
        }

        .brand-subtitle {
          font-size: 1.1rem;
          color: var(--text-muted);
          font-weight: 400;
          margin-bottom: 8px;
        }

        .live-clock {
          font-size: 0.9rem;
          color: var(--text-light);
          text-transform: capitalize;
        }

        .login-main {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-grow: 1;
        }

        .login-card {
          width: 100%;
          max-width: 450px;
          margin: 20px 0;
        }

        .login-card-title {
          font-size: 1.5rem;
          margin-bottom: 24px;
          color: var(--text-main);
          font-weight: 600;
        }

        .select-input {
          cursor: pointer;
        }

        .login-submit-btn {
          width: 100%;
          background-color: var(--primary-color);
          color: #ffffff;
          border: none;
          padding: 12px;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 4px;
          margin-top: 15px;
        }

        .login-submit-btn:hover {
          background-color: var(--primary-hover);
        }

        .login-footer {
          text-align: center;
          color: var(--text-light);
          font-size: 0.8rem;
          padding: 10px 0;
          border-top: 1px solid var(--border-color);
        }
      `}} />
    </div>
  );
}

export default Login;
