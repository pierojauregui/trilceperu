import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import './ClasesIndividual.css';

const ClasesIndividual = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [clase, setClase] = useState(null);
  const [materiales, setMateriales] = useState([]);
  const [modalSubirMaterial, setModalSubirMaterial] = useState(false);
  const [modalVideo, setModalVideo] = useState(false);
  const [videoActual, setVideoActual] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const claseId = localStorage.getItem('claseSeleccionada');

  const [nuevoMaterial, setNuevoMaterial] = useState({
    tipo_material: 'documento',
    titulo: '',
    descripcion: '',
    url_externa: '',
    archivo: null
  });

  useEffect(() => {
    cargarDatos();
  }, [claseId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar información de la clase
      const claseResponse = await fetch(`${API_URL}/clases/${claseId}`);
      const claseData = await claseResponse.json();
      setClase(claseData.data);
      
      // Cargar materiales de la clase
      const materialesResponse = await fetch(`${API_URL}/clases/${claseId}/materiales`);
      const materialesData = await materialesResponse.json();
      setMateriales(materialesData.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const subirMaterial = async () => {
    try {
      const formData = new FormData();
      formData.append('id_clase', claseId);
      formData.append('tipo_material', nuevoMaterial.tipo_material);
      formData.append('titulo', nuevoMaterial.titulo);
      formData.append('descripcion', nuevoMaterial.descripcion);
      
      if (nuevoMaterial.tipo_material === 'link') {
        formData.append('url_externa', nuevoMaterial.url_externa);
      } else if (nuevoMaterial.archivo) {
        formData.append('archivo', nuevoMaterial.archivo);
      }

      const response = await fetch(`${API_URL}/materiales`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        await cargarDatos();
        setModalSubirMaterial(false);
        setNuevoMaterial({
          tipo_material: 'documento',
          titulo: '',
          descripcion: '',
          url_externa: '',
          archivo: null
        });
        Swal.fire({
          icon: 'success',
          title: 'Material subido',
          text: 'El material se ha subido exitosamente'
        });
      }
    } catch (error) {
      console.error('Error al subir material:', error);
    }
  };

  const eliminarMaterial = async (materialId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se eliminará este material',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/materiales/${materialId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          await cargarDatos();
          Swal.fire('Eliminado', 'El material ha sido eliminado', 'success');
        }
      } catch (error) {
        console.error('Error al eliminar material:', error);
      }
    }
  };

  const getTipoMaterialIcon = (tipo) => {
    const icons = {
      'documento': 'bx-file',
      'presentacion': 'bx-slideshow',
      'video': 'bx-video',
      'imagen': 'bx-image',
      'link': 'bx-link',
      'tarea': 'bx-task'
    };
    return icons[tipo] || 'bx-file';
  };

  const abrirVideo = (material) => {
    setVideoActual(material);
    setModalVideo(true);
  };

  const cerrarVideo = () => {
    setVideoActual(null);
    setModalVideo(false);
  };

  const getVideoUrl = (material) => {
    if (material.url_externa) {
      return material.url_externa;
    }
    if (material.url_archivo) {
      // Usar endpoint de streaming para soportar seek/adelantar
      const path = material.url_archivo.replace('/uploads/', '');
      return `${API_URL.replace('/api', '')}/api/stream/video/${path}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando clase...</p>
      </div>
    );
  }

  return (
    <div className="clase-individual-container">
      <div className="clase-header">
        <button 
          className="btn-volver-atras"
          onClick={() => setCurrentSection('clases-modulo')}
        >
          <i className='bx bx-arrow-back'></i>
        </button>
        <div className="header-info">
          <h1>{clase?.titulo || 'Cargando...'}</h1>
          <p>{clase?.descripcion}</p>
          <div className="clase-badges">
            <span className={`tipo-badge ${clase?.tipo_clase}`}>
              {clase?.tipo_clase}
            </span>
            {clase?.duracion_minutos && (
              <span className="duracion-badge">
                <i className='bx bx-time'></i>
                {clase.duracion_minutos} min
              </span>
            )}
            {clase?.fecha_clase && (
              <span className="fecha-badge">
                <i className='bx bx-calendar'></i>
                {new Date(clase.fecha_clase).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="contenido-clase">
        <div className="materiales-section">
          <div className="section-header">
            <h2>Material de Clase</h2>
            <button 
              className="btn-subir-material"
              onClick={() => setModalSubirMaterial(true)}
            >
              <i className='bx bx-upload'></i>
              Subir Material
            </button>
          </div>

          {materiales.length === 0 ? (
            <div className="empty-material">
              <i className='bx bx-folder-open'></i>
              <p>No hay material subido aún</p>
            </div>
          ) : (
            <div className="materiales-grid">
              {materiales.map(material => (
                <div key={material.id} className="material-card">
                  <div className="material-icon">
                    <i className={`bx ${getTipoMaterialIcon(material.tipo_material)}`}></i>
                  </div>
                  <div className="material-info">
                    <h4>{material.titulo}</h4>
                    <p>{material.descripcion}</p>
                    <span className="material-tipo">{material.tipo_material}</span>
                  </div>
                  <div className="material-actions">
                    {material.tipo_material === 'video' && (material.url_archivo || material.url_externa) && (
                      <button 
                        className="btn-play"
                        onClick={() => abrirVideo(material)}
                        title="Reproducir video"
                      >
                        <i className='bx bx-play'></i>
                      </button>
                    )}
                    {material.url_archivo ? (
                      <a 
                        href={`${API_URL.replace('/api', '')}${material.url_archivo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-download"
                        title="Descargar"
                      >
                        <i className='bx bx-download'></i>
                      </a>
                    ) : material.url_externa ? (
                      <a 
                        href={material.url_externa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-link"
                        title="Abrir enlace"
                      >
                        <i className='bx bx-link-external'></i>
                      </a>
                    ) : null}
                    <button 
                      className="btn-delete"
                      onClick={() => eliminarMaterial(material.id)}
                      title="Eliminar"
                    >
                      <i className='bx bx-trash'></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Subir Material */}
      {modalSubirMaterial && (
        <div className="modal-overlay" onClick={() => setModalSubirMaterial(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Subir Material</h2>
              <button className="btn-close" onClick={() => setModalSubirMaterial(false)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tipo de Material</label>
                <select 
                  value={nuevoMaterial.tipo_material}
                  onChange={(e) => setNuevoMaterial({...nuevoMaterial, tipo_material: e.target.value})}
                >
                  <option value="documento">Documento</option>
                  <option value="presentacion">Presentación</option>
                  <option value="video">Video</option>
                  <option value="imagen">Imagen</option>
                  <option value="link">Enlace</option>
                  <option value="tarea">Tarea</option>
                </select>
              </div>
              <div className="form-group">
                <label>Título *</label>
                <input 
                  type="text"
                  value={nuevoMaterial.titulo}
                  onChange={(e) => setNuevoMaterial({...nuevoMaterial, titulo: e.target.value})}
                  placeholder="Título del material"
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea 
                  value={nuevoMaterial.descripcion}
                  onChange={(e) => setNuevoMaterial({...nuevoMaterial, descripcion: e.target.value})}
                  placeholder="Describe el material"
                  rows="3"
                />
              </div>
              {nuevoMaterial.tipo_material === 'link' ? (
                <div className="form-group">
                  <label>URL *</label>
                  <input 
                    type="url"
                    value={nuevoMaterial.url_externa}
                    onChange={(e) => setNuevoMaterial({...nuevoMaterial, url_externa: e.target.value})}
                    placeholder="https://..."
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label>Archivo *</label>
                  <input 
                    type="file"
                    onChange={(e) => setNuevoMaterial({...nuevoMaterial, archivo: e.target.files[0]})}
                    required
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalSubirMaterial(false)}>
                Cancelar
              </button>
              <button className="btn-guardar" onClick={subirMaterial}>
                Subir Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reproductor de Video */}
      {modalVideo && videoActual && (
        <div className="video-modal-overlay" onClick={cerrarVideo}>
          <div className="video-modal-content-trilce" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{videoActual.titulo}</h2>
              <button className="btn-close" onClick={cerrarVideo}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="modal-body video-modal-body">
              <div className="video-player-container">
                {videoActual.url_externa && (videoActual.url_externa.includes('youtube') || videoActual.url_externa.includes('youtu.be')) ? (
                  <iframe
                    src={videoActual.url_externa.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    title={videoActual.titulo}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="video-iframe"
                  ></iframe>
                ) : videoActual.url_externa && videoActual.url_externa.includes('vimeo') ? (
                  <iframe
                    src={videoActual.url_externa.replace('vimeo.com/', 'player.vimeo.com/video/')}
                    title={videoActual.titulo}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="video-iframe"
                  ></iframe>
                ) : (
                  <video 
                    controls 
                    autoPlay
                    className="video-player"
                    src={getVideoUrl(videoActual)}
                  >
                    Tu navegador no soporta la reproducción de videos.
                  </video>
                )}
              </div>
              {videoActual.descripcion && (
                <div className="video-descripcion">
                  <p>{videoActual.descripcion}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {videoActual.url_archivo && (
                <a 
                  href={`${API_URL.replace('/api', '')}${videoActual.url_archivo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-guardar"
                >
                  <i className='bx bx-download'></i> Descargar Video
                </a>
              )}
              <button className="btn-cancelar" onClick={cerrarVideo}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClasesIndividual;