import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import './GestionarClases.css';

const GestionarClases = ({ cursoId: cursoIdProp, setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [cursos, setCursos] = useState([]);
  // Prioridad: prop > localStorage > vacío
  const cursoIdInicial = cursoIdProp || localStorage.getItem('cursoSeleccionado') || '';
  const [cursoSeleccionado, setCursoSeleccionado] = useState(cursoIdInicial);
  const [asignacion, setAsignacion] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [modalCrearModulo, setModalCrearModulo] = useState(false);
  const [modalEditarModulo, setModalEditarModulo] = useState(false);
  const [moduloEditar, setModuloEditar] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const [nuevoModulo, setNuevoModulo] = useState({
    titulo: '',
    descripcion: '',
    orden: 1
  });

  useEffect(() => {
    cargarCursosProfesor();
  }, [user]);

  useEffect(() => {
    if (cursoSeleccionado) {
      obtenerAsignacionYCargarDatos();
    }
  }, [cursoSeleccionado]);

  const cargarCursosProfesor = async () => {
    try {
      const response = await fetch(`${API_URL}/asignaciones/profesor/${user.id}/cursos`);
      const data = await response.json();
      if (data.success && data.data) {
        setCursos(data.data);
        // Si no hay curso seleccionado, usar el de localStorage o el primero disponible
        if (!cursoSeleccionado && data.data.length > 0) {
          const cursoFromStorage = localStorage.getItem('cursoSeleccionado');
          if (cursoFromStorage && data.data.some(c => c.curso_id.toString() === cursoFromStorage)) {
            setCursoSeleccionado(cursoFromStorage);
          } else {
            setCursoSeleccionado(data.data[0].curso_id.toString());
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    }
  };

  const obtenerAsignacionYCargarDatos = async () => {
    try {
      setLoading(true);
      
      const asignacionResponse = await fetch(
        `${API_URL}/asignaciones/profesor/${user.id}/curso/${cursoSeleccionado}`
      );
      const asignacionData = await asignacionResponse.json();
      
      if (asignacionData.success && asignacionData.data) {
        setAsignacion(asignacionData.data);
        
        const modulosResponse = await fetch(`${API_URL}/cursos/${cursoSeleccionado}/modulos`);
        const modulosData = await modulosResponse.json();
        setModulos(modulosData.data || []);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const crearModulo = async () => {
    try {
      const dataToSend = {
        id_curso: parseInt(cursoSeleccionado),
        numero_modulo: modulos.length + 1,
        titulo: nuevoModulo.titulo,
        descripcion: nuevoModulo.descripcion,
        orden: modulos.length + 1
      };

      const response = await fetch(`${API_URL}/modulos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        await obtenerAsignacionYCargarDatos();
        setModalCrearModulo(false);
        setNuevoModulo({ titulo: '', descripcion: '', orden: 1 });
        Swal.fire({
          icon: 'success',
          title: 'Módulo creado',
          text: 'El módulo se ha creado exitosamente'
        });
      }
    } catch (error) {
      console.error('Error al crear módulo:', error);
    }
  };

  const editarModulo = async () => {
    try {
      const response = await fetch(`${API_URL}/modulos/${moduloEditar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          titulo: moduloEditar.titulo,
          descripcion: moduloEditar.descripcion
        })
      });

      if (response.ok) {
        await obtenerAsignacionYCargarDatos();
        setModalEditarModulo(false);
        setModuloEditar(null);
        Swal.fire({
          icon: 'success',
          title: 'Módulo actualizado',
          text: 'El módulo se ha actualizado exitosamente'
        });
      }
    } catch (error) {
      console.error('Error al editar módulo:', error);
    }
  };

  const eliminarModulo = async (moduloId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se eliminarán todas las clases de este módulo',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/modulos/${moduloId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          await obtenerAsignacionYCargarDatos();
          Swal.fire('Eliminado', 'El módulo ha sido eliminado', 'success');
        }
      } catch (error) {
        console.error('Error al eliminar módulo:', error);
      }
    }
  };

  const verClasesModulo = (moduloId) => {
    localStorage.setItem('moduloSeleccionado', moduloId);
    localStorage.setItem('cursoSeleccionado', cursoSeleccionado);
    localStorage.setItem('asignacionId', asignacion.id);
    setCurrentSection('clases-modulo');
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
    <div className="gestionar-clases-container">
      <div className="clases-header">
        <div className="header-top">
          <button 
            className="btn-volver-atras"
            onClick={() => setCurrentSection('mis-cursos')}
          >
            <i className='bx bx-arrow-back'></i>
            Volver a Mis Cursos
          </button>
        </div>
        
        <div className="header-content-clases">
          <h1>Gestión de Clases</h1>
          <p>Organiza los módulos y clases de tus cursos</p>
        </div>
        
        {cursos.length > 1 && (
          <div className="selector-curso">
            <label>Curso:</label>
            <select 
              value={cursoSeleccionado}
              onChange={(e) => setCursoSeleccionado(e.target.value)}
            >
              {cursos.map(curso => (
                <option key={curso.curso_id} value={curso.curso_id}>
                  {curso.curso_nombre}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {asignacion && (
          <div className="asignacion-info">
            <span className="horario-badge">
              <i className='bx bx-time'></i>
              {asignacion.horarios?.map(h => 
                `${h.dia_semana} ${h.hora_inicio}-${h.hora_fin}`
              ).join(', ')}
            </span>
          </div>
        )}
      </div>

      <div className="clases-toolbar">
        <button 
          className="btn-crear-modulo"
          onClick={() => setModalCrearModulo(true)}
        >
          <i className='bx bx-folder-plus'></i>
          Crear Módulo
        </button>
      </div>

      {modulos.length === 0 ? (
        <div className="empty-state">
          <i className='bx bx-folder-open'></i>
          <h3>No hay módulos creados</h3>
          <p>Crea el primer módulo para empezar a organizar tus clases</p>
        </div>
      ) : (
        <div className="modulos-grid">
          {modulos.map(modulo => (
            <div key={modulo.id} className="modulo-card-item" onClick={() => verClasesModulo(modulo.id)}>
              <div className="modulo-actions">
                <button 
                  className="btn-edit-modulo"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModuloEditar(modulo);
                    setModalEditarModulo(true);
                  }}
                  title="Editar módulo"
                >
                  <i className='bx bx-edit'></i>
                </button>
                <button 
                  className="btn-delete-modulo"
                  onClick={(e) => {
                    e.stopPropagation();
                    eliminarModulo(modulo.id);
                  }}
                  title="Eliminar módulo"
                >
                  <i className='bx bx-trash'></i>
                </button>
              </div>
              
              <div className="modulo-icon">
                <i className='bx bx-folder'></i>
              </div>
              
              <div className="modulo-content">
                <h3>Módulo {modulo.numero_modulo}</h3>
                <h4>{modulo.titulo}</h4>
                {modulo.descripcion && (
                  <p>{modulo.descripcion}</p>
                )}
                <span className="modulo-clases-count">
                  Ver clases →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear Módulo */}
      {modalCrearModulo && (
        <div className="modal-overlay" onClick={() => setModalCrearModulo(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Nuevo Módulo</h2>
              <button className="btn-close" onClick={() => setModalCrearModulo(false)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Título del Módulo *</label>
                <input 
                  type="text"
                  value={nuevoModulo.titulo}
                  onChange={(e) => setNuevoModulo({...nuevoModulo, titulo: e.target.value})}
                  placeholder="Ej: Fundamentos Básicos"
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea 
                  value={nuevoModulo.descripcion}
                  onChange={(e) => setNuevoModulo({...nuevoModulo, descripcion: e.target.value})}
                  placeholder="Describe el contenido del módulo"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalCrearModulo(false)}>
                Cancelar
              </button>
              <button className="btn-guardar" onClick={crearModulo}>
                Crear Módulo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Módulo */}
      {modalEditarModulo && moduloEditar && (
        <div className="modal-overlay" onClick={() => setModalEditarModulo(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Módulo</h2>
              <button className="btn-close" onClick={() => setModalEditarModulo(false)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Título del Módulo *</label>
                <input 
                  type="text"
                  value={moduloEditar.titulo}
                  onChange={(e) => setModuloEditar({...moduloEditar, titulo: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea 
                  value={moduloEditar.descripcion || ''}
                  onChange={(e) => setModuloEditar({...moduloEditar, descripcion: e.target.value})}
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalEditarModulo(false)}>
                Cancelar
              </button>
              <button className="btn-guardar" onClick={editarModulo}>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionarClases;