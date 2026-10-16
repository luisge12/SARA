import React, { useState, useEffect } from 'react';
import { 
  Key, ShieldCheck, AlertTriangle, Calendar, Clock, Copy, Check, 
  RefreshCw, Sparkles, Building, CreditCard, ChevronRight, Lock
} from 'lucide-react';
import licenseService from '../../services/licenseService';
import './LicenseManager.css';

export default function LicenseManager() {
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeemKeyInput, setRedeemKeyInput] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Estados exclusivos para Super Master
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isMaster = currentUser?.role?.toLowerCase() === 'master';

  const [keysList, setKeysList] = useState([]);
  const [genPlanType, setGenPlanType] = useState('MONTHLY');
  const [genNotes, setGenNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [lastGeneratedKey, setLastGeneratedKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [manualDays, setManualDays] = useState(30);
  const [manualExtending, setManualExtending] = useState(false);

  const fetchLicenseData = async () => {
    try {
      setLoading(true);
      const data = await licenseService.getStatus();
      setLicense(data);

      if (isMaster) {
        const keys = await licenseService.listKeys();
        setKeysList(keys);
      }
    } catch (err) {
      console.error('Error al cargar datos de licencia:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenseData();
  }, []);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!redeemKeyInput.trim()) return;

    setRedeeming(true);
    setFeedback(null);
    try {
      const res = await licenseService.redeemKey(redeemKeyInput.trim());
      setFeedback({ type: 'success', message: res.message });
      setRedeemKeyInput('');
      await fetchLicenseData();
      // Notificar al sistema para actualizar badges en tiempo real
      window.dispatchEvent(new Event('sara_license_updated'));
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Error al canjear la clave de licencia.';
      setFeedback({ type: 'error', message: errMsg });
    } finally {
      setRedeeming(false);
    }
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setLastGeneratedKey(null);
    try {
      const res = await licenseService.generateKey({
        planType: genPlanType,
        notes: genNotes.trim()
      });
      setLastGeneratedKey(res.key);
      setGenNotes('');
      // Refrescar lista de claves
      const keys = await licenseService.listKeys();
      setKeysList(keys);
    } catch (err) {
      alert('Error al generar clave: ' + (err.response?.data?.error || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleManualExtend = async () => {
    if (!window.confirm(`¿Confirmas extender manualmente ${manualDays} días a la clínica actual?`)) return;
    setManualExtending(true);
    try {
      await licenseService.manualExtend({ days: manualDays, notes: 'Extensión manual Super Master' });
      alert(`¡Se añadieron ${manualDays} días con éxito!`);
      await fetchLicenseData();
      window.dispatchEvent(new Event('sara_license_updated'));
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setManualExtending(false);
    }
  };

  if (loading && !license) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 1rem' }} />
        <p>Cargando información de suscripción y licencias...</p>
      </div>
    );
  }

  // Cálculo de porcentaje para la barra de progreso
  const totalDaysCycle = license?.planType === 'ANNUAL' ? 365 : 30;
  const daysLeft = license?.daysRemaining || 0;
  const progressPercent = Math.min(100, Math.max(0, Math.round((daysLeft / totalDaysCycle) * 100)));

  return (
    <div className="license-manager-container">
      {/* 1. TARJETA PRINCIPAL DEL ESTADO DE LA LICENCIA DE LA CLÍNICA */}
      <div className={`license-hero-card ${license?.isExpired ? 'expired' : ''}`}>
        <div className="license-hero-header">
          <div className="license-title-group">
            <h2>
              <ShieldCheck size={26} color="#38bdf8" />
              Licencia Oficial de la Clínica
            </h2>
            <p>
              Centro: <strong>{license?.clinicName || 'Clínica Principal'}</strong> &bull; ID #{license?.clinicId}
            </p>
          </div>

          <div>
            {license?.isExpired ? (
              <span className="license-status-badge expired">
                <span className="pulse-dot"></span> Licencia Vencida
              </span>
            ) : license?.isExpiringSoon ? (
              <span className="license-status-badge warning">
                <span className="pulse-dot"></span> Vence Pronto
              </span>
            ) : (
              <span className="license-status-badge active">
                <span className="pulse-dot"></span> Licencia Activa
              </span>
            )}
          </div>
        </div>

        <div className="license-metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Modalidad / Plan</span>
            <span className="metric-value">
              {license?.planType === 'ANNUAL' ? 'Plan Anual' : 'Plan Mensual'}
            </span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Días de Servicio Restantes</span>
            <span className={`metric-value ${license?.isExpired ? 'urgent' : 'highlight'}`}>
              {license?.isExpired ? '0 días' : `${license?.daysRemaining} días`}
            </span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Fecha de Vencimiento</span>
            <span className="metric-value">
              {license?.expiresAt ? new Date(license.expiresAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'}
            </span>
          </div>

          <div className="metric-item">
            <span className="metric-label">Clave Registrada</span>
            <span className="metric-value" style={{ fontSize: '1rem', fontFamily: 'monospace' }}>
              {license?.activeLicenseKey || 'SARA-M-START-2026'}
            </span>
          </div>
        </div>

        {/* Barra de progreso de días */}
        {!license?.isExpired && (
          <div className="license-progress-container">
            <div className="progress-labels">
              <span>Vigencia en curso ({license?.planType === 'ANNUAL' ? 'Ciclo Anual' : 'Ciclo Mensual'})</span>
              <span>{daysLeft} de {totalDaysCycle} días disponibles</span>
            </div>
            <div className="progress-bar-track">
              <div 
                className={`progress-bar-fill ${license?.isExpiringSoon ? 'urgent' : ''}`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* 2. FORMULARIO DE CANJE DE CLAVE */}
      <div className="redeem-card">
        <div className="redeem-header">
          <h3>
            <Key size={20} color="#22505d" /> Canjear Clave de Renovación o Activación
          </h3>
          <p>
            Ingrese el código de licencia (Mensual o Anual) proporcionado por soporte para activar o sumar días al servicio de la clínica.
          </p>
        </div>

        {feedback && (
          <div className={`alert-feedback ${feedback.type}`} style={{ marginBottom: '1rem' }}>
            {feedback.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleRedeem} className="redeem-form">
          <div className="key-input-wrapper">
            <input 
              type="text" 
              className="key-input"
              placeholder="SARA-M-XXXX-XXXX-XXXX"
              value={redeemKeyInput}
              onChange={(e) => setRedeemKeyInput(e.target.value.toUpperCase())}
              disabled={redeeming}
              maxLength={26}
              required
            />
            <button 
              type="submit" 
              className="btn-redeem"
              disabled={redeeming || !redeemKeyInput.trim()}
            >
              {redeeming ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  <span>Validando Clave...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Activar Licencia</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. SECCIÓN EXCLUSIVA PARA SUPER MASTER: GENERADOR Y ADMINISTRACIÓN */}
      {isMaster && (
        <div className="super-master-section">
          <div className="master-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                  Panel Super Master de Licencias SARA
                </h3>
                <span className="master-badge">Exclusivo Desarrollador / Master</span>
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                Herramienta para emitir claves oficiales a clientes (clínicas) y llevar el registro de ventas.
              </p>
            </div>
            <button 
              className="btn-redeem" 
              onClick={fetchLicenseData}
              style={{ background: '#475569' }}
              title="Refrescar lista"
            >
              <RefreshCw size={16} /> Refrescar Claves
            </button>
          </div>

          {/* Selector de Plan a generar */}
          <form onSubmit={handleGenerateKey}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#334155' }}>
                1. Selecciona el Tipo de Plan a emitir:
              </label>
              <div className="plan-picker-grid">
                <div 
                  className={`plan-card-choice ${genPlanType === 'MONTHLY' ? 'selected' : ''}`}
                  onClick={() => setGenPlanType('MONTHLY')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="plan-choice-title">Plan Mensual</span>
                    <Calendar size={18} color="#22505d" />
                  </div>
                  <span className="plan-choice-desc">Vigencia: 30 días continuos. Ideal para cobro mensual recurrente.</span>
                </div>

                <div 
                  className={`plan-card-choice ${genPlanType === 'ANNUAL' ? 'selected' : ''}`}
                  onClick={() => setGenPlanType('ANNUAL')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="plan-choice-title">Plan Anual</span>
                    <Sparkles size={18} color="#eab308" />
                  </div>
                  <span className="plan-choice-desc">Vigencia: 365 días continuos. Suscripción anual para centros médicos.</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#334155' }}>
                2. Detalle de venta / Cliente (opcional):
              </label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ej. Clínica San Lucas - Pago Zelle Ref #4928"
                value={genNotes}
                onChange={(e) => setGenNotes(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn-redeem"
              disabled={generating}
              style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
            >
              {generating ? <RefreshCw className="animate-spin" size={18} /> : <Key size={18} />}
              <span>Generar Clave {genPlanType === 'ANNUAL' ? 'Anual (365d)' : 'Mensual (30d)'}</span>
            </button>
          </form>

          {/* Banner de clave recién generada */}
          {lastGeneratedKey && (
            <div className="key-generated-banner">
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#065f46', fontWeight: 700, textTransform: 'uppercase' }}>
                  ¡Nueva Clave Generada Lista para Enviar al Cliente!
                </span>
                <span className="key-generated-code">{lastGeneratedKey.licenseKey}</span>
                <span style={{ display: 'block', fontSize: '0.85rem', color: '#047857', marginTop: '0.25rem' }}>
                  Plan: {lastGeneratedKey.planType} ({lastGeneratedKey.durationDays} días) &bull; {lastGeneratedKey.notes || 'Sin nota'}
                </span>
              </div>
              <button 
                type="button" 
                className="btn-copy"
                onClick={() => handleCopy(lastGeneratedKey.licenseKey)}
              >
                {copiedKey ? <Check size={18} /> : <Copy size={18} />}
                <span>{copiedKey ? '¡Copiada!' : 'Copiar Clave'}</span>
              </button>
            </div>
          )}

          {/* Extensión manual de cortesía rápida */}
          <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontSize: '1rem', fontWeight: 700 }}>
              Extensión Rápida de Cortesía (Sin Código)
            </h4>
            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#64748b' }}>
              Suma días directamente a la clínica activa de esta instancia si el cliente pagó por transferencia directa.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="btn-redeem"
                onClick={handleManualExtend}
                disabled={manualExtending}
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
              >
                {manualExtending ? <RefreshCw className="animate-spin" size={16} /> : <Clock size={16} />}
                <span>Sumar +{manualDays} Días a la Clínica</span>
              </button>
              <select 
                value={manualDays} 
                onChange={(e) => setManualDays(Number(e.target.value))}
                style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600 }}
              >
                <option value={7}>+7 días (Período de Gracia)</option>
                <option value={15}>+15 días (Medio Mes)</option>
                <option value={30}>+30 días (1 Mes)</option>
                <option value={365}>+365 días (1 Año)</option>
              </select>
            </div>
          </div>

          {/* Historial de Claves emitidas */}
          <div style={{ marginTop: '2.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontSize: '1.05rem', fontWeight: 700 }}>
              Historial de Claves Emitidas ({keysList.length})
            </h4>
            <div className="keys-table-wrapper">
              <table className="keys-table">
                <thead>
                  <tr>
                    <th>Clave de Licencia</th>
                    <th>Plan</th>
                    <th>Vigencia</th>
                    <th>Estado</th>
                    <th>Notas / Cliente</th>
                    <th>Fecha Emisión</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {keysList.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        No se han emitido claves aún. Genera la primera clave con el formulario superior.
                      </td>
                    </tr>
                  ) : (
                    keysList.map((k) => (
                      <tr key={k.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{k.licenseKey}</td>
                        <td><strong>{k.planType === 'ANNUAL' ? 'Anual' : 'Mensual'}</strong></td>
                        <td>{k.durationDays} días</td>
                        <td>
                          {k.isUsed ? (
                            <span className="key-badge-status used">Canjeada</span>
                          ) : (
                            <span className="key-badge-status available">Disponible</span>
                          )}
                        </td>
                        <td>{k.notes || '-'}</td>
                        <td>{new Date(k.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            type="button"
                            onClick={() => handleCopy(k.licenseKey)}
                            style={{ 
                              background: 'transparent', 
                              border: '1px solid #cbd5e1', 
                              borderRadius: '6px', 
                              padding: '0.35rem 0.65rem', 
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.78rem',
                              fontWeight: 600
                            }}
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
        </div>
      )}
    </div>
  );
}
