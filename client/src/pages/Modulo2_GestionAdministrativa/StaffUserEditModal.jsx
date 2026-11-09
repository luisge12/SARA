import React, { useState } from 'react';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import api from '../../services/api';
import { User, X, Check, Key, Shield, Building2, Stethoscope, Briefcase } from 'lucide-react';
import { COMMON_SPECIALTIES } from '../../data/clinicalTemplates';
import { getClinicSedes } from '../../services/clinicSettings';

export function StaffUserEditModal({ user, onClose, onSaveSuccess }) {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isMaster = currentUser.role === 'Master' || currentUser.role === 'SuperMaster';
  const clinicSedes = getClinicSedes();

  const [name, setName] = useState(user.name || '');
  const [role, setRole] = useState(user.role || 'Médico');
  const [sedeAtencion, setSedeAtencion] = useState(user.sedeAtencion || clinicSedes[0] || 'CENTRAL');
  const availableSedes = Array.from(new Set([...clinicSedes, ...(sedeAtencion ? [sedeAtencion] : [])]));
  const [identificationNumber, setIdentificationNumber] = useState(user.identificationNumber || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  
  // Específico para Médicos
  const [specialty, setSpecialty] = useState(user.specialty || 'Coloproctología');
  const [mppsNumber, setMppsNumber] = useState(user.mppsNumber || '');
  const [medicalCollegeNumber, setMedicalCollegeNumber] = useState(user.medicalCollegeNumber || '');

  // Específico para Recepcionistas
  const [shift, setShift] = useState(user.shift || 'Mañana');
  const [academicDegree, setAcademicDegree] = useState(user.academicDegree || '');

  // Contraseña opcional
  const [newPassword, setNewPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);

    try {
      const payload = {
        name,
        role,
        sedeAtencion,
        identificationNumber,
        email,
        phone,
        specialty: role === 'Médico' ? specialty : null,
        mppsNumber: role === 'Médico' ? mppsNumber : null,
        medicalCollegeNumber: role === 'Médico' ? medicalCollegeNumber : null,
        shift: role === 'Recepcionista' ? shift : null,
        academicDegree: role === 'Recepcionista' ? academicDegree : null
      };

      if (newPassword && newPassword.trim().length > 0) {
        payload.newPassword = newPassword.trim();
      }

      const res = await api.put(`/api/users/${user.id}`, payload);
      if (onSaveSuccess) {
        onSaveSuccess(res.data.user || payload);
      }
      onClose();
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      setErrorMsg(err.response?.data?.error || 'No se pudo guardar la información del usuario.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Cabecera del Modal */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              padding: '0.6rem',
              borderRadius: '10px',
              display: 'flex'
            }}>
              <User size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text)' }}>
                Editar Usuario: <span style={{ color: 'var(--color-primary)' }}>@{user.username}</span>
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Modifique los accesos, datos laborales o restablezca la contraseña
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '8px',
              display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMsg && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}>
              {errorMsg}
            </div>
          )}

          {/* Fila 1: Nombre completo y Cédula */}
          <div className="responsive-grid-1-1">
            <Input
              label="Nombre Completo"
              type="text"
              placeholder="Ej. Dr. Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Cédula / Documento de Identidad"
              type="text"
              placeholder="Ej. V-12345678"
              value={identificationNumber}
              onChange={(e) => setIdentificationNumber(e.target.value)}
            />
          </div>

          {/* Fila 2: Rol y Sede de Atención */}
          <div className="responsive-grid-1-1">
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Shield size={15} style={{ color: 'var(--color-primary)' }} /> Rol del Sistema *
              </label>
              <select
                className="input-field"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={!isMaster}
                style={{ height: '42px', padding: '0.5rem 1rem' }}
              >
                {isMaster && <option value="Master">Master / Director</option>}
                <option value="Administrador">Administrador</option>
                <option value="Médico">Médico</option>
                <option value="Recepcionista">Recepcionista</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Building2 size={15} style={{ color: 'var(--color-primary)' }} /> Sede de Atención *
              </label>
              <select
                className="input-field"
                value={sedeAtencion}
                onChange={(e) => setSedeAtencion(e.target.value)}
                style={{ height: '42px', padding: '0.5rem 1rem' }}
              >
                {availableSedes.map(sede => (
                  <option key={sede} value={sede}>{sede}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 3: Teléfono y Correo */}
          <div className="responsive-grid-1-1">
            <Input
              label="Teléfono de Contacto"
              type="tel"
              placeholder="Ej. +58 412 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="usuario@clinica.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Campos condicionales para Médicos */}
          {role === 'Médico' && (
            <div style={{
              background: 'rgba(56, 189, 248, 0.05)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontWeight: '600' }}>
                <Stethoscope size={18} /> Datos Profesionales Médicos
              </div>

              <div className="input-group">
                <label className="input-label">Especialidad Médica</label>
                <select
                  className="input-field"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  style={{ height: '42px', padding: '0.5rem 1rem' }}
                >
                  {COMMON_SPECIALTIES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="Otro">Otro / General</option>
                </select>
              </div>

              <div className="responsive-grid-1-1">
                <Input
                  label="Nº Registro MPPS"
                  type="text"
                  placeholder="Ej. MPPS-123456"
                  value={mppsNumber}
                  onChange={(e) => setMppsNumber(e.target.value)}
                />
                <Input
                  label="Nº Colegio de Médicos"
                  type="text"
                  placeholder="Ej. CM-98765"
                  value={medicalCollegeNumber}
                  onChange={(e) => setMedicalCollegeNumber(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Campos condicionales para Recepcionistas */}
          {role === 'Recepcionista' && (
            <div style={{
              background: 'rgba(168, 85, 247, 0.05)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9333ea', fontWeight: '600' }}>
                <Briefcase size={18} /> Turno y Asignación de Recepción
              </div>

              <div className="responsive-grid-1-1">
                <div className="input-group">
                  <label className="input-label">Turno de Trabajo</label>
                  <select
                    className="input-field"
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    style={{ height: '42px', padding: '0.5rem 1rem' }}
                  >
                    <option value="Mañana">Mañana (07:00 - 13:00)</option>
                    <option value="Tarde">Tarde (13:00 - 19:00)</option>
                    <option value="Completo">Jornada Completa</option>
                  </select>
                </div>
                <Input
                  label="Título o Cargo Académico"
                  type="text"
                  placeholder="Ej. TSU en Administración"
                  value={academicDegree}
                  onChange={(e) => setAcademicDegree(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Sección de Reseteo de Contraseña */}
          <div style={{
            background: 'rgba(234, 179, 8, 0.06)',
            border: '1px solid rgba(234, 179, 8, 0.25)',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ca8a04', fontWeight: '600', marginBottom: '0.75rem' }}>
              <Key size={18} /> Restablecer Contraseña (Opcional)
            </div>
            <Input
              label="Nueva Contraseña"
              type="password"
              placeholder="Dejar en blanco para no modificar la contraseña actual"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Solo complete este campo si el usuario olvidó su contraseña o necesita asignarle una nueva clave de acceso inmediato.
            </p>
          </div>

          {/* Botones de acción */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--color-border)'
          }}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              style={{
                background: 'var(--color-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Check size={16} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

