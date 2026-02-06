import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { EyeIcon, EyeSlashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Footer from '../public/Footer';
import Navbar from '../shared/Navbar';
import './Login.css';
import '../public/Public.css';

const Login = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cursos, setCursos] = useState([]);
  
  const { login } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Cargar cursos para el navbar
  useEffect(() => {
    const cargarCursos = async () => {
      try {
        const response = await fetch(`${API_URL}/cursos-disponibles`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && (data.cursos || data.data)) {
            setCursos(data.cursos || data.data);
          } else {
            setCursos([]);
          }
        } else {
          setCursos([]);
        }
      } catch (error) {
        console.error('Error conectando con la API:', error);
        setCursos([]);
      }
    };
    
    cargarCursos();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Redirigir al dashboard después de login exitoso
      navigate('/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className={`login-page-container ${isDarkMode ? 'login-dark' : ''}`}>
      {/* Header/Navbar */}
      <Navbar showSearch={true} cursos={cursos} />

      {/* Main Content */}
      <main className="login-page-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="login-page-card login-fade-in"
        >
        {/* Header */}
        <div className="login-page-header">
        
            <img src="/images/trilce_peru.png" alt="Logo Trilce Perú" style={{width: '280px', height: '100px'}} />
       
          
          <p className="login-page-subtitle">
            Inicia sesión para acceder al panel
          </p>
        </div>

     

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-page-form">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="login-error-message login-slide-up"
            >
              <ExclamationTriangleIcon />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="login-form-group">
            <label className="login-form-label">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="login-email-input"
              placeholder="admin@plataforma.com"
            />
          </div>

          <div className="login-form-group">
            <label className="login-form-label">
              Contraseña
            </label>
            <div className="login-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="login-password-field"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-password-toggle"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="login-page-button"
          >
            <div className="login-page-button-content">
              {loading ? (
                <>
                  <div className="login-loading-spinner"></div>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </div>
          </motion.button>
        </form>

        {/* Additional Links */}
        <div style={{textAlign: 'center', marginTop: '1rem'}}>
          <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem'}}>
            ¿No tienes una cuenta?{' '}
            <button 
              type="button"
              onClick={() => navigate('/registro')}
              style={{
                background: 'none',
                border: 'none',
                color: '#4f46e5',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Regístrate
            </button>
          </p>
          <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
            <button 
              type="button"
              onClick={() => {/* TODO: Implementar recuperación de contraseña */}}
              style={{
                background: 'none',
                border: 'none',
                color: '#4f46e5',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </p>
        </div>
      </motion.div>
    </main>

    {/* Footer */}
    <Footer />
  </div>
  );
};

export default Login;