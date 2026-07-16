import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import Modulo2_GestionAdministrativa from './pages/Modulo2_GestionAdministrativa/Modulo2_GestionAdministrativa';
import Modulo3_RegistroCaja from './pages/Modulo3_RegistroCaja/Modulo3_RegistroCaja';
import Modulo4_DatosClinicos from './pages/Modulo4_DatosClinicos/Modulo4_DatosClinicos';
import Modulo7_GestionMedicaEstadistica from './pages/Modulo7_GestionMedicaEstadistica/Modulo7_GestionMedicaEstadistica';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta del Módulo 1: Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard de SARA */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Rutas para los Módulos de SARA */}
        <Route path="/modulo2" element={
          <ProtectedRoute allowedGroups={['ADMINISTRADOR', 'RECEPCIONISTA', 'MEDICO']}>
            <Modulo2_GestionAdministrativa />
          </ProtectedRoute>
        } />
        <Route path="/modulo3" element={
          <ProtectedRoute allowedGroups={['RECEPCIONISTA', 'ADMINISTRADOR', 'MASTER']}>
            <Modulo3_RegistroCaja />
          </ProtectedRoute>
        } />
        <Route path="/modulo4" element={
          <ProtectedRoute allowedGroups={['MEDICO', 'RECEPCIONISTA']}>
            <Modulo4_DatosClinicos />
          </ProtectedRoute>
        } />
        <Route path="/modulo7" element={
          <ProtectedRoute allowedGroups={['ADMINISTRADOR']}>
            <Modulo7_GestionMedicaEstadistica />
          </ProtectedRoute>
        } />
        
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
