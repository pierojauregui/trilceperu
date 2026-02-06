import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Profesor.css';
import './MisCursos.css';
import './AsistenciasProfesor';

const MisCursos = ({ setCurrentSection, setCursoSeleccionado }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cursoExpandido, setCursoExpandido] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    cargarMisCursos();
  }, []);

  const cargarMisCursos = async () => {
    try {
      setLoading(true);

      if (!isAuthenticated || !user) {
        throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      }

      const userId = user.id || user.usuario_id;

      if (!userId) {
        throw new Error('Datos de usuario incompletos. Por favor, inicia sesión nuevamente.');
      }

      // Cargar cursos
      const response = await fetch(`${API_URL}/asignaciones/profesor/${userId}/cursos`);

      if (!response.ok) {
        throw new Error('Error al cargar los cursos');
      }

      const data = await response.json();
      setCursos(data.data || []);

      // Cargar alumnos para obtener el conteo por curso
      const alumnosResponse = await fetch(
        `${API_URL}/profesores/${userId}/alumnos`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (alumnosResponse.ok) {
        const alumnosData = await alumnosResponse.json();
        if (alumnosData.success) {
          setAlumnos(alumnosData.data.alumnos || []);
        }
      }

    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandir = (cursoId) => {
    setCursoExpandido(cursoExpandido === cursoId ? null : cursoId);
  };

  const formatearHorarios = (horarios) => {
    if (!horarios || horarios.length === 0) return 'Sin horarios asignados';

    return horarios.map(h => `${h.dia_semana} ${h.hora_inicio}-${h.hora_fin}`).join(', ');
  };

  const formatearContenido = (contenido) => {
    if (!contenido) return [];
    // Dividir el contenido por saltos de línea y filtrar líneas vacías
    return contenido.split('\n').filter(linea => linea.trim() !== '');
  };

  const obtenerImagenPorDefecto = () => {
    // Imagen por defecto para todos los cursos
    return '/images/default-course.svg';
  };

  const seleccionarCurso = (cursoId, seccion) => {
    setCursoSeleccionado(cursoId.toString()); // Asegurarse de que sea string
    setCurrentSection(seccion);
  };

  // Función para obtener el número de estudiantes por curso
  const obtenerEstudiantesPorCurso = (cursoId) => {
    if (!alumnos || alumnos.length === 0) return 0;
    
    let totalEstudiantes = 0;
    alumnos.forEach(alumno => {
      if (alumno.cursos && alumno.cursos.some(curso => curso.curso_id === cursoId)) {
        totalEstudiantes++;
      }
    });
    
    return totalEstudiantes;
  };

  return (
    <div className="profesor-container">
      <div className="profesor-header">
        <div className="header-content-mis-cursos">
          <h1>Mis Cursos</h1>
          <p>Gestiona y supervisa todos tus cursos asignados</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="profesor-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bx bx-book"></i>
          </div>
          <div className="stat-info">
            <h3>{cursos.length}</h3>
            <p>Cursos Asignados</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bx bx-group"></i>
          </div>
          <div className="stat-info">
            <h3>{alumnos.reduce((total, alumno) => {
              return total + (alumno.cursos ? alumno.cursos.length : 0);
            }, 0)}</h3>
            <p>Estudiantes Totales</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bx bx-time"></i>
          </div>
          <div className="stat-info">
            <h3>{cursos.reduce((total, curso) => total + (curso.horas_totales || 0), 0)}</h3>
            <p>Horas Totales</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando cursos...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <i className="bx bx-error-circle"></i>
          <h3>Error al cargar los cursos</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={cargarMisCursos}>
            <i className="bx bx-refresh"></i> Reintentar
          </button>
        </div>
      ) : (
        <div className="cursos-list">
          {cursos.length === 0 ? (
            <div className="empty-state">
          <i className="bx bx-book-open"></i>
          <h3>No tienes cursos asignados</h3>
          <p>Contacta al administrador para que te asigne cursos.</p>
        </div>
          ) : (
            cursos.map((curso) => (
              <div key={curso.curso_id} className="curso-card-expandible">
                {/* Imagen del curso */}
                <div className="curso-imagen-wrapper">
                  <img 
                    src={curso.imagen_url ? `${API_URL.replace('/api', '')}${curso.imagen_url}` : obtenerImagenPorDefecto()}
                    alt={curso.curso_nombre}
                    className="curso-imagen-full"
                    onError={(e) => {
                      e.target.src = obtenerImagenPorDefecto();
                    }}
                  />
                </div>

                {/* Título y categoría */}
                <div className="curso-titulo-section">
                  <h2>{curso.curso_nombre}</h2>
                  <span className="categoria-badge">{curso.categoria_nombre}</span>
                </div>

                {/* Descripción */}
                <div className="curso-descripcion-profesor">
                  <p>{curso.curso_descripcion}</p>
                </div>

                {/* Detalles del curso */}
                <div className="curso-detalles">
                  <div className="detalle-item">
                    <i className="bx bx-group"></i>
                    <span>{obtenerEstudiantesPorCurso(curso.curso_id)} estudiantes</span>
                  </div>
                  <div className="detalle-item">
                    <i className="bx bx-time"></i>
                    <span>{curso.duracion_horas || 0} horas</span>
                  </div>
                  <div className="detalle-item">
                    <i className="bx bx-book-bookmark"></i>
                    <span>{curso.numero_modulos || 0} módulos</span>
                  </div>
                </div>

                {/* Horarios detallados */}
                <div className="horarios-detalle">
                  <h4>Horarios de Clase</h4>
                  <div className="horarios-grid">
                    {curso.horarios && curso.horarios.length > 0 ? (
                      curso.horarios.map((horario, index) => (
                        <div key={index} className="horario-item">
                          <div className="dia-semana">{horario.dia_semana}</div>
                          <div className="horario-tiempo">
                            <i className="bx bx-time"></i>
                            <span>{horario.hora_inicio} - {horario.hora_fin}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="horario-item">
                        <div className="dia-semana">Sin horarios</div>
                        <div className="horario-tiempo">
                          <i className="bx bx-info-circle"></i>
                          <span>Por definir</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenido expandible */}
                {cursoExpandido === curso.curso_id && curso.curso_contenido && (
                  <div className="curso-contenido-expandido">
                    <h4>Contenido del Curso</h4>
                    <ul className="contenido-lista">
                      {formatearContenido(curso.curso_contenido).map((item, index) => (
                        <li key={index}>
                          <i className="bx bx-check-circle"></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Acciones del curso */}
                <div className="curso-acciones">
                  <button 
                    className="btn btn-gestionar-clases"
                    onClick={() => seleccionarCurso(curso.curso_id, 'gestionar-clases')}
                  >
                    <i className="bx bx-chalkboard"></i>
                    Gestionar Clases
                  </button>
                  <button 
                    className="btn btn-ver-alumnos"
                    onClick={() => seleccionarCurso(curso.curso_id, 'mis-alumnos')}
                  >
                    <i className="bx bx-group"></i>
                    Ver Alumnos
                  </button>
                  <button 
                    className="btn btn-ver-asistencias"
                    onClick={() => seleccionarCurso(curso.curso_id, 'asistencias')}
                  >
                    <i className="bx bx-calendar-check"></i>
                    Ver Asistencias
                  </button>
                  <button 
                    className="btn btn-gestionar-examenes"
                    onClick={() => seleccionarCurso(curso.curso_id, 'examenes-profesor')}
                  >
                    <i className="bx bx-edit-alt"></i>
                    Gestionar Exámenes
                  </button>
                  <button 
                    className="btn btn-foros"
                    onClick={() => seleccionarCurso(curso.curso_id, 'foros-profesor')}
                  >
                    <i className="bx bx-chat"></i>
                    Foros
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MisCursos;