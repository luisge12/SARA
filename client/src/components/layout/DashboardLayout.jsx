import React from 'react';
import { Sidebar } from '../Sidebar';
import { SaraAiChat } from '../SaraAiChat';
import { TopBar } from './TopBar';

function DashboardLayout({ children }) {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
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
