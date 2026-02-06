import { useState } from 'react';
import PropTypes from 'prop-types';
import './CrearProfesor.css';
import Swal from 'sweetalert2';
import axios from 'axios';

const CrearProfesor = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    celular: '',
    correo: '',
    contraseña: '',
    fecha_nacimiento: '',
    descripcion: '',
    imagen_perfil: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imagen_perfil: file
      }));
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('🚀 Iniciando creación de profesor...');
      console.log('📝 Datos del formulario:', formData);
      console.log('🔑 Contraseña enviada:', formData.contraseña);
      
      // Crear FormData para enviar archivo de imagen
      const formDataToSend = new FormData();
      formDataToSend.append('nombres', formData.nombres || '');
      formDataToSend.append('apellidos', formData.apellidos || '');
      formDataToSend.append('dni', formData.dni || '');
      formDataToSend.append('celular', formData.celular || '');
      formDataToSend.append('correo', formData.correo || '');
      formDataToSend.append('contraseña', formData.contraseña || '');
      formDataToSend.append('fecha_nacimiento', formData.fecha_nacimiento || '');
      formDataToSend.append('descripcion', formData.descripcion || '');
      formDataToSend.append('rol_usuario_id', '3'); // Rol de profesor (ID = 3)
      
      if (formData.imagen_perfil) {
        formDataToSend.append('foto_perfil', formData.imagen_perfil);
        console.log('📷 Archivo de imagen incluido:', formData.imagen_perfil.name);
      }

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
      console.log('🌐 URL:', `${API_URL}/profesores`);
      
      // Mostrar todos los datos que se envían
      console.log('📋 FormData contenido:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`  ${key}:`, value);
      }

      const response = await axios.post(`${API_URL}/profesores`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Respuesta del servidor:', response.data);

      if (response.data.success) {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Profesor creado exitosamente',
          icon: 'success',
          confirmButtonText: 'Ok',
          confirmButtonColor: '#4CAF50'
        });
        
        setCurrentSection('profesores');
      }
    } catch (error) {
      console.error('❌ Error creando profesor:', error);
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
        text: error.response?.data?.message || 'Error al crear el profesor',
        icon: 'error',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#f44336'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="crear-profesor-container">
      <h2>Crear Nuevo Profesor</h2>
      <form onSubmit={handleSubmit} className="crear-profesor-form">
        {/* Datos Personales */}
        <div className="form-section">
          <h3>Datos Personales</h3>
          
          {/* Foto de Perfil */}
          <div className="form-group foto-perfil-group">
            <label>Foto de Perfil:</label>
            <div className="foto-perfil-container">
              <input
                type="file"
                id="foto_perfil"
                name="foto_perfil"
                accept="image/*"
                onChange={handleImageChange}
                className="foto-input"
              />
              <label htmlFor="foto_perfil" className="foto-label">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="foto-preview" />
                ) : (
                  <div className="foto-placeholder">
                    <span>📷</span>
                    <p>Seleccionar foto</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nombres:</label>
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
              <label>Apellidos:</label>
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
              <label>DNI:</label>
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
              <label>Fecha de Nacimiento:</label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Celular:</label>
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
            <div className="form-group">
              <label>Correo:</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="Ingrese correo"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contraseña:</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="contraseña"
                  value={formData.contraseña}
                  onChange={handleChange}
                  placeholder="Ingrese contraseña"
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
            </div>
          </div>

          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Ingrese una descripción del profesor (opcional)"
              rows="4"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Creando...' : '+ Crear Profesor'}
          </button>
        </div>
      </form>
    </div>
  );
};

CrearProfesor.propTypes = {
  setCurrentSection: PropTypes.func.isRequired
};

export default CrearProfesor;