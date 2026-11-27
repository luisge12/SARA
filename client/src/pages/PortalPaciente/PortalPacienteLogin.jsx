import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  CreditCard,
  Mail,
  Phone,
  Check,
  X,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { portalApi } from '../../services/api';

const MedicalCrossBg = () => (
  <svg
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '150%',
      height: '150%',
      zIndex: 0,
      pointerEvents: 'none'
    }}
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M35,10 h30 v25 h25 v30 h-25 v25 h-30 v-25 h-25 v-30 h25 z"
      fill="rgba(42, 183, 202, 0.04)"
    />
  </svg>
);

const CornerCircles = () => (
  <svg
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '500px',
      height: '500px',
      zIndex: 0,
      pointerEvents: 'none'
    }}
    viewBox="0 0 300 300"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="0" cy="0" r="220" fill="rgba(42, 183, 202, 0.08)" />
    <circle cx="60" cy="60" r="140" fill="rgba(34, 80, 93, 0.05)" />
    <circle cx="0" cy="0" r="160" fill="rgba(42, 183, 202, 0.1)" />
  </svg>
);

const PASSWORD_RULES = [
  { id: 'length', label: 'Mínimo 8 caracteres', test: (pwd) => pwd.length >= 8 },
  { id: 'upper', label: 'Al menos una letra mayúscula (A-Z)', test: (pwd) => /[A-Z]/.test(pwd) },
  { id: 'lower', label: 'Al menos una letra minúscula (a-z)', test: (pwd) => /[a-z]/.test(pwd) },
  { id: 'number', label: 'Al menos un número (0-9)', test: (pwd) => /[0-9]/.test(pwd) },
  { id: 'special', label: 'Al menos un carácter especial (!@#$%^&*...)', test: (pwd) => /[^A-Za-z0-9]/.test(pwd) }
];

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem 0.75rem 2.85rem',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  backgroundColor: 'var(--color-bg-card)',
  color: 'var(--color-text-main)',
  fontSize: '0.92rem',
  boxSizing: 'border-box'
};

const passwordInputStyle = {
  ...inputStyle,
  paddingRight: '2.8rem'
};

const iconWrapperStyle = {
  position: 'absolute',
  top: '50%',
  left: '0.9rem',
  transform: 'translateY(-50%)',
  color: 'var(--color-text-muted)',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center'
};

const labelStyle = {
  display: 'block',
  textAlign: 'left',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--color-text-main)',
  marginBottom: '0.3rem'
};

