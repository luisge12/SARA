import React, { useState, useEffect } from 'react';
import './PortalPacienteHistoriaMedica.css';
import { User, Activity, Heart, Weight } from 'lucide-react';
import { portalApi } from '../../services/api';

export function PortalPacienteHistoriaMedica() {
  const userStr = localStorage.getItem('portal_user');
  const user = userStr ? JSON.parse(userStr) : {};
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const res = await portalApi.get(`/api/patients/${user.id}/profile`);
        setProfileData(res.data);
      } catch (err) {
        console.error('Error al cargar perfil del paciente:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id]);

  const pProfile = profileData?.patientProfile || {};

  // Calcular Edad automáticamente
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return '';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    if (isNaN(nacimiento.getTime())) return '';
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad > 0 ? `(${edad} años)` : '';
  };

  // Calcular IMC
  const calcularIMC = (peso, tallaCm) => {
    if (!peso || !tallaCm || parseFloat(tallaCm) === 0) return '-';
    const tallaM = parseFloat(tallaCm) / 100;
    return (parseFloat(peso) / (tallaM * tallaM)).toFixed(1);
  };

  const nombre = profileData?.name || user.name || '-';
  const identificacion = profileData?.identificationNumber || user.identificationNumber || '-';
  const genero = pProfile.gender || '-';
  const fechaNacimiento = pProfile.dateOfBirth ? `${pProfile.dateOfBirth} ${calcularEdad(pProfile.dateOfBirth)}` : '-';
  const telefono = pProfile.phone || '-';
  const email = pProfile.email || user.username || '-';
  const sedeAtencion = profileData?.sedeAtencion || user.sedeAtencion || '-';
  const medicoTratante = pProfile.treatingDoctor || '-';
  const referente = pProfile.referringEntity || '-';
  const proximaCita = pProfile.nextAppointment ? new Date(pProfile.nextAppointment).toLocaleString('es-ES') : '-';
  const direccion = pProfile.address || '-';

  const fc = pProfile.heartRate ? `${pProfile.heartRate}` : '-';
  const fr = pProfile.respiratoryRate ? `${pProfile.respiratoryRate}` : '-';
  const ta = pProfile.bloodPressure || '-';
  const sato2 = pProfile.oxygenSaturation ? `${pProfile.oxygenSaturation}` : '-';
  const talla = pProfile.heightCm ? `${pProfile.heightCm}` : '-';
  const peso = pProfile.weightKg ? `${pProfile.weightKg}` : '-';

  return (
    <div className="historia-medica-container">
      <div className="historia-header">
        <h1>Historia Médica</h1>
        <p>Resumen de tu información clínica y datos personales.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          Cargando datos clínicos...
        </div>
      ) : (
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
                <span>{nombre}</span>
              </div>
              <div className="hm-data-item">
                <label>Número de Identificación</label>
                <span>{identificacion}</span>
              </div>
              <div className="hm-data-item">
                <label>Género</label>
                <span>{genero}</span>
              </div>
              <div className="hm-data-item">
                <label>Fecha de Nacimiento y Edad</label>
                <span>{fechaNacimiento}</span>
              </div>
              <div className="hm-data-item">
                <label>Teléfono</label>
                <span>{telefono}</span>
              </div>
              <div className="hm-data-item">
                <label>Email</label>
                <span>{email}</span>
              </div>
              <div className="hm-data-item">
                <label>Sede de Atención</label>
                <span>{sedeAtencion}</span>
              </div>
              <div className="hm-data-item">
                <label>Médico Tratante</label>
                <span>{medicoTratante}</span>
              </div>
              <div className="hm-data-item">
                <label>Referente</label>
                <span>{referente}</span>
              </div>
              <div className="hm-data-item">
                <label>Próxima Cita / Control</label>
                <span className="hm-highlight">{proximaCita}</span>
              </div>
              <div className="hm-data-item hm-col-span-2">
                <label>Dirección</label>
                <span>{direccion}</span>
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
                  <div className="param-value">{fc} {fc !== '-' && <span>ppm</span>}</div>
                </div>
              </div>

              <div className="hm-param-card">
                <div className="param-icon-box" style={{backgroundColor: 'rgba(59, 130, 246, 0.1)'}}>
                  <Activity size={20} color="#3b82f6" />
                </div>
                <div className="param-info">
                  <label>Frecuencia Respiratoria (FR)</label>
                  <div className="param-value">{fr} {fr !== '-' && <span>rpm</span>}</div>
                </div>
              </div>

              <div className="hm-param-card">
                <div className="param-icon-box" style={{backgroundColor: 'rgba(139, 92, 246, 0.1)'}}>
                  <Activity size={20} color="#8b5cf6" />
                </div>
                <div className="param-info">
                  <label>Tensión Arterial (TA)</label>
                  <div className="param-value">{ta} {ta !== '-' && <span>mmHg</span>}</div>
                </div>
              </div>

              <div className="hm-param-card">
                <div className="param-icon-box" style={{backgroundColor: 'rgba(16, 185, 129, 0.1)'}}>
                  <Activity size={20} color="#10b981" />
                </div>
                <div className="param-info">
                  <label>Saturación de Oxígeno (SatO2)</label>
                  <div className="param-value">{sato2} {sato2 !== '-' && <span>%</span>}</div>
                </div>
              </div>

              <div className="hm-param-card">
                <div className="param-icon-box" style={{backgroundColor: 'rgba(245, 158, 11, 0.1)'}}>
                  <Activity size={20} color="#f59e0b" />
                </div>
                <div className="param-info">
                  <label>Talla</label>
                  <div className="param-value">{talla} {talla !== '-' && <span>cm</span>}</div>
                </div>
              </div>

              <div className="hm-param-card">
                <div className="param-icon-box" style={{backgroundColor: 'rgba(245, 158, 11, 0.1)'}}>
                  <Weight size={20} color="#f59e0b" />
                </div>
                <div className="param-info">
                  <label>Peso</label>
                  <div className="param-value">{peso} {peso !== '-' && <span>Kg</span>}</div>
                </div>
              </div>

              <div className="hm-param-card hm-col-span-2" style={{backgroundColor: 'rgba(42, 183, 202, 0.05)', border: '1px solid var(--color-accent)'}}>
                <div className="param-info" style={{alignItems: 'center', textAlign: 'center', width: '100%'}}>
                  <label style={{color: 'var(--color-primary)'}}>Índice de Masa Corporal (IMC)</label>
                  <div className="param-value" style={{fontSize: '2rem', color: 'var(--color-accent)'}}>
                    {calcularIMC(pProfile.weightKg, pProfile.heightCm)}
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>
      )}
    </div>
  );
}
