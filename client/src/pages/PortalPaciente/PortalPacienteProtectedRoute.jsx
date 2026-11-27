import React from 'react';
import { Navigate } from 'react-router-dom';
import { PortalPacienteLayout } from './PortalPacienteLayout';

export function PortalPacienteProtectedRoute({ children }) {
  const token = localStorage.getItem('portal_token') || localStorage.getItem('token');
  const userStr = localStorage.getItem('portal_user') || localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/users/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const normalized = user.role?.toLowerCase().replace(/\s+/g, '');
    if (normalized !== 'paciente') {
      return <Navigate to="/dashboard" replace />;
    }
  } catch {
    return <Navigate to="/users/login" replace />;
  }

  return <PortalPacienteLayout>{children}</PortalPacienteLayout>;
}
