import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import api from '../../services/api';
import { Trash2, UserPlus, ShieldAlert, Users } from 'lucide-react';

import { PatientProfileEditor } from './PatientProfileEditor';

function Modulo2_GestionAdministrativa() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isMaster = currentUser.role === 'Master';
  const hasAccess = ['Master', 'Administrador', 'Recepcionista', 'Médico'].includes(currentUser.role);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // State lists
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const initialRole = isMaster ? 'Administrador' : 'Paciente';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [identificationNumber, setIdentificationNumber] = useState('');
  const [mppsNumber, setMppsNumber] = useState('');
  const [medicalCollegeNumber, setMedicalCollegeNumber] = useState('');
  const [sedeAtencion, setSedeAtencion] = useState('CENTRAL');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Paciente specific states
  const [gender, setGender] = useState('Masculino');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [treatingDoctor, setTreatingDoctor] = useState('');
  const [referringEntity, setReferringEntity] = useState('');
  const [nextAppointment, setNextAppointment] = useState('');
  const [address, setAddress] = useState('');

  // Recepcionista specific states
  const [shift, setShift] = useState('Mañana');
  const [academicDegree, setAcademicDegree] = useState('');

  // Fetch users if Master
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const endpoint = isMaster ? '/api/users' : '/api/patients'; // Assuming we have an endpoint for just patients, actually the /api/patients/ returns patients
      const response = await api.get(endpoint);
      setUsersList(response.data);
    } catch (err) {
      console.error('Error al obtener lista de usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        username,
        password,
        role,
        name,
        identificationNumber,
        mppsNumber,
        medicalCollegeNumber,
        sedeAtencion,
        ...(role === 'Paciente' ? {
          gender, dateOfBirth, phone, email, treatingDoctor, referringEntity, nextAppointment, address
        } : {}),
        ...(role === 'Recepcionista' ? {
          shift, academicDegree
        } : {})
      };
      
      const response = await api.post('/api/users/create', payload);
      setSuccessMsg(response.data.message || 'Usuario creado exitosamente.');
      
      // Reset form
      setUsername('');
      setPassword('');
      setName('');
      setIdentificationNumber('');
      setMppsNumber('');
      setMedicalCollegeNumber('');
      setRole(initialRole);
      setSedeAtencion('CENTRAL');
      
      setGender('Masculino');
      setDateOfBirth('');
      setPhone('');
      setEmail('');
      setTreatingDoctor('');
      setReferringEntity('');
      setNextAppointment('');
      setAddress('');
      
      setShift('Mañana');
      setAcademicDegree('');
      
      // Reload user list
      fetchUsers();
    } catch (err) {
      console.error('Error al crear usuario:', err);
      setErrorMsg(err.response?.data?.error || 'Error al procesar la solicitud.');
    }
  };

  const handleDeleteUser = async (id, usernameToDelete) => {
    if (currentUser.id === id) {
      alert('No puedes eliminar tu propia cuenta de administrador activa.');
      return;
    }

    if (!window.confirm(`¿Estás seguro de que deseas eliminar el usuario "${usernameToDelete}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/users/${id}`);
      setSuccessMsg(`Usuario "${usernameToDelete}" eliminado correctamente.`);
      fetchUsers();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      alert(err.response?.data?.error || 'Error al eliminar usuario.');
    }
  };

  // 1. Return Access Denied if user has no access
  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-alert)', marginBottom: '1.5rem' }}>
            <ShieldAlert size={48} />
          </div>
          <h3 style={{ color: 'var(--color-text-main)', fontSize: '1.75rem', fontWeight: '700', marginBottom: '1rem' }}>Acceso Restringido</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
            Tu rol actual no tiene privilegios para acceder al módulo de gestión de usuarios o pacientes.
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
            Tu rol actual registrado es: <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{currentUser.role || 'Invitado'}</span>
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // 2. Return Admin Dashboard if Master
  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        
        <header style={{ marginBottom: '0.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-primary)' }}>Registro de Usuarios y Pacientes</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Crea y gestiona cuentas, roles y expedientes base de pacientes.</p>
        </header>

        {successMsg && (
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', fontWeight: '500', fontSize: '0.9rem' }}>
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-alert)', fontWeight: '500', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }} className="admin-grid">
          
          {/* USER LIST PANEL */}
          <Card title="Cuentas de Usuarios Registradas" action={<Users size={20} style={{ color: 'var(--color-primary)' }} />} className="glass-panel">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Cargando usuarios...</div>
            ) : usersList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No hay usuarios registrados en el sistema.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {usersList.map((usr) => (
                  <div 
                    key={usr.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '1rem', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border-color)', 
                      backgroundColor: 'var(--color-bg-main)' 
                    }}
                  >
                    <div>
                      <h4 style={{ fontWeight: '600', color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
                        {usr.name || 'Sin Nombre Registrado'}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                        Usuario: <strong>{usr.username}</strong> | Rol: <span style={{ color: usr.role === 'Master' ? 'var(--color-alert)' : 'var(--color-primary)', fontWeight: 'bold' }}>{usr.role}</span>
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Sede: {usr.sedeAtencion || 'No especificada'} {usr.mppsNumber && `| MPPS: ${usr.mppsNumber}`}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {usr.role === 'Paciente' && (
                        <button 
                          onClick={() => setSelectedPatient(usr)} 
                          style={{ 
                            background: 'var(--color-primary)', 
                            border: 'none', 
                            color: '#fff', 
                            cursor: 'pointer',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '0.85rem'
                          }}
                        >
                          Ver/Editar Datos
                        </button>
                      )}
                      {isMaster && (
                        <button 
                          onClick={() => handleDeleteUser(usr.id, usr.username)} 
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--color-alert)', 
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          className="delete-user-btn"
                          title="Eliminar Cuenta"
                          disabled={currentUser.id === usr.id}
                        >
                          <Trash2 size={18} style={{ opacity: currentUser.id === usr.id ? 0.3 : 1 }} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* CREATE USER PANEL */}
          <Card title="Registrar Nuevo Usuario" action={<UserPlus size={20} style={{ color: 'var(--color-accent)' }} />} className="glass-panel">
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Input 
                  label="Nombre de Usuario *"
                  type="text"
                  placeholder="ej. luisg12"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <Input 
                  label="Contraseña *"
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="input-group">
                  <label className="input-label">Rol del Usuario *</label>
                  <select 
                    className="input-field" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    style={{ height: '39px', padding: '0.5rem 1rem' }}
                    disabled={!isMaster && role !== 'Paciente'}
                  >
                    {isMaster && (
                      <>
                        <option value="Administrador">Administrador</option>
                        <option value="Médico">Médico</option>
                        <option value="Recepcionista">Recepcionista</option>
                      </>
                    )}
                    <option value="Paciente">Paciente</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Sede de Atención *</label>
                  <select 
                    className="input-field" 
                    value={sedeAtencion} 
                    onChange={(e) => setSedeAtencion(e.target.value)}
                    style={{ height: '39px', padding: '0.5rem 1rem' }}
                  >
                    <option value="CENTRAL">CENTRAL</option>
                    <option value="GMSP">GMSP</option>
                    <option value="CCMLA">CCMLA</option>
                    <option value="PLA">PLA</option>
                  </select>
                </div>
              </div>

              <Input 
                label="Nombre Completo"
                type="text"
                placeholder="Nombre y Apellido"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input 
                label="Documento de Identificación / Cédula"
                type="text"
                placeholder="C.I. o Pasaporte"
                value={identificationNumber}
                onChange={(e) => setIdentificationNumber(e.target.value)}
              />

              {role === 'Médico' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Input 
                    label="Número MPPS"
                    type="text"
                    placeholder="Ministerio"
                    value={mppsNumber}
                    onChange={(e) => setMppsNumber(e.target.value)}
                  />
                  <Input 
                    label="Colegio de Médicos"
                    type="text"
                    placeholder="Número de Registro"
                    value={medicalCollegeNumber}
                    onChange={(e) => setMedicalCollegeNumber(e.target.value)}
                  />
                </div>
              )}

              {role === 'Recepcionista' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="input-group">
                    <label className="input-label">Turno</label>
                    <select 
                      className="input-field" 
                      value={shift} 
                      onChange={(e) => setShift(e.target.value)}
                      style={{ height: '39px', padding: '0.5rem 1rem' }}
                    >
                      <option value="Mañana">Mañana</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noche">Noche</option>
                      <option value="Mixto">Mixto</option>
                    </select>
                  </div>
                  <Input 
                    label="Título o Grado Académico"
                    type="text"
                    placeholder="Ej. TSU, Licenciada, etc."
                    value={academicDegree}
                    onChange={(e) => setAcademicDegree(e.target.value)}
                  />
                </div>
              )}

              {role === 'Paciente' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="input-group">
                      <label className="input-label">Género</label>
                      <select 
                        className="input-field" 
                        value={gender} 
                        onChange={(e) => setGender(e.target.value)}
                        style={{ height: '39px', padding: '0.5rem 1rem' }}
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                    <Input 
                      label="Fecha de Nacimiento"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <Input 
                      label="Teléfono"
                      type="text"
                      placeholder="+58 412 1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <Input 
                      label="Email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <Input 
                      label="Médico Tratante"
                      type="text"
                      placeholder="Dr. Nombre Apellido"
                      value={treatingDoctor}
                      onChange={(e) => setTreatingDoctor(e.target.value)}
                    />
                    <Input 
                      label="Referente"
                      type="text"
                      placeholder="Seguros Mercantil, etc."
                      value={referringEntity}
                      onChange={(e) => setReferringEntity(e.target.value)}
                    />
                  </div>
                  <Input 
                    label="Próxima Cita / Control"
                    type="datetime-local"
                    value={nextAppointment}
                    onChange={(e) => setNextAppointment(e.target.value)}
                  />
                  <Input 
                    label="Dirección"
                    type="text"
                    placeholder="Dirección completa"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </>
              )}

              <Button type="submit" fullWidth style={{ marginTop: '0.5rem' }}>
                Crear Usuario
              </Button>
            </form>
          </Card>
          
        </div>
      </div>
      
      {selectedPatient && (
        <PatientProfileEditor 
          patient={selectedPatient} 
          onClose={() => {
            setSelectedPatient(null);
            fetchUsers();
          }} 
        />
      )}
    </DashboardLayout>
  );
}

export default Modulo2_GestionAdministrativa;
