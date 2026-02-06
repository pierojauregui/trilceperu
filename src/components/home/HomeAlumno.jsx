import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import logger from '../../utils/logger';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './HomeAlumno.css';

moment.locale('es');
const localizer = momentLocalizer(moment);

const HomeAlumno = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cursosAlumno, setCursosAlumno] = useState([]);
  const [noticias, setNoticias] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [estadisticasAlumno, setEstadisticasAlumno] = useState({
    cursosInscritos: 0,
    cursosCompletados: 0,
    promedioGeneral: 0,
    horasEstudio: 0
  });

  useEffect(() => {
    cargarDatosAlumno();
  }, [user]);

  const cargarDatosAlumno = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/cursos/alumno/${user?.id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const cursosReales = await response.json();
        logger.api('Cursos del alumno:', cursosReales);

        const cursosArray = cursosReales.data || cursosReales;
        
        const cursosFormateados = cursosArray.map(curso => ({
          ...curso,
          // ✅ FIX: Usar la URL completa como en CursoPublico.jsx
          imagen: curso.imagen_url 
            ? `${API_URL.replace('/api', '')}${curso.imagen_url}` 
            : obtenerImagenPorDefecto(curso.nombre),
          color: obtenerColorCurso(curso.id),
          progreso: curso.progreso_porcentaje || Math.floor(Math.random() * 100),
          proximaClase: obtenerProximaClase(curso.horario),
          duracion: calcularDuracionDesdeHorario(curso.horario)
        }));

        logger.debug('Cursos formateados:', cursosFormateados);

        setCursosAlumno(cursosFormateados);
        const eventosGenerados = generarEventosCalendario(cursosFormateados);
        logger.debug('Eventos generados:', eventosGenerados.length, eventosGenerados);
        setEventos(eventosGenerados);

        setEstadisticasAlumno({
          cursosInscritos: cursosFormateados.length,
          cursosCompletados: Math.floor(cursosFormateados.length * 0.3),
          promedioGeneral: 85,
          horasEstudio: cursosFormateados.length * 20
        });

        
      } else {
        logger.debug('No se pudieron cargar los cursos');
        cargarDatosMock();
      }
    } catch (error) {
      logger.error('Error al cargar datos del alumno:', error);
      cargarDatosMock();
    } finally {
      setLoading(false);
    }
  };

  const generarEventosCalendario = (cursos) => {
    const eventos = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    logger.debug('Generando eventos para cursos:', cursos);

    cursos.forEach(curso => {
      logger.debug(`Procesando curso: ${curso.nombre}`);
      logger.debug(`Horario:`, curso.horario);
      
      if (!curso.horario || !curso.horario.dias) {
        logger.debug(`Curso sin horario válido: ${curso.nombre}`);
        return;
      }

      const horarioObj = curso.horario;

      if (!Array.isArray(horarioObj.dias) || horarioObj.dias.length === 0) {
        logger.error(`Estructura de horario inválida para: ${curso.nombre}`);
        return;
      }

      logger.debug(`Horario válido con ${horarioObj.dias.length} día(s)`);

      horarioObj.dias.forEach((diaInfo, idx) => {
        logger.debug(`Procesando día ${idx + 1}:`, diaInfo);
        
        // Generar eventos para las próximas 16 semanas
        for (let semana = 0; semana < 16; semana++) {
          const fechaEvento = obtenerFechaPorDia(diaInfo.dia, semana);
          
          if (fechaEvento >= hoy) {
            try {
              const [horaInicio, minutoInicio] = diaInfo.horaInicio.split(':').map(Number);
              const [horaFin, minutoFin] = diaInfo.horaFin.split(':').map(Number);
              
              const inicio = new Date(fechaEvento);
              inicio.setHours(horaInicio, minutoInicio, 0, 0);
              
              const fin = new Date(fechaEvento);
              fin.setHours(horaFin, minutoFin, 0, 0);

              const evento = {
                id: `${curso.id}-${diaInfo.dia}-${semana}`,
                title: curso.nombre,
                start: inicio,
                end: fin,
                resource: {
                  profesor: curso.profesor_nombre || 'Profesor',
                  descripcion: curso.descripcion,
                  curso: curso,
                  modalidad: diaInfo.modalidad || 'Virtual',
                  aula: diaInfo.aula,
                  color: curso.color,
                  horario: `${diaInfo.horaInicio} - ${diaInfo.horaFin}`
                }
              };

             
              
              eventos.push(evento);
            } catch (err) {
              logger.error('Error al crear evento:', err);
            }
          }
        }
      });
    });

    logger.debug(`Total eventos generados: ${eventos.length}`);
    return eventos;
  };

  const obtenerFechaPorDia = (nombreDia, semanasAdelante = 0) => {
    const diasSemana = {
      'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3,
      'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6, 'domingo': 0
    };

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const diaObjetivo = diasSemana[nombreDia.toLowerCase()];
    if (diaObjetivo === undefined) {
      logger.error('Día no reconocido:', nombreDia);
      return hoy;
    }
    
    const diaActual = hoy.getDay();
    let diasHastaObjetivo = diaObjetivo - diaActual;
    
    if (diasHastaObjetivo <= 0) {
      diasHastaObjetivo += 7;
    }

    const fechaObjetivo = new Date(hoy);
    fechaObjetivo.setDate(hoy.getDate() + diasHastaObjetivo + (semanasAdelante * 7));
    
    return fechaObjetivo;
  };

  const calcularDuracionDesdeHorario = (horario) => {
    try {
      if (!horario || !horario.dias || !horario.dias[0]) {
        return '1h 30min';
      }

      const primerDia = horario.dias[0];
      return calcularDuracion(primerDia.horaInicio, primerDia.horaFin);
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

  const obtenerProximaClase = (horario) => {
    if (!horario || !horario.dias || horario.dias.length === 0) {
      return 'No programada';
    }
    
    try {
      const primerDia = horario.dias[0];
      return `${primerDia.dia} ${primerDia.horaInicio}`;
    } catch (error) {
      logger.error('Error al obtener próxima clase:', error);
      return 'No programada';
    }
  };

  const obtenerColorCurso = (idCurso) => {
    const colores = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    return colores[idCurso % colores.length];
  };

  const obtenerImagenPorDefecto = (nombreCurso) => {
    const imagenes = {
      'matematicas': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
      'fisica': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400',
      'quimica': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400',
      'diseño': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
      'ux': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
      'ui': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
      'programacion': 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400',
      'frances': 'https://images.unsplash.com/photo-1569098644584-210bcd375b59?w=400',
      'intensivo': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
      'default': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'
    };
    
    const nombreLower = nombreCurso.toLowerCase();
    const key = Object.keys(imagenes).find(k => nombreLower.includes(k));
    return imagenes[key] || imagenes.default;
  };

  const cargarDatosMock = () => {
    const mockCursos = [
      {
        id: 1,
        nombre: 'Matemáticas Avanzadas',
        descripcion: 'Curso de matemáticas nivel universitario',
        profesor_nombre: 'Dr. García',
        imagen_url: null,
        color: '#FF6B6B',
        progreso: 75,
        horario: {
          dias: [
            { dia: 'Lunes', horaInicio: '08:00', horaFin: '10:00', modalidad: 'virtual' },
            { dia: 'Miércoles', horaInicio: '08:00', horaFin: '10:00', modalidad: 'virtual' }
          ]
        }
      }
    ];

    const mockNoticias = [
      {
        id: 1,
        titulo: "Bienvenido a la plataforma",
        contenido: "Explora tus cursos y mantente al día.",
        fecha: new Date().toISOString(),
        tipo: "sistema"
      }
    ];

    const cursosFormateados = mockCursos.map(curso => ({
      ...curso,
      imagen: curso.imagen_url 
        ? `${API_URL.replace('/api', '')}${curso.imagen_url}` 
        : obtenerImagenPorDefecto(curso.nombre),
      proximaClase: obtenerProximaClase(curso.horario),
      duracion: calcularDuracionDesdeHorario(curso.horario)
    }));

    setCursosAlumno(cursosFormateados);
    setEventos(generarEventosCalendario(cursosFormateados));
    setNoticias(mockNoticias);
    setEstadisticasAlumno({
      cursosInscritos: cursosFormateados.length,
      cursosCompletados: 1,
      promedioGeneral: 85,
      horasEstudio: 45
    });
  };

  // Función para acceder al curso
  const accederCurso = (curso) => {
    if (!setCurrentSection) {
      console.warn('setCurrentSection no disponible');
      return;
    }
    
    const cursoData = {
      id: curso.id_curso || curso.id,
      id_curso: curso.id_curso || curso.id,
      id_asignacion: curso.id_asignacion,
      nombre: curso.nombre,
      descripcion: curso.descripcion,
    };
    
    localStorage.setItem('cursoSeleccionadoAlumno', JSON.stringify(cursoData));
    if (curso.id_asignacion) {
      localStorage.setItem('asignacionIdAlumno', curso.id_asignacion);
    }
    setCurrentSection('clases-alumno');
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

  // ✅ Componente de evento con tooltip mejorado
  const CustomEvent = ({ event }) => (
    <div className="custom-event-content">
      <div className="event-title">{event.title}</div>
      <div className="event-time">
        {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
      </div>
    </div>
  );

  // ✅ Tooltip personalizado para eventos
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
          <i className='bx bx-user'></i>
          <span>{event.resource?.profesor}</span>
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
      <div className="home-alumno-loading">
        <div className="loading-spinner"></div>
        <p>Cargando tu aula virtual...</p>
      </div>
    );
  }

  return (
    <div className="home-alumno-container">
      {/* Header con saludo y fecha */}
      <div className="home-alumno-header">
        <div className="saludo-container">
          <h1>{obtenerSaludo()}, {user?.nombres}! 👋</h1>
          <p>Bienvenido a tu aula virtual</p>
        </div>
        <div className="fecha-actual">
          <i className='bx bx-calendar'></i>
          <span>{formatearFecha(new Date().toISOString())}</span>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-alumno">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <i className='bx bx-book-bookmark'></i>
          </div>
          <div className="stat-info">
            <h3>{estadisticasAlumno.cursosInscritos}</h3>
            <p>Cursos Activos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <i className='bx bx-check-circle'></i>
          </div>
          <div className="stat-info">
            <h3>{estadisticasAlumno.cursosCompletados}</h3>
            <p>Cursos Completados</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <i className='bx bx-trending-up'></i>
          </div>
          <div className="stat-info">
            <h3>{Math.round(estadisticasAlumno.promedioGeneral)}%</h3>
            <p>Promedio General</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <i className='bx bx-time'></i>
          </div>
          <div className="stat-info">
            <h3>{estadisticasAlumno.horasEstudio}h</h3>
            <p>Horas de Estudio</p>
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
                  // Tooltip se muestra automáticamente en hover
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
                  return `${event.title}\n${event.resource?.profesor}\n${event.resource?.horario}`;
                }}
              />
            </div>
          </div>

          {/* Mis Cursos */}
          <div className="seccion-cursos">
            <div className="seccion-header">
              <h2><i className='bx bx-book-content'></i> Mis Cursos</h2>
              <span className="badge-info">{cursosAlumno.length} activos</span>
            </div>
            
            <div className="cursos-grid-mejorado">
              {cursosAlumno.length > 0 ? (
                cursosAlumno.map(curso => (
                  <div key={curso.id} className="curso-card-moderno">
                    <div className="curso-imagen-container">
                      <img 
                        src={curso.imagen} 
                        alt={curso.nombre}
                        onError={(e) => {
                          e.target.src = obtenerImagenPorDefecto(curso.nombre);
                        }}
                      />
                      <div className="curso-badge-progreso" style={{ backgroundColor: curso.color }}>
                        {curso.progreso}%
                      </div>
                    </div>
                    <div className="curso-info-moderna">
                      <h3>{curso.nombre}</h3>
                      <p className="curso-profesor">
                        <i className='bx bx-user-circle'></i>
                        {curso.profesor_nombre}
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

                      <div className="curso-progreso-moderna">
                        <div className="progreso-bar-moderna">
                          <div 
                            className="progreso-fill-moderna" 
                            style={{
                              width: `${curso.progreso}%`,
                              backgroundColor: curso.color
                            }}
                          ></div>
                        </div>
                      </div>

                      <button 
                        className="btn-acceder-curso"
                        style={{ backgroundColor: curso.color }}
                        onClick={() => accederCurso(curso)}
                      >
                        Acceder al curso
                        <i className='bx bx-right-arrow-alt'></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sin-cursos">
                  <i className='bx bx-book-open'></i>
                  <p>No tienes cursos inscritos aún</p>
                </div>
              )}
            </div>
          </div>
        </div>

      
      </div>
    </div>
  );
};

export default HomeAlumno;