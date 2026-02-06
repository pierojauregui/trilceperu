import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import './ClasesModulo.css';

const ClasesModulo = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [modulo, setModulo] = useState(null);
  const [clases, setClases] = useState([]);
  const [modalCrearClase, setModalCrearClase] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const moduloId = localStorage.getItem('moduloSeleccionado');
  const cursoId = localStorage.getItem('cursoSeleccionado');
  const asignacionId = localStorage.getItem('asignacionId');

  const [nuevaClase, setNuevaClase] = useState({
    titulo: '',
    descripcion: '',
    tipo_clase: 'teorica',
    fecha_clase: '',
    hora_inicio: '',
    hora_fin: '',
    duracion_minutos: 90
  });

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
      
      // Cargar clases del módulo
      const clasesResponse = await fetch(
        `${API_URL}/asignaciones/${asignacionId}/modulo/${moduloId}/clases`
      );
      const clasesData = await clasesResponse.json();
      setClases(clasesData.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const crearClase = async () => {
    try {
      const dataToSend = {
        id_modulo: parseInt(moduloId),
        id_asignacion: parseInt(asignacionId),
        numero_clase: clases.length + 1,
        titulo: nuevaClase.titulo,
        descripcion: nuevaClase.descripcion,
        tipo_clase: nuevaClase.tipo_clase,
        fecha_clase: nuevaClase.fecha_clase || null,
        hora_inicio: nuevaClase.hora_inicio || null,
        hora_fin: nuevaClase.hora_fin || null,
        duracion_minutos: parseInt(nuevaClase.duracion_minutos),
        orden: clases.length + 1
      };

      const response = await fetch(`${API_URL}/clases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        await cargarDatos();
        setModalCrearClase(false);
        setNuevaClase({
          titulo: '',
          descripcion: '',
          tipo_clase: 'teorica',
          fecha_clase: '',
          hora_inicio: '',
          hora_fin: '',
          duracion_minutos: 90
        });
        Swal.fire({
          icon: 'success',
          title: 'Clase creada',
          text: 'La clase se ha creado exitosamente'
        });
      }
    } catch (error) {
      console.error('Error al crear clase:', error);
    }
  };

  const verClase = (claseId) => {
    localStorage.setItem('claseSeleccionada', claseId);
    setCurrentSection('clase-individual');
  };

  const eliminarClase = async (claseId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se eliminará la clase y todo su material',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/clases/${claseId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          await cargarDatos();
          Swal.fire('Eliminado', 'La clase ha sido eliminada', 'success');
        }
      } catch (error) {
        console.error('Error al eliminar clase:', error);
      }
    }
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
    <div className="clases-modulo-container">
      <div className="modulo-header">
        <button 
          className="btn-volver-atras"
          onClick={() => setCurrentSection('gestionar-clases')}
        >
          <i className='bx bx-arrow-back'></i>
        </button>
        <div className="header-info">
          <h1>{modulo?.titulo || 'Cargando...'}</h1>
          <p>Módulo {modulo?.numero_modulo} - {modulo?.descripcion}</p>
        </div>
      </div>

      <div className="clases-toolbar">
        <button 
          className="btn-crear-clase"
          onClick={() => setModalCrearClase(true)}
        >
          <i className='bx bx-plus'></i>
          Nueva Clase
        </button>
      </div>

      {clases.length === 0 ? (
        <div className="empty-state">
          <i className='bx bx-book-open'></i>
          <h3>No hay clases en este módulo</h3>
          <p>Crea la primera clase para comenzar</p>
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
                </div>
              </div>
              <div className="clase-actions">
                <button 
                  className="btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    eliminarClase(clase.id);
                  }}
                >
                  <i className='bx bx-trash'></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear Clase */}
      {modalCrearClase && (
        <div className="modal-overlay" onClick={() => setModalCrearClase(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Nueva Clase</h2>
              <button className="btn-close" onClick={() => setModalCrearClase(false)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Título de la Clase *</label>
                <input 
                  type="text"
                  value={nuevaClase.titulo}
                  onChange={(e) => setNuevaClase({...nuevaClase, titulo: e.target.value})}
                  placeholder="Ej: Introducción al tema"
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea 
                  value={nuevaClase.descripcion}
                  onChange={(e) => setNuevaClase({...nuevaClase, descripcion: e.target.value})}
                  placeholder="Objetivos de la clase"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Clase</label>
                  <select 
                    value={nuevaClase.tipo_clase}
                    onChange={(e) => setNuevaClase({...nuevaClase, tipo_clase: e.target.value})}
                  >
                    <option value="teorica">Teórica</option>
                    <option value="practica">Práctica</option>
                    <option value="taller">Taller</option>
                    <option value="evaluacion">Evaluación</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Duración (min)</label>
                  <input 
                    type="number"
                    value={nuevaClase.duracion_minutos}
                    onChange={(e) => setNuevaClase({...nuevaClase, duracion_minutos: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalCrearClase(false)}>
                Cancelar
              </button>
              <button className="btn-guardar" onClick={crearClase}>
                Crear Clase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClasesModulo;