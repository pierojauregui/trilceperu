import React, { useState, useEffect } from 'react';
import './Profesor.css';
import './MisAlumnos.css';

const MisAlumnos = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [alumnos, setAlumnos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroCurso, setFiltroCurso] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [stats, setStats] = useState({
    total_alumnos: 0,
    inscripciones_activas: 0,
    cursos_completados: 0,
    progreso_promedio: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || !user.id) {
        throw new Error('Usuario no encontrado');
      }

      // Cargar cursos del profesor
      const cursosResponse = await fetch(
        `${API_URL}/asignaciones/profesor/${user.id}/cursos`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!cursosResponse.ok) {
        throw new Error('Error al cargar los cursos');
      }
      
      const cursosData = await cursosResponse.json();
      setCursos(cursosData.data || []);

      // Cargar alumnos
      const alumnosResponse = await fetch(
        `${API_URL}/profesores/${user.id}/alumnos`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!alumnosResponse.ok) {
        throw new Error('Error al cargar los alumnos');
      }
      
      const alumnosData = await alumnosResponse.json();
      
      if (alumnosData.success) {
        setAlumnos(alumnosData.data.alumnos || []);
      }

      // Cargar estadísticas
      const statsResponse = await fetch(
        `${API_URL}/profesores/${user.id}/estadisticas`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }
      
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar alumnos
  const alumnosFiltrados = alumnos.filter(alumno => {
    const cumpleBusqueda = 
      `${alumno.nombres} ${alumno.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      alumno.correo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      alumno.dni?.includes(busqueda);
    
    const cumpleCurso = filtroCurso === 'todos' || 
      alumno.cursos.some(curso => curso.curso_id.toString() === filtroCurso);
    
    return cumpleBusqueda && cumpleCurso;
  });

  // Crear lista plana de inscripciones para la tabla
  const inscripciones = [];
  alumnosFiltrados.forEach(alumno => {
    alumno.cursos.forEach(curso => {
      // Si hay filtro de curso, solo agregar las inscripciones de ese curso
      if (filtroCurso === 'todos' || curso.curso_id.toString() === filtroCurso) {
        inscripciones.push({
          alumno_id: alumno.id,
          alumno_nombre: `${alumno.nombres} ${alumno.apellidos}`,
          alumno_correo: alumno.correo,
          alumno_dni: alumno.dni,
          alumno_celular: alumno.celular,
          alumno_imagen: alumno.imagen_perfil ? `${API_URL.replace('/api', '')}/${alumno.imagen_perfil}` : null,
          ...curso
        });
      }
    });
  });

  if (loading) {
    return (
      <div className="mis-alumnos-container">
        <div className="mis-alumnos-loading-container">
          <div className="mis-alumnos-spinner"></div>
          <p>Cargando mis alumnos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mis-alumnos-container">
        <div className="mis-alumnos-error-container">
          <i className='bx bx-error-circle'></i>
          <h3>Error al cargar los alumnos</h3>
          <p>{error}</p>
          <button onClick={cargarDatos} className="mis-alumnos-btn-retry">
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-alumnos-container">
      <div className="mis-alumnos-header">
        <div className="header-content-alumno">
          <h1>Mis Alumnos</h1>
          <p>Gestiona y monitorea el progreso de tus estudiantes</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="mis-alumnos-stats">
        <div className="mis-alumnos-stat-card">
          <div className="mis-alumnos-stat-icon total">
            <i className='bx bx-group'></i>
          </div>
          <div className="mis-alumnos-stat-info">
            <h3>{stats.total_alumnos}</h3>
            <p>Total Alumnos</p>
          </div>
        </div>
        <div className="mis-alumnos-stat-card">
          <div className="mis-alumnos-stat-icon activas">
            <i className='bx bx-trending-up'></i>
          </div>
          <div className="mis-alumnos-stat-info">
            <h3>{stats.inscripciones_activas}</h3>
            <p>Inscripciones Activas</p>
          </div>
        </div>
        <div className="mis-alumnos-stat-card">
          <div className="mis-alumnos-stat-icon completados">
            <i className='bx bx-check-circle'></i>
          </div>
          <div className="mis-alumnos-stat-info">
            <h3>{stats.cursos_completados}</h3>
            <p>Cursos Completados</p>
          </div>
        </div>
        <div className="mis-alumnos-stat-card">
          <div className="mis-alumnos-stat-icon promedio">
            <i className='bx bx-line-chart'></i>
          </div>
          <div className="mis-alumnos-stat-info">
            <h3>{stats.progreso_promedio}%</h3>
            <p>Progreso Promedio</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mis-alumnos-filters">
        <div className="mis-alumnos-search-box">
          <i className='bx bx-search'></i>
          <input
            type="text"
            placeholder="Buscar por nombre, correo o DNI..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        
        <select 
          value={filtroCurso} 
          onChange={(e) => setFiltroCurso(e.target.value)}
          className="mis-alumnos-filter-select"
        >
          <option value="todos">Todos los cursos</option>
          {cursos.map(curso => (
            <option key={curso.curso_id} value={curso.curso_id}>
              {curso.curso_nombre}
            </option>
          ))}
        </select>
        
        <button onClick={cargarDatos} className="mis-alumnos-btn-refresh">
          <i className='bx bx-refresh'></i>
          Actualizar
        </button>
      </div>

      {/* Tabla de Alumnos */}
      <div className="mis-alumnos-tabla-container">
        {inscripciones.length === 0 ? (
          <div className="mis-alumnos-empty-state">
            <i className='bx bx-user-x'></i>
            <h3>No se encontraron alumnos</h3>
            <p>No hay alumnos que coincidan con los filtros seleccionados</p>
          </div>
        ) : (
          <div className="mis-alumnos-tabla-wrapper">
            <table className="mis-alumnos-tabla">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Alumno</th>
                  <th>DNI</th>
                  <th>Contacto</th>
                  <th>Curso</th>
                  <th>Progreso</th>
                  <th>Estado</th>
                  <th>Fecha Inscripción</th>
                </tr>
              </thead>
              <tbody>
                {inscripciones.map((insc, index) => (
                  <tr key={`${insc.alumno_id}-${insc.curso_id}`}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="mis-alumnos-alumno-cell">
                        <div className="mis-alumnos-alumno-avatar">
                          {insc.alumno_imagen ? (
                            <img src={insc.alumno_imagen} alt={insc.alumno_nombre} />
                          ) : (
                            <i className='bx bx-user'></i>
                          )}
                        </div>
                        <div>
                          <div className="mis-alumnos-alumno-nombre">{insc.alumno_nombre}</div>
                          <div className="mis-alumnos-alumno-correo">{insc.alumno_correo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="mis-alumnos-dni-cell">{insc.alumno_dni || 'N/A'}</td>
                    <td>
                      <div className="mis-alumnos-contacto-cell">
                        {insc.alumno_celular && (
                          <a href={`tel:${insc.alumno_celular}`}>
                            {insc.alumno_celular}
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="mis-alumnos-curso-cell">
                        {insc.curso_nombre}
                      </div>
                    </td>
                    <td>
                      <div className="mis-alumnos-progreso-cell">
                        <div className="mis-alumnos-progreso-bar">
                          <div 
                            className="mis-alumnos-progreso-fill"
                            style={{
                              width: `${insc.progreso_porcentaje}%`,
                              backgroundColor: insc.progreso_porcentaje >= 70 ? '#27ae60' : 
                                             insc.progreso_porcentaje >= 40 ? '#f39c12' : '#e74c3c'
                            }}
                          ></div>
                        </div>
                        <span className="mis-alumnos-progreso-texto">{insc.progreso_porcentaje}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`mis-alumnos-estado-badge ${insc.estado_inscripcion}`}>
                        {insc.estado_inscripcion === 'activo' && 'Activo'}
                        {insc.estado_inscripcion === 'completado' && 'Completado'}
                        {insc.estado_inscripcion === 'inactivo' && 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="mis-alumnos-fecha-cell">
                        {new Date(insc.fecha_inscripcion).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resumen al final */}
      {inscripciones.length > 0 && (
        <div className="mis-alumnos-tabla-footer">
          <p>
            Mostrando <strong>{inscripciones.length}</strong> inscripciones 
            {filtroCurso !== 'todos' && ` del curso seleccionado`}
          </p>
        </div>
      )}
    </div>
  );
};

export default MisAlumnos;