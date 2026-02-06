import React, { useState, useEffect } from 'react';
import './Profesor.css';

const ForosProfesor = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [foros, setForos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCurso, setFiltroCurso] = useState('todos');
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista' o 'crear'
  const [foroSeleccionado, setForoSeleccionado] = useState(null);

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

      // Simular datos de foros
      const forosSimulados = [
        {
          id: 1,
          titulo: 'Dudas sobre Álgebra Lineal - Capítulo 3',
          descripcion: 'Espacio para resolver dudas sobre matrices y determinantes',
          curso_id: 1,
          curso_nombre: 'Matemáticas Básicas',
          categoria: 'dudas',
          estado: 'activo',
          total_mensajes: 24,
          total_participantes: 12,
          ultimo_mensaje: {
            autor: 'María García',
            fecha: '2024-01-21T15:30:00',
            contenido: '¿Podrían explicar mejor el método de Gauss-Jordan?'
          },
          mensajes_sin_responder: 3,
          created_at: '2024-01-15T10:00:00',
          moderado: true
        },
        {
          id: 2,
          titulo: 'Proyecto Final - Grupos de Trabajo',
          descripcion: 'Coordinación para la formación de grupos del proyecto final',
          curso_id: 1,
          curso_nombre: 'Matemáticas Básicas',
          categoria: 'proyectos',
          estado: 'activo',
          total_mensajes: 18,
          total_participantes: 8,
          ultimo_mensaje: {
            autor: 'Carlos López',
            fecha: '2024-01-21T12:15:00',
            contenido: 'Busco compañeros para el proyecto de estadística aplicada'
          },
          mensajes_sin_responder: 1,
          created_at: '2024-01-18T14:00:00',
          moderado: false
        },
        {
          id: 3,
          titulo: 'Anuncios Importantes del Curso',
          descripcion: 'Comunicados oficiales y anuncios importantes',
          curso_id: 2,
          curso_nombre: 'Física Avanzada',
          categoria: 'anuncios',
          estado: 'activo',
          total_mensajes: 8,
          total_participantes: 16,
          ultimo_mensaje: {
            autor: 'Prof. Rodriguez',
            fecha: '2024-01-20T09:00:00',
            contenido: 'Recordatorio: Examen parcial el próximo viernes'
          },
          mensajes_sin_responder: 0,
          created_at: '2024-01-10T08:00:00',
          moderado: true
        },
        {
          id: 4,
          titulo: 'Discusión General - Física Cuántica',
          descripcion: 'Espacio para discutir conceptos avanzados de física cuántica',
          curso_id: 2,
          curso_nombre: 'Física Avanzada',
          categoria: 'discusion',
          estado: 'archivado',
          total_mensajes: 45,
          total_participantes: 14,
          ultimo_mensaje: {
            autor: 'Ana Martínez',
            fecha: '2024-01-19T16:45:00',
            contenido: 'Excelente explicación sobre el principio de incertidumbre'
          },
          mensajes_sin_responder: 0,
          created_at: '2024-01-05T11:00:00',
          moderado: true
        }
      ];
      
      setForos(forosSimulados);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const forosFiltrados = foros.filter(foro => {
    const cumpleEstado = filtroEstado === 'todos' || foro.estado === filtroEstado;
    const cumpleCurso = filtroCurso === 'todos' || foro.curso_id.toString() === filtroCurso;
    
    return cumpleEstado && cumpleCurso;
  });

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo': return '#28a745';
      case 'cerrado': return '#6c757d';
      case 'archivado': return '#17a2b8';
      case 'moderacion': return '#ffc107';
      default: return '#007bff';
    }
  };

  const getCategoriaIcon = (categoria) => {
    switch (categoria) {
      case 'dudas': return 'bx-help-circle';
      case 'anuncios': return 'bx-megaphone';
      case 'proyectos': return 'bx-briefcase';
      case 'discusion': return 'bx-chat';
      default: return 'bx-message';
    }
  };

  const formatearFecha = (fecha) => {
    const ahora = new Date();
    const fechaMensaje = new Date(fecha);
    const diferencia = ahora - fechaMensaje;
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 60) {
      return `hace ${minutos} min`;
    } else if (horas < 24) {
      return `hace ${horas}h`;
    } else if (dias < 7) {
      return `hace ${dias}d`;
    } else {
      return fechaMensaje.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="profesor-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando foros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profesor-container">
        <div className="error-container">
          <i className='bx bx-error-circle'></i>
          <h3>Error al cargar los foros</h3>
          <p>{error}</p>
          <button onClick={cargarDatos} className="btn-retry">
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profesor-container">
      <div className="profesor-header">
        <div className="header-content">
          <h1>Gestión de Foros</h1>
          <p>Administra las discusiones y comunicación con tus estudiantes</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => setVistaActual(vistaActual === 'lista' ? 'crear' : 'lista')}
          >
            <i className={`bx ${vistaActual === 'lista' ? 'bx-plus' : 'bx-list-ul'}`}></i>
            {vistaActual === 'lista' ? 'Crear Foro' : 'Ver Lista'}
          </button>
        </div>
      </div>

      {vistaActual === 'lista' ? (
        <>
          <div className="profesor-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <i className='bx bx-chat'></i>
              </div>
              <div className="stat-info">
                <h3>{foros.length}</h3>
                <p>Total Foros</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className='bx bx-message'></i>
              </div>
              <div className="stat-info">
                <h3>{foros.reduce((acc, f) => acc + f.total_mensajes, 0)}</h3>
                <p>Total Mensajes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className='bx bx-group'></i>
              </div>
              <div className="stat-info">
                <h3>{foros.reduce((acc, f) => acc + f.total_participantes, 0)}</h3>
                <p>Participantes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className='bx bx-time'></i>
              </div>
              <div className="stat-info">
                <h3>{foros.reduce((acc, f) => acc + f.mensajes_sin_responder, 0)}</h3>
                <p>Sin Responder</p>
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
              <option value="activo">Activo</option>
              <option value="cerrado">Cerrado</option>
              <option value="archivado">Archivado</option>
              <option value="moderacion">En Moderación</option>
            </select>
          </div>

          <div className="foros-grid">
            {forosFiltrados.length === 0 ? (
              <div className="empty-state">
                <i className='bx bx-chat'></i>
                <h3>No hay foros</h3>
                <p>No se encontraron foros que coincidan con los filtros seleccionados</p>
                <button 
                  className="btn-primary"
                  onClick={() => setVistaActual('crear')}
                >
                  Crear primer foro
                </button>
              </div>
            ) : (
              forosFiltrados.map(foro => (
                <div key={foro.id} className="foro-card">
                  <div className="foro-header">
                    <div className="foro-categoria">
                      <i className={`bx ${getCategoriaIcon(foro.categoria)}`}></i>
                      <span>{foro.categoria.toUpperCase()}</span>
                    </div>
                    <div className="foro-estado">
                      <span 
                        className="estado-badge"
                        style={{ backgroundColor: getEstadoColor(foro.estado) }}
                      >
                        {foro.estado}
                      </span>
                      {foro.moderado && (
                        <span className="moderado-badge">
                          <i className='bx bx-shield-check'></i>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="foro-content">
                    <h3>{foro.titulo}</h3>
                    <p className="foro-descripcion">{foro.descripcion}</p>
                    <p className="curso-nombre">{foro.curso_nombre}</p>
                    
                    <div className="foro-stats">
                      <div className="stat-item">
                        <i className='bx bx-message'></i>
                        <span>{foro.total_mensajes} mensajes</span>
                      </div>
                      <div className="stat-item">
                        <i className='bx bx-group'></i>
                        <span>{foro.total_participantes} participantes</span>
                      </div>
                      {foro.mensajes_sin_responder > 0 && (
                        <div className="stat-item pendiente">
                          <i className='bx bx-time'></i>
                          <span>{foro.mensajes_sin_responder} sin responder</span>
                        </div>
                      )}
                    </div>
                    
                    {foro.ultimo_mensaje && (
                      <div className="ultimo-mensaje">
                        <div className="mensaje-header">
                          <span className="autor">{foro.ultimo_mensaje.autor}</span>
                          <span className="fecha">{formatearFecha(foro.ultimo_mensaje.fecha)}</span>
                        </div>
                        <p className="mensaje-contenido">
                          {foro.ultimo_mensaje.contenido.length > 100 
                            ? `${foro.ultimo_mensaje.contenido.substring(0, 100)}...`
                            : foro.ultimo_mensaje.contenido
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="foro-actions">
                    <button 
                      className="btn-action btn-primary"
                      onClick={() => setForoSeleccionado(foro)}
                    >
                      <i className='bx bx-message-detail'></i>
                      Ver Mensajes
                    </button>
                    <button className="btn-action btn-secondary">
                      <i className='bx bx-edit'></i>
                      Editar
                    </button>
                    <button className="btn-action btn-tertiary">
                      <i className='bx bx-cog'></i>
                      Configurar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="crear-foro-form">
          <div className="form-header">
            <h2>Crear Nuevo Foro</h2>
            <p>Configura un nuevo espacio de discusión para tus estudiantes</p>
          </div>
          
          <form className="foro-form">
            <div className="form-row">
              <div className="form-group">
                <label>Título del Foro</label>
                <input 
                  type="text" 
                  placeholder="Ej: Dudas sobre el Capítulo 5"
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
                <label>Categoría</label>
                <select className="form-select">
                  <option value="dudas">Dudas y Preguntas</option>
                  <option value="anuncios">Anuncios</option>
                  <option value="proyectos">Proyectos</option>
                  <option value="discusion">Discusión General</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Estado Inicial</label>
                <select className="form-select">
                  <option value="activo">Activo</option>
                  <option value="moderacion">En Moderación</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Descripción</label>
              <textarea 
                className="form-textarea"
                placeholder="Describe el propósito de este foro..."
                rows="4"
              ></textarea>
            </div>
            
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Permitir que los estudiantes creen nuevos temas</span>
              </label>
              
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Moderar mensajes antes de publicar</span>
              </label>
              
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Enviar notificaciones por email</span>
              </label>
              
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Permitir archivos adjuntos</span>
              </label>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                Crear Foro
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ForosProfesor;