import React from 'react';
import { Sidebar } from '../Sidebar';

function DashboardLayout({ children }) {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
