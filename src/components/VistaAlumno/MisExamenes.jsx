import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ExamenesAlumno from './ExamenesAlumno';
import './MisExamenes.css';

const MisExamenes = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/inscripciones/alumno/${user.id}/cursos`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      console.log('Datos de cursos recibidos:', data); // Debug
      
      // Procesar los datos para incluir información de exámenes
      const cursosConExamenes = await Promise.all((data.data || []).map(async (curso) => {
        try {
          // Obtener exámenes por asignación
          const examenesResponse = await fetch(
            `${API_URL}/examenes/asignacion/${curso.id_asignacion}`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          const examenesData = await examenesResponse.json();
          
          return {
            ...curso,
            id: curso.id_curso, // Usar id_curso como id principal
            nombre: curso.nombre_curso,
            descripcion: curso.descripcion_curso,
            profesor_nombre: curso.nombre_profesor,
            profesor_apellidos: curso.apellido_profesor,
            imagen_curso: curso.imagen_curso, // Agregar imagen_curso
            imagen_profesor: curso.profesor_imagen, // Agregar imagen del profesor
            total_examenes: examenesData.data ? examenesData.data.length : 0,
            total_modulos: curso.total_clases || 0,
            progreso: curso.porcentaje_completado || 0,
            duracion_horas: Math.round((curso.total_clases || 0) * 1.5) // Estimación
          };
        } catch (error) {
          console.error('Error al cargar exámenes para curso:', curso.id_curso, error);
          return {
            ...curso,
            id: curso.id_curso,
            nombre: curso.nombre_curso,
            descripcion: curso.descripcion_curso,
            profesor_nombre: curso.nombre_profesor,
            profesor_apellidos: curso.apellido_profesor,
            imagen_curso: curso.imagen_curso, // Agregar imagen_curso
            imagen_profesor: curso.profesor_imagen, // Agregar imagen del profesor
            total_examenes: 0,
            total_modulos: curso.total_clases || 0,
            progreso: curso.porcentaje_completado || 0,
            duracion_horas: Math.round((curso.total_clases || 0) * 1.5)
          };
        }
      }));
      
      setCursos(cursosConExamenes);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const seleccionarCurso = (curso) => {
    console.log('Seleccionando curso para ver exámenes:', curso); // Debug
    // Guardar el curso seleccionado en localStorage para que VistaAlumno pueda accederlo
    localStorage.setItem('cursoSeleccionadoAlumno', JSON.stringify(curso));
    setCurrentSection('examenes-curso'); // Cambiar a la nueva sección
  };

  if (loading) {
    return (
      <div className="mis-examenes-loading">
        <div className="loading-spinner"></div>
        <p>Cargando exámenes...</p>
      </div>
    );
  }

  return (
    <div className="mis-examenes-container">
      <div className="mis-examenes-header">
        <button
          className="btn-volver-atras"
          onClick={() => setCurrentSection('dashboard')}
        >
          <i className='bx bx-arrow-back'></i>
        </button>
        <div className="mis-examenes-header-info">
          <h1>Mis Exámenes</h1>
          <p>Selecciona un curso para ver los exámenes disponibles</p>
        </div>
      </div>

      {cursos.length > 0 && (
        <div className="mis-examenes-resumen">
          <div className="resumen-card">
            <div className="resumen-icon">
              <i className='bx bx-book-open'></i>
            </div>
            <div className="resumen-info">
              <h4>Total de cursos</h4>
              <span>{cursos.length}</span>
            </div>
          </div>
          
          <div className="resumen-card">
            <div className="resumen-icon">
              <i className='bx bx-task'></i>
            </div>
            <div className="resumen-info">
              <h4>Exámenes disponibles</h4>
              <span>{cursos.reduce((total, curso) => total + (curso.total_examenes || 0), 0)}</span>
            </div>
          </div>
          
          <div className="resumen-card">
            <div className="resumen-icon">
              <i className='bx bx-trending-up'></i>
            </div>
            <div className="resumen-info">
              <h4>Progreso promedio</h4>
              <span>{Math.round(cursos.reduce((total, curso) => total + (curso.progreso || 0), 0) / cursos.length)}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="mis-examenes-grid">
        {cursos.length === 0 ? (
          <div className="mis-examenes-empty">
            <i className='bx bx-book-open'></i>
            <h3>No tienes cursos inscritos</h3>
            <p>Inscríbete en un curso para acceder a los exámenes</p>
            <button 
              className="btn-ver-cursos"
              onClick={() => setCurrentSection('cursos-disponibles')}
            >
              Ver cursos disponibles
            </button>
          </div>
        ) : (
          cursos.map(curso => (
            <div key={curso.id} className="mis-examenes-curso-card">
              <div className="curso-card-header">
                <div className="curso-imagen-container">
                  {curso.imagen_curso ? (
                    <img 
                      src={curso.imagen_curso.startsWith('http') ? curso.imagen_curso : `${API_URL.replace('/api', '')}${curso.imagen_curso}`}
                      alt={curso.nombre}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentNode.querySelector('.curso-imagen-placeholder');
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div className="curso-imagen-placeholder" style={{display: curso.imagen_curso ? 'none' : 'flex'}}>
                    <i className='bx bx-book'></i>
                  </div>
                </div>
                <div className="curso-overlay">
                  <span className="curso-categoria">{curso.categoria}</span>
                </div>
              </div>

              <div className="curso-card-body">
                <h3>{curso.nombre}</h3>
                
                <div className="curso-profesor">
                  <div className="profesor-imagen">
                    {curso.imagen_profesor ? (
                      <img 
                        src={curso.imagen_profesor.startsWith('http') ? curso.imagen_profesor : `${API_URL.replace('/api', '')}/${curso.imagen_profesor}`}
                        alt={`${curso.profesor_nombre} ${curso.profesor_apellidos}`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const placeholder = e.target.parentNode.querySelector('.profesor-imagen-placeholder');
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className="profesor-imagen-placeholder" style={{display: curso.imagen_profesor ? 'none' : 'flex'}}>
                      <i className='bx bx-user'></i>
                    </div>
                  </div>
                  <span>{curso.profesor_nombre} {curso.profesor_apellidos}</span>
                </div>

                <div className="curso-stats">
                  <div className="stat">
                    <i className='bx bx-time'></i>
                    <span>{curso.duracion_horas}h</span>
                  </div>
                  <div className="stat">
                    <i className='bx bx-book-bookmark'></i>
                    <span>{curso.total_modulos || 0} módulos</span>
                  </div>
                  <div className="stat">
                    <i className='bx bx-task'></i>
                    <span>{curso.total_examenes || 0} exámenes</span>
                  </div>
                </div>

                <div className="curso-progreso">
                  <div className="progreso-info">
                    <span>Progreso del curso</span>
                    <span>{curso.progreso || 0}%</span>
                  </div>
                  <div className="progreso-barra">
                    <div 
                      className="progreso-fill"
                      style={{width: `${curso.progreso || 0}%`}}
                    />
                  </div>
                </div>
              </div>

              <div className="curso-card-footer">
                <button
                  className="btn-ver-examenes"
                  onClick={() => seleccionarCurso(curso)}
                  disabled={!curso.total_examenes || curso.total_examenes === 0}
                >
                  <i className='bx bx-list-check'></i>
                  {curso.total_examenes > 0 ? 'Ver exámenes' : 'Sin exámenes'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MisExamenes;