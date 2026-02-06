import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Swal from 'sweetalert2';
import './CrearAdministrador.css';

const API_URL = import.meta.env.VITE_API_URL;

const CrearAdministrador = ({ setCurrentSection, modo = 'crear' }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(modo === 'editar');
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    celular: '',
    correo_electronico: '',
    password: '',
    confirmar_password: '',
    fecha_nacimiento: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (modo === 'editar') {
      const adminId = localStorage.getItem('selectedAdminId');
      if (adminId) {
        fetchAdminData(adminId);
      }
    }
  }, [modo]);

  const fetchAdminData = async (id) => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/administradores/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const admin = response.data.data || response.data;
      setFormData({
        nombres: admin.nombres || '',
        apellidos: admin.apellidos || '',
        dni: admin.dni || '',
        celular: admin.celular || '',
        correo_electronico: admin.correo_electronico || '',
        password: '',
        confirmar_password: '',
        fecha_nacimiento: admin.fecha_nacimiento ? admin.fecha_nacimiento.split('T')[0] : ''
      });
    } catch (err) {
      console.error('Error al cargar datos del administrador:', err);
      Swal.fire('Error', 'No se pudieron cargar los datos del administrador', 'error');
      setCurrentSection('administradores');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    }

    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es requerido';
    } else if (!/^\d{8}$/.test(formData.dni)) {
      newErrors.dni = 'El DNI debe tener 8 dígitos';
    }

    if (!formData.correo_electronico.trim()) {
      newErrors.correo_electronico = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo_electronico)) {
      newErrors.correo_electronico = 'El correo no es válido';
    }

    if (modo === 'crear') {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (formData.password !== formData.confirmar_password) {
        newErrors.confirmar_password = 'Las contraseñas no coinciden';
      }
    } else {
      // En modo editar, si se ingresa contraseña, validar
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      if (formData.password && formData.password !== formData.confirmar_password) {
        newErrors.confirmar_password = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const dataToSend = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        dni: formData.dni,
        celular: formData.celular,
        correo_electronico: formData.correo_electronico,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        rol_usuario_id: 2 // Rol de Admin
      };

      if (formData.password) {
        dataToSend.password = formData.password;
      }

      if (modo === 'crear') {
        await axios.post(`${API_URL}/administradores`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        Swal.fire({
          icon: 'success',
          title: '¡Administrador creado!',
          text: 'El administrador ha sido registrado exitosamente.',
          confirmButtonColor: '#3498db'
        });
      } else {
        const adminId = localStorage.getItem('selectedAdminId');
        await axios.put(`${API_URL}/administradores/${adminId}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        Swal.fire({
          icon: 'success',
          title: '¡Administrador actualizado!',
          text: 'Los datos del administrador han sido actualizados.',
          confirmButtonColor: '#3498db'
        });
      }

      setCurrentSection('administradores');

    } catch (err) {
      console.error('Error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.detail || 'No se pudo guardar el administrador'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="loading-state">Cargando datos del administrador...</div>;
  }

  return (
    <div className="crear-admin-container">
      <div className="crear-admin-header">
        <button 
          className="btn-volver"
          onClick={() => setCurrentSection('administradores')}
        >
          <i className='bx bx-arrow-back'></i>
        
        </button>
        <h1>
          <i className='bx bx-shield-quarter'></i>
          {modo === 'crear' ? 'Crear Nuevo Administrador' : 'Editar Administrador'}
        </h1>
      </div>

      <div className="info-box">
        <i className='bx bx-info-circle'></i>
        <div>
          <strong>Permisos del Administrador:</strong>
          <ul>
            <li>✅ Gestionar Categorías</li>
            <li>✅ Gestionar Cursos</li>
            <li>✅ Gestionar Profesores</li>
            <li>✅ Gestionar Asignaciones</li>
            <li>✅ Gestionar Alumnos</li>
            <li>❌ <strong>Sin acceso a Pagos</strong></li>
            <li>❌ <strong>Sin acceso a Reportes</strong></li>
            <li>❌ <strong>Sin acceso a Configuraciones</strong></li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="crear-admin-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="nombres">
              Nombres <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nombres"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              placeholder="Ingrese los nombres"
              className={errors.nombres ? 'error' : ''}
            />
            {errors.nombres && <span className="error-text">{errors.nombres}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="apellidos">
              Apellidos <span className="required">*</span>
            </label>
            <input
              type="text"
              id="apellidos"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              placeholder="Ingrese los apellidos"
              className={errors.apellidos ? 'error' : ''}
            />
            {errors.apellidos && <span className="error-text">{errors.apellidos}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="dni">
              DNI <span className="required">*</span>
            </label>
            <input
              type="text"
              id="dni"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              placeholder="Ingrese el DNI (8 dígitos)"
              maxLength={8}
              className={errors.dni ? 'error' : ''}
            />
            {errors.dni && <span className="error-text">{errors.dni}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="celular">Celular</label>
            <input
              type="text"
              id="celular"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              placeholder="Ingrese el celular"
              maxLength={9}
            />
          </div>

          <div className="form-group">
            <label htmlFor="correo_electronico">
              Correo Electrónico <span className="required">*</span>
            </label>
            <input
              type="email"
              id="correo_electronico"
              name="correo_electronico"
              value={formData.correo_electronico}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              className={errors.correo_electronico ? 'error' : ''}
            />
            {errors.correo_electronico && <span className="error-text">{errors.correo_electronico}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
            <input
              type="date"
              id="fecha_nacimiento"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Contraseña {modo === 'crear' && <span className="required">*</span>}
              {modo === 'editar' && <span className="optional">(dejar vacío para no cambiar)</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={modo === 'crear' ? 'Mínimo 6 caracteres' : 'Nueva contraseña (opcional)'}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmar_password">
              Confirmar Contraseña {modo === 'crear' && <span className="required">*</span>}
            </label>
            <input
              type="password"
              id="confirmar_password"
              name="confirmar_password"
              value={formData.confirmar_password}
              onChange={handleChange}
              placeholder="Repita la contraseña"
              className={errors.confirmar_password ? 'error' : ''}
            />
            {errors.confirmar_password && <span className="error-text">{errors.confirmar_password}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancelar"
            onClick={() => setCurrentSection('administradores')}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-guardar"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className='bx bx-loader-alt bx-spin'></i>
                Guardando...
              </>
            ) : (
              <>
                <i className='bx bx-save'></i>
                {modo === 'crear' ? 'Crear Administrador' : 'Guardar Cambios'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

CrearAdministrador.propTypes = {
  setCurrentSection: PropTypes.func.isRequired,
  modo: PropTypes.oneOf(['crear', 'editar'])
};

export default CrearAdministrador;
