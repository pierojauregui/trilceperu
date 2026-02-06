import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './ForosAlumno.css';

const ForosAlumno = ({ cursoId: cursoIdProp, setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [cursoInfo, setCursoInfo] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [clases, setClases] = useState([]);
  const [foros, setForos] = useState([]);
  const [foroSeleccionado, setForoSeleccionado] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMensajes, setLoadingMensajes] = useState(false);
  const [ultimoMensajeId, setUltimoMensajeId] = useState(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const { user } = useAuth();
  
  // Estados para filtros
  const [moduloSeleccionado, setModuloSeleccionado] = useState('');
  const [claseSeleccionada, setClaseSeleccionada] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('todos');
  
  // Referencias
  const mensajesRef = useRef(null);
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup al desmontar
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      detenerPolling();
    };
  }, []);

  // Cargar cursos del alumno (solo una vez al montar)
  useEffect(() => {
    if (user?.id) {
      cargarCursosAlumno();
    }
  }, [user?.id]);

  // Cuando cambia el curso seleccionado, cargar datos
  useEffect(() => {
    if (cursoSeleccionado && isMountedRef.current) {
      cargarDatosIniciales();
    }
  }, [cursoSeleccionado]);

  // Cuando cambian los filtros, recargar foros
  useEffect(() => {
    if (cursoSeleccionado && isMountedRef.current) {
      cargarForos();
    }
  }, [moduloSeleccionado, claseSeleccionada, tipoSeleccionado]);

  const cargarCursosAlumno = async () => {
    try {
      const response = await fetch(`${API_URL}/inscripciones/alumno/${user.id}/cursos`);
      const data = await response.json();
      
      if (!isMountedRef.current) return;
      
      if (data.success && data.data && data.data.length > 0) {
        setCursos(data.data);
        
        // Determinar qué curso seleccionar
        let cursoASeleccionar;
        
        if (cursoIdProp) {
          // Si viene un curso como prop, verificar que el alumno esté inscrito
          const cursoValido = data.data.find(c => c.id_curso.toString() === cursoIdProp.toString());
          cursoASeleccionar = cursoValido ? cursoIdProp.toString() : data.data[0].id_curso.toString();
          
          if (!cursoValido) {
            console.warn(`Alumno no inscrito en curso ${cursoIdProp}. Usando curso ${data.data[0].id_curso}`);
          }
        } else {
          // Si no viene prop, usar el primer curso
          cursoASeleccionar = data.data[0].id_curso.toString();
        }
        
        setCursoSeleccionado(cursoASeleccionar);
      } else {
        console.error('No hay cursos disponibles para este alumno');
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    }
  };

  const cargarDatosIniciales = async () => {
    if (!cursoSeleccionado || !isMountedRef.current) return;
    
    try {
      setLoading(true);
      
      // Cargar información del curso
      const cursoResponse = await fetch(`${API_URL}/cursos/${cursoSeleccionado}`);
      const cursoData = await cursoResponse.json();
      
      if (!isMountedRef.current) return;
      setCursoInfo(cursoData.data);
      
      // Cargar módulos y clases - CON MANEJO DE ERROR MEJORADO
      try {
        const modulosClasesResponse = await fetch(
          `${API_URL}/alumnos/${user.id}/curso/${cursoSeleccionado}/modulos-clases`
        );
        
        if (!modulosClasesResponse.ok) {
          if (modulosClasesResponse.status === 404) {
            console.warn('No se encontró inscripción activa en este curso');
            setModulos([]);
            setClases([]);
            setForos([]);
            return;
          }
          throw new Error(`Error ${modulosClasesResponse.status}`);
        }
        
        const modulosClasesData = await modulosClasesResponse.json();
        
        if (!isMountedRef.current) return;
        
        if (modulosClasesData.success && modulosClasesData.data) {
          setModulos(modulosClasesData.data.modulos || []);
          
          // Extraer todas las clases de todos los módulos
          const todasLasClases = [];
          if (modulosClasesData.data.modulos) {
            modulosClasesData.data.modulos.forEach(modulo => {
              if (modulo.clases) {
                todasLasClases.push(...modulo.clases);
              }
            });
          }
          setClases(todasLasClases);
          
          // Cargar foros con la asignación correcta
          await cargarForos();
        }
      } catch (modulosError) {
        console.error('Error al cargar módulos y clases:', modulosError);
        setModulos([]);
        setClases([]);
        setForos([]);
      }
      
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const cargarForos = async () => {
    if (!cursoSeleccionado || !isMountedRef.current) return;
    
    try {
      setLoading(true);
      
      // Primero obtener la asignación del alumno
      const modulosClasesResponse = await fetch(
        `${API_URL}/alumnos/${user.id}/curso/${cursoSeleccionado}/modulos-clases`
      );
      
      if (!modulosClasesResponse.ok) {
        console.warn('No se pudo obtener asignación para cargar foros');
        setForos([]);
        return;
      }
      
      const modulosClasesData = await modulosClasesResponse.json();
      
      if (!isMountedRef.current) return;
      
      let asignacionId = null;
      if (modulosClasesData.success && modulosClasesData.data) {
        asignacionId = modulosClasesData.data.id_asignacion;
      }
      
      if (!asignacionId) {
        console.warn('No se encontró ID de asignación');
        setForos([]);
        return;
      }
      
      // Construir URL con filtros
      let url;
      if (tipoSeleccionado === 'todos' && !moduloSeleccionado && !claseSeleccionada) {
        url = `${API_URL}/foros/asignacion/${asignacionId}`;
      } else {
        url = `${API_URL}/foros/asignacion/${asignacionId}/filtrado`;
        const params = new URLSearchParams();
        
        if (moduloSeleccionado) {
          params.append('modulo_id', moduloSeleccionado);
        }
        if (claseSeleccionada) {
          params.append('clase_id', claseSeleccionada);
        }
        if (tipoSeleccionado && tipoSeleccionado !== 'todos') {
          params.append('tipo_foro', tipoSeleccionado);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (isMountedRef.current) {
        setForos(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar foros:', error);
      if (isMountedRef.current) {
        setForos([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const cargarMensajes = useCallback(async (foroId, silencioso = false) => {
    if (!isMountedRef.current) return;
    
    try {
      if (!silencioso) {
        setLoadingMensajes(true);
      }
      
      const response = await fetch(`${API_URL}/foros/${foroId}/mensajes`);
      const data = await response.json();
      
      if (!isMountedRef.current) return;
      
      const nuevosMensajes = data.data || [];
      setMensajes(nuevosMensajes);
      
      if (nuevosMensajes.length > 0) {
        const nuevoUltimoMensajeId = nuevosMensajes[nuevosMensajes.length - 1].id;
        
        // Mostrar notificación si hay nuevos mensajes y no son del usuario
        if (ultimoMensajeId && nuevoUltimoMensajeId !== ultimoMensajeId && silencioso) {
          const ultimoMensaje = nuevosMensajes[nuevosMensajes.length - 1];
          if (ultimoMensaje.id_usuario !== user.id) {
            mostrarNotificacionNuevoMensaje(ultimoMensaje);
          }
        }
        
        setUltimoMensajeId(nuevoUltimoMensajeId);
        
        // Hacer scroll si es necesario
        if (mensajesRef.current && silencioso) {
          setTimeout(() => {
            if (mensajesRef.current) {
              mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
            }
          }, 100);
        }
      }
      
      setUltimaActualizacion(new Date().toISOString());
      
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    } finally {
      if (!silencioso && isMountedRef.current) {
        setLoadingMensajes(false);
      }
    }
  }, [ultimoMensajeId, user?.id]);

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !foroSeleccionado) return;

    try {
      const response = await fetch(`${API_URL}/foros/mensajes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id_foro: foroSeleccionado.id,
          mensaje: nuevoMensaje
        })
      });

      if (response.ok) {
        setNuevoMensaje('');
        await cargarMensajes(foroSeleccionado.id);
        
        setTimeout(() => {
          if (mensajesRef.current) {
            mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  const mostrarNotificacionNuevoMensaje = (mensaje) => {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-nuevo-mensaje';
    notificacion.innerHTML = `
      <div class="notificacion-contenido">
        <i class='bx bx-message-dots'></i>
        <div>
          <strong>${mensaje.nombres} ${mensaje.apellidos}</strong>
          <p>${mensaje.mensaje.length > 50 ? mensaje.mensaje.substring(0, 50) + '...' : mensaje.mensaje}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
      notificacion.classList.add('mostrar');
    }, 100);
    
    setTimeout(() => {
      notificacion.classList.remove('mostrar');
      setTimeout(() => {
        if (document.body.contains(notificacion)) {
          document.body.removeChild(notificacion);
        }
      }, 300);
    }, 4000);
  };

  const iniciarPolling = useCallback((foroId) => {
    detenerPolling();
    
    intervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        cargarMensajes(foroId, true);
      }
    }, 3000);
  }, [cargarMensajes]);

  const detenerPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const seleccionarForo = async (foro) => {
    setForoSeleccionado(foro);
    setMensajes([]);
    setUltimaActualizacion(null);
    await cargarMensajes(foro.id);
    iniciarPolling(foro.id);
  };

  const getForoIcon = (tipo) => {
    switch (tipo) {
      case 'general': return '💬';
      case 'dudas': return '❓';
      case 'anuncios': return '📢';
      case 'tareas': return '📝';
      default: return '💬';
    }
  };

  const getForoTypeColor = (tipo) => {
    switch (tipo) {
      case 'general': return '#4CAF50';
      case 'dudas': return '#FF9800';
      case 'anuncios': return '#2196F3';
      case 'tareas': return '#9C27B0';
      default: return '#757575';
    }
  };

  return (
    <div className="foros-alumno-container">
      <div className="foros-header">
        <div className="header-content">
          <button 
            className="btn-volver-atras"
            onClick={() => setCurrentSection('dashboard')}
          >
            <i className='bx bx-arrow-back'></i>
            Volver
          </button>
          <div className="foros-header-info">
            <h2>
              <i className='bx bx-chat'></i>
              Foros de Discusión
            </h2>
            <p className="foros-curso-nombre">
              <i className='bx bx-book'></i>
              {cursos.find(c => c.id_curso.toString() === cursoSeleccionado)?.nombre_curso || 'Cargando...'}
            </p>
          </div>
          
          {cursos.length > 0 && (
            <div className="foros-selector-curso">
              <label>Curso:</label>
              <select 
                value={cursoSeleccionado}
                onChange={(e) => {
                  detenerPolling();
                  setForoSeleccionado(null);
                  setCursoSeleccionado(e.target.value);
                }}
              >
                {cursos.map(curso => (
                  <option key={curso.id_curso} value={curso.id_curso}>
                    {curso.nombre_curso}
                  </option>
                ))}
              </select>
              <small style={{color: 'var(--grey-color)', fontSize: '12px'}}>
                {cursos.length} curso(s) disponible(s)
              </small>
            </div>
          )}
        </div>
      </div>

      <div className="foros-filtros">
        <div className="filtro-grupo">
          <label>Módulo:</label>
          <select 
            value={moduloSeleccionado} 
            onChange={(e) => setModuloSeleccionado(e.target.value)}
          >
            <option value="">Todos los módulos</option>
            {modulos.map(modulo => (
              <option key={modulo.id} value={modulo.id}>
                Módulo {modulo.numero_modulo}: {modulo.titulo}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filtro-grupo">
          <label>Clase:</label>
          <select 
            value={claseSeleccionada} 
            onChange={(e) => setClaseSeleccionada(e.target.value)}
          >
            <option value="">Todas las clases</option>
            {clases.map(clase => (
              <option key={clase.id} value={clase.id}>
                Clase {clase.numero_clase}: {clase.titulo}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Tipo de Foro:</label>
          <select 
            value={tipoSeleccionado} 
            onChange={(e) => setTipoSeleccionado(e.target.value)}
          >
            <option value="todos">Todos los tipos</option>
            <option value="general">General</option>
            <option value="dudas">Dudas</option>
            <option value="tareas">Tareas</option>
            <option value="debate">Debate</option>
            <option value="anuncios">Anuncios</option>
          </select>
        </div>
      </div>

      <div className="foros-alumno-layout">
        <div className="foros-lista">
          {loading ? (
            <div className="loading">Cargando foros...</div>
          ) : foros.length === 0 ? (
            <div className="sin-foros">
              <i className='bx bx-chat'></i>
              <h3>No hay foros disponibles</h3>
              <p>No se encontraron foros para los filtros seleccionados</p>
            </div>
          ) : (
            foros.map(foro => (
              <div 
                key={foro.id}
                className={`foro-item ${foroSeleccionado?.id === foro.id ? 'activo' : ''} ${foro.pinned ? 'pinned' : ''}`}
                onClick={() => seleccionarForo(foro)}
              >
                <div className="foro-header">
                  <div className="foro-icon" style={{ color: getForoTypeColor(foro.tipo_foro) }}>
                    {getForoIcon(foro.tipo_foro)}
                  </div>
                  <div className="foro-info">
                    <h4>
                      {foro.pinned && <i className='bx bx-pin'></i>}
                      {foro.titulo}
                    </h4>
                    <p>{foro.descripcion}</p>
                  </div>
                </div>
                <div className="foro-meta">
                  <span className="foro-tipo" style={{ backgroundColor: getForoTypeColor(foro.tipo_foro) }}>
                    {foro.tipo_foro}
                  </span>
                  <span className="foro-mensajes">
                    <i className='bx bx-message'></i>
                    {foro.total_mensajes || 0}
                  </span>
                  {foro.modulo_titulo && (
                    <span className="foro-modulo">
                      <i className='bx bx-book'></i>
                      {foro.modulo_titulo}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="chat-container">
          {foroSeleccionado ? (
            <div className="chat-activo">
              <div className="chat-header">
                <div className="foro-seleccionado-info">
                  <div className="foro-icon" style={{ color: getForoTypeColor(foroSeleccionado.tipo_foro) }}>
                    {getForoIcon(foroSeleccionado.tipo_foro)}
                  </div>
                  <div>
                    <h3>{foroSeleccionado.titulo}</h3>
                    <p>{foroSeleccionado.descripcion}</p>
                  </div>
                </div>
                <button 
                  className="btn-cerrar-chat"
                  onClick={() => {
                    setForoSeleccionado(null);
                    detenerPolling();
                  }}
                >
                  <i className='bx bx-x'></i>
                </button>
              </div>

              <div 
                className="chat-mensajes"
                ref={mensajesRef}
              >
                {loadingMensajes && (
                  <div className="loading-mensajes">
                    <i className='bx bx-loader-alt bx-spin'></i>
                    <span>Cargando mensajes...</span>
                  </div>
                )}
                {mensajes.length === 0 ? (
                  <div className="sin-mensajes">
                    <i className='bx bx-message-dots'></i>
                    <p>No hay mensajes en este foro. ¡Sé el primero en participar!</p>
                  </div>
                ) : (
                  mensajes.map(mensaje => (
                    <div 
                      key={mensaje.id}
                      className={`mensaje ${mensaje.id_usuario === user.id ? 'propio' : ''}`}
                    >
                      <div className="mensaje-avatar">
                        <i className='bx bx-user-circle'></i>
                      </div>
                      <div className="mensaje-contenido-wrapper">
                        <div className="mensaje-autor">
                          {mensaje.nombres} {mensaje.apellidos}
                          <span className="mensaje-fecha">
                            {new Date(mensaje.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="mensaje-contenido">
                          {mensaje.mensaje}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {foroSeleccionado.permite_respuestas && foroSeleccionado.estado === 'abierto' ? (
                <div className="chat-input">
                  <div className="input-wrapper">
                    <input 
                      type="text"
                      placeholder="Escribe tu mensaje..."
                      value={nuevoMensaje}
                      onChange={(e) => setNuevoMensaje(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                    />
                    <button 
                      onClick={enviarMensaje}
                      disabled={!nuevoMensaje.trim()}
                      className={nuevoMensaje.trim() ? 'active' : ''}
                    >
                      <i className='bx bx-send'></i>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="chat-disabled">
                  <i className='bx bx-lock'></i>
                  <span>
                    {foroSeleccionado.estado !== 'abierto' 
                      ? 'Este foro está cerrado' 
                      : 'No se permiten respuestas en este foro'
                    }
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="sin-foro">
              <div className="sin-foro-content">
                <i className='bx bx-chat'></i>
                <h3>Selecciona un foro</h3>
                <p>Elige un foro de la lista para ver los mensajes y participar en la conversación</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForosAlumno;