import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../shared/Navbar';
import Footer from './Footer';
import './TrabajaConNosotros.css';

const TrabajaConNosotros = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const [anuncios, setAnuncios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnuncio, setSelectedAnuncio] = useState(null);

  // Número de WhatsApp para aplicaciones
  const whatsappNumber = "51987654321";

  useEffect(() => {
    cargarAnuncios();
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      const response = await fetch(`${API_URL}/cursos-disponibles`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && (data.cursos || data.data)) {
          setCursos(data.cursos || data.data);
        }
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    }
  };

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

  return (
    <div className="tcn-page">
      <Navbar showSearch={true} cursos={cursos} />
      
      <main className="tcn-main">
        {/* Hero Section */}
        <section className="tcn-hero">
          <div className="tcn-hero-content">
            <h1>Trabaja con Nosotros</h1>
            <p>
              Únete al equipo líder en educación digital del Perú. Buscamos profesionales 
              apasionados que quieran transformar el futuro educativo.
            </p>
            <div className="tcn-hero-stats">
              <div className="tcn-stat-item">
                <span className="tcn-stat-number">25+</span>
                <span className="tcn-stat-label">Años de Experiencia</span>
              </div>
              <div className="tcn-stat-item">
                <span className="tcn-stat-number">100+</span>
                <span className="tcn-stat-label">Colaboradores</span>
              </div>
              <div className="tcn-stat-item">
                <span className="tcn-stat-number">15k+</span>
                <span className="tcn-stat-label">Docentes Capacitados</span>
              </div>
            </div>
          </div>
        </section>

        <div className="tcn-content">
          {/* Por qué trabajar con nosotros */}
          <section className="tcn-why-section">
            <div className="tcn-section-title">
              <h2>¿Por qué unirte a TRILCE PERÚ?</h2>
              <p>Descubre los beneficios de ser parte de nuestro equipo</p>
            </div>

            <div className="tcn-benefits-grid">
              <div className="tcn-benefit-card">
                <div className="tcn-benefit-icon">
                  <i className='bx bx-trophy'></i>
                </div>
                <h3>Liderazgo Educativo</h3>
                <p>Trabaja en la institución pionera en capacitación docente digital del Perú</p>
              </div>

              <div className="tcn-benefit-card">
                <div className="tcn-benefit-icon">
                  <i className='bx bx-rocket'></i>
                </div>
                <h3>Innovación Constante</h3>
                <p>Accede a las últimas tecnologías y metodologías educativas</p>
              </div>

              <div className="tcn-benefit-card">
                <div className="tcn-benefit-icon">
                  <i className='bx bx-group'></i>
                </div>
                <h3>Equipo Excepcional</h3>
                <p>Colabora con profesionales apasionados y comprometidos</p>
              </div>

              <div className="tcn-benefit-card">
                <div className="tcn-benefit-icon">
                  <i className='bx bx-trending-up'></i>
                </div>
                <h3>Crecimiento Profesional</h3>
                <p>Capacitación continua y oportunidades de desarrollo</p>
              </div>
            </div>
          </section>

          {/* Ofertas de trabajo */}
          <section className="tcn-jobs-section">
            <div className="tcn-section-title">
              <span className="tcn-jobs-badge">💼 Ofertas Disponibles</span>
              <h2>Posiciones Abiertas</h2>
              <p>Encuentra la oportunidad perfecta para ti</p>
            </div>

            {loading ? (
              <div className="tcn-loading">
                <div className="tcn-spinner"></div>
                <p>Cargando ofertas de trabajo...</p>
              </div>
            ) : anuncios.length === 0 ? (
              <div className="tcn-no-jobs">
                <div className="tcn-no-jobs-icon">
                  <i className='bx bx-briefcase'></i>
                </div>
                <h3>No hay vacantes disponibles</h3>
                <p>Por el momento no tenemos posiciones abiertas, pero puedes dejarnos tu CV para futuras oportunidades.</p>
              </div>
            ) : (
              <div className="tcn-jobs-grid">
                {anuncios.map(anuncio => (
                  <article key={anuncio.id} className="tcn-job-card">
                    {anuncio.imagen_url && (
                      <div className="tcn-job-image">
                        <img 
                          src={`${API_URL.replace('/api', '')}${anuncio.imagen_url}`} 
                          alt={anuncio.posicion}
                        />
                      </div>
                    )}
                    
                    <div className="tcn-job-content">
                      <h3 className="tcn-job-title">{anuncio.posicion}</h3>
                      
                      <p className="tcn-job-description">
                        {anuncio.descripcion.length > 130 
                          ? `${anuncio.descripcion.substring(0, 130)}...` 
                          : anuncio.descripcion}
                      </p>

                      {anuncio.remuneracion && (
                        <div className="tcn-job-salary">
                          <i className='bx bx-money'></i>
                          <span>{anuncio.remuneracion}</span>
                        </div>
                      )}

                      <div className="tcn-job-actions">
                        <button 
                          className="tcn-btn-details"
                          onClick={() => openModal(anuncio)}
                        >
                          Ver detalles
                        </button>
                        <button 
                          className="tcn-btn-apply"
                          onClick={() => handleAplicar(anuncio)}
                        >
                          <i className='bx bxl-whatsapp'></i>
                          Aplicar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* CTA Section */}
          <section className="tcn-cta-section">
            <h3>¿No encuentras tu posición ideal?</h3>
            <p>
              Envíanos tu CV y serás considerado para futuras oportunidades 
              que se ajusten a tu perfil profesional.
            </p>
            <div className="tcn-cta-buttons">
              <a href="/contacto" className="tcn-cta-btn primary">
                <i className='bx bx-envelope'></i>
                Contáctanos
              </a>
              <a href="/acerca-de-nosotros" className="tcn-cta-btn secondary">
                Conoce más sobre nosotros
              </a>
            </div>
          </section>
        </div>

        {/* Modal de detalle */}
        {selectedAnuncio && (
          <div className="tcn-modal-overlay" onClick={closeModal}>
            <div className="tcn-modal-content" onClick={e => e.stopPropagation()}>
              <button className="tcn-modal-close" onClick={closeModal}>
                <i className='bx bx-x'></i>
              </button>

              {selectedAnuncio.imagen_url ? (
                <div className="tcn-modal-image">
                  <img 
                    src={`${API_URL.replace('/api', '')}${selectedAnuncio.imagen_url}`} 
                    alt={selectedAnuncio.posicion}
                  />
                </div>
              ) : (
                <div className="tcn-modal-image">
                  {/* Placeholder gradient si no hay imagen */}
                </div>
              )}

              <div className="tcn-modal-body">
                <h2>{selectedAnuncio.posicion}</h2>

                {selectedAnuncio.remuneracion && (
                  <div className="tcn-modal-salary">
                    <i className='bx bx-money'></i>
                    <span>{selectedAnuncio.remuneracion}</span>
                  </div>
                )}

                <div className="tcn-modal-section">
                  <h4><i className='bx bx-info-circle'></i> Descripción del puesto</h4>
                  <p>{selectedAnuncio.descripcion}</p>
                </div>

                <div className="tcn-modal-section">
                  <h4><i className='bx bx-list-check'></i> Requisitos</h4>
                  <ul className="tcn-requisitos-list">
                    {formatRequisitos(selectedAnuncio.requisitos).map((req, index) => (
                      <li key={index}>{req.trim().replace(/^[-•]\s*/, '')}</li>
                    ))}
                  </ul>
                </div>

                <div className="tcn-modal-footer">
                  <p className="tcn-modal-cta">¿Te interesa esta posición?</p>
                  <button 
                    className="tcn-btn-apply-large"
                    onClick={() => handleAplicar(selectedAnuncio)}
                  >
                    <i className='bx bxl-whatsapp'></i>
                    Aplicar por WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TrabajaConNosotros;