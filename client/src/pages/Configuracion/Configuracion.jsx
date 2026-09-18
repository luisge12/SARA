import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modulo2_GestionAdministrativa from '../Modulo2_GestionAdministrativa/Modulo2_GestionAdministrativa';
import { Users, Settings, Building2, CheckCircle, Upload, Trash2, Eye } from 'lucide-react';
import { getClinicSettings, saveClinicSettings } from '../../services/clinicSettings';
import './Configuracion.css';

export default function Configuracion() {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [settings, setSettings] = useState(getClinicSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setSettings(getClinicSettings());
  }, []);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('El archivo supera los 2MB recomendados para logos.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        handleInputChange('logoUrl', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    handleInputChange('logoUrl', '');
  };

  const handleSave = (e) => {
    e.preventDefault();
    const success = saveClinicSettings(settings);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }
  };

  return (
    <DashboardLayout>
      <div className="config-container p-6 max-w-7xl mx-auto space-y-6">
        <header className="config-header">
          <h1>Configuración del Sistema</h1>
          <p>Gestione usuarios, personalización de marca e identidad institucional</p>
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
            <Settings size={18} /> Personalización de la Clínica
          </button>
        </div>

        <div className="config-content">
          {activeTab === 'usuarios' && <Modulo2_GestionAdministrativa />}
          {activeTab === 'clinica' && (
            <div className="clinica-settings-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2>Identidad Institucional de la Clínica</h2>
                  <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>
                    Esta información se reflejará automáticamente en todos los récipes médicos, comprobantes de pago e informes clínicos.
                  </p>
                </div>

                {savedSuccess && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--color-success)',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}>
                    <CheckCircle size={18} /> ¡Configuración guardada exitosamente!
                  </div>
                )}
              </div>

              <form onSubmit={handleSave}>
                <div className="settings-grid">
                  <div className="setting-group">
                    <label>Nombre Oficial de la Clínica / Centro</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Ej. Centro Médico SARA / UNIMECO" 
                      value={settings.name || ''} 
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required 
                    />
                  </div>

                  <div className="setting-group">
                    <label>Subtítulo / Especialidad General</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Ej. Unidad Médica Quirúrgica Especializada" 
                      value={settings.subtitle || ''} 
                      onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    />
                  </div>

                  <div className="setting-group">
                    <label>RIF / NIT / Registro Fiscal</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Ej. J-50123456-7" 
                      value={settings.rif || ''} 
                      onChange={(e) => handleInputChange('rif', e.target.value)}
                    />
                  </div>

                  <div className="setting-group">
                    <label>Teléfono Institucional</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Ej. +58 (0212) 555-0199" 
                      value={settings.phone || ''} 
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                  <div className="setting-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Dirección Sede Principal</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Ej. Av. Principal, Edificio Médico Piso 2, Caracas" 
                      value={settings.address || ''} 
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>

                  {/* Logo de la Clínica */}
                  <div className="setting-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Logo Oficial de la Clínica</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                      <div style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '12px',
                        backgroundColor: '#fff',
                        border: '2px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        padding: '4px'
                      }}>
                        {settings.logoUrl ? (
                          <img src={settings.logoUrl} alt="Logo de la clínica" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : (
                          <Building2 size={40} color="#94a3b8" />
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <label className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.88rem' }}>
                            <Upload size={16} /> Subir Imagen del Logo
                            <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
                          </label>

                          {settings.logoUrl && (
                            <button 
                              type="button" 
                              onClick={handleRemoveLogo} 
                              className="btn-secondary" 
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444', borderColor: '#fca5a5', padding: '0.5rem 0.85rem', fontSize: '0.88rem' }}
                            >
                              <Trash2 size={15} /> Quitar Logo
                            </button>
                          )}
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Formatos aceptados: PNG, JPG, SVG. Recomendado fondo transparente.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="setting-group">
                    <label>Color Corporativo Principal</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input 
                        type="color" 
                        className="color-picker" 
                        value={settings.primaryColor || '#22505d'} 
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)} 
                      />
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>
                        {settings.primaryColor || '#22505d'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vista Previa de Documento Oficial */}
                <div style={{ marginTop: '2rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    <Eye size={16} /> Vista Previa en Encabezado de Documentos
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" style={{ height: '42px', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: settings.primaryColor || '#22505d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {(settings.name || 'S')[0]}
                        </div>
                      )}
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: settings.primaryColor || '#22505d' }}>
                          {settings.name || 'Nombre de la Clínica'}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                          {settings.subtitle || 'Subtítulo o Especialidad'} {settings.rif ? `• RIF: ${settings.rif}` : ''}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', backgroundColor: '#ecfdf5', padding: '0.25rem 0.6rem', borderRadius: '12px' }}>
                      ENCABEZADO OFICIAL
                    </span>
                  </div>
                </div>

                <button type="submit" className="btn-primary mt-6" style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: '700' }}>
                  Guardar Configuración de la Clínica
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
