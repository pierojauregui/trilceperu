import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import './SuperAdminSetup.css';

const SuperAdminSetup = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [isLoading, setIsLoading] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm();

  const password = watch('contrasena');

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Preparar datos para enviar al backend
      const superAdminData = {
        nombres: data.nombres,
        apellidos: data.apellidos,
        correo_electronico: data.correo_electronico,
        dni: data.dni,
        celular: data.celular,
        contrasena: data.contrasena,
        rol_usuario_id: 1 // SuperAdmin
      };

      // Llamada al backend para crear el superadmin
      const response = await axios.post(`${API_URL}/setup/superadmin`, superAdminData);
      
      if (response.data.success) {
        toast.success('¡SuperAdmin creado exitosamente!');
        setIsSetupComplete(true);
        reset();
      } else {
        toast.error(response.data.message || 'Error al crear el SuperAdmin');
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error de conexión. Verifica que el backend esté funcionando.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSetupComplete) {
    return (
      <div className="setup-container">
        <div className="setup-card success-card">
          <div className="success-icon">✅</div>
          <h2>¡Configuración Completada!</h2>
          <p>El SuperAdmin ha sido creado exitosamente.</p>
          <p>Ya puedes acceder al panel de administración.</p>
          <button 
            className="btn-primary"
            onClick={() => window.location.href = '/login'}
          >
            Ir al Login
          </button>
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-header">
          <h1>CursosPeru.com</h1>
          <h2>Configuración Inicial</h2>
          <p>Crea el usuario SuperAdmin para comenzar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="setup-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombres">Nombres *</label>
              <input
                type="text"
                id="nombres"
                {...register('nombres', {
                  required: 'Los nombres son obligatorios',
                  minLength: {
                    value: 2,
                    message: 'Los nombres deben tener al menos 2 caracteres'
                  }
                })}
                className={errors.nombres ? 'error' : ''}
                placeholder="Ingresa tus nombres"
              />
              {errors.nombres && <span className="error-message">{errors.nombres.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="apellidos">Apellidos *</label>
              <input
                type="text"
                id="apellidos"
                {...register('apellidos', {
                  required: 'Los apellidos son obligatorios',
                  minLength: {
                    value: 2,
                    message: 'Los apellidos deben tener al menos 2 caracteres'
                  }
                })}
                className={errors.apellidos ? 'error' : ''}
                placeholder="Ingresa tus apellidos"
              />
              {errors.apellidos && <span className="error-message">{errors.apellidos.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="correo_electronico">Correo Electrónico *</label>
            <input
              type="email"
              id="correo_electronico"
              {...register('correo_electronico', {
                required: 'El correo electrónico es obligatorio',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Ingresa un correo electrónico válido'
                }
              })}
              className={errors.correo_electronico ? 'error' : ''}
              placeholder="admin@cursosperu.com"
            />
            {errors.correo_electronico && <span className="error-message">{errors.correo_electronico.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dni">DNI *</label>
              <input
                type="text"
                id="dni"
                {...register('dni', {
                  required: 'El DNI es obligatorio',
                  pattern: {
                    value: /^[0-9]{8}$/,
                    message: 'El DNI debe tener 8 dígitos'
                  }
                })}
                className={errors.dni ? 'error' : ''}
                placeholder="12345678"
                maxLength="8"
              />
              {errors.dni && <span className="error-message">{errors.dni.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="celular">Celular</label>
              <input
                type="text"
                id="celular"
                {...register('celular', {
                  pattern: {
                    value: /^[0-9]{9}$/,
                    message: 'El celular debe tener 9 dígitos'
                  }
                })}
                className={errors.celular ? 'error' : ''}
                placeholder="987654321"
                maxLength="9"
              />
              {errors.celular && <span className="error-message">{errors.celular.message}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contrasena">Contraseña *</label>
              <input
                type="password"
                id="contrasena"
                {...register('contrasena', {
                  required: 'La contraseña es obligatoria',
                  minLength: {
                    value: 8,
                    message: 'La contraseña debe tener al menos 8 caracteres'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial'
                  }
                })}
                className={errors.contrasena ? 'error' : ''}
                placeholder="Contraseña segura"
              />
              {errors.contrasena && <span className="error-message">{errors.contrasena.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmar_contrasena">Confirmar Contraseña *</label>
              <input
                type="password"
                id="confirmar_contrasena"
                {...register('confirmar_contrasena', {
                  required: 'Confirma tu contraseña',
                  validate: value => value === password || 'Las contraseñas no coinciden'
                })}
                className={errors.confirmar_contrasena ? 'error' : ''}
                placeholder="Confirma tu contraseña"
              />
              {errors.confirmar_contrasena && <span className="error-message">{errors.confirmar_contrasena.message}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creando SuperAdmin...' : 'Crear SuperAdmin'}
            </button>
          </div>
        </form>

        <div className="setup-info">
          <h3>Información Importante:</h3>
          <ul>
            <li>Este usuario tendrá acceso completo al sistema</li>
            <li>Podrá crear otros administradores y profesores</li>
            <li>Gestionar todos los cursos y configuraciones</li>
            <li>Acceder a reportes y estadísticas completas</li>
          </ul>
        </div>
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
};

export default SuperAdminSetup;