export function PortalPacienteLogin() {
  const navigate = useNavigate();

  // Modo: 'login' | 'register'
  const [mode, setMode] = useState('login');

  // Estados de inicio de sesión
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados de registro de paciente
  const [regName, setRegName] = useState('');
  const [regIdNumber, setRegIdNumber] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirigir si ya existe sesión activa de paciente
  useEffect(() => {
    const token = localStorage.getItem('portal_token');
    const userStr = localStorage.getItem('portal_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.role?.toLowerCase().replace(/\s+/g, '') === 'paciente') {
          navigate('/users/dashboard', { replace: true });
        }
      } catch {
        localStorage.removeItem('portal_token');
        localStorage.removeItem('portal_user');
      }
    }
  }, [navigate]);

  // Evaluación en tiempo real de seguridad de contraseña
  const passwordEval = useMemo(() => {
    const checks = PASSWORD_RULES.map((rule) => ({
      ...rule,
      passed: rule.test(regPassword)
    }));
    const passedCount = checks.filter((c) => c.passed).length;
    const allPassed = passedCount === PASSWORD_RULES.length;

    let label = 'Sin evaluar';
    let color = '#94a3b8';
    if (regPassword.length > 0) {
      if (passedCount <= 2) {
        label = 'Débil';
        color = '#ef4444';
      } else if (passedCount === 3) {
        label = 'Media';
        color = '#f59e0b';
      } else if (passedCount === 4) {
        label = 'Fuerte';
        color = '#0284c7';
      } else {
        label = 'Muy Segura';
        color = '#10b981';
      }
    }

    return { checks, passedCount, allPassed, label, color };
  }, [regPassword]);

  const passwordsMatch =
    regConfirmPassword.length > 0 && regPassword === regConfirmPassword;
  const passwordsMismatch =
    regConfirmPassword.length > 0 && regPassword !== regConfirmPassword;

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrorMsg('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const response = await portalApi.post('/api/users/login', {
        username: username.trim(),
        password
      });
      const { token, user, expiresIn } = response.data;

      if (user.role !== 'Paciente') {
        setErrorMsg('Acceso exclusivo para pacientes.');
        return;
      }

      localStorage.setItem('portal_token', token);
      localStorage.setItem('portal_user', JSON.stringify(user));
      localStorage.setItem(
        'session_expires_at',
        String(Date.now() + (expiresIn || 24 * 60 * 60 * 1000))
      );
      navigate('/users/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = regName.trim();
    const cleanId = regIdNumber.trim();
    const cleanUsername = regUsername.trim();

    if (cleanName.length < 3) {
      setErrorMsg('Ingresa tu nombre completo (mínimo 3 caracteres).');
      return;
    }
    if (cleanId.length < 4) {
      setErrorMsg('Ingresa un número de cédula o documento de identidad válido.');
      return;
    }
    if (cleanUsername.length < 4 || !/^[a-zA-Z0-9._-]+$/.test(cleanUsername)) {
      setErrorMsg(
        'El usuario debe tener al menos 4 caracteres y solo puede contener letras, números, puntos, guiones o guion bajo (sin espacios).'
      );
      return;
    }
    if (!passwordEval.allPassed) {
      setErrorMsg(
        'Tu contraseña aún no cumple todos los requisitos de seguridad indicados.'
      );
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Verifica ambos campos.');
      return;
    }

    setLoading(true);
    try {
      const response = await portalApi.post('/api/users/register-patient', {
        name: cleanName,
        identificationNumber: cleanId,
        phone: regPhone.trim(),
        email: regEmail.trim(),
        username: cleanUsername,
        password: regPassword
      });

      const { token, user, expiresIn } = response.data;
      localStorage.setItem('portal_token', token);
      localStorage.setItem('portal_user', JSON.stringify(user));
      localStorage.setItem(
        'session_expires_at',
        String(Date.now() + (expiresIn || 24 * 60 * 60 * 1000))
      );
      navigate('/users/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.error ||
          err.message ||
          'No se pudo completar el registro. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const eyeBtnStyle = (active) => ({
    position: 'absolute',
    top: '50%',
    right: '0.65rem',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    padding: '0.25rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
    borderRadius: '6px'
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-main)',
        position: 'relative',
        overflow: 'hidden',
        padding: '2rem 1rem'
      }}
    >
      <MedicalCrossBg />
      <CornerCircles />

      <div
        style={{
          zIndex: 1,
          textAlign: 'center',
          marginBottom: '1.5rem',
          maxWidth: '600px',
          padding: '0 1rem'
        }}
      >
        <h1
          style={{
            fontSize: '3.25rem',
            fontWeight: 800,
            color: 'var(--color-text-main)',
            margin: '0 0 0.35rem 0',
            letterSpacing: '2px'
          }}
        >
          S.A.R.A.
        </h1>
        <p
          style={{
            fontSize: '1rem',
            fontWeight: 500,
            color: 'var(--color-text-muted)',
            lineHeight: 1.4,
            margin: 0
          }}
        >
          Sistema Administrativo y de Registro Automatizado de Pacientes
        </p>
      </div>

      <div
        className="glass-panel"
        style={{
          maxWidth: mode === 'register' ? '490px' : '420px',
          width: '100%',
          padding: '2.25rem 2rem',
          textAlign: 'center',
          zIndex: 1,
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
          transition: 'max-width 0.25s ease'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}
        >
          <div
            style={{
              width: '58px',
              height: '58px',
              backgroundColor: 'var(--color-primary)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(34, 80, 93, 0.2)'
            }}
          >
            <Activity size={28} color="var(--color-accent)" />
          </div>
        </div>

        <h2
          style={{
            fontSize: '1.3rem',
            color: 'var(--color-text-main)',
            marginBottom: '0.2rem',
            fontWeight: 700
          }}
        >
          Portal del Paciente
        </h2>
        <p
          style={{
            color: 'var(--color-text-muted)',
            fontSize: '0.86rem',
            marginBottom: '1.4rem'
          }}
        >
          {mode === 'login'
            ? 'Consulta tus citas, historia clínica y resultados'
            : 'Crea tu usuario seguro para acceder a tu portal médico'}
        </p>

        {/* Selector de Modo: Iniciar Sesión / Crear Cuenta */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.35rem',
            padding: '0.3rem',
            backgroundColor: 'var(--color-bg-main)',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            marginBottom: '1.4rem'
          }}
        >
          <button
            type="button"
            onClick={() => switchMode('login')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.6rem 0.75rem',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: 'pointer',
              backgroundColor:
                mode === 'login' ? 'var(--color-primary)' : 'transparent',
              color: mode === 'login' ? '#ffffff' : 'var(--color-text-muted)',
              transition: 'all 0.2s ease'
            }}
          >
            <LogIn size={15} /> Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.6rem 0.75rem',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: 'pointer',
              backgroundColor:
                mode === 'register' ? 'var(--color-primary)' : 'transparent',
              color: mode === 'register' ? '#ffffff' : 'var(--color-text-muted)',
              transition: 'all 0.2s ease'
            }}
          >
            <UserPlus size={15} /> Crear Usuario
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: 'var(--color-alert)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textAlign: 'left'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {mode === 'login' ? (
          <form
            onSubmit={handleLogin}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div>
              <label style={labelStyle}>Usuario</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrapperStyle}>
                  <User size={18} />
                </div>
                <input
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrapperStyle}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                  style={passwordInputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  style={eyeBtnStyle(showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '0.8rem',
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1,
                transition: 'all 0.2s',
                fontSize: '0.98rem'
              }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>

            <p
              style={{
                margin: '0.5rem 0 0',
                fontSize: '0.84rem',
                color: 'var(--color-text-muted)'
              }}
            >
              ¿Eres paciente nuevo?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                Crea tu usuario aquí
              </button>
            </p>
          </form>
        ) : (
          <form
            onSubmit={handleRegister}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
          >
            <div>
              <label style={labelStyle}>Nombre Completo *</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrapperStyle}>
                  <User size={17} />
                </div>
                <input
                  type="text"
                  placeholder="Ej: María Fernanda Pérez"
                  value={regName}
                  onChange={(e) => {
                    setRegName(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Cédula / Documento de Identidad *</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrapperStyle}>
                  <CreditCard size={17} />
                </div>
                <input
                  type="text"
                  placeholder="Ej: V-12345678"
                  value={regIdNumber}
                  onChange={(e) => {
                    setRegIdNumber(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
                gap: '0.75rem'
              }}
            >
              <div>
                <label style={labelStyle}>Teléfono (opcional)</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapperStyle}>
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    placeholder="Ej: 0414-1234567"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Correo Electrónico (opcional)</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapperStyle}>
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Nombre de Usuario *</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrapperStyle}>
                  <UserPlus size={17} />
                </div>
                <input
                  type="text"
                  placeholder="Sin espacios (ej: mperez o tu cédula)"
                  value={regUsername}
                  onChange={(e) => {
                    setRegUsername(e.target.value.replace(/\s+/g, ''));
                    setErrorMsg('');
                  }}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Contraseña Segura *</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrapperStyle}>
                  <Lock size={17} />
                </div>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  placeholder="Crea una contraseña segura"
                  value={regPassword}
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                  style={passwordInputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showRegPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  style={eyeBtnStyle(showRegPassword)}
                >
                  {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Indicador de fortaleza y checklist de seguridad */}
              <div
                style={{
                  marginTop: '0.6rem',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-bg-main)',
                  border: '1px solid var(--border-color)',
                  textAlign: 'left'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.45rem',
                    fontSize: '0.76rem',
                    fontWeight: 700
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: 'var(--color-text-main)'
                    }}
                  >
                    <ShieldCheck size={14} color={passwordEval.color} />
                    Seguridad de la contraseña
                  </span>
                  <span style={{ color: passwordEval.color }}>
                    {passwordEval.label}
                  </span>
                </div>

                {/* Barra de progreso en 5 segmentos */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '4px',
                    marginBottom: '0.6rem'
                  }}
                >
                  {PASSWORD_RULES.map((rule, idx) => (
                    <div
                      key={rule.id}
                      style={{
                        height: '5px',
                        borderRadius: '4px',
                        backgroundColor:
                          idx < passwordEval.passedCount
                            ? passwordEval.color
                            : 'rgba(148, 163, 184, 0.3)',
                        transition: 'background-color 0.2s ease'
                      }}
                    />
                  ))}
                </div>

                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.28rem'
                  }}
                >
                  {passwordEval.checks.map((item) => (
                    <li
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.75rem',
                        fontWeight: item.passed ? 600 : 500,
                        color: item.passed ? '#059669' : 'var(--color-text-muted)'
                      }}
                    >
                      {item.passed ? (
                        <Check size={13} color="#059669" style={{ flexShrink: 0 }} />
                      ) : (
                        <X size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
                      )}
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Confirmar Contraseña *</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrapperStyle}>
                  <Lock size={17} />
                </div>
                <input
                  type={showRegConfirmPassword ? 'text' : 'password'}
                  placeholder="Repite tu contraseña"
                  value={regConfirmPassword}
                  onChange={(e) => {
                    setRegConfirmPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                  style={{
                    ...passwordInputStyle,
                    borderColor: passwordsMismatch
                      ? '#ef4444'
                      : passwordsMatch
                      ? '#10b981'
                      : 'var(--border-color)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={
                    showRegConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'
                  }
                  style={eyeBtnStyle(showRegConfirmPassword)}
                >
                  {showRegConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordsMismatch && (
                <div
                  style={{
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    color: '#ef4444',
                    fontWeight: 600,
                    marginTop: '0.3rem'
                  }}
                >
                  Las contraseñas no coinciden.
                </div>
              )}
              {passwordsMatch && (
                <div
                  style={{
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    color: '#059669',
                    fontWeight: 600,
                    marginTop: '0.3rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Check size={13} /> Las contraseñas coinciden.
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !passwordEval.allPassed || !passwordsMatch}
              style={{
                marginTop: '0.4rem',
                padding: '0.82rem',
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor:
                  loading || !passwordEval.allPassed || !passwordsMatch
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  loading || !passwordEval.allPassed || !passwordsMatch ? 0.6 : 1,
                transition: 'all 0.2s',
                fontSize: '0.96rem'
              }}
            >
              {loading ? 'Creando cuenta...' : 'Crear Usuario'}
            </button>

            <p
              style={{
                margin: '0.35rem 0 0',
                fontSize: '0.84rem',
                color: 'var(--color-text-muted)'
              }}
            >
              ¿Ya tienes usuario?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                Inicia sesión aquí
              </button>
            </p>
          </form>
        )}

        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)'
          }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.82rem',
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={14} /> Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
