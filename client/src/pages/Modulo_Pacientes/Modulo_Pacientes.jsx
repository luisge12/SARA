import React, { useState, useEffect } from 'react';
import { Search, UserPlus, CalendarPlus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppointmentModal } from '../../components/AppointmentModal';
import { PatientRegistrationModal } from '../../components/PatientRegistrationModal';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import './Modulo_Pacientes.css';

export default function Modulo_Pacientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const endpoint = '/api/patients'; 
      const response = await api.get(endpoint);
      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredPatients(patients);
      return;
    }
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = patients.filter(p => 
      (p.name && p.name.toLowerCase().includes(lowerSearch)) ||
      (p.identificationNumber && p.identificationNumber.toLowerCase().includes(lowerSearch)) ||
      (p.treatingDoctor && p.treatingDoctor.toLowerCase().includes(lowerSearch))
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <DashboardLayout>
      <div className="pacientes-container">
        <header className="pacientes-header">
          <h1>Gestión de Pacientes</h1>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setShowAppointmentModal(true)}>
              <CalendarPlus size={20} />
              <span>Nueva Cita</span>
            </button>
            <button className="btn-secondary" onClick={() => setShowRegistrationModal(true)}>
              <UserPlus size={20} />
              <span>Registrar Paciente</span>
            </button>
          </div>
        </header>

        <section className="search-section">
          <form onSubmit={handleSearch} className="search-bar">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, ID o médico..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn-search">Buscar</button>
          </form>
        </section>

        <section className="results-section">
          <h2>Resultados Recientes</h2>
          {loading ? (
            <p>Cargando pacientes...</p>
          ) : (
            <div className="patients-grid">
              {filteredPatients.map(patient => (
                <div key={patient.id} className="patient-card" onClick={() => navigate(`/pacientes/${patient.id}`)}>
                  <div className="patient-info">
                    <h3>{patient.name}</h3>
                    <p><strong>ID:</strong> {patient.identificationNumber || patient.document}</p>
                    <p><strong>Médico:</strong> {patient.treatingDoctor || patient.doctor || 'No asignado'}</p>
                  </div>
                  <ChevronRight size={24} className="nav-icon" />
                </div>
              ))}
              {filteredPatients.length === 0 && <p>No se encontraron pacientes.</p>}
            </div>
          )}
        </section>

        {showAppointmentModal && (
          <AppointmentModal 
            onClose={() => setShowAppointmentModal(false)}
            onSuccess={() => {
              setShowAppointmentModal(false);
              window.dispatchEvent(new Event('appointmentCreated'));
            }}
          />
        )}

        {showRegistrationModal && (
          <PatientRegistrationModal 
            onClose={() => setShowRegistrationModal(false)}
            onSuccess={() => {
              setShowRegistrationModal(false);
              fetchPatients();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
