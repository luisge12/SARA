import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import './Login.css';

const PatientNetworkBg = () => (
  <svg className="network-bg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    {/* Network Connections */}
    <path 
      d="M 100 150 L 250 100 L 400 200 L 550 150 L 700 250 M 250 100 L 300 300 L 400 200 M 300 300 L 150 450 L 100 150 M 550 150 L 600 350 L 400 200 M 600 350 L 700 500 L 700 250 M 300 300 L 450 450 L 600 350 M 450 450 L 250 550 L 150 450" 
      stroke="rgba(42, 183, 202, 0.25)" 
      strokeWidth="2" 
      fill="none" 
    />
    
    {/* Patient Nodes */}
    <g fill="rgba(34, 80, 93, 0.4)">
      <circle cx="100" cy="150" r="15" />
      <circle cx="250" cy="100" r="20" />
      <circle cx="400" cy="200" r="28" fill="rgba(42, 183, 202, 0.6)" /> {/* Central node */}
      <circle cx="550" cy="150" r="18" />
      <circle cx="700" cy="250" r="14" />
      <circle cx="300" cy="300" r="22" />
      <circle cx="150" cy="450" r="16" />
      <circle cx="600" cy="350" r="20" />
      <circle cx="700" cy="500" r="15" />
      <circle cx="450" cy="450" r="18" />
      <circle cx="250" cy="550" r="12" />
    </g>

    {/* User Icons inside nodes */}
    <g stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Node 400,200 (Central) */}
      <path d="M 390 208 v -2 a 10 10 0 0 1 20 0 v 2" />
      <circle cx="400" cy="196" r="5" />
      
      {/* Node 300,300 */}
      <path d="M 293 306 v -1 a 7 7 0 0 1 14 0 v 1" />
      <circle cx="300" cy="297" r="3.5" />

      {/* Node 600,350 */}
      <path d="M 594 356 v -1 a 6 6 0 0 1 12 0 v 1" />
      <circle cx="600" cy="347" r="3" />
      
      {/* Node 250,100 */}
      <path d="M 244 106 v -1 a 6 6 0 0 1 12 0 v 1" />
      <circle cx="250" cy="97" r="3" />
    </g>
  </svg>
);

export function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, perform auth here. For now, redirect to dashboard.
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-bg-shape login-bg-shape-1"></div>
      <div className="login-bg-shape login-bg-shape-2"></div>
      <PatientNetworkBg />
      
      <div className="login-card glass-panel">
        <div className="login-header">
          <h1 className="login-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', letterSpacing: '4px', marginBottom: '0.5rem' }}>
            SARA
          </h1>
          <p className="login-subtitle">Sistema Avanzado de Registros Asistenciales</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <Input 
            label="Email or Username"
            type="text" 
            placeholder="doctor@saraclinic.com" 
            icon={<User size={18} />}
            required
          />
          
          <div className="password-field">
            <Input 
              label="Password"
              type="password" 
              placeholder="••••••••" 
              icon={<Lock size={18} />}
              required
            />
            <div className="forgot-password">
              <a href="#">Forgot password?</a>
            </div>
          </div>

          <Button type="submit" fullWidth className="login-submit">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
