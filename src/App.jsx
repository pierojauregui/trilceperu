import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';


import Login from './components/login/Login';
import Public from './components/public/Public';
import MensajesModal from './components/common/MensajesModal';
import SessionModal from './components/modals/SessionModal';
import useInactivityDetector from './hooks/useInactivityDetector';
import './App.css';


const spinnerStyles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;


if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = spinnerStyles;
  document.head.appendChild(styleSheet);
}


const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const CursoPublico = lazy(() => import('./components/public/CursoPublico'));
const Registro = lazy(() => import('./components/registro/Registro'));
const ChangePassword = lazy(() => import('./components/admin/ChangePassword'));
const TerminosCondiciones = lazy(() => import('./components/public/TerminosCondiciones'));
const PoliticaPrivacidad = lazy(() => import('./components/public/PoliticaPrivacidad'));
const LibroReclamaciones = lazy(() => import('./components/public/LibroReclamaciones'));
const TrabajaConNosotros = lazy(() => import('./components/public/TrabajaConNosotros'));
const Contacto = lazy(() => import('./components/public/Contacto'));
const AcercaDeNosotros = lazy(() => import('./components/public/AcercaDeNosotros'));


const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#666'
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <span>Cargando...</span>
    </div>
  </div>
);


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth(); 


  if (loading) {
    return <div>Cargando...</div>; 
  }


  return isAuthenticated ? (
    <>
      {children}
      <MensajesModal />
    </>
  ) : <Navigate to="/login" replace />;
};


const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};


const AppContent = () => {

  useInactivityDetector(30); 

  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Public />} />
          <Route path="/curso/:id" element={<CursoPublico />} />
          <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/libro-reclamaciones" element={<LibroReclamaciones />} />
          <Route path="/trabaja-con-nosotros" element={<TrabajaConNosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/acerca-de-nosotros" element={<AcercaDeNosotros />} />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/registro" 
            element={
              <PublicRoute>
                <Registro />
              </PublicRoute>
            } 
          />
          <Route 
            path="/change-password" 
            element={
              <PublicRoute>
                <ChangePassword />
              </PublicRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      

      <SessionModal />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
