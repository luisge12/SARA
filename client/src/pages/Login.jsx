import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, AlertTriangle, ExternalLink, X } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import api from '../services/api';
import './Login.css';

const PatientNetworkBg = () => (
  <svg className="network-bg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M 100 150 L 250 100 L 400 200 L 550 150 L 700 250 M 250 100 L 300 300 L 400 200 M 300 300 L 150 450 L 100 150 M 550 150 L 600 350 L 400 200 M 600 350 L 700 500 L 700 250 M 300 300 L 450 450 L 600 350 M 450 450 L 250 550 L 150 450" 
      stroke="rgba(42, 183, 202, 0.25)" 
      strokeWidth="2" 
      fill="none" 
    />
    <g fill="rgba(34, 80, 93, 0.4)">
      <circle cx="100" cy="150" r="15" />
      <circle cx="250" cy="100" r="20" />
      <circle cx="400" cy="200" r="28" fill="rgba(42, 183, 202, 0.6)" />
      <circle cx="550" cy="150" r="18" />
      <circle cx="700" cy="250" r="14" />
      <circle cx="300" cy="300" r="22" />
      <circle cx="150" cy="450" r="16" />
      <circle cx="600" cy="350" r="20" />
      <circle cx="700" cy="500" r="15" />
      <circle cx="450" cy="450" r="18" />
      <circle cx="250" cy="550" r="12" />
    </g>
    <g stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 390 208 v -2 a 10 10 0 0 1 20 0 v 2" />
      <circle cx="400" cy="196" r="5" />
      <path d="M 293 306 v -1 a 7 7 0 0 1 14 0 v 1" />
      <circle cx="300" cy="297" r="3.5" />
      <path d="M 594 356 v -1 a 6 6 0 0 1 12 0 v 1" />
      <circle cx="600" cy="347" r="3" />
      <path d="M 244 106 v -1 a 6 6 0 0 1 12 0 v 1" />
      <circle cx="250" cy="97" r="3" />
    </g>
  </svg>
);

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());

  // Actualizar la fecha y hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    try {
      const response = await api.post('/api/users/login', { username, password });
      const { token, user } = response.data;
      
      // Bloqueo de Pacientes en la App Principal (Clínica)
      if (user.role === 'Paciente') {
        setShowPatientModal(true);
        return;
      }
      
      // Guardar token y datos de usuario en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirigir al Dashboard nuevo de SARA
      navigate('/dashboard');
    } catch (err) {
      console.error('Error de login:', err);
      const errMsg = err.response?.data?.error || 'Error de conexión con el servidor backend';
      setErrorMsg(errMsg);
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
      hour12: true
    });
  };

  return (
    <div className="login-container">
      <div className="login-bg-shape login-bg-shape-1"></div>
      <div className="login-bg-shape login-bg-shape-2"></div>
      <PatientNetworkBg />
      
      <div className="login-card glass-panel">
        <div className="login-header">
          <h1 className="login-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', letterSpacing: '4px', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>
            SARA
          </h1>
          <p className="login-subtitle">Sistema Avanzado de Registros Asistenciales</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', textTransform: 'capitalize' }}>
            {formatDateTime(dateTime)}
          </p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <Input 
            label="Usuario"
            type="text" 
            placeholder="Ingrese su usuario" 
            icon={<User size={18} />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          <Input 
            label="Contraseña"
            type="password" 
            placeholder="••••••••" 
            icon={<Lock size={18} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth className="login-submit">
            Ingresar
          </Button>
        </form>
      </div>

      {showPatientModal && (
        <div className="patient-modal-overlay">
          <div className="patient-modal-content">
            <button className="patient-modal-close" onClick={() => setShowPatientModal(false)}>
              <X size={20} />
            </button>
            <div className="patient-modal-icon-wrapper">
              <AlertTriangle size={32} className="patient-modal-icon" />
            </div>
            <h2 className="patient-modal-title">Acceso Denegado</h2>
            <p className="patient-modal-text">
              Tu cuenta está registrada como <strong>Paciente</strong>. Por motivos de seguridad y privacidad, el acceso a esta plataforma administrativa está restringido.
            </p>
            <p className="patient-modal-text">
              Por favor, dirígete al <strong>Portal de Usuarios</strong> para consultar tu información clínica, citas y documentos.
            </p>
            <Link to="/users" className="patient-modal-link-btn">
              Ir al Portal de Usuarios <ExternalLink size={16} style={{ marginLeft: '8px' }} />
            </Link>
          </div>
        </div>
      )}

      <footer className="login-footer-text">
        <p>
          Producto Desarrollado por FrailejonDEV
        </p>
      </footer>
    </div>
  );
}
