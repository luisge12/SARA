import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Modulo1_Login/Login';
import Modulo2_GestionAdministrativa from './pages/Modulo2_GestionAdministrativa/Modulo2_GestionAdministrativa';
import Modulo3_RegistroCaja from './pages/Modulo3_RegistroCaja/Modulo3_RegistroCaja';
import Modulo4_DatosClinicos from './pages/Modulo4_DatosClinicos/Modulo4_DatosClinicos';
import Modulo7_GestionMedicaEstadistica from './pages/Modulo7_GestionMedicaEstadistica/Modulo7_GestionMedicaEstadistica';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta del Módulo 1: Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas para los Módulos de SARA */}
        <Route path="/modulo2" element={<Modulo2_GestionAdministrativa />} />
        <Route path="/modulo3" element={<Modulo3_RegistroCaja />} />
        <Route path="/modulo4" element={<Modulo4_DatosClinicos />} />
        <Route path="/modulo7" element={<Modulo7_GestionMedicaEstadistica />} />
        
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

