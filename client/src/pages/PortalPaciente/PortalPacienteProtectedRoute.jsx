import React from 'react';
import { Navigate } from 'react-router-dom';
import { PortalPacienteLayout } from './PortalPacienteLayout';

export function PortalPacienteProtectedRoute({ children }) {
  const token = localStorage.getItem('portal_token');
  if (!token) {
    return <Navigate to="/users/login" replace />;
  }
  return <PortalPacienteLayout>{children}</PortalPacienteLayout>;
}
