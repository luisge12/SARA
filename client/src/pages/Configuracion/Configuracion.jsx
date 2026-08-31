import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modulo2_GestionAdministrativa from '../Modulo2_GestionAdministrativa/Modulo2_GestionAdministrativa';
import { Users, Settings } from 'lucide-react';
import './Configuracion.css';

export default function Configuracion() {
  const [activeTab, setActiveTab] = useState('usuarios');

  return (
    <DashboardLayout>
      <div className="config-container p-6 max-w-7xl mx-auto space-y-6">
        <header className="config-header">
          <h1>Configuración del Sistema</h1>
          <p>Gestione usuarios, finanzas y configuración de la clínica</p>
        </header>

        <div className="config-tabs">
          <button 
            className={`config-tab-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('usuarios')}
          >
            <Users size={18} /> Usuarios y Accesos
          </button>
          <button 
            className={`config-tab-btn ${activeTab === 'clinica' ? 'active' : ''}`}
            onClick={() => setActiveTab('clinica')}
          >
            <Settings size={18} /> Personalización
          </button>
        </div>

        <div className="config-content">
          {activeTab === 'usuarios' && <Modulo2_GestionAdministrativa />}
          {activeTab === 'clinica' && (
            <div className="clinica-settings-card">
              <h2>Personalización de la Clínica</h2>
              <div className="settings-grid">
                <div className="setting-group">
                  <label>Nombre de la Clínica</label>
                  <input type="text" className="input-field" placeholder="Ej. Centro Médico SARA" defaultValue="SARA Clinic" />
                </div>
                <div className="setting-group">
                  <label>Rif / RUT / ID Empresa</label>
                  <input type="text" className="input-field" placeholder="Ej. J-12345678-9" />
                </div>
                <div className="setting-group">
                  <label>Logo de la Clínica</label>
                  <input type="file" className="input-field" accept="image/*" />
                </div>
                <div className="setting-group">
                  <label>Color Principal</label>
                  <input type="color" className="color-picker" defaultValue="#3b82f6" />
                </div>
              </div>
              <button className="btn-primary mt-6">Guardar Configuración</button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
