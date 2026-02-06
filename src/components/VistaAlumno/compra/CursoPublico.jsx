import React from 'react';
import './CursoPublico.css';

const CursoPublico = ({ curso, onVolver, onRegistrarse }) => {
  const API_URL = import.meta.env.VITE_API_URL;
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

  const precioFinal = curso.precio_oferta && parseFloat(curso.precio_oferta) < parseFloat(curso.precio_real || curso.precio) 
    ? parseFloat(curso.precio_oferta) 
    : parseFloat(curso.precio_real || curso.precio || 0);

  const precioOriginal = parseFloat(curso.precio_real || curso.precio || 0);
  const descuento = curso.precio_oferta && precioOriginal > precioFinal 
    ? Math.round(((precioOriginal - precioFinal) / precioOriginal) * 100) 
    : 0;

  return (
    <div className="detalle-curso-container">
      {/* Header con imagen y información básica */}
      <div className="curso-header">
        <div className="curso-imagen-hero">
          <img 
            src={curso.imagen_url ? `${API_URL.replace('/api', '')}${curso.imagen_url}` : '/images/default-course.svg'} 
            alt={curso.nombre}
            className="imagen-hero"
            onError={(e) => {
              e.target.src = '/images/default-course.svg';
            }}
          />
          <div className="curso-categoria-badge">
            {curso.categoria || 'Sin categoría'}
          </div>
        </div>
        
        <div className="curso-info-principal">
          <div className="breadcrumb">
            <button onClick={onVolver} className="btn-breadcrumb">
              ← Volver a cursos
            </button>
          </div>
          
          <h1 className="curso-titulo">{curso.nombre}</h1>
          
          <div className="curso-meta-info">
            <span className="curso-modulos">
              📚 {curso.numero_modulos || 0} módulos
            </span>
            <span className="curso-duracion">
              ⏱️ {curso.duracion_horas || curso.duracion_semanas || 0} {curso.duracion_horas ? 'horas' : 'semanas'}
            </span>
            {curso.asignaciones && curso.asignaciones.length > 0 && (
              <span className="curso-horarios-disponibles">
                📅 {curso.asignaciones.length} horario{curso.asignaciones.length > 1 ? 's' : ''} disponible{curso.asignaciones.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Precio y botón de registro */}
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
            <button onClick={onRegistrarse} className="btn-registrarse-principal">
              Regístrate para Comprar
            </button>
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
            </div>
          </section>



          {/* Requisitos */}
          <section className="seccion-requisitos">
            <h2>Requisitos</h2>
            <div className="lista-requisitos">
              <p>Este programa está diseñado para estudiantes comprometidos con su aprendizaje:</p>
              <ul>
                <li>Motivación y dedicación para completar el curso</li>
                <li>Acceso a internet y dispositivo para seguir las clases</li>
                <li>No se requieren conocimientos previos específicos</li>
                <li>Ganas de aprender y aplicar nuevos conocimientos</li>
              </ul>
            </div>
          </section>

          {/* Descripción */}
          <section className="seccion-descripcion">
            <h2>Descripción</h2>
            <div className="descripcion-completa">
              <p>{curso.descripcion}</p>
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
                <li>Estudiantes que buscan ampliar sus conocimientos en {curso.categoria || 'esta área'}</li>
                <li>Profesionales que desean actualizar sus competencias</li>
                <li>Personas interesadas en desarrollar nuevas habilidades</li>
                <li>Cualquier persona motivada por aprender y crecer profesionalmente</li>
              </ul>
            </div>
          </section>

          {/* Instructores */}
          {curso.asignaciones && curso.asignaciones.length > 0 && (
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
        <div className="sidebar-info">
          <div className="card-compra">
            <div className="imagen-curso-sidebar">
              <img 
                src={curso.imagen_url ? `${API_URL.replace('/api', '')}${curso.imagen_url}` : '/images/default-course.svg'} 
                alt={curso.nombre}
                onError={(e) => {
                  e.target.src = '/images/default-course.svg';
                }}
              />
            </div>
            
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

            <button onClick={onRegistrarse} className="btn-registrarse-sidebar">
              Regístrate para Comprar
            </button>

            <div className="garantias">
              <div className="garantia-item">
                <span className="garantia-icon">🔒</span>
                <span>Pago 100% seguro</span>
              </div>
              <div className="garantia-item">
                <span className="garantia-icon">📱</span>
                <span>Acceso desde cualquier dispositivo</span>
              </div>
              <div className="garantia-item">
                <span className="garantia-icon">🎓</span>
                <span>Certificado de finalización</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CursoPublico;