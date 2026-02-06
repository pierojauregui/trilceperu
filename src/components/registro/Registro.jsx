import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import * as authService from '../../services/auth';
import Footer from '../public/Footer';
import Navbar from '../shared/Navbar';
import './Registro.css';
import '../public/Public.css';

const Registro = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    dni: '',
    celular: '',
    nivel: '',
    area: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [cursos, setCursos] = useState([]);
  const [cursosNavbar, setCursosNavbar] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(null);
  const navigate = useNavigate();

  // Cargar cursos disponibles para el select de área
  useEffect(() => {
    // Cargar cursos para el navbar
    const cargarCursosNavbar = async () => {
      try {
        const response = await fetch(`${API_URL}/cursos-disponibles`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && (data.cursos || data.data)) {
            setCursosNavbar(data.cursos || data.data);
          } else {
            setCursosNavbar([]);
          }
        } else {
          setCursosNavbar([]);
        }
      } catch (error) {
        console.error('Error conectando con la API:', error);
        setCursosNavbar([]);
      }
    };

    // Aquí cargarías los cursos desde la API
    const cursosEjemplo = [
      { id: 1, nombre: 'Matemáticas', nivel: 'Primaria' },
      { id: 2, nombre: 'Comunicación', nivel: 'Primaria' },
      { id: 3, nombre: 'Ciencias', nivel: 'Primaria' },
      { id: 4, nombre: 'Álgebra', nivel: 'Secundaria' },
      { id: 5, nombre: 'Geometría', nivel: 'Secundaria' },
      { id: 6, nombre: 'Literatura', nivel: 'Secundaria' },
      { id: 7, nombre: 'Química', nivel: 'Secundaria' },
      { id: 8, nombre: 'Física', nivel: 'Secundaria' },
      { id: 9, nombre: 'Psicomotricidad', nivel: 'Inicial' },
      { id: 10, nombre: 'Desarrollo del Lenguaje', nivel: 'Inicial' }
    ];
    setCursos(cursosEjemplo);
    cargarCursosNavbar();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validaciones específicas
    if (name === 'dni' && value.length > 8) return;
    if (name === 'celular' && value.length > 9) return;
    if (name === 'dni' && !/^\d*$/.test(value)) return;
    if (name === 'celular' && !/^\d*$/.test(value)) return;
    
    const newFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(newFormData);
    
    // Validar contraseñas en tiempo real
    if (name === 'password' || name === 'confirmPassword') {
      const password = name === 'password' ? value : newFormData.password;
      const confirmPassword = name === 'confirmPassword' ? value : newFormData.confirmPassword;
      
      if (password && confirmPassword) {
        setPasswordsMatch(password === confirmPassword);
      } else if (!password && !confirmPassword) {
        setPasswordsMatch(null);
      } else {
        setPasswordsMatch(false);
      }
    }
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombres.trim()) newErrors.nombres = 'Los nombres son obligatorios';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Los apellidos son obligatorios';
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }
    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (formData.dni.length !== 8) {
      newErrors.dni = 'El DNI debe tener exactamente 8 dígitos';
    }
    if (!formData.celular.trim()) {
      newErrors.celular = 'El número de celular es obligatorio';
    } else if (formData.celular.length !== 9) {
      newErrors.celular = 'El celular debe tener exactamente 9 dígitos';
    }
    if (!formData.nivel) newErrors.nivel = 'Debe seleccionar un nivel educativo';
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      console.log('Datos del registro:', formData);
      
      // Llamada real al backend
      const response = await authService.register(formData);
      
      console.log('Registro exitoso:', response);
      
      // Redirigir al login después del registro exitoso
      navigate('/login', { 
        state: { 
          message: 'Registro exitoso. Por favor, inicia sesión con tus credenciales.' 
        }
      });
    } catch (error) {
      console.error('Error en el registro:', error);
      const errorMessage = error.response?.data?.detail || 'Error al registrar usuario. Inténtalo de nuevo.';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPublic = () => {
    navigate('/');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  // Filtrar cursos según el nivel seleccionado
  const cursosFiltrados = formData.nivel 
    ? cursos.filter(curso => curso.nivel === formData.nivel)
    : [];

  return (
    <div className="registro-container">
      {/* Header/Navbar */}
      <Navbar showSearch={true} cursos={cursosNavbar} />

      {/* Main Content */}
      <main className="registro-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="registro-card fade-in"
        >
          {/* Header */}
          <div className="registro-header">
            <img src="/images/trilce_peru.png" alt="Logo Trilce Perú" style={{width: '280px', height: '100px'}} />
            <h1>Crear Cuenta</h1>
            <p>Únete a nuestra plataforma educativa</p>
          </div>
        
        <form onSubmit={handleSubmit} className="registro-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}
          
          <div className="form-row-registro">
            <div className="form-group">
              <label htmlFor="nombres">Nombres *</label>
              <input
                type="text"
                id="nombres"
                name="nombres"
                value={formData.nombres}
                onChange={handleInputChange}
                className={errors.nombres ? 'error' : ''}
                placeholder="Ingresa tus nombres"
              />
              {errors.nombres && <span className="error-text">{errors.nombres}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="apellidos">Apellidos *</label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                className={errors.apellidos ? 'error' : ''}
                placeholder="Ingresa tus apellidos"
              />
              {errors.apellidos && <span className="error-text">{errors.apellidos}</span>}
            </div>
          </div>
          
       
          
          <div className="form-row-registro">
            <div className="form-group">
              <label htmlFor="dni">DNI *</label>
              <input
                type="text"
                id="dni"
                name="dni"
                value={formData.dni}
                onChange={handleInputChange}
                className={errors.dni ? 'error' : ''}
                placeholder="12345678"
                maxLength="8"
              />
              {errors.dni && <span className="error-text">{errors.dni}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="celular">Celular *</label>
              <input
                type="text"
                id="celular"
                name="celular"
                value={formData.celular}
                onChange={handleInputChange}
                className={errors.celular ? 'error' : ''}
                placeholder="987654321"
                maxLength="9"
              />
              {errors.celular && <span className="error-text">{errors.celular}</span>}
            </div>
          </div>
          
          <div className="form-row-registro">
            <div className="form-group">
              <label htmlFor="nivel">Nivel Educativo *</label>
              <select
                id="nivel"
                name="nivel"
                value={formData.nivel}
                onChange={handleInputChange}
                className={errors.nivel ? 'error' : ''}
              >
                <option value="">Selecciona un nivel</option>
                <option value="Inicial">Inicial</option>
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
              </select>
              {errors.nivel && <span className="error-text">{errors.nivel}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="area">Área de Interés (Opcional)</label>
              <select
                id="area"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                disabled={!formData.nivel}
              >
                <option value="">Selecciona un área</option>
                {cursosFiltrados.map(curso => (
                  <option key={curso.id} value={curso.nombre}>
                    {curso.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
             <div className="form-group">
            <label htmlFor="email">Correo Electrónico *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="ejemplo@correo.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="form-row-registro">
            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <div className="registro-password-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`registro-password-input ${errors.password ? 'error' : ''}`}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  className="registro-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
              <div className="registro-password-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`registro-password-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Repite tu contraseña"
                />
                <button
                  type="button"
                  className="registro-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>
          
          {/* Barra de validación de contraseñas */}
          {(formData.password || formData.confirmPassword) && (
            <div className="password-validation">
              <div className={`validation-bar ${passwordsMatch === true ? 'match' : passwordsMatch === false ? 'no-match' : 'empty'}`}>
                <div className="validation-indicator"></div>
              </div>
              <div className="validation-text">
                {passwordsMatch === true && (
                  <span className="match-text">
                    <i className='bx bx-check-circle'></i>
                    Las contraseñas coinciden
                  </span>
                )}
                {passwordsMatch === false && (
                  <span className="no-match-text">
                    <i className='bx bx-x-circle'></i>
                    Las contraseñas no coinciden
                  </span>
                )}
              </div>
            </div>
          )}



          
          <button 
            type="submit" 
            className="btn-register-submit"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>
        
        <div className="registro-footer">
          <p>¿Ya tienes una cuenta? 
            <button 
              type="button" 
              className="link-button"
              onClick={handleGoToLogin}
            >
              Inicia Sesión
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

export default Registro;