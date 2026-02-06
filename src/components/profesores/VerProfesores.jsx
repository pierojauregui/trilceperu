import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import axios from 'axios';
import './VerProfesores.css';

const VerProfesores = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasMinLength: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password) => {
    const requirements = {
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      hasMinLength: password.length >= 8
    };
    
    setPasswordRequirements(requirements);
    
    // Calcular fortaleza (0-4)
    const strength = Object.values(requirements).filter(Boolean).length;
    setPasswordStrength(strength);
    
    return requirements.hasUpperCase && 
           requirements.hasLowerCase && 
           requirements.hasNumber && 
           requirements.hasSpecialChar &&
           requirements.hasMinLength;
  };

  const handlePasswordChange = (e) => {
    const newPass = e.target.value;
    setNewPassword(newPass);
    validatePassword(newPass);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('selectedUserId');
      const token = localStorage.getItem('token');
      
      if (!userId) {
        Swal.fire({
          title: 'Error',
          text: 'No se ha seleccionado ningún profesor',
          icon: 'error',
          confirmButtonColor: '#4CAF50'
        });
        return;
      }
      
      if (!token) {
        Swal.fire({
          title: 'Error',
          text: 'No hay token de sesión. Por favor, inicia sesión nuevamente.',
          icon: 'error',
          confirmButtonColor: '#4CAF50'
        });
        return;
      }
      
      try {
        const response = await axios.get(`${API_URL}/profesores/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Manejar la estructura de respuesta del backend
        const profesorData = response.data.success ? response.data.data.profesor : response.data;
        
        setUserData(profesorData);

        // Obtener datos del usuario actual del localStorage
        const userDataFromStorage = localStorage.getItem('user');
        const currentUserData = userDataFromStorage && userDataFromStorage !== 'undefined' && userDataFromStorage !== 'null' 
          ? JSON.parse(userDataFromStorage) 
          : null;
        setCurrentUser(currentUserData);
      } catch (error) {
        console.error('Error:', error);
        let errorMessage = 'Error al cargar los datos del profesor';
        
        if (error.response?.status === 401) {
          errorMessage = 'No tienes autorización para ver este profesor';
        } else if (error.response?.status === 404) {
          errorMessage = 'Profesor no encontrado';
        }
        
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#4CAF50'
        });
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setUserData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfileImage(file);
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      
      // Validar contraseña solo si se ha ingresado una nueva y no está vacía
      if (newPassword && newPassword.trim() !== '' && !validatePassword(newPassword)) {
        await Swal.fire({
          title: 'Error',
          text: 'La contraseña no cumple con los requisitos de seguridad',
          icon: 'error',
          confirmButtonColor: '#4CAF50'
        });
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      
      // Agregar solo los campos necesarios
      formData.append('nombres', userData.nombres || '');
      formData.append('apellidos', userData.apellidos || '');
      formData.append('dni', userData.dni || '');
      formData.append('celular', userData.celular || '');
      formData.append('correo', userData.correo_electronico || userData.correo || '');
      formData.append('descripcion', userData.descripcion || '');
      
      // Solo incluir contraseña si se ha ingresado una nueva
      if (newPassword && newPassword.trim() !== '') {
        formData.append('contraseña', newPassword);
      }
      
      // Agregar nueva foto de perfil si se seleccionó una
      if (newProfileImage) {
        formData.append('foto_perfil', newProfileImage);
      }

      console.log('Enviando datos de actualización:', {
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        dni: userData.dni,
        celular: userData.celular,
        correo: userData.correo_electronico || userData.correo,
        hasNewPassword: !!newPassword,
        hasNewPhoto: !!newProfileImage
      });

      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${API_URL}/profesores/${userData.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        }
      );

      console.log('Respuesta del servidor:', response.data);

      await Swal.fire({
        title: '¡Éxito!',
        text: 'Profesor actualizado exitosamente',
        icon: 'success',
        confirmButtonColor: '#4CAF50'
      });
      
      setIsEditing(false);
      setNewPassword('');
      setPreviewImage(null);
      setNewProfileImage(null);
      
      // Recargar los datos del usuario
      const userId = localStorage.getItem('selectedUserId');
      const updatedResponse = await axios.get(`${API_URL}/profesores/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Manejar la estructura de respuesta del backend
      const updatedProfesorData = updatedResponse.data.success ? updatedResponse.data.data.profesor : updatedResponse.data;
      setUserData(updatedProfesorData);
      
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Respuesta del error:', error.response?.data);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Error al actualizar profesor';
      
      await Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#4CAF50'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4CAF50',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          await Swal.fire({
            title: 'Error',
            text: 'No hay token de sesión. Por favor, inicia sesión nuevamente.',
            icon: 'error',
            confirmButtonColor: '#4CAF50'
          });
          return;
        }

        const response = await fetch(`${API_URL}/profesores/${userData.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          await Swal.fire({
            title: '¡Eliminado!',
            text: 'Profesor eliminado exitosamente',
            icon: 'success',
            confirmButtonColor: '#4CAF50'
          });
          setCurrentSection('profesores');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Error al eliminar profesor');
        }
      } catch (error) {
        console.error('Error:', error);
        await Swal.fire({
          title: 'Error',
          text: error.message || 'Error al eliminar profesor',
          icon: 'error',
          confirmButtonColor: '#4CAF50'
        });
      }
    }
  };

  if (!userData) return <div>Cargando...</div>;

  return (
    <div className="ver-profesores-container">
      <div className="header-section">
        <h2>Ver Profesor</h2>
        {!isEditing && (
          <div className="header-buttons">
            <button type="button" className="edit-btn" onClick={() => setIsEditing(true)}>
              <i className="bx bx-edit"></i>
              Editar
            </button>
            {(currentUser?.rol_nombre === 'SuperAdmin' || currentUser?.rol_nombre === 'Admin') && (
              <button type="button" className="delete-btn" onClick={handleDelete}>
                <i className="bx bx-trash"></i>
                Eliminar
              </button>
            )}
          </div>
        )}
      </div>
      <form className="ver-profesores-form">
        <div className="form-row">
          <div className="form-group">
            <label>Nombres:</label>
            <input
              type="text"
              name="nombres"
              value={userData.nombres || ''}
              onChange={handleChange}
              placeholder="Ingrese nombres"
              disabled={!isEditing}
              required
            />
          </div>
          <div className="form-group">
            <label>Apellidos:</label>
            <input
              type="text"
              name="apellidos"
              value={userData.apellidos || ''}
              onChange={handleChange}
              placeholder="Ingrese apellidos"
              disabled={!isEditing}
              required
            />
          </div>
          <div className="form-group">
            <label>DNI:</label>
            <input
              type="text"
              name="dni"
              value={userData.dni || ''}
              onChange={handleChange}
              maxLength="8"
              placeholder="Ingrese DNI"
              disabled={!isEditing}
              required
            />
          </div>
          <div className="form-group">
            <label>Fecha de Nacimiento:</label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={userData.fecha_nacimiento || ''}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Celular:</label>
            <input
              type="text"
              name="celular"
              value={userData.celular || ''}
              onChange={handleChange}
              maxLength="9"
              placeholder="Ingrese celular"
              disabled={!isEditing}
              required
            />
          </div>
          <div className="form-group">
            <label>Correo:</label>
            <input
              type="email"
              name="correo"
              value={userData.correo_electronico || ''}
              onChange={handleChange}
              placeholder="Ingrese correo"
              disabled={!isEditing}
              required
            />
          </div>
        </div>

        {/* Campo de descripción */}
        <div className="form-row">
          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={userData.descripcion || ''}
              onChange={handleChange}
              placeholder="Descripción del profesor"
              disabled={!isEditing}
              rows="4"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                backgroundColor: !isEditing ? '#f9f9f9' : 'white'
              }}
            />
          </div>
        </div>

        {/* Sección de contraseña */}
        {isEditing && (
          <div className="form-row">
            <div className="form-group">
              <label>Nueva Contraseña (opcional):</label>
              <div className="password-input-wrapper" style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Dejar vacío para mantener la actual"
                  disabled={!isEditing}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666',
                    fontSize: '18px'
                  }}
                >
                  <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`}></i>
                </button>
              </div>
              
              {/* Indicador de fortaleza de contraseña */}
              {newPassword && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className={`strength-fill strength-${passwordStrength}`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    ></div>
                  </div>
                  <div className="strength-text">
                    {passwordStrength === 0 && 'Muy débil'}
                    {passwordStrength === 1 && 'Débil'}
                    {passwordStrength === 2 && 'Regular'}
                    {passwordStrength === 3 && 'Buena'}
                    {passwordStrength === 4 && 'Muy fuerte'}
                  </div>
                </div>
              )}
              
              {/* Requisitos de contraseña */}
              {newPassword && (
                <div className="password-requirements">
                  <div className={`requirement ${passwordRequirements.hasMinLength ? 'met' : ''}`}>
                    <i className={`bx ${passwordRequirements.hasMinLength ? 'bx-check' : 'bx-x'}`}></i>
                    Mínimo 8 caracteres
                  </div>
                  <div className={`requirement ${passwordRequirements.hasUpperCase ? 'met' : ''}`}>
                    <i className={`bx ${passwordRequirements.hasUpperCase ? 'bx-check' : 'bx-x'}`}></i>
                    Una letra mayúscula
                  </div>
                  <div className={`requirement ${passwordRequirements.hasLowerCase ? 'met' : ''}`}>
                    <i className={`bx ${passwordRequirements.hasLowerCase ? 'bx-check' : 'bx-x'}`}></i>
                    Una letra minúscula
                  </div>
                  <div className={`requirement ${passwordRequirements.hasNumber ? 'met' : ''}`}>
                    <i className={`bx ${passwordRequirements.hasNumber ? 'bx-check' : 'bx-x'}`}></i>
                    Un número
                  </div>
                  <div className={`requirement ${passwordRequirements.hasSpecialChar ? 'met' : ''}`}>
                    <i className={`bx ${passwordRequirements.hasSpecialChar ? 'bx-check' : 'bx-x'}`}></i>
                    Un carácter especial
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sección de foto de perfil */}
        <div className="form-row photo-section">
          <div className="form-group photo-upload-group">
            <label>Foto de Perfil:</label>
            <div className="photo-upload-container">
              <div className="photo-preview">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="preview-image" />
                ) : userData.imagen_perfil ? (
                  <img 
                    src={`${API_URL.replace('/api', '')}/${userData.imagen_perfil}`} 
                    alt="Foto actual" 
                    className="preview-image" 
                  />
                ) : (
                  <div className="no-photo">
                    <i className="bx bx-user"></i>
                    <span>Sin foto</span>
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="photo-upload-controls">
                  <input
                    type="file"
                    id="imagen_perfil"
                    name="imagen_perfil"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="imagen_perfil" className="file-input-label">
                    <i className="bx bx-upload"></i>
                    Seleccionar foto
                  </label>
                  <small className="file-help-text">
                    Formatos permitidos: JPG, PNG, GIF (máx. 5MB)
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>



        <div className="form-actions">
          {isEditing ? (
            <>
              <button 
                type="button" 
                className="update-btn" 
                onClick={handleUpdate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="bx bx-loader-alt bx-spin"></i>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => {
                  setIsEditing(false);
                  setNewPassword('');
                  setPreviewImage(null);
                  setNewProfileImage(null);
                }}
                disabled={isLoading}
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button type="button" className="back-btn" onClick={() => setCurrentSection('profesores')}>
                Volver
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

VerProfesores.propTypes = {
  setCurrentSection: PropTypes.func.isRequired
};

export default VerProfesores;