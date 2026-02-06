import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import logger from '../../utils/logger';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './HomeProfesor.css';

moment.locale('es');
const localizer = momentLocalizer(moment);

const HomeProfesor = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cursosProfesor, setCursosProfesor] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [estadisticasProfesor, setEstadisticasProfesor] = useState({
    cursosImpartidos: 0,
    estudiantesActivos: 0,
    horasClase: 0,
    calificacionPromedio: 0
  });

  useEffect(() => {
    cargarDatosProfesor();
  }, [user]);

  const cargarDatosProfesor = async () => {
    try {
      setLoading(true);
      logger.debug('Iniciando carga de datos del profesor...');
      
      const response = await fetch(`${API_URL}/asignaciones/profesor/${user.id}/cursos`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        logger.api('Datos recibidos del servidor:', data);
        
        if (data.success && data.data && data.data.length > 0) {
          const cursosData = data.data;
          logger.debug(`Procesando ${cursosData.length} cursos...`);
          
          const cursosFormateados = cursosData.map(curso => ({
            ...curso,
            id: curso.curso_id || curso.id,
            nombre: curso.curso_nombre || curso.nombre,
            descripcion: curso.curso_descripcion || curso.descripcion,
            imagen: curso.imagen_url 
              ? `${API_URL.replace('/api', '')}${curso.imagen_url}` 
              : obtenerImagenPorDefecto(curso.curso_nombre || curso.nombre),
            color: obtenerColorCurso(curso.curso_id || curso.id),
            estudiantesInscritos: curso.estudiantes_inscritos || 0,
            proximaClase: obtenerProximaClase(curso.horarios),
            duracion: calcularDuracionDesdeHorario(curso.horarios),
            calificacionPromedio: curso.calificacion_promedio || "4.0",
            horarios: curso.horarios || []
          }));
          
          setCursosProfesor(cursosFormateados);
          
          // Generar eventos del calendario
          const eventosGenerados = generarEventosCalendario(cursosFormateados);
          logger.debug(`Eventos generados para el calendario: ${eventosGenerados.length}`);
          setEventos(eventosGenerados);
          
          // Calcular estadísticas basadas en la estructura real del endpoint
          const totalCursos = cursosFormateados.length;
          const cursosActivos = cursosFormateados.length; // Todos los cursos devueltos están activos
          
          // Para obtener el total de alumnos, necesitaríamos hacer llamadas adicionales
          // Por ahora usaremos un valor estimado o haremos una llamada separada
          let totalAlumnos = 0;
          try {
            const alumnosResponse = await fetch(`${API_URL}/profesores/${user.id}/alumnos`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            });
            if (alumnosResponse.ok) {
              const alumnosData = await alumnosResponse.json();
              totalAlumnos = alumnosData.data?.total_alumnos || 0;
            }
          } catch (error) {
            logger.debug('No se pudo obtener el total de alumnos:', error);
            totalAlumnos = cursosFormateados.reduce((sum, curso) => sum + curso.estudiantesInscritos, 0);
          }

          const promedioCalificaciones = cursosFormateados.length > 0 
            ? (cursosFormateados.reduce((sum, curso) => sum + parseFloat(curso.calificacionPromedio), 0) / cursosFormateados.length).toFixed(1)
            : 0;

          setEstadisticasProfesor({
            cursosImpartidos: totalCursos,
            estudiantesActivos: totalAlumnos,
            horasClase: totalCursos * 32,
            calificacionPromedio: promedioCalificaciones
          });

          logger.debug('Estadísticas calculadas:', {
            cursosImpartidos: totalCursos,
            estudiantesActivos: totalAlumnos,
            horasClase: totalCursos * 32,
            calificacionPromedio: promedioCalificaciones
          });

          // Anuncios de ejemplo para profesores
          if (anuncios.length === 0) {
            setAnuncios([
              {
                id: 1,
                titulo: "Bienvenido al panel de profesor",
                contenido: "Gestiona tus cursos y revisa el calendario de clases.",
                fecha: new Date().toISOString(),
                tipo: "sistema"
              },
              {
                id: 2,
                titulo: "Recordatorio de evaluaciones",
                contenido: "No olvides programar las evaluaciones del mes.",
                fecha: new Date(Date.now() - 86400000).toISOString(),
                tipo: "academico"
              },
              {
                id: 3,
                titulo: "Actualización de materiales",
                contenido: "Revisa y actualiza los materiales de tus cursos.",
                fecha: new Date(Date.now() - 172800000).toISOString(),
                tipo: "recursos"
              }
            ]);
          }
        } else {
          logger.debug('No se encontraron cursos, cargando datos mock...');
          cargarDatosMock();
        }
      } else {
        logger.error('Error en la respuesta del servidor:', response.status);
        cargarDatosMock();
      }
    } catch (error) {
      logger.error('Error al cargar datos del profesor:', error);
      cargarDatosMock();
    } finally {
      setLoading(false);
    }
  };

  const generarEventosCalendario = (cursos) => {
    const eventos = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    cursos.forEach(curso => {
      if (!curso.horarios || !Array.isArray(curso.horarios) || curso.horarios.length === 0) {
        return;
      }

      curso.horarios.forEach((horario, idx) => {
        // Generar eventos para las próximas 16 semanas
        for (let semana = 0; semana < 16; semana++) {
          const fechaEvento = obtenerFechaPorDia(horario.dia_semana, semana);
          
          if (fechaEvento >= hoy) {
            try {
              const [horaInicio, minutoInicio] = horario.hora_inicio.split(':').map(Number);
              const [horaFin, minutoFin] = horario.hora_fin.split(':').map(Number);
              
              const inicio = new Date(fechaEvento);
              inicio.setHours(horaInicio, minutoInicio, 0, 0);
              
              const fin = new Date(fechaEvento);
              fin.setHours(horaFin, minutoFin, 0, 0);

              const evento = {
                id: `${curso.id}-${horario.dia_semana}-${semana}`,
                title: curso.nombre,
                start: inicio,
                end: fin,
                resource: {
                  cursoId: curso.id,
                  color: curso.color,
                  horario: `${horario.hora_inicio} - ${horario.hora_fin}`,
                  estudiantes: curso.estudiantesInscritos || 0,
                  modalidad: horario.modalidad || 'Presencial',
                  aula: horario.aula || null
                }
              };

              eventos.push(evento);
            } catch (error) {
              logger.error(`Error al crear evento para ${curso.nombre}:`, error);
            }
          }
        }
      });
    });

    return eventos;
  };

  const obtenerFechaPorDia = (diaSemana, semanaOffset = 0) => {
    try {
      const diasSemana = {
        'lunes': 1,
        'martes': 2,
        'miércoles': 3,
        'jueves': 4,
        'viernes': 5,
        'sábado': 6,
        'domingo': 0
      };

      const numeroDia = diasSemana[diaSemana.toLowerCase()];
      if (numeroDia === undefined) {
        throw new Error(`Día de la semana no válido: ${diaSemana}`);
      }

      const hoy = new Date();
      const diaActual = hoy.getDay();
      let diasHastaObjetivo = numeroDia - diaActual;
      
      if (diasHastaObjetivo < 0) {
        diasHastaObjetivo += 7;
      }

      const fechaObjetivo = new Date(hoy);
      fechaObjetivo.setDate(hoy.getDate() + diasHastaObjetivo + (semanaOffset * 7));
      fechaObjetivo.setHours(0, 0, 0, 0);

      return fechaObjetivo;
    } catch (error) {
      logger.error('Error en obtenerFechaPorDia:', error);
      return new Date();
    }
  };

  const calcularDuracionDesdeHorario = (horarios) => {
    try {
      if (!horarios || !Array.isArray(horarios) || horarios.length === 0) {
        return '1h 30min';
      }

      const primerHorario = horarios[0];
      return calcularDuracion(primerHorario.hora_inicio, primerHorario.hora_fin);
    } catch (error) {
      logger.error('Error al calcular duración:', error);
      return '1h 30min';
    }
  };

  const calcularDuracion = (horaInicio, horaFin) => {
    if (!horaInicio || !horaFin) return '1h 30min';
    
    try {
      const [horaI, minI] = horaInicio.split(':').map(Number);
      const [horaF, minF] = horaFin.split(':').map(Number);
      
      const inicioMinutos = horaI * 60 + minI;
      const finMinutos = horaF * 60 + minF;
      const duracionMinutos = finMinutos - inicioMinutos;
      
      const horas = Math.floor(duracionMinutos / 60);
      const minutos = duracionMinutos % 60;
      
      if (horas > 0 && minutos > 0) {
        return `${horas}h ${minutos}min`;
      } else if (horas > 0) {
        return `${horas}h`;
      } else {
        return `${minutos}min`;
      }
    } catch (error) {
      return '1h 30min';
    }
  };

  const obtenerProximaClase = (horarios) => {
    if (!horarios || !Array.isArray(horarios) || horarios.length === 0) {
      return 'No programada';
    }
    
    try {
      const primerHorario = horarios[0];
      return `${primerHorario.dia_semana} ${primerHorario.hora_inicio}`;
    } catch (error) {
      logger.error('Error al obtener próxima clase:', error);
      return 'No programada';
    }
  };

  const obtenerColorCurso = (idCurso) => {
    const colores = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A80', '#81C784'];
    return colores[idCurso % colores.length];
  };

  const obtenerImagenPorDefecto = (nombreCurso) => {
    // Imagen por defecto para todos los cursos
    return '/images/default-course.svg';
  };

  const cargarDatosMock = () => {
    const mockCursos = [
      {
        id: 1,
        nombre: 'Matemáticas Avanzadas',
        descripcion: 'Curso de matemáticas nivel universitario',
        imagen_url: null,
        color: '#FF6B6B',
        estudiantesInscritos: 25,
        calificacionPromedio: '4.2',
        horario: {
          dias: [
            { dia: 'Lunes', horaInicio: '08:00', horaFin: '10:00', modalidad: 'virtual' },
            { dia: 'Miércoles', horaInicio: '08:00', horaFin: '10:00', modalidad: 'virtual' }
          ]
        }
      },
      {
        id: 2,
        nombre: 'Física Cuántica',
        descripcion: 'Introducción a la física cuántica',
        imagen_url: null,
        color: '#4ECDC4',
        estudiantesInscritos: 18,
        calificacionPromedio: '4.5',
        horario: {
          dias: [
            { dia: 'Martes', horaInicio: '14:00', horaFin: '16:00', modalidad: 'presencial', aula: 'Lab 201' },
            { dia: 'Jueves', horaInicio: '14:00', horaFin: '16:00', modalidad: 'presencial', aula: 'Lab 201' }
          ]
        }
      }
    ];

    const mockAnuncios = [
      {
        id: 1,
        titulo: "Bienvenido al panel de profesor",
        contenido: "Gestiona tus cursos desde aquí.",
        fecha: new Date().toISOString(),
        tipo: "sistema"
      }
    ];

    const cursosFormateados = mockCursos.map(curso => ({
      ...curso,
      nombre: curso.curso_nombre || curso.nombre,
      imagen: curso.imagen_url 
        ? `${API_URL.replace('/api', '')}${curso.imagen_url}` 
        : obtenerImagenPorDefecto(curso.curso_nombre || curso.nombre),
      proximaClase: obtenerProximaClase(curso.horario),
      duracion: calcularDuracionDesdeHorario(curso.horario)
    }));

    setCursosProfesor(cursosFormateados);
    setEventos(generarEventosCalendario(cursosFormateados));
    setAnuncios(mockAnuncios);
    
    const totalEstudiantes = cursosFormateados.reduce((sum, curso) => sum + curso.estudiantesInscritos, 0);
    const promedioCalificaciones = cursosFormateados.length > 0 
      ? (cursosFormateados.reduce((sum, curso) => sum + parseFloat(curso.calificacionPromedio), 0) / cursosFormateados.length).toFixed(1)
      : 0;

    setEstadisticasProfesor({
      cursosImpartidos: cursosFormateados.length,
      estudiantesActivos: totalEstudiantes,
      horasClase: cursosFormateados.length * 32,
      calificacionPromedio: promedioCalificaciones
    });
  };

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const obtenerIconoTipo = (tipo) => {
    const iconos = {
      'sistema': 'bx-cog',
      'academico': 'bx-book',
      'recursos': 'bx-library',
      'general': 'bx-info-circle'
    };
    return iconos[tipo] || iconos.general;
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.resource?.color || '#4ECDC4',
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        fontSize: '13px',
        fontWeight: '600',
        padding: '4px 8px'
      }
    };
  };

  const CustomEvent = ({ event }) => (
    <div className="custom-event-content">
      <div className="event-title">{event.title}</div>
      <div className="event-time">
        {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
      </div>
    </div>
  );

  const EventTooltip = ({ event }) => (
    <div className="event-tooltip">
      <div className="tooltip-header" style={{ backgroundColor: event.resource?.color }}>
        <strong>{event.title}</strong>
      </div>
      <div className="tooltip-body">
        <div className="tooltip-row">
          <i className='bx bx-time'></i>
          <span>{event.resource?.horario}</span>
        </div>
        <div className="tooltip-row">
          <i className='bx bx-group'></i>
          <span>{event.resource?.estudiantes} estudiantes</span>
        </div>
        <div className="tooltip-row">
          <i className='bx bx-video'></i>
          <span>{event.resource?.modalidad}</span>
        </div>
        {event.resource?.aula && (
          <div className="tooltip-row">
            <i className='bx bx-door-open'></i>
            <span>{event.resource?.aula}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="home-profesor-loading">
        <div className="loading-spinner"></div>
        <p>Cargando panel de profesor...</p>
      </div>
    );
  }

  return (
    <div className="home-profesor-container">
      {/* Header con saludo y fecha */}
      <div className="home-profesor-header">
        <div className="saludo-container">
          <h1>{obtenerSaludo()}, Prof. {user?.nombres}! 👨‍🏫</h1>
          <p>Panel de gestión académica</p>
        </div>
        <div className="fecha-actual">
          <i className='bx bx-calendar'></i>
          <span>{formatearFecha(new Date().toISOString())}</span>
        </div>
      </div>

      {/* Estadísticas del profesor */}
      <div className="estadisticas-profesor">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <i className='bx bx-book-content'></i>
          </div>
          <div className="stat-info">
            <h3>{estadisticasProfesor.cursosImpartidos}</h3>
            <p>Cursos Impartidos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <i className='bx bx-group'></i>
          </div>
          <div className="stat-info">
            <h3>{estadisticasProfesor.estudiantesActivos}</h3>
            <p>Estudiantes Activos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <i className='bx bx-star'></i>
          </div>
          <div className="stat-info">
            <h3>{estadisticasProfesor.calificacionPromedio}</h3>
            <p>Calificación Promedio</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <i className='bx bx-time'></i>
          </div>
          <div className="stat-info">
            <h3>{estadisticasProfesor.horasClase}h</h3>
            <p>Horas de Clase</p>
          </div>
        </div>
      </div>

      {/* Layout principal: 2 columnas */}
      <div className="contenido-principal">
        {/* Columna izquierda: Calendario y Cursos */}
        <div className="columna-izquierda">
          {/* Calendario */}
          <div className="seccion-calendario">
            <div className="seccion-header">
              <h2><i className='bx bx-calendar'></i> Calendario de Clases</h2>
              {eventos.length > 0 && (
                <span className="badge-info">
                  {eventos.filter(e => new Date(e.start) >= new Date()).length} clases próximas
                </span>
              )}
            </div>
            
            <div className="calendario-wrapper">
              <Calendar
                localizer={localizer}
                events={eventos}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                eventPropGetter={eventStyleGetter}
                components={{
                  event: CustomEvent,
                }}
                messages={{
                  next: "Siguiente",
                  previous: "Anterior",
                  today: "Hoy",
                  month: "Mes",
                  week: "Semana",
                  day: "Día",
                  agenda: "Agenda",
                  date: "Fecha",
                  time: "Hora",
                  event: "Evento",
                  noEventsInRange: "No hay clases programadas",
                  showMore: total => `+ Ver ${total} más`
                }}
                formats={{
                  monthHeaderFormat: 'MMMM YYYY',
                  dayHeaderFormat: 'dddd DD/MM',
                  dayRangeHeaderFormat: ({ start, end }) => 
                    `${moment(start).format('DD/MM')} - ${moment(end).format('DD/MM')}`,
                  agendaDateFormat: 'ddd DD/MM',
                  agendaTimeFormat: 'HH:mm',
                  agendaTimeRangeFormat: ({ start, end }) => 
                    `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
                }}
                views={['month', 'week', 'day', 'agenda']}
                defaultView="month"
                popup
                selectable
                onSelectEvent={(event) => {
                  logger.debug('Evento seleccionado:', event);
                }}
                tooltipAccessor={(event) => {
                  return `${event.title}\n${event.resource?.estudiantes} estudiantes\n${event.resource?.horario}`;
                }}
              />
            </div>
          </div>

          {/* Mis Cursos */}
          <div className="seccion-cursos">
            <div className="seccion-header">
              <h2><i className='bx bx-chalkboard'></i> Mis Cursos</h2>
              <span className="badge-info">{cursosProfesor.length} activos</span>
            </div>
            
            <div className="cursos-grid-mejorado">
              {cursosProfesor.length > 0 ? (
                cursosProfesor.map(curso => (
                  <div key={curso.id} className="curso-card-moderno">
                    <div className="curso-imagen-container">
                      <img 
                        src={curso.imagen} 
                        alt={curso.nombre}
                        onError={(e) => {
                          logger.debug('Error cargando imagen:', curso.imagen);
                          e.target.src = obtenerImagenPorDefecto(curso.nombre);
                        }}
                        onLoad={() => {
                          logger.debug('Imagen cargada exitosamente:', curso.imagen);
                        }}
                      />
                      <div className="curso-badge-estudiantes" style={{ backgroundColor: curso.color }}>
                        {curso.estudiantesInscritos} estudiantes
                      </div>
                    </div>
                    <div className="curso-info-moderna">
                      <h3>{curso.nombre}</h3>
                      <p className="curso-calificacion">
                        <i className='bx bx-star'></i>
                        Calificación: {curso.calificacionPromedio}/5.0
                      </p>
                      
                      <div className="curso-detalles-grid">
                        <div className="detalle-item">
                          <i className='bx bx-calendar'></i>
                          <span>{curso.proximaClase}</span>
                        </div>
                        <div className="detalle-item">
                          <i className='bx bx-time-five'></i>
                          <span>{curso.duracion}</span>
                        </div>
                      </div>

                      <div className="curso-estudiantes-info">
                        <div className="estudiantes-bar">
                          <div 
                            className="estudiantes-fill" 
                            style={{
                              width: `${Math.min((curso.estudiantesInscritos / 30) * 100, 100)}%`,
                              backgroundColor: curso.color
                            }}
                          ></div>
                        </div>
                        <small>{curso.estudiantesInscritos}/30 estudiantes</small>
                      </div>

                      <button 
                        className="btn-gestionar-curso"
                        style={{ backgroundColor: curso.color }}
                        onClick={() => {
                          // Guardar el curso seleccionado para GestionarClases
                          localStorage.setItem('cursoSeleccionado', curso.id || curso.curso_id);
                          localStorage.setItem('asignacionId', curso.asignacion_id || curso.id_asignacion || '');
                          if (setCurrentSection) {
                            setCurrentSection('gestionar-clases');
                          }
                        }}
                      >
                        Gestionar curso
                        <i className='bx bx-cog'></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sin-cursos">
                  <i className='bx bx-chalkboard'></i>
                  <p>No tienes cursos asignados aún</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha: Anuncios */}
        <div className="columna-derecha">
          <div className="seccion-anuncios-moderna">
            <div className="seccion-header">
              <h2><i className='bx bx-megaphone'></i> Anuncios</h2>
            </div>
            
            <div className="anuncios-lista-moderna">
              {anuncios.length > 0 ? (
                anuncios.map(anuncio => (
                  <div key={anuncio.id} className="anuncio-card-moderna">
                    <div className="anuncio-icon-moderna">
                      <i className={`bx ${obtenerIconoTipo(anuncio.tipo)}`}></i>
                    </div>
                    <div className="anuncio-contenido-moderno">
                      <h4>{anuncio.titulo}</h4>
                      <p>{anuncio.contenido}</p>
                      <small className="anuncio-fecha-moderna">
                        {moment(anuncio.fecha).fromNow()}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sin-anuncios">
                  <i className='bx bx-megaphone-off'></i>
                  <p>No hay anuncios nuevos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeProfesor;