import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import './GestionarExamenes.css';

const GestionarExamenes = ({ cursoId: cursoIdProp, setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(() => {
    return cursoIdProp ? parseInt(cursoIdProp) : '';
  });

  const [cursoInfo, setCursoInfo] = useState(() => {
    if (cursoIdProp) {
      return { nombre: 'Cargando curso...' };
    }
    return null;
  });
  const [modulos, setModulos] = useState([]);
  const [examenes, setExamenes] = useState([]);
  const [asignacionId, setAsignacionId] = useState(null);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalPreguntas, setModalPreguntas] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [examenSeleccionado, setExamenSeleccionado] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroModulo, setFiltroModulo] = useState('todos');
  const [publicando, setPublicando] = useState(false);
  const { user } = useAuth();

  const [nuevoExamen, setNuevoExamen] = useState({
    titulo: '',
    descripcion: '',
    id_modulo: null,
    tipo_examen: 'quiz',
    fecha_inicio: '',
    fecha_fin: '',
    duracion_minutos: 60,
    intentos_permitidos: 1,
    nota_minima_aprobacion: 11.00,
    mostrar_respuestas: true,
    aleatorizar_preguntas: false
  });

  const [nuevaPregunta, setNuevaPregunta] = useState({
    pregunta: '',
    tipo_pregunta: 'multiple',
    opciones: ['', '', '', ''],
    respuesta_correcta: '',
    retroalimentacion: '',
    puntos: 1
  });

  const [editandoPregunta, setEditandoPregunta] = useState(null);

  const [examenEditando, setExamenEditando] = useState({
    titulo: '',
    descripcion: '',
    id_modulo: null,
    tipo_examen: 'quiz',
    fecha_inicio: '',
    fecha_fin: '',
    duracion_minutos: 60,
    intentos_permitidos: 1,
    nota_minima_aprobacion: 11.00,
    mostrar_respuestas: false,
    aleatorizar_preguntas: true
  });

  // Función para abrir el modal de creación con fecha actual
  const abrirModalCrear = () => {
    const ahora = new Date();
    // Ajustar a la zona horaria local
    const offsetMs = ahora.getTimezoneOffset() * 60000;
    const fechaLocal = new Date(ahora.getTime() - offsetMs);
    const fechaActual = fechaLocal.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:MM
    
    setNuevoExamen({
      titulo: '',
      descripcion: '',
      id_modulo: null,
      tipo_examen: 'quiz',
      fecha_inicio: fechaActual,
      fecha_fin: '',
      duracion_minutos: 60,
      intentos_permitidos: 1,
      nota_minima_aprobacion: 11.00,
      mostrar_respuestas: true,
      aleatorizar_preguntas: false
    });
    
    setModalCrear(true);
  };

  const editarExamen = (examen) => {
    // ✅ Convertir fechas correctamente
    const fechaInicio = examen.fecha_inicio ?
      new Date(examen.fecha_inicio).toISOString().slice(0, 16) : '';
    const fechaFin = examen.fecha_fin ?
      new Date(examen.fecha_fin).toISOString().slice(0, 16) : '';

    setExamenEditando({
      titulo: examen.titulo,
      descripcion: examen.descripcion,
      id_modulo: examen.id_modulo,
      tipo_examen: examen.tipo_examen,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      duracion_minutos: parseInt(examen.duracion_minutos), // ✅ Convertir a número
      intentos_permitidos: parseInt(examen.intentos_permitidos), // ✅ Convertir a número
      nota_minima_aprobacion: parseFloat(examen.nota_minima_aprobacion), // ✅ Convertir a número
      mostrar_respuestas: Boolean(examen.mostrar_respuestas),
      aleatorizar_preguntas: Boolean(examen.aleatorizar_preguntas)
    });
    setExamenSeleccionado(examen);
    setModalEditar(true);
  };

  const actualizarExamen = async () => {
    try {
      if (!examenSeleccionado) return;

      const response = await fetch(`${API_URL}/examenes/${examenSeleccionado.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(examenEditando)
      });

      if (response.ok) {
        await cargarDatosCurso();
        setModalEditar(false);
        setExamenSeleccionado(null);
        Swal.fire({
          icon: 'success',
          title: 'Examen actualizado',
          text: 'Los cambios se han guardado correctamente'
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorData.detail || 'No se pudo actualizar el examen'
        });
      }
    } catch (error) {
      console.error('Error al actualizar examen:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el examen'
      });
    }
  };

  // useEffect mejorado
  useEffect(() => {
    if (user?.id) {
      cargarCursosProfesor();
    }
  }, [user?.id]);

  useEffect(() => {
    if (cursoSeleccionado) {
      cargarDatosCurso();
    }
  }, [cursoSeleccionado]);

  const cargarCursosProfesor = async () => {
    try {
      const response = await fetch(`${API_URL}/asignaciones/profesor/${user.id}/cursos`);
      const data = await response.json();
      if (data.success && data.data) {
        setCursos(data.data);
        // Si viene un curso por prop, usarlo, sino usar el primero
        if (!cursoIdProp && data.data.length > 0) {
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

      // Cargar información del curso
      const cursoResponse = await fetch(`${API_URL}/cursos/${cursoSeleccionado}`);
      const cursoData = await cursoResponse.json();
      setCursoInfo(cursoData.curso);

      // Cargar módulos del curso
      const modulosResponse = await fetch(`${API_URL}/cursos/${cursoSeleccionado}/modulos`);
      const modulosData = await modulosResponse.json();
      setModulos(modulosData.data || []);

      // Obtener la asignación del profesor
      const asignacionResponse = await fetch(
        `${API_URL}/asignaciones/profesor/${user.id}/curso/${cursoSeleccionado}`
      );
      const asignacionData = await asignacionResponse.json();

      if (!asignacionData.success || !asignacionData.data) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No tienes asignación en este curso'
        });
        return;
      }


      const asignacionId = asignacionData.data.id;
      setAsignacionId(asignacionId); // Guardar en estado

      // Cargar exámenes del curso (RUTA ESPECÍFICA PARA PROFESORES)
      const examenesResponse = await fetch(
        `${API_URL}/examenes/profesor/asignacion/${asignacionId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const examenesData = await examenesResponse.json();
      setExamenes(examenesData.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setCursoInfo({ nombre: 'Error al cargar curso' }); // 👈 Agregar esto
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la información del curso'
      });
    } finally {
      setLoading(false);
    }
  };

  const crearExamen = async () => {
    try {
      if (!user || !user.id) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Usuario no identificado'
        });
        return;
      }

      // Verificar que tenemos la asignación
      if (!asignacionId) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se encontró la asignación del curso'
        });
        return;
      }

      const dataToSend = {
        ...nuevoExamen,
        id_curso: parseInt(cursoSeleccionado),
        id_modulo: nuevoExamen.id_modulo ? parseInt(nuevoExamen.id_modulo) : null,
        id_profesor: user.id,
        id_asignacion: asignacionId
      };

      const response = await fetch(`${API_URL}/examenes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const result = await response.json();
        await cargarDatosCurso();
        setModalCrear(false);
        setNuevoExamen({
          titulo: '',
          descripcion: '',
          id_modulo: null,
          tipo_examen: 'quiz',
          fecha_inicio: '',
          fecha_fin: '',
          duracion_minutos: 60,
          intentos_permitidos: 1,
          nota_minima_aprobacion: 11.00,
          mostrar_respuestas: true,
          aleatorizar_preguntas: false
        });
        Swal.fire({
          icon: 'success',
          title: 'Examen creado',
          text: 'Ahora puedes agregar preguntas al examen'
        });
      }
    } catch (error) {
      console.error('Error al crear examen:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el examen'
      });
    }
  };

  const cargarPreguntas = async (examenId) => {
    try {
      const response = await fetch(`${API_URL}/examenes/${examenId}/preguntas`);
      const data = await response.json();
      setPreguntas(data.data || []);
    } catch (error) {
      console.error('Error al cargar preguntas:', error);
    }
  };

  const agregarPregunta = async () => {
    if (!examenSeleccionado) return;

    try {
      const dataToSend = {
        id_examen: examenSeleccionado.id,
        tipo_pregunta: nuevaPregunta.tipo_pregunta,
        pregunta: nuevaPregunta.pregunta,
        opciones: nuevaPregunta.tipo_pregunta === 'multiple' ?
          JSON.stringify(nuevaPregunta.opciones.filter(o => o)) : null,
        respuesta_correcta: nuevaPregunta.respuesta_correcta,
        retroalimentacion: nuevaPregunta.retroalimentacion,
        puntos: parseFloat(nuevaPregunta.puntos),
        orden: preguntas.length + 1
      };

      const response = await fetch(`${API_URL}/preguntas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        await cargarPreguntas(examenSeleccionado.id);
        setNuevaPregunta({
          pregunta: '',
          tipo_pregunta: 'multiple',
          opciones: ['', '', '', ''],
          respuesta_correcta: '',
          puntos: 1
        });
        Swal.fire({
          icon: 'success',
          title: 'Pregunta agregada',
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (error) {
      console.error('Error al agregar pregunta:', error);
    }
  };

  const eliminarPregunta = async (preguntaId) => {
    try {
      const response = await fetch(`${API_URL}/preguntas/${preguntaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await cargarPreguntas(examenSeleccionado.id);
      }
    } catch (error) {
      console.error('Error al eliminar pregunta:', error);
    }
  };

  const editarPregunta = (pregunta) => {
    setEditandoPregunta(pregunta.id);

    // Parsear correctamente las opciones si es pregunta múltiple
    let opcionesParsed = ['', '', '', ''];
    if (pregunta.tipo_pregunta === 'multiple' && pregunta.opciones) {
      try {
        opcionesParsed = JSON.parse(pregunta.opciones);
      } catch (e) {
        console.error('Error al parsear opciones:', e);
      }
    }

    setNuevaPregunta({
      pregunta: pregunta.pregunta,
      tipo_pregunta: pregunta.tipo_pregunta,
      opciones: opcionesParsed,
      respuesta_correcta: pregunta.respuesta_correcta || '',
      retroalimentacion: pregunta.retroalimentacion || '',
      puntos: parseFloat(pregunta.puntos) || 1
    });
  };

  const cancelarEdicion = () => {
    setEditandoPregunta(null);
    setNuevaPregunta({
      pregunta: '',
      tipo_pregunta: 'multiple',
      opciones: ['', '', '', ''],
      respuesta_correcta: '',
      retroalimentacion: '',
      puntos: 1
    });
  };

  const actualizarPregunta = async () => {
    try {
      // Validaciones...
      if (!nuevaPregunta.pregunta.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo requerido',
          text: 'Debes escribir la pregunta',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      if (nuevaPregunta.tipo_pregunta === 'multiple' && !nuevaPregunta.respuesta_correcta) {
        Swal.fire({
          icon: 'warning',
          title: 'Respuesta requerida',
          text: 'Debes seleccionar la respuesta correcta',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      if (nuevaPregunta.tipo_pregunta === 'verdadero_falso' && !nuevaPregunta.respuesta_correcta) {
        Swal.fire({
          icon: 'warning',
          title: 'Respuesta requerida',
          text: 'Debes seleccionar Verdadero o Falso',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      const dataToSend = {
        id_examen: examenSeleccionado.id,
        tipo_pregunta: nuevaPregunta.tipo_pregunta,
        pregunta: nuevaPregunta.pregunta,
        opciones: nuevaPregunta.tipo_pregunta === 'multiple' ?
          JSON.stringify(nuevaPregunta.opciones.filter(o => o.trim())) : null,
        respuesta_correcta: nuevaPregunta.respuesta_correcta,
        retroalimentacion: nuevaPregunta.retroalimentacion,
        puntos: parseFloat(nuevaPregunta.puntos)
        // ✅ NO enviar 'orden' al actualizar
      };

      console.log('Enviando actualización:', dataToSend);

      const response = await fetch(`${API_URL}/preguntas/${editandoPregunta}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        await cargarPreguntas(examenSeleccionado.id);
        cancelarEdicion();

        Swal.fire({
          icon: 'success',
          title: '¡Pregunta actualizada!',
          text: 'Los cambios se guardaron correctamente',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        // ✅ CORRECCIÓN: Parsear el error correctamente
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);

        let errorMessage = 'No se pudo actualizar la pregunta';

        // Manejar diferentes formatos de error
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Error de validación de Pydantic
            errorMessage = errorData.detail.map(err => {
              return `${err.loc.join('.')}: ${err.msg}`;
            }).join('\n');
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          }
        }

        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          text: errorMessage,
          confirmButtonText: 'Entendido'
        });
      }
    } catch (error) {
      console.error('Error al actualizar pregunta:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar la pregunta. Verifica tu conexión.',
        confirmButtonText: 'Entendido'
      });
    }
  };

  const publicarExamen = async (examenId) => {
    try {
      setPublicando(true); // ✅ Mostrar loading

      const response = await fetch(`${API_URL}/examenes/${examenId}/publicar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await cargarDatosCurso(); // ✅ Recargar datos
        Swal.fire({
          icon: 'success',
          title: 'Examen publicado',
          text: 'El examen ya está disponible para los alumnos',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorData.detail || 'No se pudo publicar el examen'
        });
      }
    } catch (error) {
      console.error('Error al publicar examen:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo publicar el examen'
      });
    } finally {
      setPublicando(false); // ✅ Ocultar loading
    }
  };

  const eliminarExamen = async (examenId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se eliminarán todas las preguntas y respuestas',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/examenes/${examenId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          await cargarDatosCurso();
          Swal.fire('Eliminado', 'El examen ha sido eliminado', 'success');
        }
      } catch (error) {
        console.error('Error al eliminar examen:', error);
      }
    }
  };

  const gestionarPreguntas = async (examen) => {
    setExamenSeleccionado(examen);
    await cargarPreguntas(examen.id);
    setModalPreguntas(true);
  };

  const examenesFiltrados = examenes.filter(examen => {
    if (filtroModulo === 'todos') return true;
    if (filtroModulo === 'sin-modulo') return !examen.id_modulo;
    return examen.id_modulo === parseInt(filtroModulo);
  });

  const getEstadoBadge = (estado) => {
    const badges = {
      'borrador': 'examenes-badge-borrador',
      'publicado': 'examenes-badge-publicado',
      'cerrado': 'examenes-badge-cerrado'
    };
    return badges[estado] || 'examenes-badge-default';
  };

  const getTipoExamenIcon = (tipo) => {
    const icons = {
      'quiz': 'bx-list-check',
      'parcial': 'bx-book-bookmark',
      'final': 'bx-trophy',
      'practica': 'bx-edit-alt'
    };
    return icons[tipo] || 'bx-file';
  };

  if (loading) {
    return (
      <div className="examenes-loading">
        <div className="examenes-spinner"></div>
        <p>Cargando exámenes...</p>
      </div>
    );
  }

  return (
    <div className="examenes-gestionar-container">
      <div className="examenes-header-profesor">
        <div className="examenes-header-top">
          <button
            className="examenes-btn-volver-atras"
            onClick={() => setCurrentSection('mis-cursos')}
          >
            <i className='bx bx-arrow-back'></i>
          </button>
          <div className="examenes-header-info">
            <h1>Gestión de Exámenes</h1>
            <p className="examenes-curso-nombre">
              <i className='bx bx-book'></i>
              {cursoInfo?.nombre || 'Cargando...'}
            </p>
          </div>
        </div>

        {cursos.length > 1 && (
          <div className="examenes-selector-curso">
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
      </div>

      <div className="examenes-toolbar">
        <button
          className="examenes-btn-crear"
          onClick={abrirModalCrear}
        >
          <i className='bx bx-plus'></i>
          Crear Nuevo Examen
        </button>

        <select
          className="examenes-filtro-modulo"
          value={filtroModulo}
          onChange={(e) => setFiltroModulo(e.target.value)}
        >
          <option value="todos">Todos los exámenes</option>
          <option value="sin-modulo">Exámenes generales</option>
          {modulos.map(modulo => (
            <option key={modulo.id} value={modulo.id}>
              Módulo {modulo.numero_modulo}: {modulo.titulo}
            </option>
          ))}
        </select>
      </div>

      <div className="examenes-grid">
        {examenesFiltrados.length === 0 ? (
          <div className="examenes-empty">
            <i className='bx bx-file-blank'></i>
            <h3>No hay exámenes</h3>
            <p>Crea tu primer examen para evaluar a tus alumnos</p>
          </div>
        ) : (
          examenesFiltrados.map(examen => (
            <div key={examen.id} className="examenes-card">
              <div className="examenes-card-header">
                <div className="examenes-tipo">
                  <i className={`bx ${getTipoExamenIcon(examen.tipo_examen)}`}></i>
                  <span>{examen.tipo_examen.toUpperCase()}</span>
                </div>
                <span className={`examenes-estado ${getEstadoBadge(examen.estado)}`}>
                  {examen.estado}
                </span>
              </div>

              <div className="examenes-card-body">
                <h3>{examen.titulo}</h3>
                <p className="examenes-descripcion">{examen.descripcion}</p>

                {examen.modulo_titulo && (
                  <p className="examenes-modulo">
                    <i className='bx bx-folder'></i>
                    {examen.modulo_titulo}
                  </p>
                )}

                <div className="examenes-detalles">
                  <div className="examenes-detalle">
                    <i className='bx bx-time'></i>
                    <span>{examen.duracion_minutos} min</span>
                  </div>
                  <div className="examenes-detalle">
                    <i className='bx bx-question-mark'></i>
                    <span>{examen.total_preguntas || 0} preguntas</span>
                  </div>
                  <div className="examenes-detalle">
                    <i className='bx bx-repeat'></i>
                    <span>{examen.intentos_permitidos} intentos</span>
                  </div>
                </div>

                <div className="examenes-fechas">
                  <p><strong>Inicio:</strong> {new Date(examen.fecha_inicio).toLocaleDateString()}</p>
                  <p><strong>Fin:</strong> {new Date(examen.fecha_fin).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="examenes-card-footer">
                <button
                  className="examenes-btn-accion examenes-btn-preguntas"
                  onClick={() => gestionarPreguntas(examen)}
                >
                  <i className='bx bx-list-plus'></i>
                  Preguntas
                </button>
                <button
                  className="examenes-btn-accion examenes-btn-editar"
                  onClick={() => editarExamen(examen)}
                >
                  <i className='bx bx-edit'></i>
                  Editar
                </button>
                {examen.estado === 'borrador' && (
                  <button
                    className="examenes-btn-accion examenes-btn-publicar"
                    onClick={() => publicarExamen(examen.id)}
                    disabled={publicando} // ✅ Deshabilitar mientras publica
                  >
                    <i className='bx bx-upload'></i>
                    {publicando ? 'Publicando...' : 'Publicar'}
                  </button>
                )}
                <button
                  className="examenes-btn-accion examenes-btn-eliminar"
                  onClick={() => eliminarExamen(examen.id)}
                >
                  <i className='bx bx-trash'></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Crear Examen */}
      {modalCrear && (
        <div className="examenes-modal-overlay" onClick={() => setModalCrear(false)}>
          <div className="examenes-modal-content" onClick={e => e.stopPropagation()}>
            <div className="examenes-modal-header">
              <h2>Crear Nuevo Examen</h2>
              <button className="examenes-btn-close" onClick={() => setModalCrear(false)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="examenes-modal-body">
              <div className="examenes-form-group">
                <label>Título del Examen *</label>
                <input
                  type="text"
                  value={nuevoExamen.titulo}
                  onChange={(e) => setNuevoExamen({ ...nuevoExamen, titulo: e.target.value })}
                  placeholder="Ej: Examen Parcial - Unidad 1"
                  required
                />
              </div>

              <div className="examenes-form-group">
                <label>Módulo (Opcional)</label>
                <select
                  value={nuevoExamen.id_modulo || ''}
                  onChange={(e) => setNuevoExamen({ ...nuevoExamen, id_modulo: e.target.value || null })}
                >
                  <option value="">Examen general del curso</option>
                  {modulos.map(modulo => (
                    <option key={modulo.id} value={modulo.id}>
                      Módulo {modulo.numero_modulo}: {modulo.titulo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="examenes-form-group">
                <label>Descripción</label>
                <textarea
                  value={nuevoExamen.descripcion}
                  onChange={(e) => setNuevoExamen({ ...nuevoExamen, descripcion: e.target.value })}
                  placeholder="Describe el contenido del examen"
                  rows="3"
                />
              </div>

              <div className="examenes-form-row">
                <div className="examenes-form-group">
                  <label>Tipo de Examen</label>
                  <select
                    value={nuevoExamen.tipo_examen}
                    onChange={(e) => setNuevoExamen({ ...nuevoExamen, tipo_examen: e.target.value })}
                  >
                    <option value="quiz">Quiz</option>
                    <option value="parcial">Parcial</option>
                    <option value="final">Final</option>
                    <option value="practica">Práctica</option>
                  </select>
                </div>
                <div className="examenes-form-group">
                  <label>Duración (minutos)</label>
                  <input
                    type="number"
                    value={nuevoExamen.duracion_minutos}
                    onChange={(e) => setNuevoExamen({ ...nuevoExamen, duracion_minutos: e.target.value })}
                    min="5"
                    max="240"
                  />
                </div>
              </div>

              <div className="examenes-form-row">
                <div className="examenes-form-group">
                  <label>
                    <i className='bx bx-calendar'></i>
                    Fecha de Inicio *
                  </label>
                  <input
                    type="datetime-local"
                    value={nuevoExamen.fecha_inicio}
                    onChange={(e) => setNuevoExamen({ ...nuevoExamen, fecha_inicio: e.target.value })}
                    required
                  />
                </div>
                <div className="examenes-form-group">
                  <label>
                    <i className='bx bx-calendar'></i>
                    Fecha de Fin *
                  </label>
                  <input
                    type="datetime-local"
                    value={nuevoExamen.fecha_fin}
                    onChange={(e) => setNuevoExamen({ ...nuevoExamen, fecha_fin: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="examenes-form-row">
                <div className="examenes-form-group">
                  <label>Intentos Permitidos</label>
                  <input
                    type="number"
                    value={nuevoExamen.intentos_permitidos}
                    onChange={(e) => setNuevoExamen({ ...nuevoExamen, intentos_permitidos: e.target.value })}
                    min="1"
                    max="10"
                  />
                </div>
                <div className="examenes-form-group">
                  <label>Nota Mínima Aprobación</label>
                  <input
                    type="number"
                    value={nuevoExamen.nota_minima_aprobacion}
                    onChange={(e) => setNuevoExamen({ ...nuevoExamen, nota_minima_aprobacion: e.target.value })}
                    min="0"
                    max="20"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="examenes-form-checkboxes">
                <label>
                  <input
                    type="checkbox"
                    checked={nuevoExamen.mostrar_respuestas}
                    onChange={(e) => setNuevoExamen({ ...nuevoExamen, mostrar_respuestas: e.target.checked })}
                  />
                  <span>Mostrar respuestas al finalizar</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={nuevoExamen.aleatorizar_preguntas}
                    onChange={(e) => setNuevoExamen({ ...nuevoExamen, aleatorizar_preguntas: e.target.checked })}
                  />
                  <span>Aleatorizar preguntas</span>
                </label>
              </div>
            </div>
            <div className="examenes-modal-footer">
              <button className="examenes-btn-cancelar" onClick={() => setModalCrear(false)}>
                Cancelar
              </button>
              <button
                className="examenes-btn-guardar"
                onClick={crearExamen}
                disabled={!nuevoExamen.titulo || !nuevoExamen.fecha_inicio || !nuevoExamen.fecha_fin}
              >
                Crear Examen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Examen */}
      {modalEditar && examenSeleccionado && (
        <div className="examenes-modal-overlay" onClick={() => setModalEditar(false)}>
          <div className="examenes-modal-content" onClick={e => e.stopPropagation()}>
            <div className="examenes-modal-header">
              <h2>Editar Examen</h2>
              <button className="examenes-btn-close" onClick={() => setModalEditar(false)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="examenes-modal-body">
              <div className="examenes-form-group">
                <label>Título del Examen *</label>
                <input
                  type="text"
                  value={examenEditando.titulo}
                  onChange={(e) => setExamenEditando({ ...examenEditando, titulo: e.target.value })}
                  placeholder="Ej: Examen Parcial - Unidad 1"
                  required
                />
              </div>

              <div className="examenes-form-group">
                <label>Descripción</label>
                <textarea
                  value={examenEditando.descripcion}
                  onChange={(e) => setExamenEditando({ ...examenEditando, descripcion: e.target.value })}
                  placeholder="Descripción del examen..."
                  rows="3"
                />
              </div>

              <div className="examenes-form-row">
                <div className="examenes-form-group">
                  <label>Módulo</label>
                  <select
                    value={examenEditando.id_modulo || ''}
                    onChange={(e) => setExamenEditando({ ...examenEditando, id_modulo: e.target.value ? parseInt(e.target.value) : null })}
                  >
                    <option value="">Sin módulo específico</option>
                    {modulos.map(modulo => (
                      <option key={modulo.id} value={modulo.id}>
                        Módulo {modulo.numero_modulo}: {modulo.titulo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="examenes-form-group">
                  <label>Tipo de Examen</label>
                  <select
                    value={examenEditando.tipo_examen}
                    onChange={(e) => setExamenEditando({ ...examenEditando, tipo_examen: e.target.value })}
                  >
                    <option value="quiz">Quiz</option>
                    <option value="parcial">Parcial</option>
                    <option value="final">Final</option>
                    <option value="practica">Práctica</option>
                  </select>
                </div>
              </div>

              <div className="examenes-form-row">
                <div className="examenes-form-group">
                  <label>
                    <i className='bx bx-calendar'></i>
                    Fecha y Hora de Inicio *
                  </label>
                  <input
                    type="datetime-local"
                    value={examenEditando.fecha_inicio}
                    onChange={(e) => setExamenEditando({ ...examenEditando, fecha_inicio: e.target.value })}
                    required
                  />
                </div>
                <div className="examenes-form-group">
                  <label>
                    <i className='bx bx-calendar'></i>
                    Fecha y Hora de Fin *
                  </label>
                  <input
                    type="datetime-local"
                    value={examenEditando.fecha_fin}
                    onChange={(e) => setExamenEditando({ ...examenEditando, fecha_fin: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="examenes-form-row">
                <div className="examenes-form-group">
                  <label>Duración (minutos)</label>
                  <input
                    type="number"
                    value={examenEditando.duracion_minutos}
                    onChange={(e) => setExamenEditando({
                      ...examenEditando,
                      duracion_minutos: parseInt(e.target.value) || 0  // ✅ Parsear inmediatamente
                    })}
                    min="5"
                    max="300"
                  />
                </div>
                <div className="examenes-form-group">
                  <label>Intentos Permitidos</label>
                  <input
                    type="number"
                    value={examenEditando.intentos_permitidos}
                    onChange={(e) => setExamenEditando({
                      ...examenEditando,
                      intentos_permitidos: parseInt(e.target.value) || 1  // ✅ Parsear inmediatamente
                    })}
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div className="examenes-form-row">
                <div className="examenes-form-group">
                  <label>Nota Mínima Aprobación</label>
                  <input
                    type="number"
                    value={examenEditando.nota_minima_aprobacion}
                    onChange={(e) => setExamenEditando({
                      ...examenEditando,
                      nota_minima_aprobacion: parseFloat(e.target.value) || 0  // ✅ Parsear inmediatamente
                    })}
                    min="0"
                    max="20"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="examenes-form-checkboxes">
                <label>
                  <input
                    type="checkbox"
                    checked={examenEditando.mostrar_respuestas}
                    onChange={(e) => setExamenEditando({ ...examenEditando, mostrar_respuestas: e.target.checked })}
                  />
                  <span>Mostrar respuestas al finalizar</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={examenEditando.aleatorizar_preguntas}
                    onChange={(e) => setExamenEditando({ ...examenEditando, aleatorizar_preguntas: e.target.checked })}
                  />
                  <span>Aleatorizar preguntas</span>
                </label>
              </div>
            </div>
            <div className="examenes-modal-footer">
              <button className="examenes-btn-cancelar" onClick={() => setModalEditar(false)}>
                Cancelar
              </button>
              <button
                className="examenes-btn-guardar"
                onClick={actualizarExamen}
                disabled={!examenEditando.titulo || !examenEditando.fecha_inicio || !examenEditando.fecha_fin}
              >
                Actualizar Examen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gestionar Preguntas */}
      {modalPreguntas && examenSeleccionado && (
        <div className="examenes-modal-overlay" onClick={() => setModalPreguntas(false)}>
          <div className="examenes-modal-content examenes-modal-large" onClick={e => e.stopPropagation()}>
            <div className="examenes-modal-header">
              <h2>Gestionar Preguntas - {examenSeleccionado.titulo}</h2>
              <button className="examenes-btn-close" onClick={() => setModalPreguntas(false)}>
                <i className='bx bx-x'></i>
              </button>
            </div>
            <div className="examenes-modal-body">
              <div className="examenes-preguntas-form">
                <h3>{editandoPregunta ? 'Editar Pregunta' : 'Agregar Nueva Pregunta'}</h3>
                <div className="examenes-form-group">
                  <label>Tipo de Pregunta</label>
                  <select
                    value={nuevaPregunta.tipo_pregunta}
                    onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, tipo_pregunta: e.target.value })}
                  >
                    <option value="multiple">Opción Múltiple</option>
                    <option value="verdadero_falso">Verdadero/Falso</option>
                    <option value="respuesta_corta">Respuesta Corta</option>
                    <option value="ensayo">Ensayo</option>
                  </select>
                </div>

                <div className="examenes-form-group">
                  <label>Pregunta *</label>
                  <textarea
                    value={nuevaPregunta.pregunta}
                    onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, pregunta: e.target.value })}
                    placeholder="Escribe la pregunta..."
                    rows="3"
                  />
                </div>

                {nuevaPregunta.tipo_pregunta === 'multiple' && (
                  <div className="examenes-opciones">
                    <label>Opciones (selecciona la respuesta correcta):</label>
                    {nuevaPregunta.opciones.map((opcion, index) => (
                      <div key={index} className="examenes-opcion-input">
                        <input
                          type="radio"
                          name="respuesta_correcta"
                          value={index.toString()}  // ✅ QUITAR EL + 1
                          checked={nuevaPregunta.respuesta_correcta === index.toString()}  // ✅ QUITAR EL + 1
                          onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, respuesta_correcta: e.target.value })}
                        />
                        <input
                          type="text"
                          value={opcion}
                          onChange={(e) => {
                            const nuevasOpciones = [...nuevaPregunta.opciones];
                            nuevasOpciones[index] = e.target.value;
                            setNuevaPregunta({ ...nuevaPregunta, opciones: nuevasOpciones });
                          }}
                          placeholder={`Opción ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {nuevaPregunta.tipo_pregunta === 'verdadero_falso' && (
                  <div className="examenes-form-group">
                    <label>Respuesta Correcta:</label>
                    <select
                      value={nuevaPregunta.respuesta_correcta}
                      onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, respuesta_correcta: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="verdadero">Verdadero</option>
                      <option value="falso">Falso</option>
                    </select>
                  </div>
                )}

                {(nuevaPregunta.tipo_pregunta === 'respuesta_corta' || nuevaPregunta.tipo_pregunta === 'ensayo') && (
                  <div className="examenes-form-group">
                    <label>Respuesta Esperada (Guía):</label>
                    <textarea
                      value={nuevaPregunta.respuesta_correcta}
                      onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, respuesta_correcta: e.target.value })}
                      placeholder="Respuesta esperada para guía del profesor..."
                      rows="2"
                    />
                  </div>
                )}

                <div className="examenes-form-group">
                  <label>Puntos:</label>
                  <input
                    type="number"
                    value={nuevaPregunta.puntos}
                    onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, puntos: e.target.value })}
                    min="1"
                    max="10"
                    step="0.5"
                  />
                </div>

                <div className="examenes-form-group">
                  <label>Retroalimentación (Explicación de la respuesta correcta):</label>
                  <textarea
                    value={nuevaPregunta.retroalimentacion}
                    onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, retroalimentacion: e.target.value })}
                    placeholder="Explica por qué esta es la respuesta correcta. Esto se mostrará al alumno cuando responda incorrectamente..."
                    rows="3"
                  />
                  <small className="examenes-help-text">
                    <i className='bx bx-info-circle'></i>
                    Esta explicación ayudará al alumno a entender su error y aprender del tema.
                  </small>
                </div>

                <div className="examenes-form-buttons">
                  {editandoPregunta ? (
                    <>
                      <button
                        className="examenes-btn-actualizar-pregunta"
                        onClick={actualizarPregunta}
                        disabled={!nuevaPregunta.pregunta}
                      >
                        <i className='bx bx-check'></i>
                        Actualizar Pregunta
                      </button>
                      <button
                        className="examenes-btn-cancelar-edicion"
                        onClick={cancelarEdicion}
                      >
                        <i className='bx bx-x'></i>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      className="examenes-btn-agregar-pregunta"
                      onClick={agregarPregunta}
                      disabled={!nuevaPregunta.pregunta}
                    >
                      <i className='bx bx-plus'></i>
                      Agregar Pregunta
                    </button>
                  )}
                </div>
              </div>

              <div className="examenes-preguntas-lista">
                <h3>Preguntas del Examen ({preguntas.length})</h3>
                {preguntas.length === 0 ? (
                  <p className="examenes-sin-preguntas">No hay preguntas agregadas aún</p>
                ) : (
                  <div className="examenes-preguntas-items">
                    {preguntas.map((pregunta, index) => (
                      <div key={pregunta.id} className="examenes-pregunta-item">
                        <div className="examenes-pregunta-numero">{index + 1}</div>

                        <div className="examenes-pregunta-contenido">
                          <p className="examenes-pregunta-texto">{pregunta.pregunta}</p>

                          {/* Metadata de la pregunta */}
                          <div className="examenes-pregunta-meta">
                            <span className="examenes-tipo-badge">
                              <i className='bx bx-category'></i>
                              {pregunta.tipo_pregunta === 'multiple' && 'Opción Múltiple'}
                              {pregunta.tipo_pregunta === 'verdadero_falso' && 'Verdadero/Falso'}
                              {pregunta.tipo_pregunta === 'respuesta_corta' && 'Respuesta Corta'}
                              {pregunta.tipo_pregunta === 'ensayo' && 'Ensayo'}
                            </span>
                            <span className="examenes-puntos-badge">
                              <i className='bx bx-trophy'></i>
                              {pregunta.puntos} pts
                            </span>
                          </div>

                          {/* Vista previa según tipo de pregunta */}
                          {pregunta.tipo_pregunta === 'multiple' && pregunta.opciones && (
                            <div className="examenes-pregunta-preview">
                              <h4 className="preview-title">
                                <i className='bx bx-list-ul'></i>
                                Opciones:
                              </h4>
                              <div className="examenes-opciones-preview">
                                {JSON.parse(pregunta.opciones).map((opcion, opIndex) => {
                                  const esCorrecta = opIndex.toString() === pregunta.respuesta_correcta;  // ✅ QUITAR EL + 1
                                  return (
                                    <div
                                      key={opIndex}
                                      className={`examenes-opcion-preview ${esCorrecta ? 'correcta' : ''}`}
                                    >
                                      <span className="opcion-numero">{opIndex + 1}.</span>
                                      <span className="opcion-texto">{opcion}</span>
                                      {esCorrecta && (
                                        <span className="opcion-correcta-badge">
                                          <i className='bx bx-check-circle'></i>
                                          Correcta
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {pregunta.tipo_pregunta === 'verdadero_falso' && pregunta.respuesta_correcta && (
                            <div className="examenes-pregunta-preview">
                              <h4 className="preview-title">
                                <i className='bx bx-check-square'></i>
                                Respuesta Correcta:
                              </h4>
                              <div className="examenes-respuesta-vf">
                                <div className={`vf-option ${pregunta.respuesta_correcta.toLowerCase() === 'verdadero' ? 'correcta' : 'incorrecta'}`}>
                                  <i className={`bx ${pregunta.respuesta_correcta.toLowerCase() === 'verdadero' ? 'bx-check-circle' : 'bx-x-circle'}`}></i>
                                  <span>Verdadero</span>
                                  {pregunta.respuesta_correcta.toLowerCase() === 'verdadero' && (
                                    <span className="badge-correcto">✓ Correcta</span>
                                  )}
                                </div>
                                <div className={`vf-option ${pregunta.respuesta_correcta.toLowerCase() === 'falso' ? 'correcta' : 'incorrecta'}`}>
                                  <i className={`bx ${pregunta.respuesta_correcta.toLowerCase() === 'falso' ? 'bx-check-circle' : 'bx-x-circle'}`}></i>
                                  <span>Falso</span>
                                  {pregunta.respuesta_correcta.toLowerCase() === 'falso' && (
                                    <span className="badge-correcto">✓ Correcta</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {(pregunta.tipo_pregunta === 'respuesta_corta' || pregunta.tipo_pregunta === 'ensayo') && pregunta.respuesta_correcta && (
                            <div className="examenes-pregunta-preview">
                              <h4 className="preview-title">
                                <i className='bx bx-edit'></i>
                                Respuesta Esperada (Guía):
                              </h4>
                              <div className="examenes-respuesta-guia">
                                <p>{pregunta.respuesta_correcta}</p>
                              </div>
                            </div>
                          )}

                          {/* Retroalimentación */}
                          {pregunta.retroalimentacion && (
                            <div className="examenes-pregunta-feedback">
                              <div className="feedback-title">
                                <i className='bx bx-info-circle'></i>
                                Retroalimentación:
                              </div>
                              <div className="feedback-content">
                                <p>{pregunta.retroalimentacion}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Botones de acción */}
                        <div className="examenes-pregunta-acciones">
                          <button
                            className="examenes-btn-editar-pregunta"
                            onClick={() => editarPregunta(pregunta)}
                            title="Editar pregunta"
                          >
                            <i className='bx bx-edit'></i>
                          </button>
                          <button
                            className="examenes-btn-eliminar-pregunta"
                            onClick={() => eliminarPregunta(pregunta.id)}
                            title="Eliminar pregunta"
                          >
                            <i className='bx bx-trash'></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionarExamenes;


