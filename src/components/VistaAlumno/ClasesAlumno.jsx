import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './ClasesAlumno.css';

const ClasesAlumno = ({ cursoId, setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [cursoInfo, setCursoInfo] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [asignacionId, setAsignacionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (cursoId) {
      cargarDatosCurso();
    }
  }, [cursoId]);

  const cargarDatosCurso = async () => {
    try {
      setLoading(true);
      
      // Cargar información del curso
      const cursoResponse = await fetch(`${API_URL}/cursos/${cursoId}`);
      const cursoData = await cursoResponse.json();
      setCursoInfo(cursoData.curso);
      
      // Obtener asignacionId desde las inscripciones del alumno
      const inscripcionesResponse = await fetch(
        `${API_URL}/inscripciones/alumno/${user.id}/cursos`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const inscripcionesData = await inscripcionesResponse.json();
      
      // Buscar la inscripción para este curso específico
      const inscripcionCurso = inscripcionesData.data?.find(
        inscripcion => inscripcion.id_curso === parseInt(cursoId)
      );
      
      if (inscripcionCurso && inscripcionCurso.id_asignacion) {
        setAsignacionId(inscripcionCurso.id_asignacion);
      }
      
      // Cargar módulos del curso
      const modulosResponse = await fetch(`${API_URL}/cursos/${cursoId}/modulos`);
      const modulosData = await modulosResponse.json();
      setModulos(modulosData.data || []);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const verClasesModulo = (moduloId) => {
    localStorage.setItem('moduloSeleccionadoAlumno', moduloId.toString());
    localStorage.setItem('cursoSeleccionadoAlumno', cursoId.toString());
    // Guardar asignacionId para que el endpoint funcione correctamente
    if (asignacionId) {
      localStorage.setItem('asignacionIdAlumno', asignacionId.toString());
    }
    setCurrentSection('clases-modulo-alumno');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando módulos...</p>
      </div>
    );
  }

  return (
    <div className="clases-alumno-container">
      <div className="clases-header">
        <div className="header-contend-modulos">
          <h1>Módulos del curso de: {cursoInfo?.nombre || 'Cargando...'}</h1>
          <p>Explora los módulos y clases disponibles</p>
        </div>
      </div>

      <div className="clases-toolbar">
        <button 
          className="btn-volver-atras"
          onClick={() => setCurrentSection('mis-cursos-alumno')}
        >
          <i className='bx bx-arrow-back'></i>
          Volver a Mis Cursos
        </button>
      </div>

      {modulos.length === 0 ? (
        <div className="empty-state">
          <i className='bx bx-folder-open'></i>
          <h3>No hay módulos disponibles</h3>
          <p>Este curso aún no tiene módulos creados</p>
        </div>
      ) : (
        <div className="modulos-grid">
          {modulos.map(modulo => (
            <div key={modulo.id} className="modulo-card-item" onClick={() => verClasesModulo(modulo.id)}>
              <div className="modulo-icon">
                <i className='bx bx-folder'></i>
              </div>
              
              <div className="modulo-content">
                <h3>Módulo {modulo.numero_modulo}</h3>
                <h4>{modulo.titulo}</h4>
                {modulo.descripcion && (
                  <p>{modulo.descripcion}</p>
                )}
                <div className="modulo-stats">
                  <span className="modulo-progreso">
                    <i className='bx bx-check-circle'></i>
                    {modulo.clases_completadas || 0}/{modulo.total_clases || 0} clases completadas
                  </span>
                </div>
                <span className="modulo-clases-count">
                  Ver clases →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClasesAlumno;