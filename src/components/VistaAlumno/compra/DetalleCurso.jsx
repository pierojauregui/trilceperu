import React, { useState, useEffect, useRef } from 'react';
import './DetalleCurso.css';

const DetalleCurso = ({ curso, onVolver, onComprar }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [cursoCompleto, setCursoCompleto] = useState(curso);
  const [loading, setLoading] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const sidebarRef = useRef(null);

  // Obtener datos completos del curso con profesores
  useEffect(() => {
    const obtenerCursoCompleto = async () => {
      if (!curso?.id) return;
      
      try {
        setLoading(true);
        console.log('🔄 Obteniendo datos completos del curso:', curso.id);
        
        const response = await fetch(`${API_URL}/cursos/${curso.id}`);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Datos completos recibidos:', data);
          
          if (data.success && data.curso) {
            // Combinar datos básicos con datos completos
            setCursoCompleto({
              ...curso,
              ...data.curso,
              profesores: data.curso.profesores || [],
              // ✅ Construir URL de video correctamente
              video_url: construirUrlVideo(data.curso.video_url)
            });
            console.log('👨‍🏫 Profesores encontrados:', data.curso.profesores);
            console.log('🎥 URL de video:', construirUrlVideo(data.curso.video_url));
          }
        } else {
          console.error('❌ Error al obtener curso completo:', response.status);
        }
      } catch (error) {
        console.error('❌ Error en la petición:', error);
      } finally {
        setLoading(false);
      }
    };

    obtenerCursoCompleto();
  }, [curso?.id]);

  // HOOK PARA FORZAR STICKY CON JAVASCRIPT CON TRANSICIONES SUAVES
  useEffect(() => {
    const handleScroll = () => {
      if (sidebarRef.current && window.innerWidth > 968) {
        const sidebar = sidebarRef.current;
        const scrollY = window.scrollY;
        const headerHeight = 10;
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
            sidebar.style.bottom = '100px';
            sidebar.style.right = '10px';
            sidebar.style.width = '380px';
            sidebar.style.transform = 'translateY(0)';
          } else {
            sidebar.style.position = 'fixed';
            sidebar.style.top = `${topOffset}px`;
            sidebar.style.bottom = '100px';
            sidebar.style.right = '10px';
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

  if (!curso) {
    return (
      <div className="detalle-curso-container">
        <div className="curso-no-encontrado">
          <h2>Curso no encontrado</h2>
          <button onClick={onVolver} className="btn-volver">
            Volver a cursos
          </button>
        </div>
      </div>
    );
  }

  // ✅ PARSEAR DATOS REALES DEL CURSO
  const contenidoParsed = parsearContenido(cursoCompleto.contenido);
  const requisitosParsed = parsearRequisitos(cursoCompleto.requisitos);
  const imagenUrl = construirUrlImagen(cursoCompleto.imagen_url);

  // Calcular precios usando cursoCompleto
  const precioOriginal = parseFloat(cursoCompleto.precio_real || cursoCompleto.precio || 0);
  const precioOferta = parseFloat(cursoCompleto.precio_oferta || 0);
  const precioFinal = precioOferta > 0 && precioOferta < precioOriginal ? precioOferta : precioOriginal;
  const descuento = precioOferta > 0 && precioOriginal > precioFinal 
    ? Math.round(((precioOriginal - precioFinal) / precioOriginal) * 100) 
    : 0;

  // Funciones para el modal de video
  const openVideoModal = (url) => {
    setVideoUrl(url);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setVideoUrl('');
  };

  return (
    <div className="detalle-curso-container">
      {/* Botón volver arriba de todo el contenido */}
      <div className="top-navigation">
        <button onClick={onVolver} className="btn-volver-top">
          ← Volver a cursos
        </button>
      </div>

      {/* Header con imagen y información básica */}
      <div className="curso-header">
        {/* Contenido principal del header */}
        <div className="header-content">
          <div className="curso-imagen-container">
            <img 
              src={imagenUrl || '/images/default-course.svg'} 
              alt={curso.nombre}
              className="imagen-curso"
              onError={(e) => {
                e.target.src = '/images/default-course.svg';
              }}
            />
            {cursoCompleto.video_url && (
              <div className="video-preview-overlay">
                <button 
                  className="preview-button"
                  onClick={() => openVideoModal(cursoCompleto.video_url)}
                  title="Vista previa del curso"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                  </svg>
                  Vista previa
                </button>
              </div>
            )}
            <div className="curso-categoria-badge">
              {curso.categoria || curso.categoria_nombre || 'Sin categoría'}
            </div>
          </div>
          
          <div className="curso-info-principal">
            <h1 className="curso-titulo">{cursoCompleto.nombre}</h1>
            
            <div className="curso-meta-info">
              <div className="curso-modulos">
                📚 {cursoCompleto.numero_modulos || 'N/A'} módulos
              </div>
              <div className="curso-duracion">
                ⏱️ {cursoCompleto.duracion_horas || 'N/A'} horas
              </div>
              <div className="curso-horarios-disponibles">
                🎯 {cursoCompleto.categoria || 'Categoría general'}
              </div>
            </div>

            {/* Precio y botón de compra */}
            <div className="curso-precio-section">
              <div className="precio-info">
                {descuento > 0 ? (
                  <>
                    <span className="precio-actual">S/ {precioFinal.toFixed(2)}</span>
                    <span className="precio-original">S/ {precioOriginal.toFixed(2)}</span>
                    <span className="descuento-badge">-{descuento}%</span>
                  </>
                ) : (
                  <span className="precio-actual">S/ {precioFinal.toFixed(2)}</span>
                )}
              </div>
              <button onClick={onComprar} className="btn-comprar-principal">
                Comprar Ahora
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="curso-contenido">
        <div className="contenido-principal">
          
          {/* Lo que aprenderás */}
          <section className="seccion-aprendizaje">
            <h2>Lo que aprenderás</h2>
            <div className="lista-aprendizaje">
              {contenidoParsed && contenidoParsed.length > 0 ? (
                contenidoParsed.map((item, index) => (
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
                  <div className="item-aprendizaje">
                    <span className="check-icon">✓</span>
                    <span>Desarrollarás habilidades prácticas y profesionales</span>
                  </div>
                  <div className="item-aprendizaje">
                    <span className="check-icon">✓</span>
                    <span>Obtendrás certificación al completar el programa</span>
                  </div>
                </>
              )}
            </div>
          </section>

        



          {/* Requisitos */}
          <section className="seccion-requisitos">
            <h2>Requisitos</h2>
            <div className="lista-requisitos">
              {requisitosParsed && requisitosParsed.length > 0 ? (
                <>
                  <p>Este programa está diseñado para estudiantes comprometidos con su aprendizaje:</p>
                  <ul>
                    {requisitosParsed.map((requisito, index) => (
                      <li key={index}>{requisito}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <p>Este programa está diseñado para estudiantes comprometidos con su aprendizaje:</p>
                  <ul>
                    <li>Motivación y dedicación para completar el curso</li>
                    <li>Acceso a internet y dispositivo para seguir las clases</li>
                    <li>No se requieren conocimientos previos específicos</li>
                    <li>Ganas de aprender y aplicar nuevos conocimientos</li>
                  </ul>
                </>
              )}
            </div>
          </section>

          {/* Descripción */}
          <section className="seccion-descripcion">
            <h2>Descripción</h2>
            <div className="descripcion-completa">
              <p>{cursoCompleto.descripcion}</p>
              <p>
                Este curso ha sido diseñado cuidadosamente para brindarte una experiencia de aprendizaje 
                completa y efectiva. A través de contenido actualizado y metodologías probadas, 
                te guiaremos paso a paso hacia el dominio de los temas más importantes.
              </p>
              <p>
                Al finalizar, habrás adquirido las competencias necesarias para aplicar 
                lo aprendido en situaciones reales y avanzar en tu desarrollo profesional.
              </p>
            </div>
          </section>

          {/* Para quién es este curso */}
          <section className="seccion-audiencia">
            <h2>¿Para quién es este curso?</h2>
            <div className="lista-audiencia">
              <ul>
                <li>Estudiantes que buscan ampliar sus conocimientos en {cursoCompleto.categoria || 'esta área'}</li>
                <li>Profesionales que desean actualizar sus competencias</li>
                <li>Personas interesadas en desarrollar nuevas habilidades</li>
                <li>Cualquier persona motivada por aprender y crecer profesionalmente</li>
              </ul>
            </div>
          </section>

          {/* Instructores Mejorados */}
          {console.log('🔍 DEBUG - Datos del curso completo:', cursoCompleto)}
          {console.log('👨‍🏫 DEBUG - Profesores:', cursoCompleto.profesores)}
          {(cursoCompleto.profesores && cursoCompleto.profesores.length > 0) && (
            <section className="detalle-instructores-section">
              <h2>Instructores</h2>
              <div className="detalle-instructores-grid">
                {cursoCompleto.profesores.map((profesor, index) => {
                  console.log(`🖼️ DEBUG - Profesor ${index}:`, profesor);
                  console.log(`🖼️ DEBUG - imagen_perfil:`, profesor.imagen_perfil);
                  console.log(`🖼️ DEBUG - URL generada:`, `${API_URL.replace('/api', '')}/${profesor.imagen_perfil}`);
                  
                  return (
                <div key={profesor.id || index} className="detalle-instructor-card">
                  <div className="detalle-instructor-layout">
                    <div className="detalle-instructor-photo">
                      {profesor.imagen_perfil ? (
                        <img 
                          src={`${API_URL.replace('/api', '')}/${profesor.imagen_perfil}`} 
                          alt={profesor.nombre_completo}
                          className="detalle-instructor-img"
                          onError={(e) => {
                            console.error('❌ ERROR cargando imagen:', e.target.src);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          onLoad={() => {
                            console.log('✅ Imagen cargada correctamente:', `${API_URL.replace('/api', '')}/${profesor.imagen_perfil}`);
                          }}
                        />
                      ) : null}
                      <div 
                        className="detalle-instructor-fallback" 
                        style={{ display: profesor.imagen_perfil ? 'none' : 'flex' }}
                      >
                        {profesor.nombre_completo ? profesor.nombre_completo.split(' ').map(n => n[0]).join('').toUpperCase() : 'PR'}
                      </div>
                    </div>
                    
                    <div className="detalle-instructor-content">
                      <h3 className="detalle-instructor-title">
                        <span className="detalle-instructor-link">
                          {profesor.nombre_completo}
                        </span>
                      </h3>
                      <p className="detalle-instructor-specialty">{profesor.area}</p>
                      
                      <div className="detalle-instructor-metrics">
                        <div className="detalle-metric-row">
                          <span className="detalle-metric-icon">⭐</span>
                          <span className="detalle-metric-label">Calificación del Instructor: <strong>4.8</strong></span>
                        </div>
                        <div className="detalle-metric-row">
                          <span className="detalle-metric-icon">📝</span>
                          <span className="detalle-metric-label"><strong>18,500</strong> reseñas</span>
                        </div>
                        <div className="detalle-metric-row">
                          <span className="detalle-metric-icon">🎓</span>
                          <span className="detalle-metric-label">Docente formador <strong>MINEDU</strong></span>
                        </div>
                        <div className="detalle-metric-row">
                          <span className="detalle-metric-icon">👥</span>
                          <span className="detalle-metric-label"><strong>65,000</strong> estudiantes</span>
                        </div>
                      </div>
                      
                      <div className="detalle-instructor-bio">
                        <p>
                          {profesor.descripcion || `Profesor ${profesor.nombre_completo} es especialista en ${profesor.area} con amplia experiencia en diseño centrado en el usuario, investigación de usabilidad y prototipado digital. Además, imparte clases de francés, combinando creatividad, comunicación y una metodología pedagógica moderna.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                );
                })}
              </div>
            </section>
          )}

          {/* Instructores Originales (fallback para asignaciones) */}
          {false && (!curso.profesores || curso.profesores.length === 0) && curso.asignaciones && curso.asignaciones.length > 0 && (
            <section className="seccion-instructores">
              <h2>Instructores</h2>
              <div className="lista-instructores">
                {curso.asignaciones.map((asignacion, index) => (
                  <div key={index} className="instructor-card">
                    <div className="instructor-info">
                      <h3>Prof. {asignacion.nombre_profesor}</h3>
                      <p className="instructor-horario">Horario: {asignacion.horario}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar con información adicional */}
        <div className="sidebar-info" ref={sidebarRef}>
          <div className="card-compra">
            {/* ✅ PREVIEW DE VIDEO/IMAGEN MEJORADO - IGUAL QUE CursoPublico.jsx */}
            {(cursoCompleto.video_url || imagenUrl) && (
              <div 
                className="sidebar-video-preview" 
                onClick={cursoCompleto.video_url ? () => openVideoModal(cursoCompleto.video_url) : undefined}
                style={{ cursor: cursoCompleto.video_url ? 'pointer' : 'default' }}
              >
                <div className="video-thumbnail-sidebar">
                  {cursoCompleto.video_url && (
                    <div className="play-overlay-sidebar">
                      <div className="play-button-sidebar">▶</div>
                    </div>
                  )}
                  <img 
                    src={imagenUrl || '/images/default-course.svg'} 
                    alt="Vista previa del curso" 
                    className="sidebar-preview-image"
                    onError={(e) => {
                      console.error('❌ Error cargando imagen:', e.target.src);
                      e.target.src = '/images/default-course.svg';
                    }}
                    onLoad={() => {
                      console.log('✅ Imagen cargada correctamente:', imagenUrl);
                    }}
                  />
                </div>
                {cursoCompleto.video_url && (
                  <p className="sidebar-video-label">Vista previa de este curso</p>
                )}
              </div>
            )}
            
            <div className="precio-sidebar">
              {descuento > 0 ? (
                <>
                  <span className="precio-grande">S/ {precioFinal.toFixed(2)}</span>
                  <span className="precio-tachado">S/ {precioOriginal.toFixed(2)}</span>
                  <span className="descuento-porcentaje">-{descuento}%</span>
                </>
              ) : (
                <span className="precio-grande">S/ {precioFinal.toFixed(2)}</span>
              )}
            </div>

          

          

            {/* Botones adicionales */}
            <div className="botones-adicionales">
              <button onClick={onComprar} className="btn-comprar-adicional">
                💳 Comprar Ahora
              </button>
              <button className="btn-chat">
                💬 Chatea con nosotros
              </button>
            </div>

              <div className="garantias">
              <div className="garantia-item">
                <span className="garantia-icon">🔒</span>
                <span>Pago 100% seguro</span>
              </div>
             
             
            </div>
          </div>
        </div>
      </div>

      {/* Modal de video */}
      {showVideoModal && videoUrl && (
        <div className="video-modal-overlay" onClick={closeVideoModal}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeVideoModal}>
              ×
            </button>
            <div className="video-modal-header">
              <h3>{cursoCompleto.nombre}</h3>
              <p>Vista previa del curso</p>
            </div>
            <div className="modal-video-wrapper">
              <video 
                controls 
                autoPlay
                controlsList="nodownload"
                preload="metadata"
                className="modal-video"
                poster={imagenUrl}
              >
                <source src={videoUrl} type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleCurso;