import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import './ExamenesAlumno.css';

const ExamenesAlumno = ({ cursoId, setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [examenes, setExamenes] = useState([]);
  const [examenActivo, setExamenActivo] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tabActivo, setTabActivo] = useState('pendientes');
  const [intentosAlumno, setIntentosAlumno] = useState({});
  
  // ✨ NUEVO: Estados para la pantalla de revisión
  const [modoRevision, setModoRevision] = useState(false);
  const [resultadoExamen, setResultadoExamen] = useState(null);
  
  const { user } = useAuth();

  useEffect(() => {
    if (!cursoId) {
      try {
        const stored = localStorage.getItem('cursoSeleccionadoAlumno');
        if (stored) {
          const parsedCurso = JSON.parse(stored);
          if (parsedCurso && parsedCurso.id_asignacion) {
            cargarExamenes(parsedCurso.id_asignacion);
            return;
          }
        }
      } catch (error) {
        console.error('Error al recuperar curso desde localStorage:', error);
      }
    }
    
    if (cursoId) {
      cargarExamenes();
    }
  }, [cursoId]);

  useEffect(() => {
    let timer;
    if (examenActivo && tiempoRestante > 0 && !modoRevision) {
      timer = setInterval(() => {
        setTiempoRestante(prev => {
          if (prev <= 1) {
            enviarExamen();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examenActivo, tiempoRestante, modoRevision]);

  const cargarExamenes = async (asignacionIdParam = null) => {
    const asignacionId = asignacionIdParam || cursoId;
    
    if (!asignacionId) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/examenes/asignacion/${asignacionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const examenesData = data.data || [];
        setExamenes(examenesData);
        
        const intentosPromises = examenesData.map(async (examen) => {
          try {
            const intentosResponse = await fetch(
              `${API_URL}/examenes/${examen.id}/intentos/${user.id}`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              }
            );
            
            if (intentosResponse.ok) {
              const intentosData = await intentosResponse.json();
              return {
                examen_id: examen.id,
                intentos: intentosData.data || []
              };
            }
          } catch (error) {
            console.error(`Error al cargar intentos del examen ${examen.id}:`, error);
          }
          return { examen_id: examen.id, intentos: [] };
        });
        
        const intentosResults = await Promise.all(intentosPromises);
        const intentosMap = {};
        intentosResults.forEach(result => {
          intentosMap[result.examen_id] = result.intentos;
        });
        setIntentosAlumno(intentosMap);
      } else {
        setExamenes([]);
      }
    } catch (error) {
      console.error('Error al cargar exámenes:', error);
      setExamenes([]);
    } finally {
      setLoading(false);
    }
  };

  // ✨ NUEVO: Función para aleatorizar array
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const iniciarExamen = async (examen) => {
    const now = new Date();
    const fechaInicio = new Date(examen.fecha_inicio);
    const fechaFin = new Date(examen.fecha_fin);
    
    if (now < fechaInicio) {
      Swal.fire({
        title: 'Examen no disponible',
        text: `Este examen estará disponible a partir del ${fechaInicio.toLocaleString()}`,
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    
    if (now > fechaFin) {
      Swal.fire({
        title: 'Examen finalizado',
        text: `Este examen finalizó el ${fechaFin.toLocaleString()}`,
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Iniciar examen?',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p><strong>${examen.titulo}</strong></p>
          <p><strong>Descripción:</strong> ${examen.descripcion || 'Sin descripción'}</p>
          <hr style="margin: 15px 0;">
          <p><strong>Duración:</strong> ${examen.duracion_minutos} minutos</p>
          <p><strong>Preguntas:</strong> ${examen.total_preguntas}</p>
          <p><strong>Intentos permitidos:</strong> ${examen.intentos_permitidos}</p>
          <hr style="margin: 15px 0;">
          <p><strong>Disponible desde:</strong> ${fechaInicio.toLocaleString()}</p>
          <p><strong>Disponible hasta:</strong> ${fechaFin.toLocaleString()}</p>
          <hr style="margin: 15px 0;">
          <p style="color: #e74c3c; font-weight: bold;">⚠️ Una vez iniciado, no podrás pausarlo.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Iniciar Examen',
      cancelButtonText: 'Cancelar',
      width: '500px'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        
        const iniciarResponse = await fetch(`${API_URL}/examenes/${examen.id}/iniciar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!iniciarResponse.ok) {
          const errorData = await iniciarResponse.json();
          throw new Error(errorData.detail || 'Error al iniciar el examen');
        }

        const iniciarData = await iniciarResponse.json();
        
        const preguntasResponse = await fetch(`${API_URL}/examenes/${examen.id}/preguntas`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!preguntasResponse.ok) {
          throw new Error('Error al cargar las preguntas del examen');
        }
        
        const preguntasData = await preguntasResponse.json();
        let preguntasCargadas = preguntasData.data || [];
        
        // ✨ ALEATORIZAR PREGUNTAS SI ESTÁ ACTIVADO
        if (examen.aleatorizar_preguntas) {
          preguntasCargadas = shuffleArray(preguntasCargadas);
          console.log('🔀 Preguntas aleatorizadas');
        }
        
        setPreguntas(preguntasCargadas);
        setExamenActivo(examen);
        setTiempoRestante(examen.duracion_minutos * 60);
        setPreguntaActual(0);
        setRespuestas({});
        setModoRevision(false);
        
        Swal.fire({
          title: '¡Examen iniciado!',
          text: iniciarData.data.mensaje || 'El examen ha comenzado. ¡Buena suerte!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
      } catch (error) {
        console.error('Error al iniciar examen:', error);
        Swal.fire({
          title: 'Error',
          text: error.message || 'No se pudo iniciar el examen. Inténtalo de nuevo.',
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const guardarRespuesta = (preguntaId, respuesta) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: respuesta
    }));
  };

  const enviarExamen = async () => {
    try {
      const dataToSend = {
        id_alumno: user.id,
        id_examen: examenActivo.id,
        respuestas: Object.entries(respuestas).map(([preguntaId, respuesta]) => ({
          id_pregunta: parseInt(preguntaId),
          respuesta_alumno: respuesta
        }))
      };

      const response = await fetch(`${API_URL}/examenes/${examenActivo.id}/enviar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const resultado = await response.json();
        
        // ✨ VERIFICAR SI DEBE MOSTRAR RESPUESTAS
        if (examenActivo.mostrar_respuestas) {
          // Entrar en modo revisión
          setResultadoExamen(resultado.data);
          setModoRevision(true);
          setPreguntaActual(0);
        } else {
          // Mostrar solo la nota y volver
          Swal.fire({
            icon: resultado.data.aprobado ? 'success' : 'info',
            title: resultado.data.aprobado ? '¡Aprobado!' : 'Examen completado',
            html: `
              <div style="text-align: center;">
                <p style="font-size: 48px; font-weight: bold; color: ${resultado.data.aprobado ? '#27ae60' : '#e74c3c'}; margin: 20px 0;">
                  ${resultado.data.nota}/20
                </p>
                <p><strong>Puntos obtenidos:</strong> ${resultado.data.puntos_obtenidos}/${resultado.data.puntos_totales}</p>
                <p><strong>Porcentaje:</strong> ${resultado.data.porcentaje}%</p>
              </div>
            `
          });
          
          // Limpiar y volver a la lista
          setExamenActivo(null);
          setPreguntas([]);
          setRespuestas({});
          setModoRevision(false);
          await cargarExamenes();
        }
      }
    } catch (error) {
      console.error('Error al enviar examen:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo enviar el examen. Por favor, intenta nuevamente.'
      });
    }
  };

  // ✨ NUEVA FUNCIÓN: Salir del modo revisión
  const salirDeRevision = () => {
    setExamenActivo(null);
    setPreguntas([]);
    setRespuestas({});
    setModoRevision(false);
    setResultadoExamen(null);
    cargarExamenes();
  };

  // ✨ NUEVA FUNCIÓN: Revisar examen completado
  const revisarExamen = async (examen, intento) => {
    try {
      setLoading(true);
      
      // Cargar las preguntas del examen
      const preguntasResponse = await fetch(`${API_URL}/examenes/${examen.id}/preguntas`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!preguntasResponse.ok) {
        throw new Error('Error al cargar las preguntas del examen');
      }
      
      const preguntasData = await preguntasResponse.json();
      const preguntasCargadas = preguntasData.data || [];
      
      // Cargar las respuestas del intento específico
      const respuestasResponse = await fetch(`${API_URL}/intentos/${intento.id}/respuestas`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!respuestasResponse.ok) {
        throw new Error('Error al cargar las respuestas del intento');
      }
      
      const respuestasData = await respuestasResponse.json();
      
      // Configurar el estado para modo revisión
      setPreguntas(preguntasCargadas);
      setExamenActivo(examen);
      setResultadoExamen(respuestasData.data);
      setModoRevision(true);
      setPreguntaActual(0);
      
      // Convertir respuestas a formato esperado
      const respuestasFormateadas = {};
      respuestasData.data.respuestas.forEach(resp => {
        respuestasFormateadas[resp.id_pregunta] = resp.respuesta_alumno;
      });
      setRespuestas(respuestasFormateadas);
      
    } catch (error) {
      console.error('Error al revisar examen:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'No se pudo cargar la revisión del examen.',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const estaCompletado = (examen) => {
    const intentos = intentosAlumno[examen.id] || [];
    return intentos.some(intento => intento.fecha_fin !== null);
  };

  const getMejorIntento = (examen) => {
    const intentos = intentosAlumno[examen.id] || [];
    const completados = intentos.filter(i => i.fecha_fin !== null);
    if (completados.length === 0) return null;
    return completados.reduce((mejor, actual) => 
      (actual.nota_obtenida > mejor.nota_obtenida) ? actual : mejor
    );
  };

  const examenesFiltrados = examenes.filter(examen => {
    if (tabActivo === 'pendientes') {
      return !estaCompletado(examen);
    } else {
      return estaCompletado(examen);
    }
  });

  // ✨ NUEVA PANTALLA: Modo Revisión
  if (modoRevision && resultadoExamen) {
    const preguntaActualData = preguntas[preguntaActual];
    const respuestaAlumno = respuestas[preguntaActualData?.id];
    const resultadoPregunta = resultadoExamen.respuestas?.find(
      r => r.pregunta_id === preguntaActualData?.id
    );

    return (
      <div className="examen-revision-container">
        <div className="revision-header">
          <h2>Revisión del Examen</h2>
          <div className="revision-nota">
            <div className={`nota-grande ${resultadoExamen.aprobado ? 'aprobado' : 'desaprobado'}`}>
              <span className="nota-valor">{resultadoExamen.nota}</span>
              <span className="nota-max">/20</span>
            </div>
            <div className="revision-stats">
              <p><strong>Puntos:</strong> {resultadoExamen.puntos_obtenidos}/{resultadoExamen.puntos_totales}</p>
              <p><strong>Porcentaje:</strong> {resultadoExamen.porcentaje}%</p>
              <p><strong>Estado:</strong> {resultadoExamen.aprobado ? '✅ Aprobado' : '❌ Desaprobado'}</p>
            </div>
          </div>
        </div>

        <div className="revision-progreso">
          <div className="progreso-barra">
            <div 
              className="progreso-fill"
              style={{width: `${((preguntaActual + 1) / preguntas.length) * 100}%`}}
            />
          </div>
          <span>Pregunta {preguntaActual + 1} de {preguntas.length}</span>
        </div>

        <div className="revision-pregunta">
          {preguntaActualData && (
            <div className="pregunta-revision-contenido">
              <div className="pregunta-header-revision">
                <h3>{preguntaActualData.pregunta}</h3>
                <div className={`resultado-badge ${resultadoPregunta?.es_correcta ? 'correcta' : 'incorrecta'}`}>
                  {resultadoPregunta?.es_correcta ? (
                    <>
                      <i className='bx bx-check-circle'></i>
                      <span>Correcta ({resultadoPregunta?.puntos || 0} pts)</span>
                    </>
                  ) : (
                    <>
                      <i className='bx bx-x-circle'></i>
                      <span>Incorrecta (0 pts)</span>
                    </>
                  )}
                </div>
              </div>
              
              {preguntaActualData.tipo_pregunta === 'multiple' && (
                <div className="opciones-revision">
                  {JSON.parse(preguntaActualData.opciones).map((opcion, idx) => {
                    const esRespuestaAlumno = respuestaAlumno === idx.toString();
                    const esCorrecta = idx.toString() === preguntaActualData.respuesta_correcta;
                    
                    let claseOpcion = 'opcion-revision';
                    if (esCorrecta) claseOpcion += ' opcion-correcta';
                    if (esRespuestaAlumno && !esCorrecta) claseOpcion += ' opcion-incorrecta';
                    
                    return (
                      <div key={idx} className={claseOpcion}>
                        <span className="opcion-letra">{String.fromCharCode(65 + idx)}.</span>
                        <span className="opcion-texto">{opcion}</span>
                        {esCorrecta && (
                          <span className="badge-correcta">
                            <i className='bx bx-check'></i> Correcta
                          </span>
                        )}
                        {esRespuestaAlumno && !esCorrecta && (
                          <span className="badge-tu-respuesta">
                            <i className='bx bx-x'></i> Tu respuesta
                          </span>
                        )}
                        {esRespuestaAlumno && esCorrecta && (
                          <span className="badge-tu-respuesta-correcta">
                            <i className='bx bx-check-double'></i> Tu respuesta
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {preguntaActualData.tipo_pregunta === 'verdadero_falso' && (
                <div className="opciones-revision">
                  {['verdadero', 'falso'].map((opcion) => {
                    const esRespuestaAlumno = respuestaAlumno?.toLowerCase() === opcion;
                    const esCorrecta = preguntaActualData.respuesta_correcta?.toLowerCase() === opcion;
                    
                    let claseOpcion = 'opcion-revision';
                    if (esCorrecta) claseOpcion += ' opcion-correcta';
                    if (esRespuestaAlumno && !esCorrecta) claseOpcion += ' opcion-incorrecta';
                    
                    return (
                      <div key={opcion} className={claseOpcion}>
                        <span className="opcion-texto">{opcion.charAt(0).toUpperCase() + opcion.slice(1)}</span>
                        {esCorrecta && <span className="badge-correcta"><i className='bx bx-check'></i> Correcta</span>}
                        {esRespuestaAlumno && !esCorrecta && <span className="badge-tu-respuesta"><i className='bx bx-x'></i> Tu respuesta</span>}
                        {esRespuestaAlumno && esCorrecta && <span className="badge-tu-respuesta-correcta"><i className='bx bx-check-double'></i> Tu respuesta</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Retroalimentación - Mostrar cuando la respuesta es incorrecta */}
              {preguntaActualData.retroalimentacion && !resultadoPregunta?.es_correcta && (
                <div className="retroalimentacion-revision">
                  <div className="retroalimentacion-header">
                    <i className='bx bx-info-circle'></i>
                    <span>Retroalimentación</span>
                  </div>
                  <div className="retroalimentacion-contenido">
                    {preguntaActualData.retroalimentacion}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="revision-navegacion">
          <button 
            className="btn-anterior"
            onClick={() => setPreguntaActual(prev => Math.max(0, prev - 1))}
            disabled={preguntaActual === 0}
          >
            <i className='bx bx-chevron-left'></i>
            Anterior
          </button>
          
          {preguntaActual < preguntas.length - 1 ? (
            <button 
              className="btn-siguiente"
              onClick={() => setPreguntaActual(prev => prev + 1)}
            >
              Siguiente
              <i className='bx bx-chevron-right'></i>
            </button>
          ) : (
            <button 
              className="btn-finalizar-revision"
              onClick={salirDeRevision}
            >
              Finalizar Revisión
              <i className='bx bx-check'></i>
            </button>
          )}
        </div>

        <div className="preguntas-indicadores-revision">
          {preguntas.map((pregunta, idx) => {
            const resultado = resultadoExamen.respuestas?.find(r => r.pregunta_id === pregunta.id);
            return (
              <button
                key={idx}
                className={`indicador ${idx === preguntaActual ? 'activo' : ''} ${resultado?.es_correcta ? 'correcta' : 'incorrecta'}`}
                onClick={() => setPreguntaActual(idx)}
                title={resultado?.es_correcta ? 'Correcta' : 'Incorrecta'}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Pantalla de examen activo (sin cambios)
  if (examenActivo && !modoRevision) {
    return (
      <div className="examen-activo-container">
        <div className="examen-activo-header">
          <h2>{examenActivo.titulo}</h2>
          <div className="examen-timer">
            <i className='bx bx-time'></i>
            <span className={tiempoRestante < 300 ? 'tiempo-critico' : ''}>
              {formatTiempo(tiempoRestante)}
            </span>
          </div>
        </div>

        <div className="examen-progreso">
          <div className="progreso-barra">
            <div 
              className="progreso-fill"
              style={{width: `${((preguntaActual + 1) / preguntas.length) * 100}%`}}
            />
          </div>
          <span>Pregunta {preguntaActual + 1} de {preguntas.length}</span>
        </div>

        <div className="examen-pregunta">
          {preguntas[preguntaActual] && (
            <div className="pregunta-contenido">
              <h3>{preguntas[preguntaActual].pregunta}</h3>
              
              {preguntas[preguntaActual].tipo_pregunta === 'multiple' && (
                <div className="opciones-multiple">
                  {JSON.parse(preguntas[preguntaActual].opciones).map((opcion, idx) => (
                    <label key={idx} className="opcion-label">
                      <input 
                        type="radio"
                        name={`pregunta_${preguntas[preguntaActual].id}`}
                        value={idx}
                        checked={respuestas[preguntas[preguntaActual].id] === idx.toString()}
                        onChange={(e) => guardarRespuesta(preguntas[preguntaActual].id, e.target.value)}
                      />
                      <span>{opcion}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {preguntas[preguntaActual].tipo_pregunta === 'verdadero_falso' && (
                <div className="opciones-vf">
                  <label className="opcion-label">
                    <input 
                      type="radio"
                      name={`pregunta_${preguntas[preguntaActual].id}`}
                      value="verdadero"
                      checked={respuestas[preguntas[preguntaActual].id] === 'verdadero'}
                      onChange={(e) => guardarRespuesta(preguntas[preguntaActual].id, e.target.value)}
                    />
                    <span>Verdadero</span>
                  </label>
                  <label className="opcion-label">
                    <input 
                      type="radio"
                      name={`pregunta_${preguntas[preguntaActual].id}`}
                      value="falso"
                      checked={respuestas[preguntas[preguntaActual].id] === 'falso'}
                      onChange={(e) => guardarRespuesta(preguntas[preguntaActual].id, e.target.value)}
                    />
                    <span>Falso</span>
                  </label>
                </div>
              )}
              
              {(preguntas[preguntaActual].tipo_pregunta === 'respuesta_corta' || 
                preguntas[preguntaActual].tipo_pregunta === 'ensayo') && (
                <textarea 
                  className="respuesta-texto"
                  placeholder="Escribe tu respuesta..."
                  value={respuestas[preguntas[preguntaActual].id] || ''}
                  onChange={(e) => guardarRespuesta(preguntas[preguntaActual].id, e.target.value)}
                  rows={preguntas[preguntaActual].tipo_pregunta === 'ensayo' ? 8 : 4}
                />
              )}
            </div>
          )}
        </div>

        <div className="examen-navegacion">
          <button 
            className="btn-anterior"
            onClick={() => setPreguntaActual(prev => Math.max(0, prev - 1))}
            disabled={preguntaActual === 0}
          >
            <i className='bx bx-chevron-left'></i>
            Anterior
          </button>
          
          {preguntaActual < preguntas.length - 1 ? (
            <button 
              className="btn-siguiente"
              onClick={() => setPreguntaActual(prev => prev + 1)}
            >
              Siguiente
              <i className='bx bx-chevron-right'></i>
            </button>
          ) : (
            <button 
              className="btn-enviar"
              onClick={enviarExamen}
            >
              Enviar examen
              <i className='bx bx-send'></i>
            </button>
          )}
        </div>

        <div className="preguntas-indicadores">
          {preguntas.map((_, idx) => (
            <button
              key={idx}
              className={`indicador ${idx === preguntaActual ? 'activo' : ''} ${respuestas[preguntas[idx]?.id] ? 'respondido' : ''}`}
              onClick={() => setPreguntaActual(idx)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="examenes-loading">
        <div className="examenes-spinner"></div>
        <p>Cargando exámenes...</p>
      </div>
    );
  }

  // Lista de exámenes (sin cambios)
  return (
    <div className="examenes-alumno-container">
      <div className="examenes-alumno-header">
        <button 
          className="btn-volver"
          onClick={() => setCurrentSection('examenes-alumno')}
        >
          <i className='bx bx-arrow-back'></i>
        </button>
        <h1>Exámenes del Curso</h1>
      </div>

      <div className="examenes-tabs">
        <button 
          className={`tab ${tabActivo === 'pendientes' ? 'activo' : ''}`}
          onClick={() => setTabActivo('pendientes')}
        >
          Pendientes
        </button>
        <button 
          className={`tab ${tabActivo === 'completados' ? 'activo' : ''}`}
          onClick={() => setTabActivo('completados')}
        >
          Completados
        </button>
      </div>

      <div className="examenes-lista">
        {examenesFiltrados.length === 0 ? (
          <div className="no-examenes">
            <i className='bx bx-file-blank'></i>
            <h3>No hay exámenes {tabActivo === 'pendientes' ? 'pendientes' : 'completados'}</h3>
            <p>
              {tabActivo === 'pendientes' 
                ? 'No tienes exámenes pendientes por realizar.' 
                : 'Aún no has completado ningún examen.'}
            </p>
          </div>
        ) : (
          examenesFiltrados.map(examen => {
            const mejorIntento = getMejorIntento(examen);
            const intentos = intentosAlumno[examen.id] || [];
            const intentosRealizados = intentos.filter(i => i.fecha_fin !== null).length;
            
            return (
              <div key={examen.id} className="examen-card">
                <div className="examen-header">
                  <h3>{examen.titulo}</h3>
                  <span className={`examen-tipo ${examen.tipo_examen}`}>
                    {examen.tipo_examen}
                  </span>
                </div>
                
                <div className="examen-info">
                  <p>{examen.descripcion}</p>
                  
                  <div className="examen-detalles">
                    <span>
                      <i className='bx bx-time'></i>
                      {examen.duracion_minutos} minutos
                    </span>
                    <span>
                      <i className='bx bx-help-circle'></i>
                      {examen.total_preguntas} preguntas
                    </span>
                    <span>
                      <i className='bx bx-repeat'></i>
                      {intentosRealizados}/{examen.intentos_permitidos} intentos
                    </span>
                  </div>
                  
                  {tabActivo === 'completados' && mejorIntento && (
                    <div className="examen-resultado">
                      <div className={`nota-badge ${mejorIntento.aprobado ? 'aprobado' : 'desaprobado'}`}>
                        <i className={`bx ${mejorIntento.aprobado ? 'bx-check-circle' : 'bx-x-circle'}`}></i>
                        <span>Nota: {mejorIntento.nota_obtenida}/20</span>
                      </div>
                      <p className="fecha-intento">
                        <i className='bx bx-calendar'></i>
                        Último intento: {new Date(mejorIntento.fecha_fin).toLocaleString()}
                      </p>
                      <button 
                        className="btn-revisar-examen"
                        onClick={() => revisarExamen(examen, mejorIntento)}
                      >
                        <i className='bx bx-search-alt'></i>
                        Revisar respuestas
                      </button>
                    </div>
                  )}
                  
                  {tabActivo === 'pendientes' && (
                    <>
                      <div className="examen-fechas">
                        <div className="fecha-item">
                          <i className='bx bx-calendar-check'></i>
                          <span>
                            <strong>Inicia:</strong> {new Date(examen.fecha_inicio).toLocaleString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="fecha-item">
                          <i className='bx bx-calendar-x'></i>
                          <span>
                            <strong>Termina:</strong> {new Date(examen.fecha_fin).toLocaleString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {(() => {
                        const now = new Date();
                        const fechaInicio = new Date(examen.fecha_inicio);
                        const fechaFin = new Date(examen.fecha_fin);
                        
                        if (now < fechaInicio) {
                          return (
                            <div className="examen-estado no-disponible">
                              <i className='bx bx-time-five'></i>
                              <span>Próximamente disponible</span>
                            </div>
                          );
                        } else if (now > fechaFin) {
                          return (
                            <div className="examen-estado finalizado">
                              <i className='bx bx-x-circle'></i>
                              <span>Examen finalizado</span>
                            </div>
                          );
                        } else {
                          return (
                            <div className="examen-estado disponible">
                              <i className='bx bx-check-circle'></i>
                              <span>Disponible ahora</span>
                            </div>
                          );
                        }
                      })()}
                    </>
                  )}
                </div>
                
                {tabActivo === 'pendientes' && (
                  <button 
                    className={`btn-iniciar-examen ${(() => {
                      const now = new Date();
                      const fechaInicio = new Date(examen.fecha_inicio);
                      const fechaFin = new Date(examen.fecha_fin);
                      
                      if (now < fechaInicio || now > fechaFin || intentosRealizados >= examen.intentos_permitidos) {
                        return 'disabled';
                      }
                      return '';
                    })()}`}
                    onClick={() => iniciarExamen(examen)}
                    disabled={(() => {
                      const now = new Date();
                      const fechaInicio = new Date(examen.fecha_inicio);
                      const fechaFin = new Date(examen.fecha_fin);
                      
                      return now < fechaInicio || now > fechaFin || intentosRealizados >= examen.intentos_permitidos;
                    })()}
                  >
                    {(() => {
                      const now = new Date();
                      const fechaInicio = new Date(examen.fecha_inicio);
                      const fechaFin = new Date(examen.fecha_fin);
                      
                      if (intentosRealizados >= examen.intentos_permitidos) {
                        return 'Sin intentos disponibles';
                      } else if (now < fechaInicio) {
                        return 'No disponible';
                      } else if (now > fechaFin) {
                        return 'Finalizado';
                      } else {
                        return 'Iniciar examen';
                      }
                    })()}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExamenesAlumno;