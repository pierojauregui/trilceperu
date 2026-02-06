import { useState } from 'react';
import PropTypes from 'prop-types';
import './CrearAlumno.css';
import Swal from 'sweetalert2';
import axios from 'axios';

const CrearAlumno = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    celular: '',
    correo: '',
    contraseña: '',
    fecha_nacimiento: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {

      if (formData.contraseña.length > 72) {
        Swal.fire({
          title: 'Error de Validación',
          text: 'La contraseña no puede tener más de 72 caracteres.',
          icon: 'warning',
          confirmButtonText: 'Ok',
          confirmButtonColor: '#f44336'
        });
        setIsLoading(false);
        return;
      }

      if (formData.contraseña.length < 6) {
        Swal.fire({
          title: 'Error de Validación',
          text: 'La contraseña debe tener al menos 6 caracteres.',
          icon: 'warning',
          confirmButtonText: 'Ok',
          confirmButtonColor: '#f44336'
        });
        setIsLoading(false);
        return;
      }
      
      console.log('🚀 Iniciando creación de alumno...');
      console.log('📝 Datos del formulario:', formData);
      
      const token = localStorage.getItem('token');
      console.log('🔐 Token encontrado:', token ? 'Sí' : 'No');
      
      if (!token) {
        console.error('❌ No hay token de sesión');
        Swal.fire({
          title: 'Error',
          text: 'No hay token de sesión. Por favor, inicia sesión nuevamente.',
          icon: 'error',
          confirmButtonText: 'Ok',
          confirmButtonColor: '#f44336'
        });
        return;
      }

      console.log('📤 Enviando datos al servidor...');
      console.log('🌐 URL:', `${API_URL}/users`);
      
      const dataToSend = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        dni: formData.dni,
        celular: formData.celular,
        correo_electronico: formData.correo,
        contraseña: formData.contraseña,
        fecha_nacimiento: formData.fecha_nacimiento,
        rol_usuario_id: 4, 
        nivel: null,
        area: null
      };

      console.log('📋 Datos a enviar:', dataToSend);

      const response = await axios.post(`${API_URL}/users/create`, dataToSend, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Respuesta del servidor:', response.data);

      if (response.data.success) {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Alumno creado exitosamente',
          icon: 'success',
          confirmButtonText: 'Ok',
          confirmButtonColor: '#4CAF50'
        });
        
        setCurrentSection('alumnos');
      }
    } catch (error) {
      console.error('❌ Error creando alumno:', error);
      console.error('📊 Error completo:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      if (error.response) {
        console.error('🔍 Detalles del error del servidor:');
        console.error('  Status:', error.response.status);
        console.error('  Data:', error.response.data);
        console.error('  Headers:', error.response.headers);
      } else if (error.request) {
        console.error('🌐 Error de red - no se recibió respuesta:', error.request);
      } else {
        console.error('⚙️ Error de configuración:', error.message);
      }
      
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Error al crear el alumno',
        icon: 'error',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#f44336'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="crear-alumno-container">
      <div className="crear-alumno-header">
        <h2>Crear Nuevo Alumno</h2>
        <button 
          type="button" 
          className="btn-volver-atras"
          onClick={() => setCurrentSection('alumnos')}
        >
          ← Volver a Alumnos
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="crear-alumno-form">
        {/* Datos Personales */}
        <div className="form-section">
          <h3>Datos Personales</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Nombres: *</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                placeholder="Ingrese nombres"
                required
              />
            </div>
            <div className="form-group">
              <label>Apellidos: *</label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                placeholder="Ingrese apellidos"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>DNI: *</label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                maxLength="8"
                placeholder="Ingrese DNI"
                required
              />
            </div>
            <div className="form-group">
              <label>Celular: *</label>
              <input
                type="text"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                maxLength="9"
                placeholder="Ingrese celular"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha de Nacimiento: *</label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Correo Electrónico: *</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="Ingrese correo electrónico"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contraseña: *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="contraseña"
                  value={formData.contraseña}
                  onChange={handleChange}
                  placeholder="Ingrese contraseña"
                  minLength="6"
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <small className="form-hint">Mínimo 6 caracteres</small>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => setCurrentSection('alumnos')}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Creando...' : '+ Crear Alumno'}
          </button>
        </div>
      </form>
    </div>
  );
};

CrearAlumno.propTypes = {
  setCurrentSection: PropTypes.func.isRequired
};

export default CrearAlumno;