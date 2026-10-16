import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, Sparkles, Key, Check, RefreshCw, X, LogOut } from 'lucide-react';
import licenseService from '../../services/licenseService';

export default function LicenseBannerModal() {
  const [license, setLicense] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [redeemInput, setRedeemInput] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const role = currentUser?.role?.toLowerCase() || '';
  const isAdminOrMaster = ['master', 'administrador', 'master/administrador'].includes(role);

  const checkLicense = async () => {
    try {
      const data = await licenseService.getStatus();
      setLicense(data);
    } catch (e) {
      // Si el servidor falla o no responde, no bloquear innecesariamente
    }
  };

  useEffect(() => {
    checkLicense();

    const handleUpdated = () => checkLicense();
    const handleExpired = () => {
      setLicense(prev => ({ ...(prev || {}), isExpired: true }));
    };

    window.addEventListener('sara_license_updated', handleUpdated);
    window.addEventListener('sara_license_expired', handleExpired);

    return () => {
      window.removeEventListener('sara_license_updated', handleUpdated);
      window.removeEventListener('sara_license_expired', handleExpired);
    };
  }, []);

  const handleQuickRedeem = async (e) => {
    e.preventDefault();
    if (!redeemInput.trim()) return;

    setRedeeming(true);
    setRedeemError(null);
    setRedeemSuccess(null);

    try {
      const res = await licenseService.redeemKey(redeemInput.trim());
      setRedeemSuccess(res.message);
      setRedeemInput('');
      await checkLicense();
      window.dispatchEvent(new Event('sara_license_updated'));
      setTimeout(() => {
        setRedeemSuccess(null);
      }, 3000);
    } catch (err) {
      setRedeemError(err.response?.data?.error || err.message || 'Error al validar la clave.');
    } finally {
      setRedeeming(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!license) return null;

  // 1. CASO BLOQUEANTE: LICENCIA VENCIDA
  if (license.isExpired) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '540px',
          width: '100%',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          textAlign: 'center',
          color: '#0f172a'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <ShieldAlert size={36} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#991b1b' }}>
            Licencia de la Clínica Vencida
          </h2>
          <p style={{ color: '#475569', fontSize: '0.95rem', margin: '0 0 1.5rem', lineHeight: '1.5' }}>
            El período de servicio de <strong>{license.clinicName || 'la clínica'}</strong> ha expirado. 
            Las funciones operativas de consultas, citas y caja se encuentran temporalmente pausadas.
          </p>

          {isAdminOrMaster ? (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'left',
              marginBottom: '1.5rem'
            }}>
              <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#1e293b' }}>
                Reactivar Servicio de la Clínica:
              </span>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem' }}>
                Como Administrador, ingrese su nueva clave de licencia (Mensual o Anual) para reactivar a todos los médicos inmediatamente:
              </p>

              {redeemError && (
                <div style={{ padding: '0.65rem 0.85rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                  {redeemError}
                </div>
              )}

              {redeemSuccess && (
                <div style={{ padding: '0.65rem 0.85rem', background: '#dcfce7', color: '#15803d', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                  {redeemSuccess}
                </div>
              )}

              <form onSubmit={handleQuickRedeem} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input 
                  type="text" 
                  placeholder="SARA-M-XXXX-XXXX-XXXX"
                  value={redeemInput}
                  onChange={(e) => setRedeemInput(e.target.value.toUpperCase())}
                  disabled={redeeming}
                  style={{
                    padding: '0.75rem 1rem',
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    border: '2px solid #cbd5e1',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}
                  required
                />
                <button 
                  type="submit" 
                  disabled={redeeming || !redeemInput.trim()}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#22505d',
                    color: '#ffffff',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {redeeming ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  <span>Canjear y Reactivar Clínica</span>
                </button>
              </form>
            </div>
          ) : (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '1rem',
              color: '#991b1b',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              fontWeight: 500
            }}>
              Por favor comuníquese con el <strong>Administrador o Director Médico</strong> de su centro para reactivar el acceso. Sus datos clínicos históricos están protegidos.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button 
              type="button" 
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.2rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                background: '#ffffff',
                color: '#64748b',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <LogOut size={16} /> Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. CASO PREVENTIVO: VENCE PRONTO (≤ 7 días) Y NO HA SIDO CERRADO
  if (license.isExpiringSoon && !bannerDismissed) {
    return (
      <div style={{
        backgroundColor: '#fffbeb',
        borderBottom: '1px solid #fef3c7',
        color: '#92400e',
        padding: '0.65rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.88rem',
        fontWeight: 600,
        zIndex: 999
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <AlertTriangle size={18} color="#d97706" />
          <span>
            Aviso de Licencia: Quedan <strong>{license.daysRemaining} días</strong> de vigencia en el plan de su clínica.
          </span>
          {isAdminOrMaster && (
            <button 
              onClick={() => navigate('/configuracion')}
              style={{
                background: '#d97706',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.25rem 0.65rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginLeft: '0.5rem'
              }}
            >
              Renovar en Configuración
            </button>
          )}
        </div>
        <button 
          onClick={() => setBannerDismissed(true)}
          style={{ background: 'transparent', border: 'none', color: '#92400e', cursor: 'pointer', padding: '0.2rem' }}
          title="Cerrar aviso"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return null;
}
