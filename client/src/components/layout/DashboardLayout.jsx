import React from 'react';
import { Sidebar } from '../Sidebar';
import { SaraAiChat } from '../SaraAiChat';

function DashboardLayout({ children }) {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {children}
      </main>
      <SaraAiChat />
    </div>
  );
}

export default DashboardLayout;
