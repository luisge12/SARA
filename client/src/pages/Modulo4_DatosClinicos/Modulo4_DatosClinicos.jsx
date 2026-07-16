import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/Card';
import api from '../../services/api';
import { Users, FileText } from 'lucide-react';
import { ClinicalWorkspace } from './ClinicalWorkspace';
import { hasAccess } from '../../components/ProtectedRoute';

function Modulo4_DatosClinicos() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isMedico = hasAccess(user.role, ['MEDICO', 'MASTER']); // Aseguramos que sea médico o master

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/patients');
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isMedico) {
    return (
      <DashboardLayout activeModule={4}>
        <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
          <h3 style={{ color: 'var(--color-text-main)', fontSize: '1.75rem', fontWeight: '700', marginBottom: '1rem' }}>Acceso Restringido</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
            Este módulo es de uso exclusivo para el cuerpo médico. Permite la edición de Historias Clínicas, diagnósticos y planes de trabajo.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeModule={4}>
      
      {!selectedPatient ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          <header style={{ marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-primary)' }}>Módulo de Datos Clínicos</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>Seleccione un paciente para abrir su expediente clínico completo.</p>
          </header>

          <Card title="Pacientes Registrados" action={<Users size={20} style={{ color: 'var(--color-primary)' }} />} className="glass-panel">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Cargando lista de pacientes...</div>
            ) : patients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No hay pacientes registrados.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {patients.map((p) => (
                  <div 
                    key={p.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '1.25rem', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border-color)', 
                      backgroundColor: 'var(--color-bg-main)',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div>
                      <h4 style={{ fontWeight: '600', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>
                        {p.name || 'Sin Nombre Registrado'}
                      </h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                        ID: <strong>{p.identificationNumber || 'N/A'}</strong>
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedPatient(p)} 
                      style={{ 
                        background: 'var(--color-primary)', 
                        border: 'none', 
                        color: '#fff', 
                        cursor: 'pointer',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '600'
                      }}
                    >
                      <FileText size={18} /> Abrir Historia Clínica
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      ) : (
        <ClinicalWorkspace patient={selectedPatient} onBack={() => setSelectedPatient(null)} />
      )}
      
    </DashboardLayout>
  );
}

export default Modulo4_DatosClinicos;
