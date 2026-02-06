import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './MensajesPersonalizados.css';

const API_URL = import.meta.env.VITE_API_URL;

const MensajesPersonalizados = () => {
  const [mensajes, setMensajes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mensajeEditando, setMensajeEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewModal, setPreviewModal] = useState(null);

  const [formulario, setFormulario] = useState({
    titulo: '',
    contenido: '',
    tipo_contenido: 'texto',
    imagen_url: '',
    dirigido_a: 'todos',
    activo: true,
    fecha_inicio: '',
    fecha_fin: '',
    mostrar_una_vez: false
  });

  const [imagenPreview, setImagenPreview] = useState('');
  const [imagenError, setImagenError] = useState('');
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [archivoImagen, setArchivoImagen] = useState(null);

  useEffect(() => {
    cargarMensajes();
  }, []);

  const cargarMensajes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/mensajes-personalizados`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMensajes(data);
      }
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let datosFormulario = { ...formulario };

      // Si hay un archivo de imagen, subirlo primero
      if (archivoImagen) {
        const urlImagen = await subirImagen();
        if (urlImagen) {
          datosFormulario.imagen_url = urlImagen;
        } else {
          setLoading(false);
          return; // Error al subir imagen, no continuar
        }
      }

      const url = mensajeEditando 
        ? `${API_URL}/mensajes-personalizados/${mensajeEditando.id}`
        : `${API_URL}/mensajes-personalizados`;
      
      const method = mensajeEditando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(datosFormulario)
      });

      if (response.ok) {
        await cargarMensajes();
        resetFormulario();
        setMostrarFormulario(false);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: mensajeEditando ? 'Mensaje actualizado exitosamente' : 'Mensaje creado exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al guardar el mensaje'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar el mensaje'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este mensaje?')) return;

    try {
      const response = await fetch(`${API_URL}/mensajes-personalizados/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await cargarMensajes();
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Mensaje eliminado exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al eliminar el mensaje'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al eliminar el mensaje'
      });
    }
  };

  const handleEditar = (mensaje) => {
    setMensajeEditando(mensaje);
    setFormulario({
      titulo: mensaje.titulo || '',
      contenido: mensaje.contenido || '',
      tipo_contenido: mensaje.tipo_contenido || 'texto',
      imagen_url: mensaje.imagen_url || '',
      dirigido_a: mensaje.dirigido_a || 'todos',
      activo: mensaje.activo !== undefined ? mensaje.activo : true,
      fecha_inicio: mensaje.fecha_inicio ? mensaje.fecha_inicio.split('T')[0] : '',
      fecha_fin: mensaje.fecha_fin ? mensaje.fecha_fin.split('T')[0] : '',
      mostrar_una_vez: mensaje.mostrar_una_vez !== undefined ? mensaje.mostrar_una_vez : false
    });
    
    // Cargar vista previa si hay imagen
    if (mensaje.imagen_url) {
      validarImagen(mensaje.imagen_url);
    }
    
    setMostrarFormulario(true);
  };

  const resetFormulario = () => {
    setFormulario({
      titulo: '',
      contenido: '',
      tipo_contenido: 'texto',
      imagen_url: '',
      dirigido_a: 'todos',
      activo: true,
      fecha_inicio: '',
      fecha_fin: '',
      mostrar_una_vez: false
    });
    setMensajeEditando(null);
    setImagenPreview('');
    setImagenError('');
    setArchivoImagen(null);
    setSubiendoImagen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Si cambia el tipo de contenido, limpiar campos de imagen
    if (name === 'tipo_contenido') {
      if (value === 'texto') {
        setFormulario(prev => ({ ...prev, imagen_url: '' }));
        setArchivoImagen(null);
        setImagenPreview('');
        setImagenError('');
      }
    }

    // Manejar vista previa de imagen
    if (name === 'imagen_url' && value) {
      validarImagen(value);
    } else if (name === 'imagen_url' && !value) {
      setImagenPreview('');
      setImagenError('');
    }
  };

  const validarImagen = (url) => {
    setImagenError('');
    setImagenPreview('');
    
    if (!url) return;

    const img = new Image();
    img.onload = () => {
      setImagenPreview(url);
      setImagenError('');
    };
    img.onerror = () => {
      setImagenPreview('');
      setImagenError('No se pudo cargar la imagen. Verifica que la URL sea válida.');
    };
    img.src = url;
  };

  const handleArchivoImagen = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    // Validar tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!tiposPermitidos.includes(archivo.type)) {
      setImagenError('Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF, WEBP');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (archivo.size > 5 * 1024 * 1024) {
      setImagenError('El archivo es demasiado grande. Tamaño máximo: 5MB');
      return;
    }

    setArchivoImagen(archivo);
    setImagenError('');
    
    // Mostrar vista previa local
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagenPreview(e.target.result);
    };
    reader.readAsDataURL(archivo);
  };

  const subirImagen = async () => {
    if (!archivoImagen) return null;

    setSubiendoImagen(true);
    const formData = new FormData();
    formData.append('file', archivoImagen);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/upload/message-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al subir imagen');
      }

      const data = await response.json();
      return `${API_URL.replace('/api', '')}${data.url}`;
    } catch (error) {
      setImagenError(`Error al subir imagen: ${error.message}`);
      return null;
    } finally {
      setSubiendoImagen(false);
    }
  };

  const mostrarPreview = (mensaje) => {
    setPreviewModal(mensaje);
  };

  const getDirigidoAText = (dirigido_a) => {
    switch (dirigido_a) {
      case 'todos': return 'Todos los usuarios';
      case 'profesores': return 'Solo profesores';
      case 'alumnos': return 'Solo alumnos';
      default: return dirigido_a;
    }
  };

  return (
    <div className="mensajes-personalizados">
      <div className="mensajes-header">
        <h2>Mensajes Personalizados</h2>
        <button 
          className="btn-nuevo"
          onClick={() => setMostrarFormulario(true)}
        >
          <i className="fas fa-plus"></i>
          Nuevo Mensaje
        </button>
      </div>

      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{mensajeEditando ? 'Editar Mensaje' : 'Nuevo Mensaje'}</h3>
              <button 
                className="btn-close"
                onClick={() => {
                  setMostrarFormulario(false);
                  resetFormulario();
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mensaje-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Título *</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formulario.titulo}
                    onChange={handleInputChange}
                    required
                    placeholder="Título del mensaje"
                  />
                </div>
                <div className="form-group">
                  <label>Tipo de contenido</label>
                  <select
                    name="tipo_contenido"
                    value={formulario.tipo_contenido}
                    onChange={handleInputChange}
                  >
                    <option value="texto">Solo texto</option>
                    <option value="imagen">Solo imagen</option>
                    <option value="mixto">Texto e imagen</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Contenido {formulario.tipo_contenido === 'texto' ? '*' : ''}</label>
                <textarea
                  name="contenido"
                  value={formulario.contenido}
                  onChange={handleInputChange}
                  required={formulario.tipo_contenido === 'texto'}
                  rows="4"
                  placeholder="Contenido del mensaje"
                />
              </div>

              {(formulario.tipo_contenido === 'imagen' || formulario.tipo_contenido === 'mixto') && (
                <div className="form-group">
                  <label>Imagen</label>
                  
                  {/* Pestañas para elegir entre URL o archivo */}
                  <div className="imagen-tabs">
                    <button
                      type="button"
                      className={`tab-button ${!archivoImagen ? 'active' : ''}`}
                      onClick={() => {
                        setArchivoImagen(null);
                        setImagenPreview('');
                        setImagenError('');
                      }}
                    >
                      <i className="fas fa-link"></i> URL
                    </button>
                    <button
                      type="button"
                      className={`tab-button ${archivoImagen ? 'active' : ''}`}
                      onClick={() => {
                        setFormulario(prev => ({ ...prev, imagen_url: '' }));
                        setImagenPreview('');
                        setImagenError('');
                      }}
                    >
                      <i className="fas fa-upload"></i> Subir archivo
                    </button>
                  </div>

                  {/* Campo URL */}
                  {!archivoImagen && (
                    <input
                      type="url"
                      name="imagen_url"
                      value={formulario.imagen_url}
                      onChange={handleInputChange}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  )}

                  {/* Campo archivo */}
                  {archivoImagen === null && formulario.imagen_url === '' && (
                    <div className="file-upload-area">
                      <input
                        type="file"
                        id="archivo-imagen"
                        accept="image/*"
                        onChange={handleArchivoImagen}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="archivo-imagen" className="file-upload-label">
                        <i className="fas fa-cloud-upload-alt"></i>
                        <span>Haz clic para seleccionar una imagen</span>
                        <small>JPG, PNG, GIF, WEBP - Máximo 5MB</small>
                      </label>
                    </div>
                  )}

                  {/* Información del archivo seleccionado */}
                  {archivoImagen && (
                    <div className="archivo-seleccionado">
                      <div className="archivo-info">
                        <i className="fas fa-file-image"></i>
                        <span>{archivoImagen.name}</span>
                        <small>({(archivoImagen.size / 1024 / 1024).toFixed(2)} MB)</small>
                      </div>
                      <button
                        type="button"
                        className="btn-remove-file"
                        onClick={() => {
                          setArchivoImagen(null);
                          setImagenPreview('');
                          setImagenError('');
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}

                  {/* Mensajes de error */}
                  {imagenError && (
                    <div className="error-message">
                      <i className="fas fa-exclamation-triangle"></i>
                      {imagenError}
                    </div>
                  )}

                  {/* Vista previa */}
                  {imagenPreview && (
                    <div className="imagen-preview">
                      <label>Vista previa:</label>
                      <div className="preview-container">
                        <img 
                          src={imagenPreview} 
                          alt="Vista previa" 
                          className="preview-image"
                        />
                        <div className="preview-info">
                          <small>Así se verá la imagen en el mensaje modal</small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label>Dirigido a</label>
                <select
                  name="dirigido_a"
                  value={formulario.dirigido_a}
                  onChange={handleInputChange}
                >
                  <option value="todos">Todos los usuarios</option>
                  <option value="profesores">Solo profesores</option>
                  <option value="alumnos">Solo alumnos</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de inicio</label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={formulario.fecha_inicio}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de fin</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={formulario.fecha_fin}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formulario.activo}
                    onChange={handleInputChange}
                  />
                  <span>Mensaje activo</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="mostrar_una_vez"
                    checked={formulario.mostrar_una_vez}
                    onChange={handleInputChange}
                  />
                  <span>Mostrar solo una vez por usuario</span>
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancelar"
                  onClick={() => {
                    setMostrarFormulario(false);
                    resetFormulario();
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-guardar"
                  disabled={loading || subiendoImagen}
                >
                  {subiendoImagen ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Subiendo imagen...
                    </>
                  ) : loading ? (
                    'Guardando...'
                  ) : (
                    mensajeEditando ? 'Actualizar' : 'Crear'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mensajes-lista">
        {loading ? (
          <div className="loading">Cargando mensajes...</div>
        ) : mensajes.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-comment-slash"></i>
            <p>No hay mensajes creados</p>
          </div>
        ) : (
          <div className="mensajes-grid">
            {mensajes.map(mensaje => (
              <div key={mensaje.id} className="mensaje-card">
                <div className="mensaje-header">
                  <h4>{mensaje.titulo}</h4>
                  <div className="mensaje-badges">
                    <span className={`badge estado ${mensaje.activo ? 'activo' : 'inactivo'}`}>
                      {mensaje.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="mensaje-info">
                  <p><strong>Dirigido a:</strong> {getDirigidoAText(mensaje.dirigido_a)}</p>
                  <p><strong>Tipo:</strong> {mensaje.tipo_contenido}</p>
                  {mensaje.fecha_inicio && (
                    <p><strong>Inicio:</strong> {new Date(mensaje.fecha_inicio).toLocaleDateString()}</p>
                  )}
                  {mensaje.fecha_fin && (
                    <p><strong>Fin:</strong> {new Date(mensaje.fecha_fin).toLocaleDateString()}</p>
                  )}
                </div>

                <div className="mensaje-contenido">
                  <p>{mensaje.contenido.substring(0, 100)}...</p>
                </div>

                <div className="mensaje-actions">
                  <button 
                    className="btn-preview"
                    onClick={() => mostrarPreview(mensaje)}
                  >
                    <i className="fas fa-eye"></i>
                    Vista previa
                  </button>
                  <button 
                    className="btn-editar"
                    onClick={() => handleEditar(mensaje)}
                  >
                    <i className="fas fa-edit"></i>
                  
                  </button>
                  <button 
                    className="btn-eliminar"
                    onClick={() => handleEliminar(mensaje.id)}
                  >
                    <i className="fas fa-trash"></i>
                  
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {previewModal && (
        <div className="modal-overlay">
          <div className="modal-content preview-modal">
            <div className="modal-header">
              <h3>Vista Previa del Mensaje</h3>
              <button 
                className="btn-close"
                onClick={() => setPreviewModal(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="preview-content">
              <div className="popup-preview">
                <h4>{previewModal.titulo}</h4>
                {previewModal.imagen_url && (
                  <img src={previewModal.imagen_url} alt="Imagen del mensaje" />
                )}
                <p>{previewModal.contenido}</p>
                <div className="preview-info">
                  <small>
                    Dirigido a: {getDirigidoAText(previewModal.dirigido_a)}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MensajesPersonalizados;