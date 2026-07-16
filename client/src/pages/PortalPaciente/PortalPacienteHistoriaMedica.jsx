import React, { useState } from 'react';
import './PortalPacienteHistoriaMedica.css';
import { User, Activity, Heart, Weight } from 'lucide-react';

export function PortalPacienteHistoriaMedica() {
  const userStr = localStorage.getItem('portal_user');
  const user = userStr ? JSON.parse(userStr) : {};

  // Mock data para los campos que aún no vienen del backend
  const [patientData] = useState({
    nombre: user.name || 'Juan Pérez',
    identificacion: user.identificationNumber || 'V-12345678',
    genero: 'Masculino',
    fechaNacimiento: '1985-05-15',
    telefono: '+58 412 1234567',
    email: user.username + '@correo.com',
    sedeAtencion: user.sedeAtencion || 'Sede Central',
    medicoTratante: 'Dr. Roberto Sánchez',
    referente: 'Seguros Mercantil',
    proximaCita: '2026-08-01 14:00',
    direccion: 'Av. Principal, Edificio Centro, Piso 4. Caracas.'
  });

  const [parametros] = useState({
    fc: 75,
    fr: 16,
    ta: '120/80',
    sato2: 98,
    talla: 175,
    peso: 72
  });

  // Calcular Edad automáticamente
  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  // Calcular IMC
  const calcularIMC = (peso, tallaCm) => {
    const tallaM = tallaCm / 100;
    return (peso / (tallaM * tallaM)).toFixed(1);
  };

  return (
    <div className="historia-medica-container">
      <div className="historia-header">
        <h1>Historia Médica</h1>
        <p>Resumen de tu información clínica y datos personales.</p>
      </div>

      <div className="historia-grid">
        {/* Sección 1: Datos del Paciente */}
        <section className="hm-section glass-panel">
          <div className="hm-section-header">
            <User className="hm-icon" size={24} />
            <h2>1. Datos del Cliente / Paciente</h2>
          </div>
          
          <div className="hm-data-grid">
            <div className="hm-data-item">
              <label>Nombre y Apellido</label>
              <span>{patientData.nombre}</span>
            </div>
            <div className="hm-data-item">
              <label>Número de Identificación</label>
              <span>{patientData.identificacion}</span>
            </div>
            <div className="hm-data-item">
              <label>Género</label>
              <span>{patientData.genero}</span>
            </div>
            <div className="hm-data-item">
              <label>Fecha de Nacimiento y Edad</label>
              <span>{patientData.fechaNacimiento} ({calcularEdad(patientData.fechaNacimiento)} años)</span>
            </div>
            <div className="hm-data-item">
              <label>Teléfono</label>
              <span>{patientData.telefono}</span>
            </div>
            <div className="hm-data-item">
              <label>Email</label>
              <span>{patientData.email}</span>
            </div>
            <div className="hm-data-item">
              <label>Sede de Atención</label>
              <span>{patientData.sedeAtencion}</span>
            </div>
            <div className="hm-data-item">
              <label>Médico Tratante</label>
              <span>{patientData.medicoTratante}</span>
            </div>
            <div className="hm-data-item">
              <label>Referente</label>
              <span>{patientData.referente}</span>
            </div>
            <div className="hm-data-item">
              <label>Próxima Cita / Control</label>
              <span className="hm-highlight">{patientData.proximaCita}</span>
            </div>
            <div className="hm-data-item hm-col-span-2">
              <label>Dirección</label>
              <span>{patientData.direccion}</span>
            </div>
          </div>
        </section>

        {/* Sección 2: Parámetros Generales */}
        <section className="hm-section glass-panel">
          <div className="hm-section-header">
            <Activity className="hm-icon" size={24} />
            <h2>2. Parámetros Generales (Última Consulta)</h2>
          </div>
          
          <div className="hm-data-grid">
            <div className="hm-param-card">
              <div className="param-icon-box" style={{backgroundColor: 'rgba(239, 68, 68, 0.1)'}}>
                <Heart size={20} color="#ef4444" />
              </div>
              <div className="param-info">
                <label>Frecuencia Cardíaca (FC)</label>
                <div className="param-value">{parametros.fc} <span>ppm</span></div>
              </div>
            </div>

            <div className="hm-param-card">
              <div className="param-icon-box" style={{backgroundColor: 'rgba(59, 130, 246, 0.1)'}}>
                <Activity size={20} color="#3b82f6" />
              </div>
              <div className="param-info">
                <label>Frecuencia Respiratoria (FR)</label>
                <div className="param-value">{parametros.fr} <span>rpm</span></div>
              </div>
            </div>

            <div className="hm-param-card">
              <div className="param-icon-box" style={{backgroundColor: 'rgba(139, 92, 246, 0.1)'}}>
                <Activity size={20} color="#8b5cf6" />
              </div>
              <div className="param-info">
                <label>Tensión Arterial (TA)</label>
                <div className="param-value">{parametros.ta} <span>mmHg</span></div>
              </div>
            </div>

            <div className="hm-param-card">
              <div className="param-icon-box" style={{backgroundColor: 'rgba(16, 185, 129, 0.1)'}}>
                <Activity size={20} color="#10b981" />
              </div>
              <div className="param-info">
                <label>Saturación de Oxígeno (SatO2)</label>
                <div className="param-value">{parametros.sato2} <span>%</span></div>
              </div>
            </div>

            <div className="hm-param-card">
              <div className="param-icon-box" style={{backgroundColor: 'rgba(245, 158, 11, 0.1)'}}>
                <Activity size={20} color="#f59e0b" />
              </div>
              <div className="param-info">
                <label>Talla</label>
                <div className="param-value">{parametros.talla} <span>cm</span></div>
              </div>
            </div>

            <div className="hm-param-card">
              <div className="param-icon-box" style={{backgroundColor: 'rgba(245, 158, 11, 0.1)'}}>
                <Weight size={20} color="#f59e0b" />
              </div>
              <div className="param-info">
                <label>Peso</label>
                <div className="param-value">{parametros.peso} <span>Kg</span></div>
              </div>
            </div>

            <div className="hm-param-card hm-col-span-2" style={{backgroundColor: 'rgba(42, 183, 202, 0.05)', border: '1px solid var(--color-accent)'}}>
              <div className="param-info" style={{alignItems: 'center', textAlign: 'center', width: '100%'}}>
                <label style={{color: 'var(--color-primary)'}}>Índice de Masa Corporal (IMC)</label>
                <div className="param-value" style={{fontSize: '2rem', color: 'var(--color-accent)'}}>
                  {calcularIMC(parametros.peso, parametros.talla)}
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
