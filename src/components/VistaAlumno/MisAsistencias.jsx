import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './MisAsistencias.css';

const MisAsistencias = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [asistencias, setAsistencias] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cursosInscritos, setCursosInscritos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth());
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    cargarCursosInscritos();
  }, []);

  useEffect(() => {
    if (cursoSeleccionado) {
      cargarAsistencias();
    }
  }, [cursoSeleccionado, filtroMes]);

  const cargarCursosInscritos = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/inscripciones/alumno/${user.id}/cursos`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      setCursosInscritos(data.data || []);
      
      // Si hay cursos, seleccionar el primero por defecto
      if (data.data && data.data.length > 0) {
        setCursoSeleccionado(data.data[0]);
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarAsistencias = async () => {
    try {
      setLoading(true);
      
      // Cargar asistencias del alumno para el curso seleccionado
      const response = await fetch(
        `${API_URL}/asistencias/alumno/${user.id}/curso/${cursoSeleccionado.id_curso}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      setAsistencias(data.data || []);
      
      // Calcular estadísticas
      calcularEstadisticas(data.data || []);
      
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (asistencias) => {
    const total = asistencias.length;
    const presentes = asistencias.filter(a => a.estado_asistencia === 'presente').length;
    const ausentes = asistencias.filter(a => a.estado_asistencia === 'ausente').length;
    const tardanzas = asistencias.filter(a => a.estado_asistencia === 'tardanza').length;
    const justificados = asistencias.filter(a => a.estado_asistencia === 'justificado').length;
    
    const porcentajeAsistencia = total > 0 ? ((presentes + tardanzas) / total * 100).toFixed(1) : 0;
    
    setEstadisticas({
      total,
      presentes,
      ausentes,
      tardanzas,
      justificados,
      porcentajeAsistencia
    });
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'presente': '#4CAF50',
      'ausente': '#f44336',
      'tardanza': '#FF9800',
      'justificado': '#2196F3'
    };
    return colores[estado] || '#9E9E9E';
  };

  const getEstadoIcon = (estado) => {
    const iconos = {
      'presente': 'bx-check-circle',
      'ausente': 'bx-x-circle',
      'tardanza': 'bx-time-five',
      'justificado': 'bx-check-shield'
    };
    return iconos[estado] || 'bx-question-mark';
  };

  return (
    <div className="mis-asistencias-container">
      <div className="mis-asistencias-header">
        <button 
          className="btn-volver-atras"
          onClick={() => setCurrentSection('mis-cursos-alumno')}
        >
          <i className='bx bx-arrow-back'></i>
          Volver
        </button>
        <h1>Mis Asistencias</h1>
      </div>

      {/* Selector de cursos */}
      <div className="selector-cursos">
        <h3>Seleccionar Curso</h3>
        <div className="cursos-grid">
          {cursosInscritos.map(curso => (
            <div 
              key={curso.id_curso}
              className={`curso-card ${cursoSeleccionado?.id_curso === curso.id_curso ? 'selected' : ''}`}
              onClick={() => setCursoSeleccionado(curso)}
            >
              <div className="curso-info">
                <h4 className="icon-alumno-course">{curso.nombre_curso}</h4>
              </div>
              <div className="curso-estado">
                <span className="estado-badge activo">Inscrito</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {cursoSeleccionado && (
        <>
          <div className="curso-seleccionado-info">
            <h3>Asistencias de: {cursoSeleccionado.nombre_curso}</h3>
          </div>

      {estadisticas && (
        <div className="asistencias-estadisticas">
          <div className="estadistica-card">
            <div className="estadistica-valor" style={{color: '#4CAF50'}}>
              {estadisticas.porcentajeAsistencia}%
            </div>
            <div className="estadistica-label">Asistencia</div>
          </div>
          
          <div className="estadistica-card">
            <div className="estadistica-icono presente">
              <i className='bx bx-check-circle'></i>
            </div>
            <div className="estadistica-info">
              <div className="estadistica-valor">{estadisticas.presentes}</div>
              <div className="estadistica-label">Presentes</div>
            </div>
          </div>
          
          <div className="estadistica-card">
            <div className="estadistica-icono ausente">
              <i className='bx bx-x-circle'></i>
            </div>
            <div className="estadistica-info">
              <div className="estadistica-valor">{estadisticas.ausentes}</div>
              <div className="estadistica-label">Ausentes</div>
            </div>
          </div>
          
          <div className="estadistica-card">
            <div className="estadistica-icono tardanza">
              <i className='bx bx-time-five'></i>
            </div>
            <div className="estadistica-info">
              <div className="estadistica-valor">{estadisticas.tardanzas}</div>
              <div className="estadistica-label">Tardanzas</div>
            </div>
          </div>
          
          <div className="estadistica-card">
            <div className="estadistica-icono justificado">
              <i className='bx bx-check-shield'></i>
            </div>
            <div className="estadistica-info">
              <div className="estadistica-valor">{estadisticas.justificados}</div>
              <div className="estadistica-label">Justificados</div>
            </div>
          </div>
        </div>
        )}

        <div className="asistencias-calendario">
          <h3>Registro de Asistencias</h3>
          
          {loading ? (
            <div className="loading-container">
              <div className="icon-alumno-spinner"></div>
              <p>Cargando asistencias...</p>
            </div>
          ) : asistencias.length === 0 ? (
            <div className="empty-state">
              <i className='bx bx-calendar-x'></i>
              <h4>No hay registros de asistencia</h4>
              <p>Aún no tienes asistencias registradas para este curso</p>
            </div>
          ) : (
            <div className="calendario-grid">
              {asistencias.map(asistencia => (
                <div key={asistencia.id} className="asistencia-item">
                  <div className="icon-alumno-date">
                    {new Date(asistencia.fecha_clase).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  
                  <div className="asistencia-clase">
                    <div className="clase-titulo">{asistencia.clase_titulo}</div>
                    <div className="modulo-info">
                      Módulo {asistencia.numero_modulo}: {asistencia.modulo_titulo}
                    </div>
                  </div>
                  
                  <div 
                    className="icon-alumno-status"
                    style={{backgroundColor: getEstadoColor(asistencia.estado_asistencia)}}
                  >
                    <i className={`bx ${getEstadoIcon(asistencia.estado_asistencia)}`}></i>
                    <span>{asistencia.estado_asistencia}</span>
                  </div>
                  
                  {asistencia.observaciones && (
                    <div className="asistencia-observacion">
                      <i className='bx bx-note'></i>
                      {asistencia.observaciones}
                    </div>
                  )}
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

export default MisAsistencias;