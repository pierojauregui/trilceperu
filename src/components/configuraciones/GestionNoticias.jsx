import React, { useState, useEffect } from 'react';
import './GestionNoticias.css';

const GestionNoticias = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [noticias, setNoticias] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [noticiaEditando, setNoticiaEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    categoria: '',
    dirigido_a: '',
    publicado: ''
  });

  const [formulario, setFormulario] = useState({
    titulo: '',
    resumen: '',
    contenido: '',
    imagen_destacada: '',
    categoria: 'general',
    dirigido_a: 'todos',
    publicado: false,
    destacado: false,
    fecha_publicacion: '',
    fecha_expiracion: '',
    permite_comentarios: true
  });

  useEffect(() => {
    cargarNoticias();
  }, []);

  const cargarNoticias = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/noticias`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNoticias(data);
      }
    } catch (error) {
      console.error('Error al cargar noticias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = noticiaEditando 
        ? `${API_URL}/noticias/${noticiaEditando.id}`
        : `${API_URL}/noticias`;
      
      const method = noticiaEditando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formulario)
      });

      if (response.ok) {
        await cargarNoticias();
        resetFormulario();
        setMostrarFormulario(false);
        alert(noticiaEditando ? 'Noticia actualizada exitosamente' : 'Noticia creada exitosamente');
      } else {
        alert('Error al guardar la noticia');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la noticia');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta noticia?')) return;

    try {
      const response = await fetch(`${API_URL}/noticias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await cargarNoticias();
        alert('Noticia eliminada exitosamente');
      } else {
        alert('Error al eliminar la noticia');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la noticia');
    }
  };

  const handleEditar = (noticia) => {
    setNoticiaEditando(noticia);
    setFormulario({
      titulo: noticia.titulo,
      resumen: noticia.resumen || '',
      contenido: noticia.contenido,
      imagen_destacada: noticia.imagen_destacada || '',
      categoria: noticia.categoria,
      dirigido_a: noticia.dirigido_a,
      publicado: noticia.publicado,
      destacado: noticia.destacado,
      fecha_publicacion: noticia.fecha_publicacion ? noticia.fecha_publicacion.split('T')[0] : '',
      fecha_expiracion: noticia.fecha_expiracion ? noticia.fecha_expiracion.split('T')[0] : '',
      permite_comentarios: noticia.permite_comentarios
    });
    setMostrarFormulario(true);
  };

  const resetFormulario = () => {
    setFormulario({
      titulo: '',
      resumen: '',
      contenido: '',
      imagen_destacada: '',
      categoria: 'general',
      dirigido_a: 'todos',
      publicado: false,
      destacado: false,
      fecha_publicacion: '',
      fecha_expiracion: '',
      permite_comentarios: true
    });
    setNoticiaEditando(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePublicado = async (id, publicado) => {
    try {
      const response = await fetch(`${API_URL}/noticias/${id}/toggle-publicado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ publicado: !publicado })
      });

      if (response.ok) {
        await cargarNoticias();
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const getCategoriaColor = (categoria) => {
    const colores = {
      general: '#6c757d',
      academico: '#007bff',
      eventos: '#28a745',
      sistema: '#ffc107',
      importante: '#dc3545'
    };
    return colores[categoria] || '#6c757d';
  };

  const getDirigidoAText = (dirigido_a) => {
    switch (dirigido_a) {
      case 'todos': return 'Todos';
      case 'profesores': return 'Profesores';
      case 'alumnos': return 'Alumnos';
      default: return dirigido_a;
    }
  };

  const noticiasFiltradas = noticias.filter(noticia => {
    return (
      (filtros.categoria === '' || noticia.categoria === filtros.categoria) &&
      (filtros.dirigido_a === '' || noticia.dirigido_a === filtros.dirigido_a) &&
      (filtros.publicado === '' || noticia.publicado.toString() === filtros.publicado)
    );
  });

  return (
    <div className="gestion-noticias">
      <div className="noticias-header">
        <div>
          <h2>Gestión de Noticias</h2>
          <p>Administra las noticias del aula virtual</p>
        </div>
        <button 
          className="btn-nueva"
          onClick={() => setMostrarFormulario(true)}
        >
          <i className="fas fa-plus"></i>
          Nueva Noticia
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtros">
          <select
            name="categoria"
            value={filtros.categoria}
            onChange={handleFiltroChange}
          >
            <option value="">Todas las categorías</option>
            <option value="general">General</option>
            <option value="academico">Académico</option>
            <option value="eventos">Eventos</option>
            <option value="sistema">Sistema</option>
            <option value="importante">Importante</option>
          </select>

          <select
            name="dirigido_a"
            value={filtros.dirigido_a}
            onChange={handleFiltroChange}
          >
            <option value="">Todos los usuarios</option>
            <option value="todos">Todos</option>
            <option value="profesores">Profesores</option>
            <option value="alumnos">Alumnos</option>
          </select>

          <select
            name="publicado"
            value={filtros.publicado}
            onChange={handleFiltroChange}
          >
            <option value="">Todos los estados</option>
            <option value="true">Publicadas</option>
            <option value="false">Borradores</option>
          </select>
        </div>
      </div>

      {/* Modal Formulario */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h3>{noticiaEditando ? 'Editar Noticia' : 'Nueva Noticia'}</h3>
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

            <form onSubmit={handleSubmit} className="noticia-form">
              <div className="form-section">
                <h4>Información básica</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Título *</label>
                    <input
                      type="text"
                      name="titulo"
                      value={formulario.titulo}
                      onChange={handleInputChange}
                      required
                      placeholder="Título de la noticia"
                    />
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <select
                      name="categoria"
                      value={formulario.categoria}
                      onChange={handleInputChange}
                    >
                      <option value="general">General</option>
                      <option value="academico">Académico</option>
                      <option value="eventos">Eventos</option>
                      <option value="sistema">Sistema</option>
                      <option value="importante">Importante</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Resumen</label>
                  <textarea
                    name="resumen"
                    value={formulario.resumen}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Breve resumen de la noticia"
                  />
                </div>

                <div className="form-group">
                  <label>Contenido *</label>
                  <textarea
                    name="contenido"
                    value={formulario.contenido}
                    onChange={handleInputChange}
                    required
                    rows="8"
                    placeholder="Contenido completo de la noticia"
                  />
                </div>

                <div className="form-group">
                  <label>Imagen destacada</label>
                  <input
                    type="url"
                    name="imagen_destacada"
                    value={formulario.imagen_destacada}
                    onChange={handleInputChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Configuración de publicación</h4>
                <div className="form-row">
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
                  <div className="form-group">
                    <label>Fecha de publicación</label>
                    <input
                      type="date"
                      name="fecha_publicacion"
                      value={formulario.fecha_publicacion}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Fecha de expiración</label>
                  <input
                    type="date"
                    name="fecha_expiracion"
                    value={formulario.fecha_expiracion}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="publicado"
                      checked={formulario.publicado}
                      onChange={handleInputChange}
                    />
                    <span>Publicar noticia</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="destacado"
                      checked={formulario.destacado}
                      onChange={handleInputChange}
                    />
                    <span>Noticia destacada</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="permite_comentarios"
                      checked={formulario.permite_comentarios}
                      onChange={handleInputChange}
                    />
                    <span>Permitir comentarios</span>
                  </label>
                </div>
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
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : (noticiaEditando ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de noticias */}
      <div className="noticias-lista">
        {loading ? (
          <div className="loading">Cargando noticias...</div>
        ) : noticiasFiltradas.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-newspaper"></i>
            <p>No hay noticias que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="noticias-grid">
            {noticiasFiltradas.map(noticia => (
              <div key={noticia.id} className="noticia-card">
                <div className="noticia-header">
                  <div className="noticia-meta">
                    <span 
                      className="badge categoria"
                      style={{ backgroundColor: getCategoriaColor(noticia.categoria) }}
                    >
                      {noticia.categoria}
                    </span>
                    {noticia.destacado && (
                      <span className="badge destacado">
                        <i className="fas fa-star"></i>
                        Destacado
                      </span>
                    )}
                  </div>
                  <div className="noticia-estado">
                    <button
                      className={`toggle-publicado ${noticia.publicado ? 'publicado' : 'borrador'}`}
                      onClick={() => togglePublicado(noticia.id, noticia.publicado)}
                      title={noticia.publicado ? 'Despublicar' : 'Publicar'}
                    >
                      <i className={`fas ${noticia.publicado ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                    </button>
                  </div>
                </div>

                {noticia.imagen_destacada && (
                  <div className="noticia-imagen">
                    <img src={noticia.imagen_destacada} alt={noticia.titulo} />
                  </div>
                )}

                <div className="noticia-content">
                  <h4>{noticia.titulo}</h4>
                  {noticia.resumen && (
                    <p className="resumen">{noticia.resumen}</p>
                  )}
                  <p className="contenido-preview">
                    {noticia.contenido.substring(0, 150)}...
                  </p>
                </div>

                <div className="noticia-info">
                  <div className="info-item">
                    <i className="fas fa-users"></i>
                    <span>{getDirigidoAText(noticia.dirigido_a)}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-calendar"></i>
                    <span>
                      {noticia.fecha_publicacion 
                        ? new Date(noticia.fecha_publicacion).toLocaleDateString()
                        : 'Sin fecha'
                      }
                    </span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-eye"></i>
                    <span>{noticia.vistas || 0} vistas</span>
                  </div>
                </div>

                <div className="noticia-actions">
                  <button 
                    className="btn-editar"
                    onClick={() => handleEditar(noticia)}
                  >
                    <i className="fas fa-edit"></i>
                    Editar
                  </button>
                  <button 
                    className="btn-eliminar"
                    onClick={() => handleEliminar(noticia.id)}
                  >
                    <i className="fas fa-trash"></i>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionNoticias;