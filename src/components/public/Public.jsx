import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Public.css';
import Footer from './Footer';
import Chatbot from '../shared/Chatbot';
import FloatingWhatsApp from '../shared/FloatingWhatsApp';
import HeroSlider from '../shared/HeroSlider';
import Navbar from '../shared/Navbar';

const API_URL = import.meta.env.VITE_API_URL;

const Public = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 1,
    minutes: 51,
    seconds: 23
  });
  const navigate = useNavigate();

  useEffect(() => {
    const cargarCursos = async () => {
      try {
        const response = await fetch(`${API_URL}/cursos-disponibles`);
        if (response.ok) {
          const data = await response.json();
          console.log('Respuesta de la API:', data); // Para debug
          if (data.success && (data.cursos || data.data)) {
            // La API puede devolver los cursos en data.cursos o data.data
            setCursos(data.cursos || data.data);
          } else {
            console.error('Respuesta de API sin cursos:', data);
            setCursos([]);
          }
        } else {
          console.error('Error al cargar cursos:', response.status);
          setCursos([]);
        }
      } catch (error) {
        console.error('Error conectando con la API:', error);
        setCursos([]);
      } finally {
        setLoading(false);
      }
    };
    
    cargarCursos();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const { hours, minutes, seconds } = prevTime;
        
        if (seconds > 0) {
          return { ...prevTime, seconds: seconds - 1 };
        } else if (minutes > 0) {
          return { ...prevTime, minutes: minutes - 1, seconds: 59 };
        } else if (hours > 0) {
          return { hours: hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Timer finished, reset to 1 hour
          return { hours: 1, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/registro');
  };

  if (loading) {
    return (
      <div className="public-loading">
        <div className="loading-spinner"></div>
        <p>Cargando cursos...</p>
      </div>
    );
  }

  return (
    <div className="public-container">
      {/* Navbar Component */}
      <Navbar showSearch={true} cursos={cursos} />

      {/* Hero Section with Slider */}
      <HeroSlider />

      {/* Courses Section */}
      <section className="courses-section">
        <div className="courses-container">
          <h2 className="courses-title">Nuestros Cursos</h2>
          <div className="courses-grid">
            {cursos.length > 0 ? cursos.map((curso, index) => (
              <article key={`curso-${curso.id}-${index}`} className="course-card">
                {/* Imagen del curso */}
                <div className="course-image-wrapper">
                  <img 
                    src={curso.imagen_url ? `${API_URL.replace('/api', '')}${curso.imagen_url}` : '/images/default-course.svg'} 
                    alt={curso.nombre}
                    className="course-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/images/default-course.svg';
                    }} 
                  />
                  <div className="course-category-badge">
                    {curso.categoria || 'Sin categoría'}
                  </div>
                </div>
                
                {/* Contenido del curso */}
                <div className="course-content">
                  <h4 className="course-title">{curso.nombre}</h4>
                  <p className="course-description">{curso.descripcion}</p>
                  
                  <div className="course-meta">
                    <div className="course-info">
                      <span className="course-modules">
                        📚 {curso.numero_modulos || 0} módulos • ⏱️ {curso.duracion_horas || 0} horas
                      </span>
                    </div>
                    
                    <div className="course-pricing">
                      {curso.precio_oferta && parseFloat(curso.precio_oferta) < parseFloat(curso.precio_real) ? (
                        <>
                          <span className="price-offer">S/ {parseFloat(curso.precio_oferta).toFixed(2)}</span>
                          <span className="price-original">S/ {parseFloat(curso.precio_real).toFixed(2)}</span>
                          <span className="price-discount">
                            -{Math.round(((curso.precio_real - curso.precio_oferta) / curso.precio_real) * 100)}%
                          </span>
                        </>
                      ) : (
                        <span className="price-current">S/ {parseFloat(curso.precio_real || 0).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="course-actions">
                    <button 
                      className="btn-view"
                      onClick={() => navigate(`/curso/${curso.id}`)}
                    >
                      Ver Detalles
                    </button>
                    <button 
                      className="btn-enroll"
                      onClick={() => navigate('/registro')}
                    >
                      Inscribirse
                    </button>
                  </div>
                </div>
              </article>
            )) : (
              <div className="no-courses-message">
                <p>No hay cursos disponibles en este momento.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      
      {/* Componentes flotantes */}
      <FloatingWhatsApp />
      <Chatbot />
    </div>
  );
};

export default Public;