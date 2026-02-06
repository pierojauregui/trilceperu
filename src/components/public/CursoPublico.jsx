import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CursoPublico.css';
import Footer from './Footer';
import FloatingWhatsApp from '../shared/FloatingWhatsApp';
import Chatbot from '../shared/Chatbot';
import Navbar from '../shared/Navbar';

const CursoPublico = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const [curso, setCurso] = useState(null);
  const [cursos, setCursos] = useState([]); // Para la búsqueda en Navbar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const sidebarRef = useRef(null);

  // HOOK PARA FORZAR STICKY CON JAVASCRIPT CON TRANSICIONES SUAVES
  useEffect(() => {
    const handleScroll = () => {
      if (sidebarRef.current && window.innerWidth > 968) {
        const sidebar = sidebarRef.current;
        const scrollY = window.scrollY;
        const headerHeight = 80;
        const topOffset = 150;
        const footerHeight = 200;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        const distanceFromBottom = documentHeight - (scrollY + windowHeight);
        
        // Agregar transición suave si no existe
        if (!sidebar.style.transition) {
          sidebar.style.transition = 'all 0.3s ease-in-out';
        }
        
        if (scrollY > headerHeight) {
          if (distanceFromBottom < footerHeight) {
            sidebar.style.position = 'absolute';
            sidebar.style.top = 'auto';
            sidebar.style.bottom = `${footerHeight + 20}px`;
            sidebar.style.right = '110px';
            sidebar.style.width = '380px';
            sidebar.style.transform = 'translateY(0)';
          } else {
            sidebar.style.position = 'fixed';
            sidebar.style.top = `${topOffset}px`;
            sidebar.style.bottom = 'auto';
            sidebar.style.right = '110px';
            sidebar.style.width = '380px';
            sidebar.style.transform = 'translateY(0)';
          }
        } else {
          sidebar.style.position = 'sticky';
          sidebar.style.top = `${topOffset}px`;
          sidebar.style.bottom = 'auto';
          sidebar.style.right = 'auto';
          sidebar.style.transform = 'translateY(0)';
        }
      } else if (sidebarRef.current && window.innerWidth <= 968) {
        // En vista móvil, resetear todos los estilos del sidebar
        const sidebar = sidebarRef.current;
        sidebar.style.position = '';
        sidebar.style.top = '';
        sidebar.style.bottom = '';
        sidebar.style.right = '';
        sidebar.style.width = '';
        sidebar.style.transform = '';
        sidebar.style.transition = '';
      }
    };

    // Ejecutar una vez al montar para establecer la transición inicial
    if (sidebarRef.current) {
      const sidebar = sidebarRef.current;
      if (window.innerWidth > 968) {
        sidebar.style.transition = 'all 0.3s ease-in-out';
      }
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // ✅ FUNCIÓN MEJORADA PARA PARSEAR CONTENIDO
  const parsearContenido = (contenido) => {
    if (!contenido) {
      return ['Sin contenido específico definido'];
    }

    try {
      // Intentar parsear como JSON
      const parsed = JSON.parse(contenido);
      
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && item !== "NADA" && item !== "");
      } else if (typeof parsed === 'string') {
        // Si es un string después del parse, dividir por saltos de línea
        return parsed
          .split(/\r?\n/)
          .map(line => line.trim())
          .filter(line => line && line !== "NADA" && line !== "");
      }
    } catch (e) {
      // No es JSON, es texto plano - dividir por saltos de línea
      const lineas = contenido
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line && line !== "NADA" && line !== "");
      
      if (lineas.length > 0) {
        return lineas;
      }
    }
    
    return ['Sin contenido específico definido'];
  };

  // ✅ FUNCIÓN MEJORADA PARA PARSEAR REQUISITOS
  const parsearRequisitos = (requisitos) => {
    if (!requisitos) {
      return ['Sin requisitos específicos'];
    }

    try {
      // Intentar parsear como JSON
      const parsed = JSON.parse(requisitos);
      
      if (Array.isArray(parsed)) {
        const filtrados = parsed.filter(item => item && item !== "NINGUNO" && item !== "");
        return filtrados.length > 0 ? filtrados : ['Sin requisitos específicos'];
      } else if (typeof parsed === 'string') {
        // Si es un string después del parse, dividir por saltos de línea
        const lineas = parsed
          .split(/\r?\n/)
          .map(line => line.trim())
          .filter(line => line && line !== "NINGUNO" && line !== "");
        
        return lineas.length > 0 ? lineas : ['Sin requisitos específicos'];
      }
    } catch (e) {
      // No es JSON, es texto plano - dividir por saltos de línea
      const lineas = requisitos
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line && line !== "NINGUNO" && line !== "");
      
      if (lineas.length > 0) {
        return lineas;
      }
    }
    
    return ['Sin requisitos específicos'];
  };

  // ✅ FUNCIÓN PARA CONSTRUIR URL DE IMAGEN CORRECTAMENTE
  const construirUrlImagen = (imagenUrl) => {
    if (!imagenUrl) return null;
    
    // Si ya tiene http:// o https://, devolverla tal cual
    if (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://')) {
      return imagenUrl;
    }
    
    // Si empieza con /, agregar solo el host
    if (imagenUrl.startsWith('/')) {
      return `${API_URL.replace('/api', '')}${imagenUrl}`;
    }
    
    // Si no tiene /, agregarla
    return `${API_URL.replace('/api', '')}/${imagenUrl}`;
  };

  // ✅ FUNCIÓN PARA CONSTRUIR URL DE VIDEO CORRECTAMENTE
  const construirUrlVideo = (videoUrl) => {
    if (!videoUrl) return null;
    
    // Si ya tiene http:// o https://, devolverla tal cual
    if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
      return videoUrl;
    }
    
    // Si empieza con /, agregar solo el host
    if (videoUrl.startsWith('/')) {
      return `${API_URL.replace('/api', '')}${videoUrl}`;
    }
    
    // Si no tiene /, agregarla
    return `${API_URL.replace('/api', '')}/${videoUrl}`;
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar el curso específico y todos los cursos en paralelo
        const [cursoResponse, cursosResponse] = await Promise.all([
          fetch(`${API_URL}/cursos/${id}`),
          fetch(`${API_URL}/cursos-disponibles`)
        ]);
        
        // Procesar curso específico
        if (cursoResponse.ok) {
          const data = await cursoResponse.json();
          console.log('📦 Datos recibidos del servidor:', data);
          
          if (data.success && data.curso) {
            const cursoData = {
              ...data.curso,
              categoria_nombre: data.curso.categoria || 'Sin categoría',
              // ✅ Parsear contenido y requisitos con las nuevas funciones
              contenido: parsearContenido(data.curso.contenido),
              requisitos: parsearRequisitos(data.curso.requisitos),
              precio: data.curso.precio_real || data.curso.precio,
              precio_oferta: data.curso.precio_oferta,
              // ✅ Construir URL de imagen correctamente
              imagen_url: construirUrlImagen(data.curso.imagen_url),
              video_url: construirUrlVideo(data.curso.video_url)
            };
            
            console.log('✅ Curso procesado:', cursoData);
            console.log('🖼️ URL de imagen:', cursoData.imagen_url);
            console.log('🎥 URL de video:', cursoData.video_url);
            console.log('📝 Contenido parseado:', cursoData.contenido);
            console.log('📋 Requisitos parseados:', cursoData.requisitos);
            
            setCurso(cursoData);
          } else {
            // Datos de ejemplo si falla
            const cursoEjemplo = {
              id: parseInt(id),
              nombre: 'Curso Intensivo - Nombramiento Docente 2025',
              descripcion: 'Este es el curso que te prepara para obtener tu nombramiento en 2025.',
              precio: 350,
              precio_oferta: 250,
              nivel: 'Todos los niveles',
              categoria_nombre: 'MARKETING',
              duracion_horas: 360,
              numero_modulos: 4,
              modalidad: 'Online',
              activo: true,
              video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
              imagen_url: 'https://via.placeholder.com/350x200/667eea/ffffff?text=Vista+Previa',
              contenido: [
                'Introducción al tema', 
                'Conceptos fundamentales', 
                'Ejercicios prácticos', 
                'Evaluación final'
              ],
              requisitos: [
                'Conocimientos básicos de lectura', 
                'Acceso a internet', 
                'Dispositivo con navegador web'
              ]
            };
            setCurso(cursoEjemplo);
          }
        } else {
          setError('Curso no encontrado');
        }

        // Procesar lista de cursos para la búsqueda
        if (cursosResponse.ok) {
          const cursosData = await cursosResponse.json();
          if (cursosData.success && (cursosData.cursos || cursosData.data)) {
            setCursos(cursosData.cursos || cursosData.data);
          }
        }
        
      } catch (error) {
        console.error('❌ Error cargando datos:', error);
        setError('Error al cargar el curso');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleRegister = () => {
    navigate('/registro');
  };

  const openVideoModal = () => {
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeVideoModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (loading) {
    return (
      <div className="curso-loading">
        <div className="loading-spinner"></div>
        <p>Cargando curso...</p>
      </div>
    );
  }

  if (error || !curso) {
    return (
      <div className="curso-error">
        <h2>Error</h2>
        <p>{error || 'Curso no encontrado'}</p>
        <button onClick={handleBackToHome} className="btn-volver-atras">
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="curso-publico-container">
      <Navbar showSearch={true} cursos={cursos} />

      <main className="curso-main">
        <div className="main-container">
          <div className="main-grid">
            <div className="main-content">
              <section className="curso-hero">
                <div className="curso-meta-detalles">
                  <span className="curso-categoria-detalles">{curso.categoria_nombre}</span>
                </div>
                <h1>{curso.nombre}</h1>
                <p className="curso-descripcion">{curso.descripcion}</p>
                
                <div className="curso-details">
                  <div className="detail-item">
                    <strong>Módulos:</strong> 
                    <span>{curso.numero_modulos || 4} módulos</span>
                  </div>
                  <div className="detail-item">
                    <strong>Duración:</strong> 
                    <span>{curso.duracion_horas || 360} horas</span>
                  </div>
                </div>

                <div className="curso-actions-detalles">
                  <button onClick={handleRegister} className="btn-inscribirse">
                    Inscribirse ahora
                  </button>
                </div>
              </section>

              <section className="curso-content">
                {/* LO QUE APRENDERÁS */}
                <section className="seccion-aprendizaje">
                  <h2>Lo que aprenderás</h2>
                  <div className="lista-aprendizaje">
                    {curso.contenido && curso.contenido.length > 0 ? (
                      curso.contenido.map((item, index) => (
                        <div key={index} className="item-aprendizaje">
                          <span className="check-icon">✓</span>
                          <span>{item}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="item-aprendizaje">
                          <span className="check-icon">✓</span>
                          <span>Dominarás todos los conceptos fundamentales del curso</span>
                        </div>
                        <div className="item-aprendizaje">
                          <span className="check-icon">✓</span>
                          <span>Aplicarás técnicas y metodologías actualizadas</span>
                        </div>
                      </>
                    )}
                  </div>
                </section>

                {/* REQUISITOS */}
                <section className="seccion-requisitos">
                  <h2>Requisitos</h2>
                  <div className="lista-requisitos">
                    {curso.requisitos && curso.requisitos.length > 0 ? (
                      <ul>
                        {curso.requisitos.map((requisito, index) => (
                          <li key={index}>{requisito}</li>
                        ))}
                      </ul>
                    ) : (
                      <ul>
                        <li>Motivación y dedicación para completar el curso</li>
                        <li>Acceso a internet y dispositivo para seguir las clases</li>
                        <li>No se requieren conocimientos previos específicos</li>
                      </ul>
                    )}
                  </div>
                </section>

                {/* INSTRUCTORES */}
                {curso.profesores && curso.profesores.length > 0 && (
                  <section className="curso-instructores-section">
                    <h2>Instructores</h2>
                    <div className="curso-instructores-grid">
                      {curso.profesores.map((profesor, index) => (
                        <div key={profesor.id || index} className="curso-instructor-card">
                          <div className="curso-instructor-layout">
                            <h3 className="curso-instructor-title">
                              <a href="#" className="curso-instructor-link">{profesor.nombre_completo}</a>
                            </h3>
                            <p className="curso-instructor-specialty">{profesor.area || 'Educación Especializada'}</p>
                          </div>
                          
                          <div className="curso-instructor-content">
                            <div className="curso-instructor-photo">
                              {profesor.imagen_perfil ? (
                                <img 
                                  src={`${API_URL.replace('/api', '')}/${profesor.imagen_perfil}`}
                                  alt={profesor.nombre_completo}
                                  className="curso-instructor-img"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className="curso-instructor-fallback"
                                style={{ display: profesor.imagen_perfil ? 'none' : 'flex' }}
                              >
                                <span className="curso-instructor-letters">
                                  {profesor.nombres?.charAt(0)}{profesor.apellidos?.charAt(0)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="curso-instructor-metrics">
                              <div className="curso-metric-row">
                                <span className="curso-metric-icon">⭐</span>
                                <span className="curso-metric-label">Calificación del Instructor: <strong>{(4.5 + Math.random() * 0.5).toFixed(1)}</strong></span>
                              </div>
                              <div className="curso-metric-row">
                                <span className="curso-metric-icon">📝</span>
                                <span className="curso-metric-label"><strong>{Math.floor(15000 + Math.random() * 10000).toLocaleString()}</strong> reseñas</span>
                              </div>
                              <div className="curso-metric-row">
                                <span className="curso-metric-icon">🎓</span>
                                <span className="curso-metric-label">Docente formador <strong>MINEDU</strong></span>
                              </div>
                              <div className="curso-metric-row">
                                <span className="curso-metric-icon">👥</span>
                                <span className="curso-metric-label"><strong>{Math.floor(50000 + Math.random() * 30000).toLocaleString()}</strong> estudiantes</span>
                              </div>
                            </div>
                          </div>
                          
                          {profesor.descripcion && (
                            <div className="curso-instructor-bio">
                              <p>{profesor.descripcion}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* DESCRIPCIÓN */}
                <section className="seccion-descripcion">
                  <h2>Descripción</h2>
                  <div className="descripcion-completa">
                    <p>{curso.descripcion}</p>
                    <p>
                      Este curso ha sido diseñado cuidadosamente para brindarte una experiencia de aprendizaje 
                      completa y efectiva. A través de contenido actualizado y metodologías probadas, 
                      te guiaremos paso a paso hacia el dominio de los temas más importantes.
                    </p>
                  </div>
                </section>

                {/* PARA QUIÉN ES ESTE CURSO */}
                <section className="seccion-audiencia">
                  <h2>¿Para quién es este curso?</h2>
                  <div className="lista-audiencia">
                    <ul>
                      <li>Estudiantes que buscan ampliar sus conocimientos en {curso.categoria_nombre || 'esta área'}</li>
                      <li>Profesionales que desean actualizar sus competencias</li>
                      <li>Personas interesadas en desarrollar nuevas habilidades</li>
                      <li>Cualquier persona motivada por aprender y crecer profesionalmente</li>
                    </ul>
                  </div>
                </section>
              </section>
            </div>

            {/* SIDEBAR STICKY */}
            <aside className="main-sidebar">
              <div className="inscripcion-card-sticky" ref={sidebarRef}>
                <h3>Inscríbete ahora</h3>
                
                {/* ✅ PREVIEW DE VIDEO/IMAGEN MEJORADO */}
                {(curso.video_url || curso.imagen_url) && (
                  <div 
                    className="sidebar-video-preview" 
                    onClick={curso.video_url ? openVideoModal : undefined}
                    style={{ cursor: curso.video_url ? 'pointer' : 'default' }}
                  >
                    <div className="video-thumbnail-sidebar">
                      {curso.video_url && (
                        <div className="play-overlay-sidebar">
                          <div className="play-button-sidebar">▶</div>
                        </div>
                      )}
                      <img 
                        src={curso.imagen_url || 'https://via.placeholder.com/350x200/667eea/ffffff?text=Vista+Previa'} 
                        alt="Vista previa del curso" 
                        className="sidebar-preview-image"
                        onError={(e) => {
                          console.error('❌ Error cargando imagen:', e.target.src);
                          e.target.src = 'https://via.placeholder.com/350x200/667eea/ffffff?text=Sin+Imagen';
                        }}
                        onLoad={() => {
                          console.log('✅ Imagen cargada correctamente:', curso.imagen_url);
                        }}
                      />
                    </div>
                    {curso.video_url && (
                      <p className="sidebar-video-label">Vista previa de este curso</p>
                    )}
                  </div>
                )}
                
                {/* PRECIO */}
                <div className="precio-card">
                  {curso.precio_oferta && parseFloat(curso.precio_oferta) < parseFloat(curso.precio) ? (
                    <>
                      <div className="precio-container">
                        <span className="precio-oferta-grande">S/ {parseFloat(curso.precio_oferta).toFixed(2)}</span>
                        <span className="precio-original-tachado">S/ {parseFloat(curso.precio).toFixed(2)}</span>
                      </div>
                      <div className="descuento-badge">
                        {Math.round(((parseFloat(curso.precio) - parseFloat(curso.precio_oferta)) / parseFloat(curso.precio)) * 100)}% DE DESCUENTO
                      </div>
                    </>
                  ) : (
                    <span className="precio-actual-card">S/ {parseFloat(curso.precio).toFixed(2)}</span>
                  )}
                </div>
                
                {/* BOTÓN INSCRIPCIÓN */}
                <button onClick={handleRegister} className="btn-inscripcion-full">
                  Comenzar ahora
                </button>
                
                {/* BOTÓN WHATSAPP */}
                <a 
                  href={`https://wa.me/51999999999?text=Hola,%20estoy%20interesado%20en%20el%20curso%20de%20${encodeURIComponent(curso.nombre)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  <svg className="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Chatea con nosotros
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      {/* MODAL DE VIDEO */}
      {showVideoModal && curso.video_url && (
        <div className="video-modal-overlay" onClick={closeVideoModal}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-cerrar-modal-video" onClick={closeVideoModal}>
             X
            </button>
            <div className="video-modal-header">
              <h3>{curso.nombre}</h3>
              <p>Vista previa del curso</p>
            </div>
            <div className="modal-video-wrapper">
              <video 
                controls 
                autoPlay
                controlsList="nodownload"
                preload="metadata"
                className="modal-video"
                poster={curso.imagen_url}
              >
                <source src={curso.video_url} type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          </div>
        </div>
      )}
      
      <FloatingWhatsApp />
      <Chatbot />
    </div>
  );
};

export default CursoPublico;