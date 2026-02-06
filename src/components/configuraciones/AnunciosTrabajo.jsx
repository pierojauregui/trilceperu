import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import './AnunciosTrabajo.css';

const AnunciosTrabajo = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnuncio, setEditingAnuncio] = useState(null);
  const [formData, setFormData] = useState({
    posicion: '',
    descripcion: '',
    requisitos: '',
    remuneracion: '',
    activo: true
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Cargar anuncios al montar
  useEffect(() => {
    cargarAnuncios();
  }, []);

  const cargarAnuncios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/anuncios-trabajo`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnuncios(data.anuncios || []);
      }
    } catch (error) {
      console.error('Error al cargar anuncios:', error);
      Swal.fire('Error', 'No se pudieron cargar los anuncios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      posicion: '',
      descripcion: '',
      requisitos: '',
      remuneracion: '',
      activo: true
    });
    setPreviewImage(null);
    setSelectedImage(null);
    setEditingAnuncio(null);
  };

  const openModal = (anuncio = null) => {
    if (anuncio) {
      setEditingAnuncio(anuncio);
      setFormData({
        posicion: anuncio.posicion || '',
        descripcion: anuncio.descripcion || '',
        requisitos: anuncio.requisitos || '',
        remuneracion: anuncio.remuneracion || '',
        activo: anuncio.activo
      });
      if (anuncio.imagen_url) {
        setPreviewImage(`${API_URL.replace('/api', '')}${anuncio.imagen_url}`);
      }
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('posicion', formData.posicion);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('requisitos', formData.requisitos);
      formDataToSend.append('remuneracion', formData.remuneracion || '');
      formDataToSend.append('activo', formData.activo);
      
      if (selectedImage) {
        formDataToSend.append('imagen', selectedImage);
      }

      const url = editingAnuncio 
        ? `${API_URL}/anuncios-trabajo/${editingAnuncio.id}`
        : `${API_URL}/anuncios-trabajo/create`;
      
      const method = editingAnuncio ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        await Swal.fire({
          title: '¡Éxito!',
          text: editingAnuncio ? 'Anuncio actualizado correctamente' : 'Anuncio creado correctamente',
          icon: 'success',
          confirmButtonColor: '#4CAF50'
        });
        closeModal();
        cargarAnuncios();
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Error al guardar el anuncio');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleToggleStatus = async (anuncio) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/anuncios-trabajo/${anuncio.id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnuncios(prev => prev.map(a => 
          a.id === anuncio.id ? { ...a, activo: data.activo } : a
        ));
        Swal.fire({
          title: '¡Actualizado!',
          text: data.message,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
    }
  };

  const handleDelete = async (anuncio) => {
    const result = await Swal.fire({
      title: '¿Eliminar anuncio?',
      text: `¿Estás seguro de eliminar el anuncio "${anuncio.posicion}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/anuncios-trabajo/${anuncio.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          Swal.fire('¡Eliminado!', 'El anuncio ha sido eliminado.', 'success');
          cargarAnuncios();
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudo eliminar el anuncio', 'error');
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="anuncios-loading">
        <div className="spinner"></div>
        <p>Cargando anuncios...</p>
      </div>
    );
  }

  return (
    <div className="anuncios-trabajo-container">
      <div className="anuncios-header">
        <div className="header-info">
          <h2>📋 Anuncios de Trabajo</h2>
          <p>Gestiona las ofertas de trabajo que se muestran en "Trabaja con Nosotros"</p>
        </div>
        <button className="btn-crear" onClick={() => openModal()}>
          <i className="fas fa-plus"></i> Nuevo Anuncio
        </button>
      </div>

      {anuncios.length === 0 ? (
        <div className="no-anuncios">
          <i className="fas fa-briefcase"></i>
          <h3>No hay anuncios de trabajo</h3>
          <p>Crea tu primer anuncio para que aparezca en la sección pública</p>
          <button className="btn-crear" onClick={() => openModal()}>
            <i className="fas fa-plus"></i> Crear Anuncio
          </button>
        </div>
      ) : (
        <div className="anuncios-grid">
          {anuncios.map(anuncio => (
            <div key={anuncio.id} className={`anuncio-card ${!anuncio.activo ? 'inactivo' : ''}`}>
              {anuncio.imagen_url && (
                <div className="anuncio-imagen">
                  <img 
                    src={`${API_URL.replace('/api', '')}${anuncio.imagen_url}`} 
                    alt={anuncio.posicion}
                  />
                </div>
              )}
              <div className="anuncio-content">
                <div className="anuncio-header">
                  <h3>{anuncio.posicion}</h3>
                  <span className={`status-badge ${anuncio.activo ? 'activo' : 'inactivo'}`}>
                    {anuncio.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <div className="anuncio-descripcion">
                  <p>{anuncio.descripcion.substring(0, 150)}...</p>
                </div>

                {anuncio.remuneracion && (
                  <div className="anuncio-remuneracion">
                    <i className="fas fa-money-bill-wave"></i>
                    <span>{anuncio.remuneracion}</span>
                  </div>
                )}

                <div className="anuncio-fecha">
                  <i className="fas fa-calendar"></i>
                  <span>Creado: {formatDate(anuncio.fecha_creacion)}</span>
                </div>

                <div className="anuncio-actions">
                  <button 
                    className="btn-action btn-edit" 
                    onClick={() => openModal(anuncio)}
                    title="Editar"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className={`btn-action btn-toggle ${anuncio.activo ? 'active' : ''}`}
                    onClick={() => handleToggleStatus(anuncio)}
                    title={anuncio.activo ? 'Desactivar' : 'Activar'}
                  >
                    <i className={`fas fa-${anuncio.activo ? 'eye-slash' : 'eye'}`}></i>
                  </button>
                  <button 
                    className="btn-action btn-delete" 
                    onClick={() => handleDelete(anuncio)}
                    title="Eliminar"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Crear/Editar */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAnuncio ? 'Editar Anuncio' : 'Nuevo Anuncio de Trabajo'}</h3>
              <button className="btn-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="anuncio-form">
              <div className="form-group">
                <label>Posición / Cargo *</label>
                <input
                  type="text"
                  name="posicion"
                  value={formData.posicion}
                  onChange={handleInputChange}
                  placeholder="Ej: Profesor de Matemáticas"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción del puesto *</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Describe las funciones y responsabilidades del puesto..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Requisitos *</label>
                <textarea
                  name="requisitos"
                  value={formData.requisitos}
                  onChange={handleInputChange}
                  placeholder="- Título profesional&#10;- Experiencia mínima de 2 años&#10;- Dominio de herramientas digitales"
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Remuneración (opcional)</label>
                <input
                  type="text"
                  name="remuneracion"
                  value={formData.remuneracion}
                  onChange={handleInputChange}
                  placeholder="Ej: S/ 2,500 - S/ 3,000 o 'A tratar'"
                />
              </div>

              <div className="form-group">
                <label>Imagen del anuncio (opcional)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <div className="image-upload-area" onClick={handleImageClick}>
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <i className="fas fa-cloud-upload-alt"></i>
                      <p>Clic para subir imagen</p>
                      <small>JPG, PNG (max. 2MB)</small>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleInputChange}
                  />
                  <span>Anuncio activo (visible en la página pública)</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancelar" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  {editingAnuncio ? 'Guardar Cambios' : 'Crear Anuncio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnunciosTrabajo;
