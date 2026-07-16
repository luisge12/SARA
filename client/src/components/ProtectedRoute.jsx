import React from 'react';
import { Navigate } from 'react-router-dom';

export const ROLES = {
  ADMINISTRADOR: ['Master/administrador', 'Administrador', 'Master'],
  MEDICO: ['Director Médico', 'Médico Tratante', 'Médico'],
  RECEPCIONISTA: ['Asistente Administrativo', 'Asistente Medico', 'Recepcionista'],
};

export const hasAccess = (userRole, allowedGroups) => {
  if (!userRole) return false;
  // Master siempre tiene acceso a todo en PWA
  if (userRole === 'Master') return true;
  
  for (const group of allowedGroups) {
    if (ROLES[group] && ROLES[group].includes(userRole)) {
      return true;
    }
  }
  return false;
};

export const ProtectedRoute = ({ children, allowedGroups }) => {
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }
  
  try {
    const user = JSON.parse(userStr);
    
    // Si no se requieren grupos específicos, solo estar logueado basta
    if (!allowedGroups || allowedGroups.length === 0) {
      return children;
    }
    
    if (hasAccess(user.role, allowedGroups)) {
      return children;
    }
    
    // Si no tiene acceso, redirigir al dashboard
    return <Navigate to="/dashboard" replace />;
  } catch (error) {
    console.error("Error parsing user from localStorage", error);
    return <Navigate to="/login" replace />;
  }
};
