import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import Modulo_CitasMedicas from './pages/Modulo_CitasMedicas/Modulo_CitasMedicas';
import Configuracion from './pages/Configuracion/Configuracion';
import Modulo3_RegistroCaja from './pages/Modulo3_RegistroCaja/Modulo3_RegistroCaja';
import Modulo4_DatosClinicos from './pages/Modulo4_DatosClinicos/Modulo4_DatosClinicos';
import Modulo6_EstudiosProcedimientos from './pages/Modulo6_EstudiosProcedimientos/Modulo6_EstudiosProcedimientos';
import Modulo7_GestionMedicaEstadistica from './pages/Modulo7_GestionMedicaEstadistica/Modulo7_GestionMedicaEstadistica';
import Modulo_Pacientes from './pages/Modulo_Pacientes/Modulo_Pacientes';
import PerfilPaciente from './pages/Modulo_Pacientes/PerfilPaciente';
import { ProtectedRoute } from './components/ProtectedRoute';

// Portal de Pacientes
import { PortalPacienteLogin } from './pages/PortalPaciente/PortalPacienteLogin';
import { PortalPacienteDashboard } from './pages/PortalPaciente/PortalPacienteDashboard';
import { PortalPacienteHistoriaMedica } from './pages/PortalPaciente/PortalPacienteHistoriaMedica';
import { PortalPacienteProtectedRoute } from './pages/PortalPaciente/PortalPacienteProtectedRoute';

function PortalPacienteIndex() {
  const token = localStorage.getItem('portal_token');
  if (!token) {
    return <Navigate to="/users/login" replace />;
  }
  return <Navigate to="/users/dashboard" replace />;
}

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
        <Route path="/pacientes" element={
          <ProtectedRoute allowedGroups={['ADMINISTRADOR', 'RECEPCIONISTA', 'MEDICO', 'MASTER']}>
            <Modulo_Pacientes />
          </ProtectedRoute>
        } />
        <Route path="/pacientes/:id" element={
          <ProtectedRoute allowedGroups={['ADMINISTRADOR', 'RECEPCIONISTA', 'MEDICO', 'MASTER']}>
            <PerfilPaciente />
          </ProtectedRoute>
        } />
        <Route path="/citas" element={
          <ProtectedRoute allowedGroups={['ADMINISTRADOR', 'RECEPCIONISTA', 'MEDICO', 'MASTER']}>
            <Modulo_CitasMedicas />
          </ProtectedRoute>
        } />
        <Route path="/configuracion" element={
          <ProtectedRoute allowedGroups={['ADMINISTRADOR', 'RECEPCIONISTA', 'MEDICO', 'MASTER']}>
            <Configuracion />
          </ProtectedRoute>
        } />
        <Route path="/modulo3" element={
          <ProtectedRoute allowedGroups={['RECEPCIONISTA', 'ADMINISTRADOR', 'MASTER']}>
            <Modulo3_RegistroCaja />
          </ProtectedRoute>
        } />
        <Route path="/modulo4" element={
          <ProtectedRoute allowedGroups={['MEDICO', 'RECEPCIONISTA', 'MASTER']}>
            <Modulo4_DatosClinicos />
          </ProtectedRoute>
        } />
        <Route path="/modulo6" element={
          <ProtectedRoute allowedGroups={['MEDICO', 'RECEPCIONISTA', 'ADMINISTRADOR', 'MASTER']}>
            <Modulo6_EstudiosProcedimientos />
          </ProtectedRoute>
        } />
        <Route path="/modulo7" element={
          <ProtectedRoute allowedGroups={['ADMINISTRADOR', 'MASTER']}>
            <Modulo7_GestionMedicaEstadistica />
          </ProtectedRoute>
        } />

        {/* Rutas del Portal del Paciente */}
        <Route path="/users" element={<PortalPacienteIndex />} />
        <Route path="/users/login" element={<PortalPacienteLogin />} />
        <Route path="/users/dashboard" element={
          <PortalPacienteProtectedRoute>
            <PortalPacienteDashboard />
          </PortalPacienteProtectedRoute>
        } />
        <Route path="/users/historia-medica" element={
          <PortalPacienteProtectedRoute>
            <PortalPacienteHistoriaMedica />
          </PortalPacienteProtectedRoute>
        } />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
