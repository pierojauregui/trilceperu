import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './ClaseIndividualAlumno.css';

const ClaseIndividualAlumno = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [clase, setClase] = useState(null);
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVideo, setModalVideo] = useState(false);
  const [videoActual, setVideoActual] = useState(null);
  const { user } = useAuth();
  
  const claseId = localStorage.getItem('claseSeleccionadaAlumno');

  useEffect(() => {
    cargarDatos();
  }, [claseId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar información de la clase
      const claseResponse = await fetch(`${API_URL}/clases/${claseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const claseData = await claseResponse.json();
      setClase(claseData.data);
      
      // Cargar materiales de la clase
      const materialesResponse = await fetch(`${API_URL}/clases/${claseId}/materiales`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const materialesData = await materialesResponse.json();
      setMateriales(materialesData.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
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

  const descargarMaterial = (material) => {
    if (material.url_archivo) {
      window.open(`${API_URL.replace('/api', '')}${material.url_archivo}`, '_blank');
    } else if (material.url_externa) {
      window.open(material.url_externa, '_blank');
    }
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
    <div className="clase-individual-alumno-container">
      <div className="clase-header">
        <button 
          className="btn-volver-atras"
          onClick={() => setCurrentSection('clases-modulo-alumno')}
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
        {/* Contenido de la clase */}
        {clase?.contenido && (
          <div className="clase-contenido-section">
            <h2>Contenido de la Clase</h2>
            <div className="contenido-texto">
              <div dangerouslySetInnerHTML={{ __html: clase.contenido }} />
            </div>
          </div>
        )}

        {/* Video de la clase */}
        {clase?.url_video && (
          <div className="video-section">
            <h2>Video de la Clase</h2>
            <div className="video-container">
              <iframe
                src={clase.url_video}
                title={clase.titulo}
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Material de la clase */}
        <div className="materiales-section">
          <div className="section-header">
            <h2>Material de Clase</h2>
          </div>

          {materiales.length === 0 ? (
            <div className="empty-material">
              <i className='bx bx-folder-open'></i>
              <p>No hay material disponible para esta clase</p>
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
                    <button 
                      className="btn-download"
                      onClick={() => descargarMaterial(material)}
                      title={material.url_archivo ? 'Descargar archivo' : 'Abrir enlace'}
                    >
                      <i className={`bx ${material.url_archivo ? 'bx-download' : 'bx-link-external'}`}></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
                  className="btn-descargar-video"
                >
                  <i className='bx bx-download'></i> Descargar Video
                </a>
              )}
              <button className="btn-cerrar" onClick={cerrarVideo}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaseIndividualAlumno;