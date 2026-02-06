import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './MisCalificaciones.css';

const MisCalificaciones = ({ cursoId, setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();
  const [cursosInscritos, setCursosInscritos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [calificaciones, setCalificaciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true); // Iniciar en true para mostrar loading al cargar

  // Cargar cursos inscritos del alumno
  const cargarCursosInscritos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/inscripciones/alumno/${user.id}/cursos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Datos recibidos:', data); // Para debug
        const cursos = data.data || data.cursos || [];
        setCursosInscritos(cursos);
        
        // Si hay cursoId como prop, seleccionar ese curso
        if (cursoId) {
          const cursoEncontrado = cursos.find(c => c.id_curso === parseInt(cursoId));
          if (cursoEncontrado) {
            setCursoSeleccionado(cursoEncontrado);
          } else if (cursos.length > 0) {
            // Si no se encuentra, seleccionar el primero
            setCursoSeleccionado(cursos[0]);
          }
        } else if (cursos.length > 0) {
          // Si no hay cursoId, seleccionar el primer curso automáticamente
          setCursoSeleccionado(cursos[0]);
        }
      } else {
        console.error('Error al cargar cursos inscritos');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar calificaciones del curso seleccionado
  const cargarCalificaciones = async () => {
    if (!cursoSeleccionado) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/calificaciones/alumno/${user.id}/curso/${cursoSeleccionado.id_curso}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCalificaciones(data.calificaciones || []);
        calcularEstadisticas(data.calificaciones || []);
      } else {
        console.error('Error al cargar calificaciones');
        setCalificaciones([]);
        setEstadisticas(null);
      }
    } catch (error) {
      console.error('Error:', error);
      setCalificaciones([]);
      setEstadisticas(null);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas de calificaciones
  const calcularEstadisticas = (calificacionesData) => {
    if (!calificacionesData || calificacionesData.length === 0) {
      setEstadisticas(null);
      return;
    }

    const totalExamenes = calificacionesData.length;
    const aprobados = calificacionesData.filter(cal => cal.aprobado).length;
    const reprobados = totalExamenes - aprobados;
    const promedioGeneral = calificacionesData.reduce((sum, cal) => sum + parseFloat(cal.nota_obtenida), 0) / totalExamenes;
    const porcentajeAprobacion = (aprobados / totalExamenes) * 100;

    setEstadisticas({
      totalExamenes,
      aprobados,
      reprobados,
      promedioGeneral: promedioGeneral.toFixed(2),
      porcentajeAprobacion: porcentajeAprobacion.toFixed(1)
    });
  };

  // Obtener color según la nota
  const getNotaColor = (nota, aprobado) => {
    if (aprobado) {
      if (nota >= 18) return '#00b894'; // Verde excelente
      if (nota >= 15) return '#00cec9'; // Verde bueno
      return '#74b9ff'; // Azul aprobado
    }
    return '#e17055'; // Rojo reprobado
  };

  // Obtener icono según el estado
  const getEstadoIcon = (aprobado) => {
    return aprobado ? 'bx-check-circle' : 'bx-x-circle';
  };

  useEffect(() => {
    if (user?.id) {
      cargarCursosInscritos();
    }
  }, [user]);

  // Cargar calificaciones cuando cambie el curso seleccionado
  useEffect(() => {
    if (cursoSeleccionado?.id_curso) {
      cargarCalificaciones();
    }
  }, [cursoSeleccionado]);

  return (
    <div className="mis-calificaciones-container">
      <div className="mis-calificaciones-header">
        <button 
          className="btn-volver-atras"
          onClick={() => setCurrentSection('home')}
        >
          <i className='bx bx-arrow-back'></i>
        </button>
        <h1>Mis Calificaciones</h1>
      </div>

      {loading && cursosInscritos.length === 0 ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando tus cursos...</p>
        </div>
      ) : cursosInscritos.length === 0 ? (
        <div className="empty-state sin-cursos">
          <i className='bx bx-book'></i>
          <h4>No tienes cursos inscritos</h4>
          <p>Inscríbete en un curso para ver tus calificaciones</p>
          <button 
            className="btn-primary"
            onClick={() => setCurrentSection('cursos-disponibles')}
          >
            Explorar Cursos Disponibles
          </button>
        </div>
      ) : (
        <>
          {/* Selector de cursos - Como tabs */}
          <div className="selector-cursos">
            <div className="selector-header">
              <h3>
                <i className='bx bx-book-bookmark'></i>
                Selecciona un curso para ver sus calificaciones
              </h3>
            </div>
            
            <div className="cursos-tabs">
              {cursosInscritos.map(curso => (
                <button 
                  key={curso.id_curso}
                  className={`curso-tab ${cursoSeleccionado?.id_curso === curso.id_curso ? 'active' : ''}`}
                  onClick={() => setCursoSeleccionado(curso)}
                >
                  <span className="curso-nombre">{curso.nombre_curso}</span>
                  {curso.promedio_notas && (
                    <span className="promedio-mini">
                      {parseFloat(curso.promedio_notas).toFixed(1)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {estadisticas && (
            <div className="calificaciones-estadisticas">
              <div className="estadistica-card total">
                <div className="estadistica-numero">{estadisticas.totalExamenes}</div>
                <div className="estadistica-label">Total Exámenes</div>
              </div>
              
              <div className="estadistica-card aprobados">
                <div className="estadistica-numero">{estadisticas.aprobados}</div>
                <div className="estadistica-label">Aprobados</div>
                <div className="estadistica-porcentaje">{estadisticas.porcentajeAprobacion}%</div>
              </div>
              
              <div className="estadistica-card reprobados">
                <div className="estadistica-numero">{estadisticas.reprobados}</div>
                <div className="estadistica-label">Reprobados</div>
              </div>
              
              <div className="estadistica-card promedio">
                <div className="estadistica-numero">{estadisticas.promedioGeneral}</div>
                <div className="estadistica-label">Promedio General</div>
              </div>
            </div>
          )}

          <div className="calificaciones-lista">
            <h3>Historial de Calificaciones</h3>
            
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando calificaciones...</p>
              </div>
            ) : calificaciones.length === 0 ? (
              <div className="empty-state">
                <i className='bx bx-file-blank'></i>
                <h4>No hay calificaciones registradas</h4>
                <p>Aún no tienes calificaciones para este curso</p>
              </div>
            ) : (
              <div className="calificaciones-grid">
                {calificaciones.map(calificacion => (
                  <div key={calificacion.id_examen} className="calificacion-item">
                    <div className="calificacion-header">
                      <div className="examen-info">
                        <h4>{calificacion.titulo}</h4>
                        <p className="examen-descripcion">{calificacion.descripcion}</p>
                      </div>
                      {calificacion.nota_obtenida !== null ? (
                        <div 
                          className="nota-principal"
                          style={{color: getNotaColor(calificacion.nota_obtenida, calificacion.aprobado)}}
                        >
                          <span className="nota-numero">{calificacion.nota_obtenida.toFixed(2)}</span>
                          <span className="nota-total">/{calificacion.puntos_totales || 20}</span>
                        </div>
                      ) : (
                        <div className="nota-principal pendiente">
                          <span className="nota-numero">-</span>
                          <span className="nota-total">Pendiente</span>
                        </div>
                      )}
                    </div>

                    <div className="calificacion-detalles">
                      <div className="detalle-item">
                        <span className="detalle-label">Estado:</span>
                        {calificacion.nota_obtenida !== null ? (
                          <span 
                            className={`estado-badge ${calificacion.aprobado ? 'aprobado' : 'reprobado'}`}
                          >
                            <i className={`bx ${getEstadoIcon(calificacion.aprobado)}`}></i>
                            {calificacion.aprobado ? 'Aprobado' : 'Reprobado'}
                          </span>
                        ) : (
                          <span className="estado-badge pendiente">
                            <i className="bx bx-time"></i>
                            Pendiente
                          </span>
                        )}
                      </div>

                      {calificacion.porcentaje !== null && (
                        <div className="detalle-item">
                          <span className="detalle-label">Porcentaje:</span>
                          <span className="detalle-valor">{calificacion.porcentaje.toFixed(1)}%</span>
                        </div>
                      )}

                      {calificacion.puntos_obtenidos !== null && calificacion.puntos_totales !== null && (
                        <div className="detalle-item">
                          <span className="detalle-label">Puntos:</span>
                          <span className="detalle-valor">
                            {calificacion.puntos_obtenidos.toFixed(1)} / {calificacion.puntos_totales.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {calificacion.intento_numero > 0 && (
                        <div className="detalle-item">
                          <span className="detalle-label">Intento:</span>
                          <span className="detalle-valor">#{calificacion.intento_numero}</span>
                        </div>
                      )}
                    </div>

                    <div className="calificacion-fechas">
                      {calificacion.fecha_realizacion ? (
                        <div className="fecha-item">
                          <i className='bx bx-calendar'></i>
                          <span>Realizado: {new Date(calificacion.fecha_realizacion).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      ) : (
                        <div className="fecha-item">
                          <i className='bx bx-calendar-x'></i>
                          <span>No realizado</span>
                        </div>
                      )}
                      
                      {calificacion.tiempo_total_minutos && (
                        <div className="fecha-item">
                          <i className='bx bx-time'></i>
                          <span>Duración: {calificacion.tiempo_total_minutos} min</span>
                        </div>
                      )}

                      {calificacion.fecha_realizacion && calificacion.fecha_fin && (
                        <div className="fecha-item">
                          <i className='bx bx-calendar-event'></i>
                          <span>Disponible: {new Date(calificacion.fecha_realizacion).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })} - {new Date(calificacion.fecha_fin).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MisCalificaciones;