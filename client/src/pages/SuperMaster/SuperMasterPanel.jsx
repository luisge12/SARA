import React, { useState, useEffect } from 'react';
import { 
  Zap, Key, Sparkles, RefreshCw, LogOut, Copy, Check, 
  Search, X, CheckCircle2, Share2, FileText, ArrowLeft, Shield,
  Users, UserPlus, Building, AlertCircle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import licenseService from '../../services/licenseService';
import '../SaraWebPortal/SaraWebPortal.css';

export default function SuperMasterPanel() {
  const navigate = useNavigate();

  // Verificar autenticación de Super Master
  const [currentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const isSuperMaster = 
    currentUser?.username?.toLowerCase() === 'luisge' || 
    currentUser?.role?.toLowerCase() === 'supermaster';

  // Si no es SuperMaster o no está autenticado, redirigir al login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isSuperMaster) {
      navigate('/login', { replace: true });
    }
  }, [isSuperMaster, navigate]);

  // Estados de navegación y datos
  const [masterTab, setMasterTab] = useState('generator'); // 'generator' | 'keys' | 'masters'
  const [loading, setLoading] = useState(false);
  const [keyStats, setKeyStats] = useState({ totalKeys: 0, availableKeys: 0, usedKeys: 0, revokedKeys: 0 });
  const [keysList, setKeysList] = useState([]);
  const [mastersList, setMastersList] = useState([]);
  const [clinicsList, setClinicsList] = useState([]);
  const [keyFilter, setKeyFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'USED' | 'REVOKED'
  const [searchTerm, setSearchTerm] = useState('');

  // Formulario Generador de Licencias
  const [planType, setPlanType] = useState('MONTHLY');
  const [customDays, setCustomDays] = useState(30);
  const [clientNotes, setClientNotes] = useState('');
  const [generatingKey, setGeneratingKey] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Formulario Creación de Nuevo Master y Clínica
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicRif, setNewClinicRif] = useState('');
  const [newClinicDays, setNewClinicDays] = useState('30');
  const [newMasterUsername, setNewMasterUsername] = useState('');
  const [newMasterPassword, setNewMasterPassword] = useState('');
  const [newMasterName, setNewMasterName] = useState('');
  const [creatingMaster, setCreatingMaster] = useState(false);
  const [masterMsg, setMasterMsg] = useState({ type: '', text: '', data: null });

  // Cargar estadísticas, claves, masters y clínicas
  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, keysRes, mastersRes, clinicsRes] = await Promise.all([
        licenseService.getKeyStats().catch(() => ({})),
        licenseService.listKeys().catch(() => []),
        licenseService.listMasterUsers().catch(() => []),
        licenseService.listClinicsSummary().catch(() => [])
      ]);
      setKeyStats(statsRes || {});
      setKeysList(Array.isArray(keysRes) ? keysRes : []);
      setMastersList(Array.isArray(mastersRes) ? mastersRes : []);
      setClinicsList(Array.isArray(clinicsRes) ? clinicsRes : []);
      if (clinicsRes && clinicsRes.length > 0 && !newMasterClinicId) {
        setNewMasterClinicId(String(clinicsRes[0].id));
      }
    } catch (err) {
      console.error('Error al cargar datos de Super Master:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperMaster) {
      loadData();
    }
  }, [isSuperMaster]);

  // Manejador de Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
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
      await loadData();
    } catch (err) {
      alert('Error al generar clave: ' + (err.response?.data?.error || err.message));
    } finally {
      setGeneratingKey(false);
    }
  };

  // Crear Usuario Master y Clínica
  const handleCreateMaster = async (e) => {
    e.preventDefault();
    setMasterMsg({ type: '', text: '', data: null });
    setCreatingMaster(true);

    try {
      const res = await licenseService.createMasterUser({
        username: newMasterUsername.trim(),
        password: newMasterPassword,
        name: newMasterName.trim(),
        clinicName: newClinicName.trim(),
        clinicRif: newClinicRif.trim(),
        initialDays: parseInt(newClinicDays) || 30
      });

      setMasterMsg({
        type: 'success',
        text: `¡Clínica "${res.clinic?.name}" y usuario Master "${res.user?.username}" creados y vinculados con éxito!`,
        data: {
          username: res.user?.username,
          password: newMasterPassword,
          clinicName: res.clinic?.name,
          rif: res.clinic?.rif
        }
      });

      // Limpiar campos
      setNewClinicName('');
      setNewClinicRif('');
      setNewMasterUsername('');
      setNewMasterPassword('');
      setNewMasterName('');
      await loadData();
    } catch (err) {
      console.error('Error al crear usuario Master y clínica:', err);
      setMasterMsg({
        type: 'error',
        text: err.response?.data?.error || 'Error al crear usuario Master y clínica.'
      });
    } finally {
      setCreatingMaster(false);
    }
  };

  // Copiar clave
  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  // Revocar clave
  const handleRevokeKey = async (keyId, licenseKey) => {
    const reason = window.prompt(
      `¿Estás seguro de REVOCAR la clave ${licenseKey}?\nIndica el motivo de revocación (ej: Falta de pago, cancelación de contrato):`, 
      'Revocada por Super Master'
    );
    if (reason === null) return;

    try {
      setLoading(true);
      await licenseService.revokeKey(keyId, reason.trim() || 'Revocada por Super Master');
      await loadData();
      alert(`¡La clave ${licenseKey} ha sido revocada exitosamente!`);
    } catch (err) {
      alert('Error al revocar clave: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Aprobar clave
  const handleApproveKey = async (keyId, licenseKey) => {
    const confirm = window.confirm(`¿Deseas APROBAR y reactivar la clave de licencia ${licenseKey}?`);
    if (!confirm) return;

    try {
      setLoading(true);
      await licenseService.approveKey(keyId);
      await loadData();
      alert(`¡La clave ${licenseKey} ha sido aprobada y rehabilitada con éxito!`);
    } catch (err) {
      alert('Error al aprobar clave: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de claves
  const filteredKeys = keysList.filter(k => {
    const isRevoked = k.status === 'REVOKED';
    const isUsed = k.isUsed && !isRevoked;
    const isAvailable = !k.isUsed && !isRevoked;

    const matchesFilter = 
      keyFilter === 'ALL' ? true :
      keyFilter === 'AVAILABLE' ? isAvailable :
      keyFilter === 'USED' ? isUsed :
      keyFilter === 'REVOKED' ? isRevoked : true;

    const matchesSearch = 
      !searchTerm || 
      (k.licenseKey && k.licenseKey.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (k.notes && k.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (k.revokedReason && k.revokedReason.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  if (!isSuperMaster) {
    return null;
  }

  return (
    <div className="sara-web-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Efectos ambientales de fondo */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Barra de Navegación Exclusiva Super Master */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(9, 14, 23, 0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
        padding: '0.85rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.4) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24'
          }}>
            <Zap size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              SARA <span style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>SUPER MASTER</span>
            </h1>
            <span style={{ fontSize: '0.78rem', color: 'var(--portal-text-muted)' }}>
              Consola Central de Licenciamiento y Alta de Masters
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link 
            to="/descargas" 
            className="btn-portal-secondary"
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
            title="Ver página de descargas del software"
          >
            📥 Portal de Descargas
          </Link>

          <button 
            className="btn-portal-secondary"
            onClick={loadData}
            disabled={loading}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
            title="Refrescar datos del servidor"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refrescar</span>
          </button>

          <button 
            className="btn-portal-secondary"
            onClick={handleLogout}
            style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)', fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
            title="Cerrar sesión de Super Master"
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1280px', width: '100%', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        {/* Banner de Bienvenida y Usuario */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              Bienvenido, {currentUser?.name || currentUser?.username} 👑
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.86rem', color: 'var(--portal-text-muted)' }}>
              Potestad exclusiva: Creación de cuentas <strong>Master</strong> para clínicas y emisión criptográfica de licencias.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              👑 Super Master Oficial
            </span>
          </div>
        </div>

        {/* KPIs del Super Master */}
        <div className="master-kpi-grid">
          <div className="master-kpi-card">
            <span className="kpi-label">Total Claves Emitidas</span>
            <span className="kpi-value cyan">{keyStats.totalKeys || keysList.length}</span>
            <span className="kpi-sub">Generadas en la plataforma</span>
          </div>

          <div className="master-kpi-card">
            <span className="kpi-label">Claves Disponibles</span>
            <span className="kpi-value green">{keyStats.availableKeys || keysList.filter(k => !k.isUsed && k.status !== 'REVOKED').length}</span>
            <span className="kpi-sub">Listas para canje</span>
          </div>

          <div className="master-kpi-card">
            <span className="kpi-label">Claves Canjeadas</span>
            <span className="kpi-value gold">{keyStats.usedKeys || keysList.filter(k => k.isUsed && k.status !== 'REVOKED').length}</span>
            <span className="kpi-sub">Activadas en clínicas</span>
          </div>

          <div className="master-kpi-card">
            <span className="kpi-label">Usuarios Master Activos</span>
            <span className="kpi-value" style={{ color: '#38bdf8' }}>{mastersList.length}</span>
            <span className="kpi-sub">Directores de clínicas</span>
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
            className={`master-tab-btn ${masterTab === 'keys' ? 'active' : ''}`}
            onClick={() => setMasterTab('keys')}
          >
            <FileText size={18} /> Control y Aprobación de Claves ({keysList.length})
          </button>
          <button 
            className={`master-tab-btn ${masterTab === 'masters' ? 'active' : ''}`}
            onClick={() => setMasterTab('masters')}
          >
            <Users size={18} /> Crear y Gestionar Masters ({mastersList.length})
          </button>
        </div>

        {/* ====================================================================
            PESTAÑA 1: GENERADOR DE LICENCIAS
            ==================================================================== */}
        {masterTab === 'generator' && (
          <div className="master-form-box" style={{ marginTop: 0 }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={20} color="#fbbf24" /> Generar Nueva Clave Criptográfica
            </h3>
            <p style={{ color: 'var(--portal-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Selecciona la duración del plan y genera un código criptográfico único para entregar a la clínica.
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
                  Notas / Clínica Destinataria:
                </label>
                <input 
                  type="text"
                  placeholder="Ej: Clínica San Miguel - Dr. Gómez (Pago Transferencia Bancaria)"
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
              <div className="key-award-banner" style={{ marginTop: '1.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                    ¡Clave Generada Exitosamente! Lista para entregar al cliente:
                  </span>
                  <div className="key-code-display">{newlyGeneratedKey.licenseKey}</div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--portal-text-muted)' }}>
                    Vigencia: {newlyGeneratedKey.durationDays} días &bull; Tipo: {newlyGeneratedKey.planType} &bull; {newlyGeneratedKey.notes || 'Sin nota'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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

        {/* ====================================================================
            PESTAÑA 2: CONTROL Y APROBACIÓN DE CLAVES
            ==================================================================== */}
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
                  Disponibles ({keysList.filter(k => !k.isUsed && k.status !== 'REVOKED').length})
                </button>
                <button 
                  className={`btn-portal-secondary ${keyFilter === 'USED' ? 'active' : ''}`}
                  onClick={() => setKeyFilter('USED')}
                  style={{ color: '#94a3b8' }}
                >
                  Canjeadas ({keysList.filter(k => k.isUsed && k.status !== 'REVOKED').length})
                </button>
                <button 
                  className={`btn-portal-secondary ${keyFilter === 'REVOKED' ? 'active' : ''}`}
                  onClick={() => setKeyFilter('REVOKED')}
                  style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  Revocadas ({keysList.filter(k => k.status === 'REVOKED').length})
                </button>
              </div>

              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--portal-text-dim)' }} />
                <input 
                  type="text"
                  placeholder="Buscar por clave, cliente o nota..."
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
                    <th>Acciones Super Master</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKeys.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--portal-text-dim)' }}>
                        No se encontraron claves de licencia con el filtro actual.
                      </td>
                    </tr>
                  ) : (
                    filteredKeys.map(k => {
                      const isRevoked = k.status === 'REVOKED';
                      return (
                        <tr key={k.id} style={{ opacity: isRevoked ? 0.78 : 1 }}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 700, color: isRevoked ? '#f87171' : k.isUsed ? '#94a3b8' : '#34d399' }}>
                            {k.licenseKey}
                          </td>
                          <td>{k.planType}</td>
                          <td>{k.durationDays} días</td>
                          <td>
                            {isRevoked ? (
                              <span className="badge-status-pill expired" title={k.revokedReason || 'Revocada'}>
                                Revocada
                              </span>
                            ) : k.isUsed ? (
                              <span className="badge-status-pill" style={{ background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }}>
                                Canjeada
                              </span>
                            ) : (
                              <span className="badge-status-pill active">
                                Disponible
                              </span>
                            )}
                          </td>
                          <td>
                            <div>{k.notes || '—'}</div>
                            {isRevoked && k.revokedReason && (
                              <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '2px' }}>
                                Motivo: {k.revokedReason}
                              </div>
                            )}
                          </td>
                          <td>{new Date(k.created_at || k.createdAt).toLocaleDateString()}</td>
                          <td>{k.usedAt ? new Date(k.usedAt).toLocaleDateString() : '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                              <button 
                                className="btn-portal-secondary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                                onClick={() => handleCopyText(k.licenseKey)}
                                title="Copiar clave"
                              >
                                <Copy size={13} />
                              </button>

                              {isRevoked ? (
                                <button 
                                  className="btn-portal-secondary"
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)' }}
                                  onClick={() => handleApproveKey(k.id, k.licenseKey)}
                                  title="Aprobar y reactivar clave"
                                >
                                  <CheckCircle2 size={13} /> Aprobar
                                </button>
                              ) : (
                                <button 
                                  className="btn-portal-secondary"
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                                  onClick={() => handleRevokeKey(k.id, k.licenseKey)}
                                  title="Revocar o suspender clave"
                                >
                                  <X size={13} /> Revocar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================================================
            PESTAÑA 3: CREAR Y GESTIONAR MASTERS DE CLÍNICA (EXCLUSIVO SUPER MASTER)
            ==================================================================== */}
        {masterTab === 'masters' && (
          <div>
            {/* Formulario de Alta de Master */}
            <div className="master-form-box" style={{ marginTop: 0, marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Building size={20} color="#38bdf8" /> Registrar Nueva Clínica y Asignar Usuario Master
              </h3>
              <p style={{ color: 'var(--portal-text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                Escribe el nombre de la clínica que usará SARA y define su usuario Master. Si la clínica es nueva, el sistema la creará automáticamente en la plataforma con su licencia inicial y le otorgará control absoluto sobre sus médicos, citas y módulos clínicos.
              </p>

              {masterMsg.text && (
                <div style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '10px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  background: masterMsg.type === 'success' ? 'rgba(52, 211, 153, 0.12)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${masterMsg.type === 'success' ? 'rgba(52, 211, 153, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  color: masterMsg.type === 'success' ? '#34d399' : '#f87171'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {masterMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span style={{ fontWeight: 600 }}>{masterMsg.text}</span>
                  </div>

                  {masterMsg.data && (
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.75rem 1rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}>
                      <div style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
                        Clínica: <strong>{masterMsg.data.clinicName}</strong> &bull; Usuario: <strong style={{ color: '#fbbf24' }}>{masterMsg.data.username}</strong> &bull; Clave: <code style={{ color: '#38bdf8', padding: '2px 4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>{masterMsg.data.password}</code>
                      </div>
                      <a
                        className="btn-portal-secondary"
                        href={`https://wa.me/?text=${encodeURIComponent(`Hola! Aquí tienes los datos de acceso para SARA Clínicas:\nClínica: ${masterMsg.data.clinicName}\nUsuario Master: ${masterMsg.data.username}\nContraseña: ${masterMsg.data.password}\nEnlace de acceso: ${window.location.origin}/login`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.4)', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        <Share2 size={14} /> Compartir por WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleCreateMaster}>
                {/* Datalist de sugerencias de clínicas */}
                <datalist id="clinics-datalist">
                  {clinicsList.map(c => (
                    <option key={c.id} value={c.name}>{c.rif ? `(${c.rif})` : ''}</option>
                  ))}
                </datalist>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  {/* Nombre de la Clínica */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#38bdf8', marginBottom: '0.4rem', fontWeight: 700 }}>
                      🏥 Nombre de la Clínica *:
                    </label>
                    <input 
                      type="text"
                      list="clinics-datalist"
                      placeholder="Escribe el nombre (ej: Clínica San Román)..."
                      value={newClinicName}
                      onChange={(e) => setNewClinicName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.4)', background: '#090e17', color: '#fff' }}
                    />
                  </div>

                  {/* RIF de la Clínica */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      RIF de la Clínica (Opcional):
                    </label>
                    <input 
                      type="text"
                      placeholder="ej: J-12345678-9"
                      value={newClinicRif}
                      onChange={(e) => setNewClinicRif(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--portal-border)', background: '#090e17', color: '#fff' }}
                    />
                  </div>

                  {/* Vigencia Inicial */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Licencia Inicial de la Clínica:
                    </label>
                    <select
                      value={newClinicDays}
                      onChange={(e) => setNewClinicDays(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--portal-border)', background: '#090e17', color: '#fff' }}
                    >
                      <option value="30">30 Días (Mes Inicial de Servicio)</option>
                      <option value="90">90 Días (Trimestral)</option>
                      <option value="180">180 Días (Semestral)</option>
                      <option value="365">365 Días (1 Año Completo)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  {/* Usuario Master */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#fbbf24', marginBottom: '0.4rem', fontWeight: 700 }}>
                      👑 Usuario Master para la Clínica *:
                    </label>
                    <input 
                      type="text"
                      placeholder="ej: sanroman_master"
                      value={newMasterUsername}
                      onChange={(e) => setNewMasterUsername(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.4)', background: '#090e17', color: '#fff' }}
                    />
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Contraseña de Acceso *:
                    </label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      value={newMasterPassword}
                      onChange={(e) => setNewMasterPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--portal-border)', background: '#090e17', color: '#fff' }}
                    />
                  </div>

                  {/* Nombre Completo Director */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                      Nombre Completo del Director / Titular:
                    </label>
                    <input 
                      type="text"
                      placeholder="ej: Dr. Alejandro Mendoza (Director)"
                      value={newMasterName}
                      onChange={(e) => setNewMasterName(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--portal-border)', background: '#090e17', color: '#fff' }}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="btn-card-download primary"
                  disabled={creatingMaster}
                  style={{ maxWidth: '340px' }}
                >
                  {creatingMaster ? <RefreshCw className="animate-spin" size={18} /> : <UserPlus size={18} />}
                  <span>Registrar Clínica y Usuario Master</span>
                </button>
              </form>
            </div>

            {/* Tabla de Usuarios Master Existentes */}
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="#fbbf24" /> Usuarios Master Registrados en el Sistema
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--portal-text-muted)' }}>
                Total: <strong>{mastersList.length}</strong> Masters activos
              </span>
            </div>

            <div className="master-table-container">
              <table className="master-data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre de Usuario</th>
                    <th>Nombre Completo</th>
                    <th>Rol en la Plataforma</th>
                    <th>Clínica Asignada</th>
                    <th>RIF Clínica</th>
                    <th>Fecha de Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {mastersList.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--portal-text-dim)' }}>
                        No hay usuarios con rol Master registrados.
                      </td>
                    </tr>
                  ) : (
                    mastersList.map(m => (
                      <tr key={m.id}>
                        <td style={{ color: 'var(--portal-text-dim)' }}>#{m.id}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#fbbf24' }}>
                          {m.username}
                        </td>
                        <td style={{ fontWeight: 600, color: '#ffffff' }}>
                          {m.name || 'Sin nombre'}
                        </td>
                        <td>
                          <span className="badge-status-pill active" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                            👑 Master de Clínica
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Building size={14} color="#38bdf8" />
                            <span>{m.clinicName}</span>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'monospace', color: 'var(--portal-text-muted)' }}>
                          {m.clinicRif}
                        </td>
                        <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer del Super Master */}
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        borderTop: '1px solid var(--portal-border)',
        color: 'var(--portal-text-dim)',
        fontSize: '0.8rem',
        marginTop: 'auto'
      }}>
        SARA Medical Platform &bull; Consola Exclusiva de Licenciamiento y Control Super Master &bull; 2026
      </footer>
    </div>
  );
}
