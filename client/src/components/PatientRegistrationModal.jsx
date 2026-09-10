import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';
import api from '../services/api';

export function PatientRegistrationModal({ onClose, onSuccess, initialData = null }) {
  const [username, setUsername] = useState(initialData?.username || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(initialData?.name || '');
  const [identificationNumber, setIdentificationNumber] = useState(initialData?.identificationNumber || '');
  const [sedeAtencion, setSedeAtencion] = useState(initialData?.sedeAtencion || 'CENTRAL');
  
  const profile = initialData?.profile || initialData?.patientProfile || {};
  const [gender, setGender] = useState(profile.gender || 'Masculino');
  // Format date for input type="date"
  const formattedDate = profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '';
  const [dateOfBirth, setDateOfBirth] = useState(formattedDate);
  const [phone, setPhone] = useState(profile.phone || '');
  const [email, setEmail] = useState(profile.email || '');
  const [treatingDoctor, setTreatingDoctor] = useState(profile.treatingDoctor || '');
  const [referringEntity, setReferringEntity] = useState(profile.referringEntity || '');
  const [address, setAddress] = useState(profile.address || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const payload = {
        name,
        identificationNumber,
        sedeAtencion,
        gender,
        dateOfBirth,
        phone,
        email,
        treatingDoctor,
        referringEntity,
        address
      };

      if (initialData) {
        // Edit mode
        await api.put(`/api/patients/${initialData.id}/profile`, payload);
      } else {
        // Create mode
        payload.username = username;
        payload.password = password;
        payload.role = 'Paciente';
        await api.post('/api/users/register', payload);
      }

      onSuccess();
    } catch (err) {
      console.error('Error al procesar paciente:', err);
      setErrorMsg(err.response?.data?.error || 'Error al procesar el paciente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>{initialData ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}</h2>
        
        {errorMsg && (
          <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-alert)', marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!initialData && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Nombre de Usuario *" type="text" placeholder="ej. juanperez" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <Input label="Contraseña *" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          )}

          <Input label="Nombre Completo *" type="text" placeholder="Nombre y Apellido" value={name} onChange={(e) => setName(e.target.value)} required />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="C.I. o Pasaporte *" type="text" value={identificationNumber} onChange={(e) => setIdentificationNumber(e.target.value)} required />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Sede de Atención</label>
              <select value={sedeAtencion} onChange={(e) => setSedeAtencion(e.target.value)} style={{ padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <option value="CENTRAL">CENTRAL</option>
                <option value="GMSP">GMSP</option>
                <option value="CCMLA">CCMLA</option>
                <option value="PLA">PLA</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Género</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ padding: '0.625rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <Input label="Fecha de Nacimiento" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Teléfono" type="text" placeholder="+58 412 1234567" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="Email" type="email" placeholder="correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Médico Tratante" type="text" placeholder="Dr. Nombre Apellido" value={treatingDoctor} onChange={(e) => setTreatingDoctor(e.target.value)} />
            <Input label="Entidad Referente" type="text" placeholder="Seguros Mercantil, etc." value={referringEntity} onChange={(e) => setReferringEntity(e.target.value)} />
          </div>

          <Input label="Dirección" type="text" placeholder="Dirección completa" value={address} onChange={(e) => setAddress(e.target.value)} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button type="button" onClick={onClose} style={{ background: '#f3f4f6', color: '#374151' }}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? (initialData ? 'Actualizando...' : 'Guardando...') : (initialData ? 'Actualizar Paciente' : 'Registrar Paciente')}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
