import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const userData = localStorage.getItem('user');
  
  // Verifica si el usuario existe y no es 'undefined' o 'null'
  const isAuthenticated = userData && userData !== 'undefined' && userData !== 'null';

  // Si está autenticado, renderiza el contenido de la ruta (usando Outlet).
  // Si no, lo redirige a la página de login.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;