import React, { useState, useEffect } from 'react';
import './Examenes.css';

const ExamenesProfesor = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [examenes, setExamenes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCurso, setFiltroCurso] = useState('todos');
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista' o 'crear'

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || !user.usuario_id) {
        throw new Error('Usuario no encontrado');
      }

      // Cargar cursos del profesor
      const cursosResponse = await fetch(`${API_URL}/asignaciones/profesor/${user.usuario_id}/horarios`);
      if (!cursosResponse.ok) {
        throw new Error('Error al cargar los cursos');
      }
      const cursosData = await cursosResponse.json();
      setCursos(cursosData.data || []);

      // Simular datos de exámenes
      const examenesSimulados = [
        {
          id: 1,
          titulo: 'Examen Parcial - Álgebra Lineal',
          curso_id: 1,
          curso_nombre: 'Matemáticas Básicas',
          tipo: 'parcial',
          fecha_inicio: '2024-01-25T09:00:00',
          fecha_fin: '2024-01-25T11:00:00',
          duracion: 120, // minutos
          total_preguntas: 20,
          estado: 'programado',
          alumnos_inscritos: 25,
          alumnos_completados: 0,
          calificacion_maxima: 100,
          promedio_calificacion: null,
          intentos_permitidos: 1,
          mostrar_resultados: true,
          created_at: '2024-01-20'
        },
        {
          id: 2,
          titulo: 'Quiz - Conceptos Básicos de Física',
          curso_id: 2,
          curso_nombre: 'Física Avanzada',
          tipo: 'quiz',
          fecha_inicio: '2024-01-22T14:00:00',
          fecha_fin: '2024-01-22T14:30:00',
          duracion: 30,
          total_preguntas: 10,
          estado: 'finalizado',
          alumnos_inscritos: 18,
          alumnos_completados: 16,
          calificacion_maxima: 100,
          promedio_calificacion: 87.5,
          intentos_permitidos: 2,
          mostrar_resultados: true,
          created_at: '2024-01-18'
        },
        {
          id: 3,
          titulo: 'Examen Final - Matemáticas Básicas',
          curso_id: 1,
          curso_nombre: 'Matemáticas Básicas',
          tipo: 'final',
          fecha_inicio: '2024-02-15T10:00:00',
          fecha_fin: '2024-02-15T13:00:00',
          duracion: 180,
          total_preguntas: 30,
          estado: 'borrador',
          alumnos_inscritos: 25,
          alumnos_completados: 0,
          calificacion_maxima: 100,
          promedio_calificacion: null,
          intentos_permitidos: 1,
          mostrar_resultados: false,
          created_at: '2024-01-21'
        }
      ];
      
      setExamenes(examenesSimulados);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const examenesFiltrados = examenes.filter(examen => {
    const cumpleEstado = filtroEstado === 'todos' || examen.estado === filtroEstado;
    const cumpleCurso = filtroCurso === 'todos' || examen.curso_id.toString() === filtroCurso;
    
    return cumpleEstado && cumpleCurso;
  });

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'borrador': return '#6c757d';
      case 'programado': return '#007bff';
      case 'activo': return '#28a745';
      case 'finalizado': return '#17a2b8';
      case 'cancelado': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'quiz': return 'bx-help-circle';
      case 'parcial': return 'bx-edit';
      case 'final': return 'bx-medal';
      case 'practica': return 'bx-dumbbell';
      default: return 'bx-edit';
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="examenes-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando exámenes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="examenes-container">
        <div className="error-container">
          <i className='bx bx-error-circle'></i>
          <h3>Error al cargar los exámenes</h3>
          <p>{error}</p>
          <button onClick={cargarDatos} className="btn-retry">
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="examenes-container">
      <div className="examenes-header">
        <div className="header-content">
          <h1>Gestión de Exámenes</h1>
          <p>Crea y administra exámenes para tus cursos</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => setVistaActual(vistaActual === 'lista' ? 'crear' : 'lista')}
          >
            <i className={`bx ${vistaActual === 'lista' ? 'bx-plus' : 'bx-list-ul'}`}></i>
            {vistaActual === 'lista' ? 'Crear Examen' : 'Ver Lista'}
          </button>
        </div>
      </div>

      {vistaActual === 'lista' ? (
        <>
          <div className="profesor-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <i className='bx bx-edit'></i>
              </div>
              <div className="stat-info">
                <h3>{examenes.length}</h3>
                <p>Total Exámenes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className='bx bx-time'></i>
              </div>
              <div className="stat-info">
                <h3>{examenes.filter(e => e.estado === 'programado').length}</h3>
                <p>Programados</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className='bx bx-check-circle'></i>
              </div>
              <div className="stat-info">
                <h3>{examenes.filter(e => e.estado === 'finalizado').length}</h3>
                <p>Finalizados</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className='bx bx-draft'></i>
              </div>
              <div className="stat-info">
                <h3>{examenes.filter(e => e.estado === 'borrador').length}</h3>
                <p>Borradores</p>
              </div>
            </div>
          </div>

          <div className="profesor-filters">
            <select 
              value={filtroCurso} 
              onChange={(e) => setFiltroCurso(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos los cursos</option>
              {cursos.map(curso => (
                <option key={curso.id} value={curso.id}>
                  {curso.nombre_curso}
                </option>
              ))}
            </select>
            
            <select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="programado">Programado</option>
              <option value="activo">Activo</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="examenes-grid">
            {examenesFiltrados.length === 0 ? (
              <div className="empty-state">
                <i className='bx bx-edit'></i>
                <h3>No hay exámenes</h3>
                <p>No se encontraron exámenes que coincidan con los filtros seleccionados</p>
                <button 
                  className="btn-primary"
                  onClick={() => setVistaActual('crear')}
                >
                  Crear primer examen
                </button>
              </div>
            ) : (
              examenesFiltrados.map(examen => (
                <div key={examen.id} className="examen-card">
                  <div className="examen-header">
                    <div className="examen-tipo">
                      <i className={`bx ${getTipoIcon(examen.tipo)}`}></i>
                      <span>{examen.tipo.toUpperCase()}</span>
                    </div>
                    <span 
                      className="estado-badge"
                      style={{ backgroundColor: getEstadoColor(examen.estado) }}
                    >
                      {examen.estado}
                    </span>
                  </div>
                  
                  <div className="examen-content">
                    <h3>{examen.titulo}</h3>
                    <p className="curso-nombre">{examen.curso_nombre}</p>
                    
                    <div className="examen-details">
                      <div className="detail-row">
                        <div className="detail-item">
                          <i className='bx bx-calendar'></i>
                          <span>Inicio: {formatearFecha(examen.fecha_inicio)}</span>
                        </div>
                        <div className="detail-item">
                          <i className='bx bx-time'></i>
                          <span>Duración: {examen.duracion} min</span>
                        </div>
                      </div>
                      
                      <div className="detail-row">
                        <div className="detail-item">
                          <i className='bx bx-help-circle'></i>
                          <span>{examen.total_preguntas} preguntas</span>
                        </div>
                        <div className="detail-item">
                          <i className='bx bx-group'></i>
                          <span>{examen.alumnos_completados}/{examen.alumnos_inscritos} completados</span>
                        </div>
                      </div>
                      
                      {examen.promedio_calificacion && (
                        <div className="promedio-section">
                          <span>Promedio: </span>
                          <span className="promedio-valor">
                            {examen.promedio_calificacion.toFixed(1)}/100
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="examen-actions">
                    <button className="btn-action btn-primary">
                      <i className='bx bx-edit'></i>
                      Editar
                    </button>
                    <button className="btn-action btn-secondary">
                      <i className='bx bx-bar-chart'></i>
                      Resultados
                    </button>
                    <button className="btn-action btn-tertiary">
                      <i className='bx bx-copy'></i>
                      Duplicar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="crear-examen-form">
          <div className="form-header">
            <h2>Crear Nuevo Examen</h2>
            <p>Completa la información básica del examen</p>
          </div>
          
          <form className="examen-form">
            <div className="form-row">
              <div className="form-group">
                <label>Título del Examen</label>
                <input 
                  type="text" 
                  placeholder="Ej: Examen Parcial - Capítulo 1"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Curso</label>
                <select className="form-select">
                  <option value="">Seleccionar curso</option>
                  {cursos.map(curso => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nombre_curso}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Examen</label>
                <select className="form-select">
                  <option value="quiz">Quiz</option>
                  <option value="parcial">Examen Parcial</option>
                  <option value="final">Examen Final</option>
                  <option value="practica">Examen de Práctica</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Duración (minutos)</label>
                <input 
                  type="number" 
                  placeholder="60"
                  className="form-input"
                  min="1"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Fecha y Hora de Inicio</label>
                <input 
                  type="datetime-local" 
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Intentos Permitidos</label>
                <select className="form-select">
                  <option value="1">1 intento</option>
                  <option value="2">2 intentos</option>
                  <option value="3">3 intentos</option>
                  <option value="unlimited">Ilimitados</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Descripción/Instrucciones</label>
              <textarea 
                className="form-textarea"
                placeholder="Instrucciones para el examen..."
                rows="4"
              ></textarea>
            </div>
            
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Mostrar resultados inmediatamente</span>
              </label>
              
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Mezclar preguntas aleatoriamente</span>
              </label>
              
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Permitir navegación entre preguntas</span>
              </label>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn-secondary">
                Guardar como Borrador
              </button>
              <button type="submit" className="btn-primary">
                Crear y Continuar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ExamenesProfesor;