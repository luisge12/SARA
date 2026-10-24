import React, { useState, useEffect } from 'react';
import { 
  Download, Shield, ShieldCheck, Key, Check, Copy, RefreshCw, Sparkles, 
  Building, Lock, AlertTriangle, Calendar, Clock, ChevronRight, Laptop, 
  HardDrive, Cpu, CheckCircle2, FileText, ArrowRight, ExternalLink, Zap, 
  Users, Activity, LogIn, LogOut, Search, Plus, X, Share2, HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import licenseService from '../../services/licenseService';
import './SaraWebPortal.css';

export default function SaraWebPortal() {
  const navigate = useNavigate();

  // Estados de Descarga & Software
  const [downloadInfo, setDownloadInfo] = useState({
    version: '2.4.0',
    build: '2026.10-PROD',
    releaseDate: 'Octubre 2026',
    appName: 'SARA Desktop - Sistema Automatizado de Registro Asistencial',
    architecture: 'Windows x64 (64-bit)',
    minOs: 'Windows 10 / Windows 11',
    fileSize: '84.6 MB',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
  });
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadingType, setDownloadingType] = useState('exe');

  // Estados de Super Master
  const [showMasterSection, setShowMasterSection] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authUsername, setAuthUsername] = useState('luisge');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Usuario actual
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const isSuperMaster = 
    currentUser?.username?.toLowerCase() === 'luisge' || 
    currentUser?.role?.toLowerCase() === 'supermaster';

  // Datos del Panel Super Master
  const [masterTab, setMasterTab] = useState('generator'); // 'generator' | 'clinics' | 'keys'
  const [loadingMasterData, setLoadingMasterData] = useState(false);
  const [clinicsData, setClinicsData] = useState({ clinics: [], stats: {} });
  const [keysList, setKeysList] = useState([]);
  const [keyFilter, setKeyFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'USED'
  const [searchTerm, setSearchTerm] = useState('');

  // Formulario Generador de Claves
  const [planType, setPlanType] = useState('MONTHLY'); // 'MONTHLY' | 'QUARTERLY' | 'SEMESTER' | 'ANNUAL' | 'CUSTOM'
  const [customDays, setCustomDays] = useState(30);
  const [clientNotes, setClientNotes] = useState('');
  const [targetClinicId, setTargetClinicId] = useState('');
  const [generatingKey, setGeneratingKey] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Modal Nueva Clínica
  const [showNewClinicModal, setShowNewClinicModal] = useState(false);
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicRif, setNewClinicRif] = useState('');
  const [newClinicPlan, setNewClinicPlan] = useState('MONTHLY');
  const [newClinicDays, setNewClinicDays] = useState(30);
  const [creatingClinic, setCreatingClinic] = useState(false);

  // Modal Extensión Rápida
  const [extendModalClinic, setExtendModalClinic] = useState(null);
  const [extendDaysInput, setExtendDaysInput] = useState(30);
  const [extendNotesInput, setExtendNotesInput] = useState('Cortesía Super Master');
  const [extending, setExtending] = useState(false);

  // Cargar información de descarga al montar
  useEffect(() => {
    licenseService.getDownloadInfo()
      .then(info => {
        if (info) setDownloadInfo(info);
      })
      .catch(() => {});
  }, []);

  // Cargar datos de Super Master si está autenticado
  const fetchMasterData = async () => {
    if (!isSuperMaster) return;
    try {
      setLoadingMasterData(true);
      const [clinicsRes, keysRes] = await Promise.all([
        licenseService.getClinics(),
        licenseService.listKeys()
      ]);
      setClinicsData(clinicsRes);
      setKeysList(Array.isArray(keysRes) ? keysRes : []);
    } catch (err) {
      console.error('Error al cargar datos de Super Master:', err);
    } finally {
      setLoadingMasterData(false);
    }
  };

  useEffect(() => {
    if (isSuperMaster && showMasterSection) {
      fetchMasterData();
    }
  }, [isSuperMaster, showMasterSection]);

  // Manejador de Login Super Master
  const handleSuperMasterLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await api.post('/api/users/login', {
        username: authUsername.trim(),
        password: authPassword
      });

      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setCurrentUser(res.data.user);
        
        if (res.data.user.role === 'SuperMaster' || res.data.user.username.toLowerCase() === 'luisge') {
          setShowAuthModal(false);
          setShowMasterSection(true);
          setAuthPassword('');
          // Recargar datos
          setTimeout(() => fetchMasterData(), 100);
        } else {
          setAuthError('El usuario ingresado no posee permisos de Super Master.');
        }
      }
    } catch (err) {
      console.error('Error login Super Master:', err);
      setAuthError(err.response?.data?.error || 'Credenciales incorrectas.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSuperMasterLogout = () => {
    setShowMasterSection(false);
  };

  // Generar Clave de Licencia
  const handleGenerateLicenseKey = async (e) => {
    e.preventDefault();
    setGeneratingKey(true);
    setNewlyGeneratedKey(null);

    let days = 30;
    if (planType === 'ANNUAL') days = 365;
    else if (planType === 'QUARTERLY') days = 90;
    else if (planType === 'SEMESTER') days = 180;
    else if (planType === 'CUSTOM') days = parseInt(customDays) || 30;

    try {
      const res = await licenseService.generateKey({
        planType: planType === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY',
        durationDays: days,
        notes: clientNotes.trim()
      });

      setNewlyGeneratedKey(res.key);
      setClientNotes('');
      // Refrescar lista de claves
      const keysRes = await licenseService.listKeys();
      setKeysList(Array.isArray(keysRes) ? keysRes : []);
    } catch (err) {
      alert('Error al generar clave: ' + (err.response?.data?.error || err.message));
    } finally {
      setGeneratingKey(false);
    }
  };

  // Copiar al portapapeles
  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  // Extensión rápida de clínica
  const handleQuickExtend = async (clinicId, days) => {
    try {
      await licenseService.manualExtend({ 
        days, 
        notes: `Extensión rápida +${days} días`, 
        clinicId 
      });
      alert(`¡Se añadieron +${days} días con éxito!`);
      await fetchMasterData();
    } catch (err) {
      alert('Error al extender: ' + (err.response?.data?.error || err.message));
    }
  };

  // Enviar extensión personalizada
  const handleCustomExtend = async (e) => {
    e.preventDefault();
    if (!extendModalClinic) return;
    setExtending(true);
    try {
      await licenseService.manualExtend({
        days: parseInt(extendDaysInput),
        notes: extendNotesInput,
        clinicId: extendModalClinic.id
      });
      alert(`¡Se añadieron +${extendDaysInput} días a ${extendModalClinic.name}!`);
      setExtendModalClinic(null);
      await fetchMasterData();
    } catch (err) {
      alert('Error al extender: ' + (err.response?.data?.error || err.message));
    } finally {
      setExtending(false);
    }
  };

  // Crear nueva clínica
  const handleCreateClinic = async (e) => {
    e.preventDefault();
    if (!newClinicName.trim()) return;
    setCreatingClinic(true);
    try {
      await licenseService.createClinic({
        name: newClinicName.trim(),
        rif: newClinicRif.trim(),
        planType: newClinicPlan,
        initialDays: parseInt(newClinicDays) || 30
      });
      alert('¡Nueva clínica cliente registrada con éxito!');
      setShowNewClinicModal(false);
      setNewClinicName('');
      setNewClinicRif('');
      await fetchMasterData();
    } catch (err) {
      alert('Error al registrar clínica: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreatingClinic(false);
    }
  };

  // Iniciar descarga del instalador o versión portable
  const handleStartDownload = (type = 'exe') => {
    setDownloadingType(type);
    setShowDownloadModal(true);

    // Disparar la descarga real del archivo con cache buster
    let downloadUrl = `/api/licenses/download/setup?t=${Date.now()}`;
    let filename = 'SARA_Setup_v2.4.0.exe';

    if (type === 'portable') {
      downloadUrl = `/api/licenses/download/setup?type=portable&t=${Date.now()}`;
      filename = 'SARA_Portable_v2.4.0.zip';
    } else if (type === 'direct') {
      downloadUrl = `/api/licenses/download/setup?type=direct&t=${Date.now()}`;
      filename = 'SARA.exe';
    }

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrado de claves
  const filteredKeys = keysList.filter(k => {
    const matchesFilter = 
      keyFilter === 'ALL' ? true :
      keyFilter === 'AVAILABLE' ? !k.isUsed :
      k.isUsed;

    const matchesSearch = 
      !searchTerm || 
      (k.licenseKey && k.licenseKey.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (k.notes && k.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="sara-web-wrapper">
      {/* Efectos ambientales de fondo */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* ====================================================================
          NAVBAR PRINCIPAL
          ==================================================================== */}
      <nav className="portal-navbar">
        <a href="#inicio" className="portal-brand">
          <div className="portal-logo-icon">
            <Shield size={24} />
          </div>
          <div className="portal-brand-text">
            <h1>SARA MED</h1>
            <span>Sistema Asistencial de Registro Automatizado</span>
          </div>
        </a>

        <ul className="portal-nav-links">
          <li><a href="#descargas" className="portal-nav-link">Descargas</a></li>
          <li><a href="#caracteristicas" className="portal-nav-link">Módulos</a></li>
          <li><a href="#requisitos" className="portal-nav-link">Requisitos</a></li>
          <li><a href="#guia" className="portal-nav-link">Guía de Instalación</a></li>
        </ul>

        <div className="portal-nav-actions">
          <button 
            className="btn-portal-secondary"
            onClick={() => navigate('/users/login')}
            title="Acceso para Pacientes a su Historia Médica"
          >
            <Users size={16} /> Portal Pacientes
          </button>

          <button 
            className="btn-portal-secondary"
            onClick={() => navigate('/login')}
            style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
            title="Iniciar sesión en la Clínica"
          >
            <LogIn size={16} /> Iniciar Sesión
          </button>

          {/* Botón de Acceso Super Master */}
          <button 
            className="btn-portal-master"
            onClick={() => {
              if (isSuperMaster) {
                setShowMasterSection(prev => !prev);
              } else {
                setShowAuthModal(true);
              }
            }}
          >
            <Zap size={16} />
            {isSuperMaster ? (showMasterSection ? 'Ocultar Panel Master' : '👑 Panel Super Master') : 'Acceso Super Master'}
          </button>
        </div>
      </nav>

      {/* ====================================================================
          HERO SECTION & DESCARGA RÁPIDA
          ==================================================================== */}
      <header className="portal-hero" id="inicio">
        <div className="hero-pill-badge">
          <span className="pulse-dot-green"></span>
          <span>Versión Oficial {downloadInfo.version} Disponible &bull; Build 2026</span>
        </div>

        <h1 className="portal-hero-title">
          La Plataforma Médica Integral <br />
          <span className="hero-highlight">Inteligente, Rápida y Segura</span>
        </h1>

        <p className="portal-hero-subtitle">
          Descarga SARA para digitalizar tu clínica, gestionar historias clínicas con IA, 
          controlar salas de espera en vivo y emitir facturas multimoneda con tasas BCV en tiempo real.
        </p>

        <div className="hero-cta-group">
          <button 
            className="btn-hero-download"
            onClick={() => handleStartDownload('exe')}
          >
            <Download size={22} />
            <span>Descargar SARA para Windows (.exe)</span>
          </button>

          <button 
            className="btn-hero-secondary"
            onClick={() => navigate('/login')}
          >
            <Laptop size={20} />
            <span>Abrir en el Navegador (Cloud PWA)</span>
          </button>
        </div>

        <div className="hero-trust-badges">
          <div className="trust-badge-item">
            <ShieldCheck size={16} color="#34d399" />
            <span>Instalador Verificado SHA-256</span>
          </div>
          <div className="trust-badge-item">
            <CheckCircle2 size={16} color="#38bdf8" />
            <span>Compatible con Windows 10 & 11 (64-bit)</span>
          </div>
          <div className="trust-badge-item">
            <Lock size={16} color="#fbbf24" />
            <span>Encriptación y Control Criptográfico de Licencias</span>
          </div>
        </div>
      </header>

      {/* ====================================================================
          PANEL SUPER MASTER (SI ESTÁ ACTIVO Y AUTENTICADO)
          ==================================================================== */}
      {showMasterSection && isSuperMaster && (
        <section className="master-control-section" id="super-master">
          <div className="master-inner-container">
            {/* Barra superior Super Master */}
            <div className="master-top-bar">
              <div className="master-title-flex">
                <div className="master-crown-icon">
                  <Zap size={26} />
                </div>
                <div>
                  <h2>Centro de Mando Super Master</h2>
                  <p>
                    Administrador: <strong>{currentUser?.name || currentUser?.username}</strong> &bull; Control central de licencias de SARA
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button 
                  className="btn-portal-secondary"
                  onClick={fetchMasterData}
                  disabled={loadingMasterData}
                  title="Actualizar datos del servidor"
                >
                  <RefreshCw size={16} className={loadingMasterData ? 'animate-spin' : ''} />
                  <span>Refrescar</span>
                </button>
                <button 
                  className="btn-portal-secondary"
                  onClick={handleSuperMasterLogout}
                  style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <LogOut size={16} /> Cerrar Panel
                </button>
              </div>
            </div>

            {/* KPIs del Super Master */}
            <div className="master-kpi-grid">
              <div className="master-kpi-card">
                <span className="kpi-label">Clínicas Registradas</span>
                <span className="kpi-value cyan">{clinicsData.stats?.totalClinics || 0}</span>
                <span className="kpi-sub">Instalaciones institucionales</span>
              </div>

              <div className="master-kpi-card">
                <span className="kpi-label">Licencias Activas</span>
                <span className="kpi-value green">{clinicsData.stats?.activeClinics || 0}</span>
                <span className="kpi-sub">Servicio vigente sin cortes</span>
              </div>

              <div className="master-kpi-card">
                <span className="kpi-label">Claves Disponibles</span>
                <span className="kpi-value gold">{clinicsData.stats?.availableKeys || 0}</span>
                <span className="kpi-sub">Listas para emitir a clientes</span>
              </div>

              <div className="master-kpi-card">
                <span className="kpi-label">Claves Canjeadas</span>
                <span className="kpi-value">{clinicsData.stats?.usedKeys || 0}</span>
                <span className="kpi-sub">Activadas en clínicas</span>
              </div>
            </div>

            {/* Pestañas de Navegación del Panel Master */}
            <div className="master-tabs">
              <button 
                className={`master-tab-btn ${masterTab === 'generator' ? 'active' : ''}`}
                onClick={() => setMasterTab('generator')}
              >
                <Key size={18} /> Generador de Licencias
              </button>
              <button 
                className={`master-tab-btn ${masterTab === 'clinics' ? 'active' : ''}`}
                onClick={() => setMasterTab('clinics')}
              >
                <Building size={18} /> Control de Clínicas ({clinicsData.clinics?.length || 0})
              </button>
              <button 
                className={`master-tab-btn ${masterTab === 'keys' ? 'active' : ''}`}
                onClick={() => setMasterTab('keys')}
              >
                <FileText size={18} /> Inventario de Claves ({keysList.length})
              </button>
            </div>

            {/* PESTAÑA 1: GENERADOR DE LICENCIAS */}
            {masterTab === 'generator' && (
              <div className="master-form-box">
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.2rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={20} color="#fbbf24" /> Generar Nueva Clave Criptográfica
                </h3>
                <p style={{ color: 'var(--portal-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Selecciona la duración del plan y genera un código de licencia seguro para entregar al cliente.
                </p>

                <form onSubmit={handleGenerateLicenseKey}>
                  <div className="plans-selector-grid">
                    <div 
                      className={`plan-option-card ${planType === 'MONTHLY' ? 'selected' : ''}`}
                      onClick={() => setPlanType('MONTHLY')}
                    >
                      <h4>Plan Mensual</h4>
                      <span>30 Días de Servicio</span>
                    </div>

                    <div 
                      className={`plan-option-card ${planType === 'QUARTERLY' ? 'selected' : ''}`}
                      onClick={() => setPlanType('QUARTERLY')}
                    >
                      <h4>Plan Trimestral</h4>
                      <span>90 Días de Servicio</span>
                    </div>

                    <div 
                      className={`plan-option-card ${planType === 'SEMESTER' ? 'selected' : ''}`}
                      onClick={() => setPlanType('SEMESTER')}
                    >
                      <h4>Plan Semestral</h4>
                      <span>180 Días de Servicio</span>
                    </div>

                    <div 
                      className={`plan-option-card ${planType === 'ANNUAL' ? 'selected' : ''}`}
                      onClick={() => setPlanType('ANNUAL')}
                    >
                      <h4>Plan Anual (365d)</h4>
                      <span>1 Año Completo</span>
                    </div>

                    <div 
                      className={`plan-option-card ${planType === 'CUSTOM' ? 'selected' : ''}`}
                      onClick={() => setPlanType('CUSTOM')}
                    >
                      <h4>Personalizado</h4>
                      <span>Duración a Medida</span>
                    </div>
                  </div>

                  {planType === 'CUSTOM' && (
                    <div style={{ marginBottom: '1.25rem', maxWidth: '300px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                        Días de Vigencia Personalizados:
                      </label>
                      <input 
                        type="number"
                        min="1"
                        max="3650"
                        value={customDays}
                        onChange={(e) => setCustomDays(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--portal-border)', background: '#090e17', color: '#fff' }}
                      />
                    </div>
                  )}

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Notas / Cliente Destinatario (Opcional):
                    </label>
                    <input 
                      type="text"
                      placeholder="Ej: Clínica San Miguel - Dr. Gómez (Pago Transferencia Banesco)"
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--portal-border)', background: '#090e17', color: '#fff' }}
                    />
                  </div>

                  <button 
                    type="submit"
                    className="btn-card-download primary"
                    disabled={generatingKey}
                    style={{ maxWidth: '320px' }}
                  >
                    {generatingKey ? <RefreshCw className="animate-spin" size={18} /> : <Key size={18} />}
                    <span>Generar Clave SARA</span>
                  </button>
                </form>

                {/* Banner de Clave Recién Generada */}
                {newlyGeneratedKey && (
                  <div className="key-award-banner">
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                        ¡Clave Generada Exitosamente! Lista para enviar al cliente:
                      </span>
                      <div className="key-code-display">{newlyGeneratedKey.licenseKey}</div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--portal-text-muted)' }}>
                        Vigencia: {newlyGeneratedKey.durationDays} días &bull; Tipo: {newlyGeneratedKey.planType} &bull; {newlyGeneratedKey.notes || 'Sin nota'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button 
                        className="btn-portal-secondary"
                        onClick={() => handleCopyText(newlyGeneratedKey.licenseKey)}
                      >
                        {copiedKey ? <Check size={18} color="#34d399" /> : <Copy size={18} />}
                        <span>{copiedKey ? '¡Copiada!' : 'Copiar Clave'}</span>
                      </button>

                      <a 
                        className="btn-portal-secondary"
                        href={`https://wa.me/?text=${encodeURIComponent(`Hola! Aquí tienes tu clave oficial de activación para SARA: ${newlyGeneratedKey.licenseKey} (${newlyGeneratedKey.durationDays} días de servicio).`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.4)' }}
                      >
                        <Share2 size={16} /> WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PESTAÑA 2: CONTROL DE CLÍNICAS */}
            {masterTab === 'clinics' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Clínicas e Instituciones Conectadas</h3>
                    <p style={{ margin: '0.2rem 0 0', color: 'var(--portal-text-muted)', fontSize: '0.88rem' }}>
                      Controla la vigencia de cada centro médico y añade días de servicio directamente.
                    </p>
                  </div>

                  <button 
                    className="btn-portal-secondary"
                    onClick={() => setShowNewClinicModal(true)}
                    style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
                  >
                    <Plus size={16} /> Registrar Nueva Clínica
                  </button>
                </div>

                <div className="master-table-container">
                  <table className="master-data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Clínica</th>
                        <th>RIF / ID Fiscal</th>
                        <th>Plan</th>
                        <th>Estado</th>
                        <th>Días Restantes</th>
                        <th>Fecha Vencimiento</th>
                        <th>Clave Activa</th>
                        <th>Acciones Super Master</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clinicsData.clinics?.length === 0 ? (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--portal-text-dim)' }}>
                            No hay clínicas registradas aún.
                          </td>
                        </tr>
                      ) : (
                        clinicsData.clinics?.map(clinic => (
                          <tr key={clinic.id}>
                            <td style={{ fontWeight: 700, color: '#38bdf8' }}>#{clinic.id}</td>
                            <td style={{ fontWeight: 600, color: '#fff' }}>{clinic.name}</td>
                            <td>{clinic.rif || 'Sin RIF'}</td>
                            <td><strong>{clinic.planType}</strong></td>
                            <td>
                              {clinic.isExpired ? (
                                <span className="badge-status-pill expired">Vencida</span>
                              ) : clinic.isExpiringSoon ? (
                                <span className="badge-status-pill warning">Por Vencer</span>
                              ) : (
                                <span className="badge-status-pill active">Activa</span>
                              )}
                            </td>
                            <td style={{ fontWeight: 700, color: clinic.isExpired ? '#f87171' : clinic.isExpiringSoon ? '#fbbf24' : '#34d399' }}>
                              {clinic.daysRemaining} días
                            </td>
                            <td>{new Date(clinic.expiresAt).toLocaleDateString()}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                              {clinic.activeLicenseKey || 'N/A'}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                <button 
                                  className="btn-portal-secondary"
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                                  onClick={() => handleQuickExtend(clinic.id, 30)}
                                  title="Extender 30 días"
                                >
                                  +30d
                                </button>
                                <button 
                                  className="btn-portal-secondary"
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                                  onClick={() => handleQuickExtend(clinic.id, 365)}
                                  title="Extender 1 año"
                                >
                                  +1 Año
                                </button>
                                <button 
                                  className="btn-portal-secondary"
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                                  onClick={() => {
                                    setExtendModalClinic(clinic);
                                    setExtendDaysInput(30);
                                  }}
                                  title="Extensión personalizada"
                                >
                                  A Medida
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PESTAÑA 3: INVENTARIO DE CLAVES */}
            {masterTab === 'keys' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button 
                      className={`btn-portal-secondary ${keyFilter === 'ALL' ? 'active' : ''}`}
                      onClick={() => setKeyFilter('ALL')}
                    >
                      Todas ({keysList.length})
                    </button>
                    <button 
                      className={`btn-portal-secondary ${keyFilter === 'AVAILABLE' ? 'active' : ''}`}
                      onClick={() => setKeyFilter('AVAILABLE')}
                      style={{ color: '#34d399' }}
                    >
                      Disponibles ({keysList.filter(k => !k.isUsed).length})
                    </button>
                    <button 
                      className={`btn-portal-secondary ${keyFilter === 'USED' ? 'active' : ''}`}
                      onClick={() => setKeyFilter('USED')}
                      style={{ color: '#94a3b8' }}
                    >
                      Canjeadas ({keysList.filter(k => k.isUsed).length})
                    </button>
                  </div>

                  <div style={{ position: 'relative', minWidth: '240px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--portal-text-dim)' }} />
                    <input 
                      type="text"
                      placeholder="Buscar por clave o cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.25rem', borderRadius: '8px', border: '1px solid var(--portal-border)', background: '#090e17', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div className="master-table-container">
                  <table className="master-data-table">
                    <thead>
                      <tr>
                        <th>Clave de Licencia</th>
                        <th>Plan</th>
                        <th>Vigencia</th>
                        <th>Estado</th>
                        <th>Notas / Cliente</th>
                        <th>Fecha de Emisión</th>
                        <th>Fecha Canje</th>
                        <th>Copiar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredKeys.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--portal-text-dim)' }}>
                            No se encontraron claves con el filtro actual.
                          </td>
                        </tr>
                      ) : (
                        filteredKeys.map(k => (
                          <tr key={k.id}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 700, color: k.isUsed ? '#94a3b8' : '#34d399' }}>
                              {k.licenseKey}
                            </td>
                            <td>{k.planType}</td>
                            <td>{k.durationDays} días</td>
                            <td>
                              {k.isUsed ? (
                                <span className="badge-status-pill" style={{ background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }}>
                                  Canjeada
                                </span>
                              ) : (
                                <span className="badge-status-pill active">
                                  Disponible
                                </span>
                              )}
                            </td>
                            <td>{k.notes || '—'}</td>
                            <td>{new Date(k.created_at || k.createdAt).toLocaleDateString()}</td>
                            <td>{k.usedAt ? new Date(k.usedAt).toLocaleDateString() : '—'}</td>
                            <td>
                              <button 
                                className="btn-portal-secondary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                                onClick={() => handleCopyText(k.licenseKey)}
                              >
                                <Copy size={13} /> Copiar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ====================================================================
          SECCIÓN: CENTRO DE DESCARGAS DEL SOFTWARE
          ==================================================================== */}
      <section className="portal-section" id="descargas">
        <div className="section-header-center">
          <span className="section-tag">Zona de Descarga Oficial</span>
          <h2>Elige tu Formato de Instalación</h2>
          <p>Instala SARA en tus estaciones médicas de trabajo o accede al instante vía web.</p>
        </div>

        <div className="downloads-grid">
          {/* Tarjeta 1: Instalador Windows Completo */}
          <div className="download-card featured">
            <span className="featured-ribbon">Recomendado</span>
            
            <div className="card-os-icon">
              <Laptop size={32} />
            </div>

            <div className="card-title-group">
              <h3>SARA para Windows (.exe)</h3>
              <div className="card-meta-row">
                <span>Versión {downloadInfo.version}</span>
                <span>&bull;</span>
                <span>{downloadInfo.fileSize}</span>
                <span>&bull;</span>
                <span>64-bit</span>
              </div>
            </div>

            <ul className="card-features-list">
              <li><CheckCircle2 size={16} /> Asistente de instalación guiado paso a paso</li>
              <li><CheckCircle2 size={16} /> Icono y acceso directo en el Escritorio</li>
              <li><CheckCircle2 size={16} /> Modo sin conexión y sincronización local</li>
              <li><CheckCircle2 size={16} /> Máxima velocidad y aceleración por GPU</li>
            </ul>

            <button 
              className="btn-card-download primary"
              onClick={() => handleStartDownload('exe')}
            >
              <Download size={18} />
              <span>Descargar Instalador (.exe)</span>
            </button>
          </div>

          {/* Tarjeta 2: Versión Portable / ZIP */}
          <div className="download-card">
            <div className="card-os-icon">
              <HardDrive size={32} color="#38bdf8" />
            </div>

            <div className="card-title-group">
              <h3>SARA Versión Portable (.zip)</h3>
              <div className="card-meta-row">
                <span>Versión {downloadInfo.version}</span>
                <span>&bull;</span>
                <span>Sin Instalación</span>
              </div>
            </div>

            <ul className="card-features-list">
              <li><CheckCircle2 size={16} /> Ejecuta directamente sin permisos de administrador</li>
              <li><CheckCircle2 size={16} /> Ideal para pendrives y consultorios móviles</li>
              <li><CheckCircle2 size={16} /> No modifica el registro de Windows</li>
              <li><CheckCircle2 size={16} /> Compatible con terminales restringidas</li>
            </ul>

            <button 
              className="btn-card-download secondary"
              onClick={() => handleStartDownload('portable')}
            >
              <Download size={18} />
              <span>Descargar Paquete ZIP</span>
            </button>
          </div>

          {/* Tarjeta 3: SARA Cloud Web App (PWA) */}
          <div className="download-card">
            <div className="card-os-icon">
              <Activity size={32} color="#fbbf24" />
            </div>

            <div className="card-title-group">
              <h3>SARA Cloud Web (PWA)</h3>
              <div className="card-meta-row">
                <span>Acceso Inmediato</span>
                <span>&bull;</span>
                <span>Multiplataforma</span>
              </div>
            </div>

            <ul className="card-features-list">
              <li><CheckCircle2 size={16} /> Compatible con Tablets, iPads y laptops</li>
              <li><CheckCircle2 size={16} /> Sin descargar archivos pesados</li>
              <li><CheckCircle2 size={16} /> Acceso seguro con certificado SSL/HTTPS</li>
              <li><CheckCircle2 size={16} /> Opción de anclar a la barra de tareas</li>
            </ul>

            <button 
              className="btn-card-download secondary"
              onClick={() => navigate('/login')}
            >
              <ExternalLink size={18} />
              <span>Abrir SARA en el Navegador</span>
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          GUÍA RÁPIDA DE INSTALACIÓN EN 3 PASOS
          ==================================================================== */}
      <section className="portal-section" id="guia" style={{ paddingTop: 0 }}>
        <div className="section-header-center">
          <span className="section-tag">Fácil y Rápido</span>
          <h2>Cómo Empezar a Usar SARA</h2>
          <p>Tu clínica lista para operar en menos de 3 minutos.</p>
        </div>

        <div className="steps-container">
          <div className="step-box">
            <div className="step-number">1</div>
            <h4>Descarga el Instalador</h4>
            <p>Haz clic en el botón de descarga para obtener el paquete de instalación oficial para Windows (64-bit).</p>
          </div>

          <div className="step-box">
            <div className="step-number">2</div>
            <h4>Ejecuta el Asistente</h4>
            <p>Abre el archivo descargado. Si Windows SmartScreen muestra aviso de protección por ser una app médica nueva, pulsa <strong>"Más información"</strong> y luego <strong>"Ejecutar de todas formas"</strong>.</p>
          </div>

          <div className="step-box">
            <div className="step-number">3</div>
            <h4>Inicia Sesión y Activa</h4>
            <p>Ingresa con tu usuario y contraseña institucional, o canjea la clave criptográfica proporcionada por tu distribuidor autorizado.</p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          REQUISITOS DEL SISTEMA
          ==================================================================== */}
      <section className="portal-section" id="requisitos">
        <div className="section-header-center">
          <span className="section-tag">Especificaciones Técnicas</span>
          <h2>Requisitos del Sistema</h2>
          <p>SARA ha sido optimizado para trabajar con fluidez en computadoras modernas y equipos estándar de consultorio.</p>
        </div>

        <div className="requirements-table-box">
          <table className="req-table">
            <thead>
              <tr>
                <th>Componente</th>
                <th>Requisito Mínimo</th>
                <th>Requisito Recomendado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Sistema Operativo</strong></td>
                <td>Windows 10 (64-bit)</td>
                <td>Windows 11 Pro (64-bit)</td>
              </tr>
              <tr>
                <td><strong>Procesador (CPU)</strong></td>
                <td>Intel Core i3 o AMD Ryzen 3 (2.0 GHz)</td>
                <td>Intel Core i5 / i7 o AMD Ryzen 5 o superior</td>
              </tr>
              <tr>
                <td><strong>Memoria RAM</strong></td>
                <td>4 GB de RAM</td>
                <td>8 GB de RAM o más</td>
              </tr>
              <tr>
                <td><strong>Almacenamiento</strong></td>
                <td>500 MB libres en disco</td>
                <td>1 GB libre en unidad de estado sólido (SSD)</td>
              </tr>
              <tr>
                <td><strong>Resolución de Pantalla</strong></td>
                <td>1280 x 720 (HD)</td>
                <td>1920 x 1080 (Full HD) o superior</td>
              </tr>
              <tr>
                <td><strong>Conexión</strong></td>
                <td>Red Local o Internet 5 Mbps</td>
                <td>Conexión de Banda Ancha Fibra Óptica</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ====================================================================
          MÓDULOS DE SARA
          ==================================================================== */}
      <section className="portal-section" id="caracteristicas">
        <div className="section-header-center">
          <span className="section-tag">Capacidades del Sistema</span>
          <h2>7 Módulos de Grado Hospitalario</h2>
          <p>Una arquitectura diseñada para cubrir todas las áreas de la práctica médica moderna.</p>
        </div>

        <div className="downloads-grid">
          <div className="step-box">
            <h4 style={{ color: '#38bdf8' }}>1. Control de Acceso & Roles</h4>
            <p>Separación estricta de perfiles: Administrador, Médico, Recepcionista y Paciente con auditoría forense.</p>
          </div>

          <div className="step-box">
            <h4 style={{ color: '#34d399' }}>2. Recepción & Pacientes</h4>
            <p>Registro demográfico, control de primera vez vs reconsulta, apertura rápida y carnet digital.</p>
          </div>

          <div className="step-box">
            <h4 style={{ color: '#fbbf24' }}>3. Caja & Facturación Multimoneda</h4>
            <p>Soporte de tasas BCV y Paralelo en vivo, cobros en USD/VES, arqueo de caja e impresión de facturas.</p>
          </div>

          <div className="step-box">
            <h4 style={{ color: '#a78bfa' }}>4. Estación Clínica & Asistente IA</h4>
            <p>Signos vitales, HCE, catálogo farmacológico, plantillas personalizadas y síntesis clínica con Google Gemini.</p>
          </div>

          <div className="step-box">
            <h4 style={{ color: '#f472b6' }}>5. Citas & Sala de Espera</h4>
            <p>Calendario dinámico por sede médica, gestión de turnos y sincronización con el portal del paciente.</p>
          </div>

          <div className="step-box">
            <h4 style={{ color: '#38bdf8' }}>6. Estudios & Procedimientos</h4>
            <p>Rayos X, Ultrasonido, Laboratorio, Endoscopias, toma de biopsias e informes descargables en PDF.</p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          MODAL DE DIÁLOGO: DESCARGA INICIADA
          ==================================================================== */}
      {showDownloadModal && (
        <div className="download-dialog-overlay" onClick={() => setShowDownloadModal(false)}>
          <div className="download-dialog-card" onClick={e => e.stopPropagation()}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#34d399' }}>
              <Download size={28} />
            </div>

            <h3 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '1.4rem' }}>
              ¡Tu Descarga Ha Comenzado!
            </h3>
            <p style={{ color: 'var(--portal-text-muted)', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
              {downloadingType === 'portable' 
                ? <>El paquete <strong>SARA_Portable_v2.4.0.zip</strong> se está guardando en tu carpeta de Descargas. Solo debes descomprimirlo y ejecutar <code>SARA.exe</code>.</>
                : downloadingType === 'direct'
                ? <>El ejecutable nativo <strong>SARA.exe</strong> se está guardando en tu carpeta de Descargas. Puedes ejecutarlo directamente sin instalar nada.</>
                : <>El instalador <strong>SARA_Setup_v2.4.0.exe</strong> se está guardando en tu carpeta de Descargas.</>
              }
            </p>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '10px', textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <span style={{ display: 'block', fontWeight: 700, color: '#38bdf8', marginBottom: '0.4rem' }}>
                💡 Instrucciones si Windows SmartScreen muestra un aviso:
              </span>
              <p style={{ margin: 0, color: 'var(--portal-text-muted)' }}>
                1. Haz clic en <strong>"Más información"</strong> en la ventana emergente.<br />
                2. Luego haz clic en <strong>"Ejecutar de todas formas"</strong> para iniciar SARA de manera segura.
              </p>
            </div>

            <button 
              className="btn-card-download primary"
              onClick={() => setShowDownloadModal(false)}
            >
              <span>Entendido, Cerrar</span>
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL DE AUTENTICACIÓN: ACCESO SUPER MASTER
          ==================================================================== */}
      {showAuthModal && (
        <div className="master-auth-modal" onClick={() => setShowAuthModal(false)}>
          <div className="master-auth-card" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowAuthModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--portal-text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#090e17' }}>
                <Lock size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>Acceso Super Master</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--portal-text-muted)' }}>Control Central de Licencias SARA</span>
              </div>
            </div>

            {authError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleSuperMasterLogin}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Usuario Super Master:
                </label>
                <input 
                  type="text"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="ej. luisge"
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--portal-border)', background: '#090e17', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Contraseña:
                </label>
                <input 
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--portal-border)', background: '#090e17', color: '#fff' }}
                />
              </div>

              <button 
                type="submit"
                className="btn-card-download primary"
                disabled={authLoading}
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#090e17' }}
              >
                {authLoading ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                <span>Ingresar al Control de Licencias</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: REGISTRAR NUEVA CLÍNICA
          ==================================================================== */}
      {showNewClinicModal && (
        <div className="master-auth-modal" onClick={() => setShowNewClinicModal(false)}>
          <div className="master-auth-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button 
              onClick={() => setShowNewClinicModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--portal-text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 1rem', color: '#fff' }}>Registrar Nueva Clínica Cliente</h3>

            <form onSubmit={handleCreateClinic}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Nombre de la Clínica / Centro Médico:
                </label>
                <input 
                  type="text"
                  placeholder="Ej: Clínica Los Cedros"
                  value={newClinicName}
                  onChange={(e) => setNewClinicName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--portal-border)', background: '#090e17', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
                  RIF / Cédula Jurídica:
                </label>
                <input 
                  type="text"
                  placeholder="Ej: J-30123456-0"
                  value={newClinicRif}
                  onChange={(e) => setNewClinicRif(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--portal-border)', background: '#090e17', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
                    Plan Inicial:
                  </label>
                  <select 
                    value={newClinicPlan} 
                    onChange={(e) => setNewClinicPlan(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--portal-border)', background: '#090e17', color: '#fff' }}
                  >
                    <option value="MONTHLY">Mensual</option>
                    <option value="ANNUAL">Anual</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
                    Días Iniciales:
                  </label>
                  <input 
                    type="number"
                    min="1"
                    value={newClinicDays}
                    onChange={(e) => setNewClinicDays(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--portal-border)', background: '#090e17', color: '#fff' }}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="btn-card-download primary"
                disabled={creatingClinic}
              >
                {creatingClinic ? <RefreshCw className="animate-spin" size={18} /> : <Building size={18} />}
                <span>Guardar y Registrar Clínica</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: EXTENSIÓN PERSONALIZADA DE CLÍNICA
          ==================================================================== */}
      {extendModalClinic && (
        <div className="master-auth-modal" onClick={() => setExtendModalClinic(null)}>
          <div className="master-auth-card" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setExtendModalClinic(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--portal-text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 0.5rem', color: '#fff' }}>Extensión de Servicio a Medida</h3>
            <p style={{ color: 'var(--portal-text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Clínica: <strong>{extendModalClinic.name}</strong> (ID #{extendModalClinic.id})
            </p>

            <form onSubmit={handleCustomExtend}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Cantidad de Días a Sumar:
                </label>
                <input 
                  type="number"
                  min="1"
                  max="3650"
                  value={extendDaysInput}
                  onChange={(e) => setExtendDaysInput(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--portal-border)', background: '#090e17', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Motivo o Nota:
                </label>
                <input 
                  type="text"
                  value={extendNotesInput}
                  onChange={(e) => setExtendNotesInput(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--portal-border)', background: '#090e17', color: '#fff' }}
                />
              </div>

              <button 
                type="submit"
                className="btn-card-download primary"
                disabled={extending}
              >
                {extending ? <RefreshCw className="animate-spin" size={18} /> : <Clock size={18} />}
                <span>Aplicar Extensión</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          FOOTER
          ==================================================================== */}
      <footer className="portal-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <h4 style={{ margin: 0, color: '#fff' }}>SARA Medical Systems</h4>
            <p>&copy; {new Date().getFullYear()} SARA. Todos los derechos reservados. Diseñado para centros médicos de excelencia.</p>
          </div>

          <div className="footer-right">
            <button 
              className="portal-nav-link"
              onClick={() => {
                if (isSuperMaster) {
                  setShowMasterSection(true);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                } else {
                  setShowAuthModal(true);
                }
              }}
              style={{ color: '#fbbf24' }}
            >
              👑 Panel Super Master
            </button>
            <button className="portal-nav-link" onClick={() => navigate('/login')}>
              Acceso Clínico
            </button>
            <button className="portal-nav-link" onClick={() => navigate('/users/login')}>
              Portal Pacientes
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
