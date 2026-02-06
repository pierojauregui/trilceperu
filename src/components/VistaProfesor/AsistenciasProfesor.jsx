import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import './AsistenciasProfesor.css';

const AsistenciasProfesor = ({ cursoId: cursoIdProp, setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(cursoIdProp || '');
  const [modulos, setModulos] = useState([]);
  const [moduloSeleccionado, setModuloSeleccionado] = useState('');
  const [clases, setClases] = useState([]);
  const [claseSeleccionada, setClaseSeleccionada] = useState('');
  const [cursoInfo, setCursoInfo] = useState(null);
  const [asignacion, setAsignacion] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [todasLasClases, setTodasLasClases] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [vista, setVista] = useState('registro');
  const { user } = useAuth();

  // Cargar cursos del profesor al inicio
  useEffect(() => {
    cargarCursosProfesor();
  }, [user]);

  // Cuando se selecciona un curso
  useEffect(() => {
    if (cursoSeleccionado) {
      cargarDatosCurso();
      setModuloSeleccionado('');
      setClaseSeleccionada('');
      setClases([]);
    }
  }, [cursoSeleccionado]);

  // Cuando se selecciona un módulo
  useEffect(() => {
    if (moduloSeleccionado && todasLasClases.length > 0) {
      const clasesFiltradas = todasLasClases.filter(
        clase => clase.modulo_id === parseInt(moduloSeleccionado)
      );
      setClases(clasesFiltradas);
      setClaseSeleccionada('');
    } else {
      setClases([]);
    }
  }, [moduloSeleccionado, todasLasClases]);

  // Cuando se selecciona una clase y fecha
  useEffect(() => {
    if (claseSeleccionada && fechaSeleccionada) {
      cargarAsistencias();
    }
  }, [claseSeleccionada, fechaSeleccionada]);

  const cargarCursosProfesor = async () => {
    try {
      const response = await fetch(
        `${API_URL}/asignaciones/profesor/${user.id}/cursos`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setCursos(data.data);

        // Si viene un curso por prop, úsalo
        if (cursoIdProp) {
          setCursoSeleccionado(cursoIdProp.toString());
        } else if (data.data.length === 1) {
          // Si solo hay un curso, selecciónalo automáticamente
          setCursoSeleccionado(data.data[0].curso_id.toString());
        }
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    }
  };

  const cargarDatosCurso = async () => {
    try {
      setLoading(true);

      // Obtener información del curso
      const cursoResponse = await fetch(`${API_URL}/cursos/${cursoSeleccionado}`);
      const cursoData = await cursoResponse.json();
      setCursoInfo(cursoData.data);

      // Obtener la asignación específica
      const asignacionResponse = await fetch(
        `${API_URL}/asignaciones/profesor/${user.id}/curso/${cursoSeleccionado}`
      );
      const asignacionData = await asignacionResponse.json();

      if (asignacionData.success && asignacionData.data) {
        setAsignacion(asignacionData.data);

        // Cargar módulos del curso
        const modulosResponse = await fetch(
          `${API_URL}/cursos/${cursoSeleccionado}/modulos`
        );
        const modulosData = await modulosResponse.json();
        setModulos(modulosData.data || []);

        // Cargar TODAS las clases de esta asignación
        const clasesResponse = await fetch(
          `${API_URL}/asignaciones/${asignacionData.data.id}/clases`
        );
        const clasesData = await clasesResponse.json();
        setTodasLasClases(clasesData.data || []);

        // Cargar alumnos del curso
        const alumnosResponse = await fetch(
          `${API_URL}/cursos/${cursoSeleccionado}/alumnos`
        );
        const alumnosData = await alumnosResponse.json();
        setAlumnos(alumnosData.data || []);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No tienes asignado este curso'
        });
        if (!cursoIdProp) {
          setCursoSeleccionado('');
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del curso:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarAsistencias = async () => {
    if (!claseSeleccionada || !fechaSeleccionada) return;

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(
        `${API_URL}/asistencias/clase/${claseSeleccionada}/fecha/${fechaSeleccionada}`,
        { headers }
      );
      const data = await response.json();
      setAsistencias(data.data || []);
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
    }
  };

  const marcarAsistencia = async (alumnoId, estado) => {
    if (!claseSeleccionada) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona una clase',
        text: 'Debes seleccionar una clase antes de marcar asistencia'
      });
      return;
    }

    try {
      const dataToSend = {
        id_clase: parseInt(claseSeleccionada),
        id_alumno: alumnoId,
        fecha_clase: fechaSeleccionada,
        estado_asistencia: estado
      };

      const response = await fetch(`${API_URL}/asistencias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        // Actualizar el estado local inmediatamente
        const nuevasAsistencias = [...asistencias];
        const index = nuevasAsistencias.findIndex(a => a.id_alumno === alumnoId);

        if (index !== -1) {
          nuevasAsistencias[index].estado_asistencia = estado;
        } else {
          nuevasAsistencias.push({
            id_alumno: alumnoId,
            estado_asistencia: estado,
            fecha_clase: fechaSeleccionada
          });
        }

        setAsistencias(nuevasAsistencias);
      }
    } catch (error) {
      console.error('Error al marcar asistencia:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo registrar la asistencia'
      });
    }
  };

  const guardarObservacion = async (alumnoId, observacion) => {
    if (!claseSeleccionada) return;

    try {
      const dataToSend = {
        id_clase: parseInt(claseSeleccionada),
        id_alumno: alumnoId,
        fecha_clase: fechaSeleccionada,
        estado_asistencia: obtenerEstadoAsistencia(alumnoId) || 'presente',
        observaciones: observacion
      };

      await fetch(`${API_URL}/asistencias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });
    } catch (error) {
      console.error('Error al guardar observación:', error);
    }
  };

  const obtenerEstadoAsistencia = (alumnoId) => {
    const asistencia = asistencias.find(a => a.id_alumno === alumnoId);
    return asistencia ? asistencia.estado_asistencia : null;
  };

  const obtenerObservacion = (alumnoId) => {
    const asistencia = asistencias.find(a => a.id_alumno === alumnoId);
    return asistencia ? asistencia.observaciones : '';
  };

  const calcularEstadisticas = () => {
    const total = alumnos.length;
    const presentes = asistencias.filter(a => a.estado_asistencia === 'presente').length;
    const ausentes = asistencias.filter(a => a.estado_asistencia === 'ausente').length;
    const tardanzas = asistencias.filter(a => a.estado_asistencia === 'tardanza').length;
    const justificados = asistencias.filter(a => a.estado_asistencia === 'justificado').length;
    const sinMarcar = total - (presentes + ausentes + tardanzas + justificados);

    return { total, presentes, ausentes, tardanzas, justificados, sinMarcar };
  };

  const estadisticas = calcularEstadisticas();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="asistencias-profesor-container">
      <div className="asistencias-header">
        <div className="header-top">
          <button
            className="btn-volver-atras"
            onClick={() => setCurrentSection('mis-cursos')}
            title="Volver a Mis Cursos"
          >
            <i className='bx bx-arrow-back'></i>
          </button>
          <div className="header-info">
            <h1>Control de Asistencias</h1>
            {cursoInfo && (
              <p className="curso-nombre">
                <i className='bx bx-book'></i>
                {cursoInfo.nombre}
              </p>
            )}
          </div>
        </div>

        {asignacion && asignacion.horarios && (
          <div className="horario-info">
            <span className="horario-badge">
              <i className='bx bx-time'></i>
              Horario: {asignacion.horarios.map(h =>
                `${h.dia_semana} ${h.hora_inicio}-${h.hora_fin}`
              ).join(', ')}
            </span>
          </div>
        )}
      </div>

      <div className="asistencias-controles">
        <div className="control-tabs">
          <button
            className={`tab-btn ${vista === 'registro' ? 'active' : ''}`}
            onClick={() => setVista('registro')}
          >
            <i className='bx bx-edit-alt'></i>
            Registrar Asistencia
          </button>
          <button
            className={`tab-btn ${vista === 'reporte' ? 'active' : ''}`}
            onClick={() => setVista('reporte')}
          >
            <i className='bx bx-stats'></i>
            Ver Reportes
          </button>
        </div>

        <div className="filtros-asistencia">
          {/* Selector de Curso si hay múltiples cursos */}
          {cursos.length > 1 && (
            <div className="filtro-item">
              <label>Curso:</label>
              <select
                value={cursoSeleccionado}
                onChange={(e) => setCursoSeleccionado(e.target.value)}
              >
                <option value="">-- Seleccionar Curso --</option>
                {cursos.map(curso => (
                  <option key={curso.curso_id} value={curso.curso_id}>
                    {curso.curso_nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selector de Módulo */}
          <div className="filtro-item">
            <label>Módulo:</label>
            <select
              value={moduloSeleccionado}
              onChange={(e) => setModuloSeleccionado(e.target.value)}
              disabled={!cursoSeleccionado || modulos.length === 0}
            >
              <option value="">-- Seleccionar Módulo --</option>
              {modulos.map(modulo => (
                <option key={modulo.id} value={modulo.id}>
                  Módulo {modulo.numero_modulo}: {modulo.titulo}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Clase */}
          <div className="filtro-item">
            <label>Clase: *</label>
            <select
              value={claseSeleccionada}
              onChange={(e) => setClaseSeleccionada(e.target.value)}
              className={!claseSeleccionada ? 'select-warning' : ''}
              disabled={!moduloSeleccionado}
            >
              <option value="">-- Seleccionar Clase --</option>
              {clases.map(clase => (
                <option key={clase.id} value={clase.id}>
                  Clase {clase.numero_clase}: {clase.titulo}
                  {clase.tipo_clase && ` (${clase.tipo_clase})`}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Fecha */}
          <div className="filtro-item">
            <label>Fecha:</label>
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Mensajes de ayuda */}
        {!cursoSeleccionado && (
          <div className="mensaje-ayuda">
            <i className='bx bx-info-circle'></i>
            Selecciona un curso para comenzar
          </div>
        )}
        {cursoSeleccionado && !moduloSeleccionado && (
          <div className="mensaje-ayuda">
            <i className='bx bx-info-circle'></i>
            Selecciona un módulo para ver sus clases
          </div>
        )}
        {moduloSeleccionado && !claseSeleccionada && (
          <div className="mensaje-ayuda">
            <i className='bx bx-info-circle'></i>
            Selecciona una clase para registrar asistencia
          </div>
        )}
        {modulos.length === 0 && cursoSeleccionado && (
          <div className="mensaje-ayuda warning">
            <i className='bx bx-error'></i>
            No hay módulos creados.
            <button
              className="link-btn"
              onClick={() => setCurrentSection('gestionar-clases')}
            >
              Crear módulos y clases
            </button>
          </div>
        )}
      </div>

      {!claseSeleccionada ? (
        <div className="seleccionar-clase-mensaje">
          <i className='bx bx-select-multiple'></i>
          <h3>Selecciona una clase</h3>
          <p>Navega por Curso → Módulo → Clase para registrar asistencia</p>
        </div>
      ) : vista === 'registro' ? (
        <div className="registro-asistencia">
          <div className="estadisticas-rapidas">
            <div className="stat-card presente">
              <div className="stat-icon">
                <i className='bx bx-group'></i>
              </div>
              <div className="stat-info">
                <h3>{estadisticas.total}</h3>
                <p>Total</p>
              </div>
            </div>
            <div className="stat-card presente">
              <div className="stat-icon">
                <i className='bx bx-user-check'></i>
              </div>
              <div className="stat-info">
                <h3>{estadisticas.presentes}</h3>
                <p>Presentes</p>
              </div>
            </div>
            <div className="stat-card ausente">
              <div className="stat-icon">
                <i className='bx bx-user-x'></i>
              </div>
              <div className="stat-info">
                <h3>{estadisticas.ausentes}</h3>
                <p>Ausentes</p>
              </div>
            </div>
            <div className="stat-card tardanza">
              <div className="stat-icon">
                <i className='bx bx-time-five'></i>
              </div>
              <div className="stat-info">
                <h3>{estadisticas.tardanzas}</h3>
                <p>Tardanzas</p>
              </div>
            </div>
            <div className="stat-card justificado">
              <div className="stat-icon">
                <i className='bx bx-check-shield'></i>
              </div>
              <div className="stat-info">
                <h3>{estadisticas.justificados}</h3>
                <p>Justificados</p>
              </div>
            </div>
            {estadisticas.sinMarcar > 0 && (
              <div className="stat-card sin-marcar">
                <div className="stat-icon">
                  <i className='bx bx-question-mark'></i>
                </div>
                <div className="stat-info">
                  <h3>{estadisticas.sinMarcar}</h3>
                  <p>Sin Marcar</p>
                </div>
              </div>
            )}
          </div>

          {alumnos.length === 0 ? (
            <div className="sin-alumnos">
              <i className='bx bx-user-x'></i>
              <h3>No hay alumnos inscritos</h3>
              <p>Este curso aún no tiene alumnos inscritos</p>
            </div>
          ) : (
            <div className="tabla-asistencia">
              <table>
                <thead>
                  <tr>
                    <th width="5%">N°</th>
                    <th width="30%">Alumno</th>
                    <th width="15%">DNI</th>
                    <th width="30%">Estado de Asistencia</th>
                    <th width="20%">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnos.map((alumno, index) => (
                    <tr key={alumno.id} className={obtenerEstadoAsistencia(alumno.id) ? 'marcado' : ''}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="alumno-info">
                          <span className="alumno-nombre">
                            {alumno.nombres} {alumno.apellidos}
                          </span>
                        </div>
                      </td>
                      <td>{alumno.dni}</td>
                      <td>
                        <div className="botones-asistencia">
                          <button
                            className={`btn-estado presente ${obtenerEstadoAsistencia(alumno.id) === 'presente' ? 'active' : ''
                              }`}
                            onClick={() => marcarAsistencia(alumno.id, 'presente')}
                            title="Presente"
                          >
                            <i className='bx bx-check'></i>
                            <span>P</span>
                          </button>
                          <button
                            className={`btn-estado ausente ${obtenerEstadoAsistencia(alumno.id) === 'ausente' ? 'active' : ''
                              }`}
                            onClick={() => marcarAsistencia(alumno.id, 'ausente')}
                            title="Ausente"
                          >
                            <i className='bx bx-x'></i>
                            <span>A</span>
                          </button>
                          <button
                            className={`btn-estado tardanza ${obtenerEstadoAsistencia(alumno.id) === 'tardanza' ? 'active' : ''
                              }`}
                            onClick={() => marcarAsistencia(alumno.id, 'tardanza')}
                            title="Tardanza"
                          >
                            <i className='bx bx-time'></i>
                            <span>T</span>
                          </button>
                          <button
                            className={`btn-estado justificado ${obtenerEstadoAsistencia(alumno.id) === 'justificado' ? 'active' : ''
                              }`}
                            onClick={() => marcarAsistencia(alumno.id, 'justificado')}
                            title="Justificado"
                          >
                            <i className='bx bx-check-shield'></i>
                            <span>J</span>
                          </button>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Agregar observación..."
                          className="input-observacion"
                          defaultValue={obtenerObservacion(alumno.id)}
                          onBlur={(e) => guardarObservacion(alumno.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="reporte-asistencia">
          <div className="graficos-asistencia">
            <div className="grafico-placeholder">
              <h3>Reporte de Asistencias</h3>
              <p>Curso: {cursoInfo?.nombre}</p>
              <div className="resumen-reporte">
                <p>Total de alumnos: {estadisticas.total}</p>
                <p>Asistencia registrada para la fecha: {fechaSeleccionada}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsistenciasProfesor;