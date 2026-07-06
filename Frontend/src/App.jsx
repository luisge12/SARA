import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

// Mock empty components for routing to prevent errors
const Patients = () => <div style={{padding: '2rem'}}><h2>Patients Module</h2><p>Under construction based on design system.</p></div>;
const Appointments = () => <div style={{padding: '2rem'}}><h2>Appointments Module</h2><p>Under construction based on design system.</p></div>;
const CashFlow = () => <div style={{padding: '2rem'}}><h2>Módulo de Flujo de Caja</h2><p>Aquí se gestionarán los ingresos y egresos de la clínica.</p></div>;
const Settings = () => <div style={{padding: '2rem'}}><h2>Settings Module</h2><p>Under construction based on design system.</p></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Protected Routes Wrapper */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/cashflow" element={<CashFlow />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
