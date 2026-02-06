import React from 'react';
import './SrcModal.css';

const SrcModal = ({ isOpen, onClose, src, title = 'Vista previa' }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isVideo = src && (src.includes('.mp4') || src.includes('.webm') || src.includes('.ogg'));
  const isImage = src && (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png') || src.includes('.gif') || src.includes('.webp'));

  return (
    <div className="src-modal-overlay" onClick={handleOverlayClick}>
      <div className="src-modal-content">
        <div className="src-modal-header">
          <h3>{title}</h3>
          <button 
            className="src-modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>
        
        <div className="src-modal-body">
          {isVideo ? (
            <video 
              controls 
              className="src-modal-media"
              src={src}
            >
              Tu navegador no soporta el elemento de video.
            </video>
          ) : isImage ? (
            <img 
              src={src} 
              alt={title}
              className="src-modal-media"
            />
          ) : (
            <div className="src-modal-placeholder">
              <p>No se puede mostrar el contenido</p>
              <p>Tipo de archivo no soportado</p>
            </div>
          )}
        </div>
        
        <div className="src-modal-footer">
          <button 
            className="btn-secondary"
            onClick={onClose}
          >
            Cerrar
          </button>
          {src && (
            <a 
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Abrir en nueva pestaña
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default SrcModal;