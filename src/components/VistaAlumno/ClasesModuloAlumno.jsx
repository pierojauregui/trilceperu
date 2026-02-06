import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './ClasesModuloAlumno.css';

const ClasesModuloAlumno = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [modulo, setModulo] = useState(null);
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const moduloId = localStorage.getItem('moduloSeleccionadoAlumno');
  const cursoId = localStorage.getItem('cursoSeleccionadoAlumno');
  const asignacionId = localStorage.getItem('asignacionIdAlumno');

  useEffect(() => {
    cargarDatos();
  }, [moduloId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar información del módulo
      const moduloResponse = await fetch(`${API_URL}/modulos/${moduloId}`);
      const moduloData = await moduloResponse.json();
      setModulo(moduloData.data);
      
      // Cargar clases del módulo usando asignacionId si está disponible
      let clasesResponse;
      if (asignacionId) {
        // Usar endpoint con asignacionId para obtener las clases correctas
        clasesResponse = await fetch(
          `${API_URL}/asignaciones/${asignacionId}/modulo/${moduloId}/clases`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      } else {
        // Fallback al endpoint original
        clasesResponse = await fetch(
          `${API_URL}/cursos/${cursoId}/modulo/${moduloId}/clases`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      }
      
      const clasesData = await clasesResponse.json();
      setClases(clasesData.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const verClase = (claseId) => {
    localStorage.setItem('claseSeleccionadaAlumno', claseId);
    setCurrentSection('clase-individual-alumno');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando clases...</p>
      </div>
    );
  }

  return (
    <div className="clases-modulo-alumno-container">
      <div className="modulo-header">
        <button 
          className="btn-volver-atras"
          onClick={() => setCurrentSection('clases-alumno')}
        >
          <i className='bx bx-arrow-back'></i>
        </button>
        <div className="header-info">
          <h1>{modulo?.titulo || 'Cargando...'}</h1>
          <p>Módulo {modulo?.numero_modulo} - {modulo?.descripcion}</p>
        </div>
      </div>

      {clases.length === 0 ? (
        <div className="empty-state">
          <i className='bx bx-book-open'></i>
          <h3>No hay clases disponibles en este módulo</h3>
          <p>Las clases aparecerán aquí cuando el profesor las publique</p>
        </div>
      ) : (
        <div className="clases-grid">
          {clases.map((clase, index) => (
            <div key={clase.id} className="clase-card" onClick={() => verClase(clase.id)}>
              <div className="clase-numero">
                {index + 1}
              </div>
              <div className="clase-content">
                <h3>{clase.titulo}</h3>
                <p>{clase.descripcion}</p>
                <div className="clase-meta">
                  <span className={`tipo-badge ${clase.tipo_clase}`}>
                    {clase.tipo_clase}
                  </span>
                  {clase.fecha_clase && (
                    <span className="fecha">
                      <i className='bx bx-calendar'></i>
                      {new Date(clase.fecha_clase).toLocaleDateString()}
                    </span>
                  )}
                  {clase.duracion_minutos && (
                    <span className="duracion">
                      <i className='bx bx-time'></i>
                      {clase.duracion_minutos} min
                    </span>
                  )}
                </div>
              </div>
              <div className="clase-status">
                <i className='bx bx-play-circle'></i>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClasesModuloAlumno;