import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import './ForosProfesor.css';

const ForosProfesor = ({ cursoId, setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [cursoInfo, setCursoInfo] = useState(null);
  const [asignacionId, setAsignacionId] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [clases, setClases] = useState([]);
  const [foros, setForos] = useState([]);
  const [moduloSeleccionado, setModuloSeleccionado] = useState('todos');
  const [claseSeleccionada, setClaseSeleccionada] = useState('todas');
  const [modalCrearForo, setModalCrearForo] = useState(false);
  const [foroSeleccionado, setForoSeleccionado] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const [nuevoForo, setNuevoForo] = useState({
    titulo: '',
    descripcion: '',
    id_modulo: null,
    id_clase: null,
    tipo_foro: 'general',
    esta_fijado: false,
    permite_respuestas: true
  });

  const [nuevoMensaje, setNuevoMensaje] = useState('');

  useEffect(() => {
    if (cursoId) {
      cargarDatosCurso();
    }
  }, [cursoId]);

  useEffect(() => {
    if (asignacionId) {
      cargarForos();
    }
  }, [asignacionId, moduloSeleccionado, claseSeleccionada]);

  useEffect(() => {
    if (foroSeleccionado) {
      cargarMensajes(foroSeleccionado.id);
    }
  }, [foroSeleccionado]);

  const cargarDatosCurso = async () => {
    try {
      setLoading(true);

      // Cargar información del curso
      const cursoResponse = await fetch(`${API_URL}/cursos/${cursoId}`);
      const cursoData = await cursoResponse.json();
      setCursoInfo(cursoData.data);

      // Obtener la asignación del profesor
      const asignacionResponse = await fetch(
        `${API_URL}/asignaciones/profesor/${user.id}/curso/${cursoId}`
      );
      const asignacionData = await asignacionResponse.json();

      if (!asignacionData.success || !asignacionData.data) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No tienes asignación en este curso'
        });
        setCurrentSection('mis-cursos');
        return;
      }

      setAsignacionId(asignacionData.data.id);

      // Cargar módulos del curso
      const modulosResponse = await fetch(`${API_URL}/cursos/${cursoId}/modulos`);
      const modulosData = await modulosResponse.json();
      setModulos(modulosData.data || []);

      // Cargar clases de la asignación
      const clasesResponse = await fetch(
        `${API_URL}/asignaciones/${asignacionData.data.id}/clases`
      );
      const clasesData = await clasesResponse.json();
      setClases(clasesData.data || []);

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarForos = async () => {
    if (!asignacionId) return;

    try {
      let url = `${API_URL}/foros/asignacion/${asignacionId}/filtrado?`;

      if (moduloSeleccionado !== 'todos') {
        url += `modulo_id=${moduloSeleccionado}&`;
      }

      if (claseSeleccionada !== 'todas') {
        url += `clase_id=${claseSeleccionada}&`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setForos(data.data || []);
    } catch (error) {
      console.error('Error al cargar foros:', error);
    }
  };

  const cargarMensajes = async (foroId) => {
    try {
      const response = await fetch(`${API_URL}/foros/${foroId}/mensajes`);
      const data = await response.json();
      setMensajes(data.data || []);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  };

  const crearForo = async () => {
    try {
      const dataToSend = {
        ...nuevoForo,
        id_curso: parseInt(cursoId),
        id_asignacion: asignacionId,
        id_modulo: nuevoForo.id_modulo ? parseInt(nuevoForo.id_modulo) : null,
        id_clase: nuevoForo.id_clase ? parseInt(nuevoForo.id_clase) : null
      };

      const response = await fetch(`${API_URL}/foros`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        await cargarForos();
        setModalCrearForo(false);
        setNuevoForo({
          titulo: '',
          descripcion: '',
          id_modulo: null,
          id_clase: null,
          tipo_foro: 'general',
          esta_fijado: false,
          permite_respuestas: true
        });
        Swal.fire({
          icon: 'success',
          title: 'Foro creado',
          text: 'El foro se ha creado exitosamente'
        });
      }
    } catch (error) {
      console.error('Error al crear foro:', error);
    }
  };

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;

    try {
      const dataToSend = {
        id_foro: foroSeleccionado.id,
        id_usuario: user.id,
        mensaje: nuevoMensaje
      };

      const response = await fetch(`${API_URL}/foros/mensajes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        setNuevoMensaje('');
        await cargarMensajes(foroSeleccionado.id);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  const cerrarForo = async (foroId) => {
    try {
      const response = await fetch(`${API_URL}/foros/${foroId}/cerrar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await cargarForos();
        Swal.fire({
          icon: 'success',
          title: 'Foro cerrado',
          text: 'El foro ha sido cerrado exitosamente'
        });
      }
    } catch (error) {
      console.error('Error al cerrar foro:', error);
    }
  };

  const getTipoForoIcon = (tipo) => {
    const icons = {
      'general': 'bx-conversation',
      'dudas': 'bx-question-mark',
      'tareas': 'bx-task',
      'debate': 'bx-message-dots',
      'anuncios': 'bx-megaphone'
    };
    return icons[tipo] || 'bx-chat';
  };

  const getTipoForoBadgeClass = (tipo) => {
    const classes = {
      'general': 'badge-general',
      'dudas': 'badge-dudas',
      'tareas': 'badge-tareas',
      'debate': 'badge-debate',
      'anuncios': 'badge-anuncios'
    };
    return classes[tipo] || 'badge-default';
  };

  return (
    <div className="foros-profesor-container">
      <div className="foros-header-profesor">
        <h1>Foros del Curso</h1>
        <p>Gestiona los espacios de discusión con tus alumnos</p>
      </div>

      <div className="foros-filtros">
        <select
          value={moduloSeleccionado}
          onChange={(e) => setModuloSeleccionado(e.target.value)}
        >
          <option value="todos">Todos los módulos</option>
          {modulos.map(modulo => (
            <option key={modulo.id} value={modulo.id}>
              Módulo {modulo.numero_modulo}: {modulo.titulo}
            </option>
          ))}
        </select>

        <select
          value={claseSeleccionada}
          onChange={(e) => setClaseSeleccionada(e.target.value)}
        >
          <option value="todas">Todas las clases</option>
          {clases.map(clase => (
            <option key={clase.id} value={clase.id}>
              Clase {clase.numero_clase}: {clase.titulo}
            </option>
          ))}
        </select>

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="todos">Todos los tipos</option>
          <option value="general">General</option>
          <option value="dudas">Dudas</option>
          <option value="tareas">Tareas</option>
          <option value="debate">Debate</option>
          <option value="anuncios">Anuncios</option>
        </select>
      </div>

      <div className="foros-layout">
        <div className="foros-sidebar">
          <div className="foros-toolbar">
            <button
              className="btn-crear-foro"
              onClick={() => setModalCrearForo(true)}
            >
              <i className='bx bx-plus'></i>
              Nuevo Foro
            </button>
          </div>

          <div className="foros-lista">
            {foros.map(foro => (
              <div
                key={foro.id}
                className={`foro-item ${foroSeleccionado?.id === foro.id ? 'active' : ''}`}
                onClick={() => setForoSeleccionado(foro)}
              >
                <div className="foro-icon">
                  <i className={`bx ${getTipoForoIcon(foro.tipo_foro)}`}></i>
                </div>
                <div className="foro-info">
                  <h4>{foro.titulo}</h4>
                  <p>{foro.descripcion}</p>
                  <div className="foro-meta">
                    <span className={`foro-tipo ${getTipoForoBadgeClass(foro.tipo_foro)}`}>
                      {foro.tipo_foro}
                    </span>
                    <span className="foro-mensajes">
                      {foro.total_mensajes || 0} mensajes
                    </span>
                  </div>
                </div>
                {foro.esta_fijado && (
                  <div className="foro-pin">
                    <i className='bx bxs-pin'></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="foros-chat">
          {foroSeleccionado ? (
            <>
              <div className="chat-header">
                <div className="chat-header-info">
                  <h2>{foroSeleccionado.titulo}</h2>
                  <p>{foroSeleccionado.descripcion}</p>
                </div>
                <div className="chat-header-actions">
                  {foroSeleccionado.estado === 'abierto' && (
                    <button
                      className="btn-cerrar-foro"
                      onClick={() => cerrarForo(foroSeleccionado.id)}
                    >
                      <i className='bx bx-lock'></i>
                      Cerrar Foro
                    </button>
                  )}
                </div>
              </div>

              <div className="chat-mensajes">
                {mensajes.length === 0 ? (
                  <div className="sin-mensajes">
                    <i className='bx bx-message-dots'></i>
                    <p>No hay mensajes en este foro aún</p>
                  </div>
                ) : (
                  mensajes.map(mensaje => (
                    <div
                      key={mensaje.id}
                      className={`mensaje-item ${mensaje.id_usuario === user.id ? 'mensaje-propio' : ''}`}
                    >
                      <div className="mensaje-avatar">
                        <i className='bx bx-user-circle'></i>
                      </div>
                      <div className="mensaje-contenido">
                        <div className="mensaje-header">
                          <span className="mensaje-autor">
                            {mensaje.nombres} {mensaje.apellidos}
                          </span>
                          <span className="mensaje-fecha">
                            {new Date(mensaje.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="mensaje-texto">
                          {mensaje.mensaje}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {foroSeleccionado.permite_respuestas && foroSeleccionado.estado === 'abierto' && (
                <div className="chat-input">
                  <input
                    type="text"
                    placeholder="Escribe tu mensaje..."
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                  />
                  <button onClick={enviarMensaje}>
                    <i className='bx bx-send'></i>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="sin-seleccion">
              <i className='bx bx-chat'></i>
              <h3>Selecciona un foro</h3>
              <p>Elige un foro de la lista para ver los mensajes</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear Foro */}
      {modalCrearForo && (
        <div className="modal-overlay" onClick={() => setModalCrearForo(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Nuevo Foro</h2>
              <button className="btn-close" onClick={() => setModalCrearForo(false)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Título del Foro</label>
                <input
                  type="text"
                  value={nuevoForo.titulo}
                  onChange={(e) => setNuevoForo({ ...nuevoForo, titulo: e.target.value })}
                  placeholder="Ej: Dudas del Módulo 1"
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={nuevoForo.descripcion}
                  onChange={(e) => setNuevoForo({ ...nuevoForo, descripcion: e.target.value })}
                  placeholder="Describe el propósito del foro"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Tipo de Foro</label>
                <select
                  value={nuevoForo.tipo_foro}
                  onChange={(e) => setNuevoForo({ ...nuevoForo, tipo_foro: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="dudas">Dudas</option>
                  <option value="tareas">Tareas</option>
                  <option value="debate">Debate</option>
                  <option value="anuncios">Anuncios</option>
                </select>
              </div>

              // Agregar después del tipo de foro en el modal
              <div className="form-group">
                <label>Módulo (Opcional)</label>
                <select
                  value={nuevoForo.id_modulo || ''}
                  onChange={(e) => setNuevoForo({ ...nuevoForo, id_modulo: e.target.value || null })}
                >
                  <option value="">Foro general del curso</option>
                  {modulos.map(modulo => (
                    <option key={modulo.id} value={modulo.id}>
                      Módulo {modulo.numero_modulo}: {modulo.titulo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Clase (Opcional)</label>
                <select
                  value={nuevoForo.id_clase || ''}
                  onChange={(e) => setNuevoForo({ ...nuevoForo, id_clase: e.target.value || null })}
                  disabled={!nuevoForo.id_modulo}
                >
                  <option value="">Todas las clases del módulo</option>
                  {clases
                    .filter(clase => !nuevoForo.id_modulo || clase.modulo_id === parseInt(nuevoForo.id_modulo))
                    .map(clase => (
                      <option key={clase.id} value={clase.id}>
                        Clase {clase.numero_clase}: {clase.titulo}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={nuevoForo.permite_respuestas}
                    onChange={(e) => setNuevoForo({ ...nuevoForo, permite_respuestas: e.target.checked })}
                  />
                  <span>Permitir respuestas de alumnos</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancelar" onClick={() => setModalCrearForo(false)}>
                Cancelar
              </button>
              <button className="btn-guardar" onClick={crearForo}>
                Crear Foro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForosProfesor;