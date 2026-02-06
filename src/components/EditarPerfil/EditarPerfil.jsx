import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import './EditarPerfil.css';

const EditarPerfil = ({ onClose }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(null); // null, true, false
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    celular: '',
    fecha_nacimiento: '',
    correo_electronico: '',
    password: '',
    confirmPassword: '',
    imagen_perfil: null
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        dni: user.dni || '',
        celular: user.celular || '',
        fecha_nacimiento: user.fecha_nacimiento ? user.fecha_nacimiento.split('T')[0] : '',
        correo_electronico: user.correo_electronico || '',
        password: '',
        confirmPassword: '',
        imagen_perfil: null
      });
      
      // Si el usuario tiene imagen de perfil, mostrarla
      if (user.imagen_perfil) {
        // Verificar si la ruta ya incluye el dominio completo
        if (user.imagen_perfil.startsWith('http')) {
          setPreviewImage(user.imagen_perfil);
        } else {
          // Construir la URL completa
          setPreviewImage(`${API_URL.replace('/api', '')}/${user.imagen_perfil}`);
        }
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Por favor selecciona un archivo de imagen válido'
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'La imagen no puede ser mayor a 5MB'
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        imagen_perfil: file
      }));

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombres.trim() || !formData.apellidos.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Los nombres y apellidos son obligatorios'
      });
      return;
    }

    if (formData.dni && formData.dni.length !== 8) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El DNI debe tener 8 dígitos'
      });
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden'
      });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La contraseña debe tener al menos 6 caracteres'
      });
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Agregar datos del formulario - asegurar que no sean vacíos
      formDataToSend.append('nombres', formData.nombres.trim() || '');
      formDataToSend.append('apellidos', formData.apellidos.trim() || '');
      formDataToSend.append('dni', formData.dni.trim() || '');
      formDataToSend.append('celular', formData.celular.trim() || '');
      formDataToSend.append('fecha_nacimiento', formData.fecha_nacimiento || '');
      
      // Solo agregar contraseña si se proporcionó
      if (formData.password && formData.password.trim()) {
        formDataToSend.append('contraseña', formData.password);
        formDataToSend.append('confirmar_contraseña', formData.confirmPassword);
      }
      
      // Agregar imagen si se seleccionó
      if (formData.imagen_perfil) {
        formDataToSend.append('imagen_perfil', formData.imagen_perfil);
      }

      console.log('FormData being sent:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/usuarios/${user.id}/perfil`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      // Si hay errores de validación, mostrarlos detalladamente
      if (data.detail && Array.isArray(data.detail)) {
        console.log('Validation errors:', data.detail);
        const errorMessages = data.detail.map(error => {
          if (error.loc && error.msg) {
            return `${error.loc.join('.')}: ${error.msg}`;
          }
          return error.msg || error;
        }).join('\n');
        console.log('Formatted error messages:', errorMessages);
      }

      if (response.ok && data.success) {
        // Actualizar el contexto de usuario
        await updateUser();
        
        // Actualizar el formulario con los datos actualizados del backend
        if (data.data) {
          const updatedUserData = data.data;
          setFormData({
            nombres: updatedUserData.nombres || '',
            apellidos: updatedUserData.apellidos || '',
            dni: updatedUserData.dni || '',
            celular: updatedUserData.celular || '',
            fecha_nacimiento: updatedUserData.fecha_nacimiento ? updatedUserData.fecha_nacimiento.split('T')[0] : '',
            correo_electronico: updatedUserData.correo_electronico || '',
            password: '',
            confirmPassword: '',
            imagen_perfil: null
          });
          
          // Actualizar imagen de perfil si existe
          if (updatedUserData.imagen_perfil) {
            if (updatedUserData.imagen_perfil.startsWith('http')) {
              setPreviewImage(updatedUserData.imagen_perfil);
            } else {
              setPreviewImage(`${API_URL.replace('/api', '')}/${updatedUserData.imagen_perfil}`);
            }
          }
        }
        
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Perfil actualizado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
        
        // NO cerrar el modal inmediatamente para que el usuario vea los cambios
        // onClose();
        
        // Forzar actualización de la imagen de perfil en toda la aplicación
        window.dispatchEvent(new Event('userProfileUpdated'));
        
        // Opcional: cerrar el modal después de mostrar los cambios por un momento
        setTimeout(() => {
          onClose();
          window.dispatchEvent(new CustomEvent('redirectToHome'));
        }, 2500);
        
      } else {
        // Manejar errores de validación específicos
        if (data.detail && Array.isArray(data.detail)) {
          const errorMessages = data.detail.map(error => {
            if (error.loc && error.msg) {
              return `${error.loc.join('.')}: ${error.msg}`;
            }
            return error.msg || error;
          }).join('\n');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || data.detail || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al actualizar el perfil'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editar-perfil-overlay">
      <div className="editar-perfil-modal">
        <div className="editar-perfil-header">
          <h2>
            <i className='bx bx-user-circle'></i>
            Editar Perfil
          </h2>
          <button className="btn-cerrar" onClick={onClose}>
            <i className='bx bx-x'></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="editar-perfil-form">
          {/* Sección de imagen de perfil */}
          <div className="imagen-perfil-section">
            <div className="imagen-preview">
              {previewImage ? (
                <img src={previewImage} alt="Preview" />
              ) : (
                <div className="imagen-placeholder">
                  <i className='bx bx-user'></i>
                </div>
              )}
            </div>
            <div className="imagen-controls">
              <label htmlFor="imagen_perfil" className="btn-cambiar-imagen">
                <i className='bx bx-camera'></i>
                Cambiar Imagen
              </label>
              <input
                type="file"
                id="imagen_perfil"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Datos personales */}
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombres">
                <i className='bx bx-user'></i>
                Nombres *
              </label>
              <input
                type="text"
                id="nombres"
                name="nombres"
                value={formData.nombres}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="apellidos">
                <i className='bx bx-user'></i>
                Apellidos *
              </label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dni">
                <i className='bx bx-id-card'></i>
                DNI
              </label>
              <input
                type="text"
                id="dni"
                name="dni"
                value={formData.dni}
                onChange={handleInputChange}
                maxLength="8"
                pattern="[0-9]{8}"
              />
            </div>

            <div className="form-group">
              <label htmlFor="celular">
                <i className='bx bx-phone'></i>
                Celular
              </label>
              <input
                type="tel"
                id="celular"
                name="celular"
                value={formData.celular}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fecha_nacimiento">
                <i className='bx bx-calendar'></i>
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="correo_electronico">
                <i className='bx bx-envelope'></i>
                Correo Electrónico
              </label>
              <input
                type="email"
                id="correo_electronico"
                name="correo_electronico"
                value={formData.correo_electronico}
                onChange={handleInputChange}
                readOnly
                title="El correo no se puede modificar"
              />
            </div>
          </div>

          {/* Cambio de contraseña */}
          <div className="password-section">
            <h3>
              <i className='bx bx-lock'></i>
              Cambiar Contraseña (Opcional)
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="password">
                  <i className='bx bx-lock-alt'></i>
                  Nueva Contraseña
                </label>
                <div className="input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    minLength="6"
                    className="form-input password-input"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <i className='bx bx-lock-alt'></i>
                  Confirmar Contraseña
                </label>
                <div className="input-container">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    minLength="6"
                    className="form-input password-input"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
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
          </div>

          {/* Botones */}
          <div className="form-actions-modal">
            <button type="button" className="btn-cancelar" onClick={onClose}>
              <i className='bx bx-x'></i>
              Cancelar
            </button>
            <button type="submit" className="btn-guardar" disabled={loading}>
              {loading ? (
                <>
                  <i className='bx bx-loader-alt bx-spin'></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className='bx bx-save'></i>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPerfil;