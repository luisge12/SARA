import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { SaraAiChat } from '../SaraAiChat';
import { TopBar } from './TopBar';
import LicenseBannerModal from '../License/LicenseBannerModal';

function DashboardLayout({ children }) {
  const navigate = useNavigate();

  // Monitor continuo del tiempo de sesión (expiración estricta de 24 horas)
  useEffect(() => {
    const checkSessionExpiration = () => {
      const expiresAt = localStorage.getItem('session_expires_at');
      if (expiresAt && Date.now() > Number(expiresAt)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('session_expires_at');
        navigate('/login?expired=1', { replace: true });
      }
    };

    // Verificar de inmediato al montar y luego cada 30 segundos
    checkSessionExpiration();
    const interval = setInterval(checkSessionExpiration, 30000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
        <LicenseBannerModal />
        <TopBar />
        <main className="main-content" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
      <SaraAiChat />
    </div>
  );
}

export default DashboardLayout;
