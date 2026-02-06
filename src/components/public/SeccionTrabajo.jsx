import React, { useState, useEffect } from 'react';
import './SeccionTrabajo.css';

const SeccionTrabajo = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnuncio, setSelectedAnuncio] = useState(null);

  // Número de WhatsApp (mismo que FloatingWhatsApp)
  const whatsappNumber = "51987654321";

  useEffect(() => {
    cargarAnuncios();
  }, []);

  const cargarAnuncios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/anuncios-trabajo/activos`);
      
      if (response.ok) {
        const data = await response.json();
        setAnuncios(data.anuncios || []);
      }
    } catch (error) {
      console.error('Error al cargar anuncios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAplicar = (anuncio) => {
    const mensaje = `¡Hola! 👋\n\nEstoy interesado/a en la posición de *${anuncio.posicion}* que vi en su página web.\n\nMe gustaría recibir más información sobre el proceso de postulación.\n\n¡Gracias!`;
    const encodedMessage = encodeURIComponent(mensaje);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const openModal = (anuncio) => {
    setSelectedAnuncio(anuncio);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedAnuncio(null);
    document.body.style.overflow = 'auto';
  };

  const formatRequisitos = (requisitos) => {
    if (!requisitos) return [];
    return requisitos.split(/\n/).filter(r => r.trim());
  };

  // Si no hay anuncios activos, no mostrar la sección
  if (!loading && anuncios.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className="seccion-trabajo" id="trabaja-con-nosotros">
        <div className="seccion-trabajo-container">
          <div className="seccion-trabajo-loading">
            <div className="spinner"></div>
            <p>Cargando ofertas...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="seccion-trabajo" id="trabaja-con-nosotros">
      <div className="seccion-trabajo-container">
        <div className="seccion-trabajo-header">
          <span className="trabajo-badge">💼 Únete a nuestro equipo</span>
          <h2>Trabaja con Nosotros</h2>
          <p>Forma parte de un equipo comprometido con la educación de calidad</p>
        </div>

        <div className="ofertas-trabajo-grid">
          {anuncios.map(anuncio => (
            <article key={anuncio.id} className="oferta-trabajo-card">
              {anuncio.imagen_url && (
                <div className="oferta-trabajo-imagen">
                  <img 
                    src={`${API_URL.replace('/api', '')}${anuncio.imagen_url}`} 
                    alt={anuncio.posicion}
                  />
                </div>
              )}
              
              <div className="oferta-trabajo-content">
                <h3 className="oferta-trabajo-titulo">{anuncio.posicion}</h3>
                
                <p className="oferta-trabajo-descripcion">
                  {anuncio.descripcion.length > 120 
                    ? `${anuncio.descripcion.substring(0, 120)}...` 
                    : anuncio.descripcion}
                </p>

                {anuncio.remuneracion && (
                  <div className="oferta-trabajo-remuneracion">
                    <i className="fas fa-money-bill-wave"></i>
                    <span>{anuncio.remuneracion}</span>
                  </div>
                )}

                <div className="oferta-trabajo-actions">
                  <button 
                    className="btn-ver-detalles"
                    onClick={() => openModal(anuncio)}
                  >
                    Ver más
                  </button>
                  <button 
                    className="btn-aplicar-whatsapp"
                    onClick={() => handleAplicar(anuncio)}
                  >
                    <i className="fab fa-whatsapp"></i>
                    Aplicar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Modal de detalle */}
        {selectedAnuncio && (
          <div className="trabajo-modal-overlay" onClick={closeModal}>
            <div className="trabajo-modal-content" onClick={e => e.stopPropagation()}>
              <button className="trabajo-modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>

              {selectedAnuncio.imagen_url && (
                <div className="trabajo-modal-imagen">
                  <img 
                    src={`${API_URL.replace('/api', '')}${selectedAnuncio.imagen_url}`} 
                    alt={selectedAnuncio.posicion}
                  />
                </div>
              )}

              <div className="trabajo-modal-body">
                <h2>{selectedAnuncio.posicion}</h2>

                {selectedAnuncio.remuneracion && (
                  <div className="trabajo-modal-remuneracion">
                    <i className="fas fa-money-bill-wave"></i>
                    <span>{selectedAnuncio.remuneracion}</span>
                  </div>
                )}

                <div className="trabajo-modal-section">
                  <h4><i className="fas fa-info-circle"></i> Descripción del puesto</h4>
                  <p>{selectedAnuncio.descripcion}</p>
                </div>

                <div className="trabajo-modal-section">
                  <h4><i className="fas fa-clipboard-list"></i> Requisitos</h4>
                  <ul className="trabajo-requisitos-lista">
                    {formatRequisitos(selectedAnuncio.requisitos).map((req, index) => (
                      <li key={index}>{req.trim().replace(/^-\s*/, '')}</li>
                    ))}
                  </ul>
                </div>

                <div className="trabajo-modal-footer">
                  <p className="trabajo-modal-cta">¿Te interesa esta posición?</p>
                  <button 
                    className="btn-aplicar-grande"
                    onClick={() => handleAplicar(selectedAnuncio)}
                  >
                    <i className="fab fa-whatsapp"></i>
                    Aplicar por WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SeccionTrabajo;
