import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import './MisCursosAlumno.css';

const MisCursosAlumno = ({ setCurrentSection, setCursoSeleccionado }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [cursosInscritos, setCursosInscritos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    cargarCursosInscritos();
  }, []);

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
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const accederCurso = (inscripcion) => {
    const cursoData = {
      id: inscripcion.id_curso,
      id_curso: inscripcion.id_curso,
      id_asignacion: inscripcion.id_asignacion, // Usar id_asignacion en lugar de asignacionId
      nombre: inscripcion.nombre_curso,
      descripcion: inscripcion.descripcion_curso,
      fecha_inscripcion: inscripcion.fecha_inscripcion,
      monto_total_pagado: inscripcion.monto_total_pagado
    };
    
    setCursoSeleccionado(cursoData);
    localStorage.setItem('cursoSeleccionadoAlumno', JSON.stringify(cursoData));
    localStorage.setItem('asignacionIdAlumno', inscripcion.id_asignacion);
    setCurrentSection('clases-alumno');
  };



  if (loading) {
    return (
      <div className="alumno-loading">
        <div className="spinner"></div>
        <p>Cargando tus cursos...</p>
      </div>
    );
  }

  return (
    <div className="mis-cursos-alumno-container">
      <div className="mis-cursos-alumno-header">
        <h1>Mis Cursos</h1>
        <p>Accede a tus cursos inscritos</p>
        <button 
          className="btn-explorar-cursos"
          onClick={() => setCurrentSection('cursos-disponibles')}
        >
          <i className='bx bx-search-alt'></i>
          Explorar más cursos
        </button>
      </div>

      {cursosInscritos.length === 0 ? (
        <div className="sin-cursos-alumno">
          <i className='bx bx-book'></i>
          <h3>No estás inscrito en ningún curso</h3>
          <p>Explora los cursos disponibles y comienza tu aprendizaje</p>
          <button 
            className="btn-ver-disponibles"
            onClick={() => setCurrentSection('cursos-disponibles')}
          >
            Ver cursos disponibles
          </button>
        </div>
      ) : (
        <div className="cursos-alumno-grid">
          {cursosInscritos.map(inscripcion => (
            <div key={inscripcion.id} className="curso-alumno-card">
              {/* Imagen del curso */}
              <div className="curso-imagen-container">
                {inscripcion.imagen_curso ? (
                  <img 
                    src={inscripcion.imagen_curso.startsWith('http') ? inscripcion.imagen_curso : `${API_URL.replace('/api', '')}${inscripcion.imagen_curso}`}
                    alt={inscripcion.nombre_curso}
                    className="curso-imagen"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const placeholder = e.target.parentNode.querySelector('.imagen-placeholder');
                      if (placeholder) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className="imagen-placeholder" style={{display: inscripcion.imagen_curso ? 'none' : 'flex'}}>
                  <i className='bx bx-image'></i>
                  <span>Sin imagen</span>
                </div>
              </div>

              <div className="curso-alumno-header">
                <h3>{inscripcion.nombre_curso}</h3>
                <span className="estado-inscripcion activo">Activo</span>
              </div>

              <div className="curso-alumno-info">
                <div className="curso-profesor">
                  <div className="profesor-imagen">
                    {inscripcion.profesor_imagen ? (
                      <img 
                        src={inscripcion.profesor_imagen.startsWith('http') ? inscripcion.profesor_imagen : `${API_URL.replace('/api', '')}/${inscripcion.profesor_imagen}`}
                        alt={`Prof. ${inscripcion.nombre_profesor} ${inscripcion.apellido_profesor}`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const placeholder = e.target.parentNode.querySelector('.profesor-imagen-placeholder');
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className="profesor-imagen-placeholder" style={{display: inscripcion.profesor_imagen ? 'none' : 'flex'}}>
                      <i className='bx bx-user'></i>
                    </div>
                  </div>
                  <span>Prof. {inscripcion.nombre_profesor} {inscripcion.apellido_profesor}</span>
                </div>

                <div className="curso-horario">
                  <i className='bx bx-time'></i>
                  <span>{inscripcion.horario}</span>
                </div>

                <div className="curso-progreso">
                  <div className="progreso-header">
                    <span>Progreso del curso</span>
                    <span>{inscripcion.porcentaje_completado || 0}%</span>
                  </div>
                  <div className="progreso-barra">
                    <div 
                      className="progreso-fill"
                      style={{width: `${inscripcion.porcentaje_completado || 0}%`}}
                    ></div>
                  </div>
                </div>

                <div className="curso-estadisticas">
                  <div className="stat">
                    <i className='bx bx-book-content'></i>
                    <span>{inscripcion.total_clases || 0} clases</span>
                  </div>
                  <div className="stat">
                    <i className='bx bx-check-circle'></i>
                    <span>{inscripcion.clases_completadas || 0} completadas</span>
                  </div>
                  <div className="stat">
                    <i className='bx bx-medal'></i>
                    <span>Nota: {inscripcion.promedio_notas || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="curso-alumno-acciones">
                <button 
                  className="btn-acceder"
                  onClick={() => accederCurso(inscripcion)}
                >
                  <i className='bx bx-log-in'></i>
                  Acceder al curso
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisCursosAlumno;