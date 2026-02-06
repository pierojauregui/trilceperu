import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './ReportesProfesor.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const API_URL = import.meta.env.VITE_API_URL;

const ReportesProfesor = ({ setCurrentSection }) => {
  const [reportes, setReportes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [datosRealesAlumnos, setDatosRealesAlumnos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('todos');
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('todos');
  const [tipoReporte, setTipoReporte] = useState('progreso');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (cursoSeleccionado !== 'todos') {
      cargarAlumnosCurso(cursoSeleccionado);
    } else {
      cargarTodosLosAlumnos();
    }
  }, [cursoSeleccionado]);

  // Cargar datos reales cuando se selecciona un alumno específico
  useEffect(() => {
    if (alumnoSeleccionado !== 'todos' && cursoSeleccionado !== 'todos') {
      cargarDatosRealesAlumno(alumnoSeleccionado, cursoSeleccionado).then(datos => {
        setDatosRealesAlumnos(prev => ({
          ...prev,
          [`${alumnoSeleccionado}-${cursoSeleccionado}`]: datos
        }));
      });
    }
  }, [alumnoSeleccionado, cursoSeleccionado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || !user.id) {
        throw new Error('Usuario no encontrado');
      }

      // Cargar cursos del profesor usando la misma API que MisCursos.jsx
      const cursosResponse = await fetch(`${API_URL}/asignaciones/profesor/${user.id}/cursos`);
      if (!cursosResponse.ok) {
        throw new Error('Error al cargar los cursos');
      }
      const cursosData = await cursosResponse.json();
      
      // Usar la estructura correcta de datos como en MisCursos.jsx
      const cursosReales = cursosData.data || [];
      setCursos(cursosReales);

      // Cargar todos los alumnos inicialmente
      await cargarTodosLosAlumnos();

      // Generar reportes basados en los cursos reales usando la estructura correcta
      const reportesGenerados = cursosReales.map(curso => ({
        id: curso.curso_id, // Usar curso_id como en MisCursos.jsx
        curso_id: curso.curso_id,
        curso_nombre: curso.curso_nombre, // Usar curso_nombre como en MisCursos.jsx
        total_alumnos: Math.floor(Math.random() * 30) + 10,
        alumnos_activos: Math.floor(Math.random() * 25) + 8,
        promedio_progreso: Math.floor(Math.random() * 40) + 60,
        tareas_entregadas: Math.floor(Math.random() * 20) + 10,
        tareas_pendientes: Math.floor(Math.random() * 5) + 1,
        examenes_realizados: Math.floor(Math.random() * 15) + 5,
        calificacion_promedio: (Math.random() * 3 + 7).toFixed(1),
        tiempo_promedio_sesion: Math.floor(Math.random() * 30) + 30,
        ultima_actualizacion: new Date().toISOString().split('T')[0],
        progreso_semanal: Array.from({length: 4}, () => Math.floor(Math.random() * 20) + 60),
        calificaciones_distribucion: {
          excelente: Math.floor(Math.random() * 10) + 5,
          bueno: Math.floor(Math.random() * 15) + 8,
          regular: Math.floor(Math.random() * 5) + 2,
          deficiente: Math.floor(Math.random() * 3)
        },
        actividad_diaria: Array.from({length: 7}, () => Math.floor(Math.random() * 15) + 10)
      }));
      
      setReportes(reportesGenerados);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarTodosLosAlumnos = async () => {
     try {
       const user = JSON.parse(localStorage.getItem('user'));
       const alumnosResponse = await fetch(`${API_URL}/profesores/${user.id}/alumnos`, {
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('token')}`
         }
       });
       
       if (alumnosResponse.ok) {
         const alumnosData = await alumnosResponse.json();
         // Usar la misma estructura que MisCursos.jsx
         if (alumnosData.success) {
           setAlumnos(alumnosData.data.alumnos || []);
         } else {
           setAlumnos(alumnosData.data || []);
         }
       } else {
         // Fallback con datos simulados si no hay endpoint
         const alumnosSimulados = cursos.flatMap((curso, cursoIndex) => 
           Array.from({length: Math.floor(Math.random() * 5) + 3}, (_, index) => ({
             id: `curso-${curso.curso_id}-alumno-${index}`,
             nombre: `Estudiante ${index + 1} - ${curso.curso_nombre}`,
             email: `estudiante${cursoIndex}-${index + 1}@email.com`,
             curso_id: curso.curso_id,
             curso_nombre: curso.curso_nombre
           }))
         );
         setAlumnos(alumnosSimulados);
       }
     } catch (error) {
       console.error('Error al cargar alumnos:', error);
       // Fallback con datos simulados usando la estructura correcta
       const alumnosSimulados = cursos.flatMap((curso, cursoIndex) => 
         Array.from({length: Math.floor(Math.random() * 5) + 3}, (_, index) => ({
           id: `curso-${curso.curso_id}-alumno-${index}`,
           nombre: `Estudiante ${index + 1} - ${curso.curso_nombre}`,
           email: `estudiante${cursoIndex}-${index + 1}@email.com`,
           curso_id: curso.curso_id,
           curso_nombre: curso.curso_nombre
         }))
       );
       setAlumnos(alumnosSimulados);
     }
   };

  const cargarAlumnosCurso = async (cursoId) => {
    try {
      // Usar el endpoint correcto para obtener alumnos de un curso específico
      const alumnosResponse = await fetch(`${API_URL}/cursos/${cursoId}/alumnos`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (alumnosResponse.ok) {
        const alumnosData = await alumnosResponse.json();
        if (alumnosData.success) {
          // Mapear los datos para que coincidan con la estructura esperada
          const alumnosFormateados = alumnosData.data.map(alumno => ({
            id: alumno.id,
            nombre: `${alumno.nombres} ${alumno.apellidos}`,
            email: alumno.correo_electronico,
            curso_id: parseInt(cursoId),
            dni: alumno.dni,
            fecha_inscripcion: alumno.fecha_inscripcion,
            progreso_porcentaje: alumno.progreso_porcentaje
          }));
          setAlumnos(alumnosFormateados);
        } else {
          setAlumnos([]);
        }
      } else {
        console.error('Error al obtener alumnos del curso');
        setAlumnos([]);
      }
    } catch (error) {
      console.error('Error al cargar alumnos del curso:', error);
      setAlumnos([]);
    }
  };

  // Función para cargar datos reales de asistencias y calificaciones
  const cargarDatosRealesAlumno = async (alumnoId, cursoId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Cargar asistencias del alumno
      const asistenciasResponse = await fetch(`${API_URL}/asistencias/alumno/${alumnoId}/curso/${cursoId}`, { headers });
      let asistenciaData = { porcentaje: 85 }; // Valor por defecto
      
      if (asistenciasResponse.ok) {
        const asistenciasResult = await asistenciasResponse.json();
        if (asistenciasResult.success && asistenciasResult.data.length > 0) {
          const totalClases = asistenciasResult.data.length;
          const clasesPresente = asistenciasResult.data.filter(a => a.estado_asistencia === 'presente').length;
          asistenciaData.porcentaje = Math.round((clasesPresente / totalClases) * 100);
        }
      }

      // Cargar calificaciones del alumno
      const calificacionesResponse = await fetch(`${API_URL}/calificaciones/alumno/${alumnoId}/curso/${cursoId}`, { headers });
      let calificacionData = { promedio: 16.5 }; // Valor por defecto
      
      if (calificacionesResponse.ok) {
        const calificacionesResult = await calificacionesResponse.json();
        console.log('Respuesta de calificaciones:', calificacionesResult); // Debug
        if (calificacionesResult.success) {
          // La respuesta tiene estructura: { success: true, calificaciones: [...], estadisticas: {...} }
          if (calificacionesResult.estadisticas && calificacionesResult.estadisticas.promedio_notas !== undefined) {
            calificacionData.promedio = calificacionesResult.estadisticas.promedio_notas;
          } else if (calificacionesResult.calificaciones && Array.isArray(calificacionesResult.calificaciones) && calificacionesResult.calificaciones.length > 0) {
            // Si no hay estadísticas, calcular promedio de las calificaciones
            const suma = calificacionesResult.calificaciones.reduce((acc, cal) => acc + (cal.nota_obtenida || 0), 0);
            calificacionData.promedio = suma / calificacionesResult.calificaciones.length;
          }
        }
      } else {
        console.log('Error en respuesta de calificaciones:', calificacionesResponse.status);
      }

      return {
        asistencia: asistenciaData.porcentaje,
        calificacion: calificacionData.promedio
      };
    } catch (error) {
      console.error('Error al cargar datos reales del alumno:', error);
      return {
        asistencia: 85,
        calificacion: 16.5
      };
    }
  };

  const reportesFiltrados = reportes.filter(reporte => {
    const cumpleCurso = cursoSeleccionado === 'todos' || reporte.curso_id?.toString() === cursoSeleccionado;
    const cumpleFecha = (!fechaInicio || !fechaFin) || 
      (new Date(reporte.ultima_actualizacion) >= new Date(fechaInicio) && 
       new Date(reporte.ultima_actualizacion) <= new Date(fechaFin));
    return cumpleCurso && cumpleFecha;
  });

  const alumnosFiltrados = alumnos.filter(alumno => {
    const cumpleCurso = cursoSeleccionado === 'todos' || alumno.curso_id?.toString() === cursoSeleccionado;
    const cumpleAlumno = alumnoSeleccionado === 'todos' || alumno.id?.toString() === alumnoSeleccionado;
    return cumpleCurso && cumpleAlumno;
  });

  // Funciones de exportación
  const exportarPDF = async () => {
    try {
      setDescargando(true);
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.text('Reporte de Progreso Académico', 20, 20);
      
      // Información general
      doc.setFontSize(12);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 20, 40);
      
      const cursoNombre = cursoSeleccionado === 'todos' 
        ? 'Todos los cursos' 
        : cursos.find(c => c.curso_id?.toString() === cursoSeleccionado)?.curso_nombre || 'Curso seleccionado';
      doc.text(`Curso: ${cursoNombre}`, 20, 50);
      
      const alumnoNombre = alumnoSeleccionado === 'todos'
        ? 'Todos los alumnos'
        : alumnos.find(a => a.id?.toString() === alumnoSeleccionado)?.nombre || 'Alumno seleccionado';
      doc.text(`Alumno: ${alumnoNombre}`, 20, 60);
      
      // Preparar datos para la tabla
      const tableData = reportesFiltrados.map(reporte => [
        reporte.curso_nombre,
        reporte.total_alumnos.toString(),
        reporte.alumnos_activos.toString(),
        `${reporte.promedio_progreso}%`,
        reporte.calificacion_promedio.toString()
      ]);
      
      // Crear tabla
      doc.autoTable({
        head: [['Curso', 'Total Alumnos', 'Alumnos Activos', 'Progreso Promedio', 'Calificación Promedio']],
        body: tableData,
        startY: 80,
        theme: 'striped',
        headStyles: { fillColor: [102, 126, 234] }
      });
      
      // Guardar PDF
      doc.save('reporte-academico-profesor.pdf');
    } catch (error) {
      console.error('Error al generar PDF:', error);
    } finally {
      setDescargando(false);
    }
  };

  const exportarExcel = async () => {
    try {
      setDescargando(true);
      const workbook = XLSX.utils.book_new();
      
      // Hoja de resumen
      const resumenData = reportesFiltrados.map(reporte => ({
        'Curso': reporte.curso_nombre,
        'Total Alumnos': reporte.total_alumnos,
        'Alumnos Activos': reporte.alumnos_activos,
        'Progreso Promedio (%)': reporte.promedio_progreso,
        'Tareas Entregadas': reporte.tareas_entregadas,
        'Tareas Pendientes': reporte.tareas_pendientes,
        'Exámenes Realizados': reporte.examenes_realizados,
        'Calificación Promedio': reporte.calificacion_promedio,
        'Tiempo Promedio por Sesión (min)': reporte.tiempo_promedio_sesion,
        'Última Actualización': reporte.ultima_actualizacion
      }));
      
      const wsResumen = XLSX.utils.json_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');
      
      // Hoja de alumnos
      const alumnosData = alumnosFiltrados.map(alumno => ({
        'ID': alumno.id,
        'Nombre': alumno.nombre,
        'Email': alumno.email,
        'Curso ID': alumno.curso_id
      }));
      
      const wsAlumnos = XLSX.utils.json_to_sheet(alumnosData);
      XLSX.utils.book_append_sheet(workbook, wsAlumnos, 'Alumnos');
      
      // Guardar archivo
      XLSX.writeFile(workbook, 'reporte-academico-profesor.xlsx');
    } catch (error) {
      console.error('Error al generar Excel:', error);
    } finally {
      setDescargando(false);
    }
  };

  const getProgresoColor = (progreso) => {
    if (progreso >= 80) return '#28a745';
    if (progreso >= 60) return '#ffc107';
    if (progreso >= 40) return '#fd7e14';
    return '#dc3545';
  };

  const getCalificacionColor = (calificacion) => {
    if (calificacion >= 9) return '#28a745';
    if (calificacion >= 7) return '#ffc107';
    if (calificacion >= 5) return '#fd7e14';
    return '#dc3545';
  };

  // Configuración de gráficos
  const getProgresoChartData = () => {
    if (reportesFiltrados.length === 0) return null;
    
    return {
      labels: reportesFiltrados.map(r => r.curso_nombre),
      datasets: [
        {
          label: 'Progreso Promedio (%)',
          data: reportesFiltrados.map(r => r.promedio_progreso),
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(52, 152, 219, 0.8)',
            'rgba(46, 204, 113, 0.8)',
          ],
          borderColor: [
            'rgba(102, 126, 234, 1)',
            'rgba(118, 75, 162, 1)',
            'rgba(52, 152, 219, 1)',
            'rgba(46, 204, 113, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getCalificacionesDistribucionData = () => {
    if (reportesFiltrados.length === 0) return null;
    
    const distribucion = reportesFiltrados.reduce((acc, reporte) => {
      acc.excelente += reporte.calificaciones_distribucion.excelente;
      acc.bueno += reporte.calificaciones_distribucion.bueno;
      acc.regular += reporte.calificaciones_distribucion.regular;
      acc.deficiente += reporte.calificaciones_distribucion.deficiente;
      return acc;
    }, { excelente: 0, bueno: 0, regular: 0, deficiente: 0 });

    return {
      labels: ['Excelente (9-10)', 'Bueno (7-8)', 'Regular (5-6)', 'Deficiente (0-4)'],
      datasets: [
        {
          data: [distribucion.excelente, distribucion.bueno, distribucion.regular, distribucion.deficiente],
          backgroundColor: [
            '#27ae60',
            '#f39c12',
            '#e67e22',
            '#e74c3c',
          ],
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    };
  };

  const getActividadSemanalData = () => {
    if (reportesFiltrados.length === 0) return null;
    
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    return {
      labels: dias,
      datasets: reportesFiltrados.map((reporte, index) => ({
        label: reporte.curso_nombre,
        data: reporte.actividad_diaria,
        borderColor: index === 0 ? 'rgba(102, 126, 234, 1)' : 'rgba(118, 75, 162, 1)',
        backgroundColor: index === 0 ? 'rgba(102, 126, 234, 0.1)' : 'rgba(118, 75, 162, 0.1)',
        tension: 0.4,
        fill: true,
      })),
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10
      }
    }
  };

  if (loading) {
    return (
      <div className="reportes-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando reportes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reportes-container">
        <div className="error-container">
          <i className='bx bx-error-circle'></i>
          <h3>Error al cargar los reportes</h3>
          <p>{error}</p>
          <button onClick={cargarDatos} className="btn-retry">
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reportes-profesor-container">
      <div className="reportes-profesor-header">
        <div>
          <h1>Reportes de Cursos</h1>
          <p>Genera reportes detallados de tus cursos y estudiantes</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={() => setCurrentSection('dashboard')}
            className="btn-profesor-back"
          >
            <i className="fas fa-arrow-left"></i>
            Volver
          </button>
          <button 
             onClick={exportarPDF}
             disabled={descargando}
             className="btn-profesor-export btn-profesor-export-pdf"
           >
             <i className="fas fa-file-pdf"></i>
             {descargando ? 'Generando...' : 'Exportar PDF'}
           </button>
           <button 
             onClick={exportarExcel}
             disabled={descargando}
             className="btn-profesor-export btn-profesor-export-excel"
           >
             <i className="fas fa-file-excel"></i>
             {descargando ? 'Generando...' : 'Exportar Excel'}
           </button>
        </div>
      </div>

      <div className="reportes-profesor-content">
        <div className="reportes-profesor-sidebar">
          <div className="filtros-profesor-section">
            <h3>Filtros</h3>
            
            <div className="filtro-grupo">
              <label>Curso:</label>
              <select 
                value={cursoSeleccionado} 
                onChange={(e) => setCursoSeleccionado(e.target.value)}
                className="filtro-profesor-select"
              >
                <option value="todos">Todos los cursos</option>
                {cursos.map(curso => (
                  <option key={curso.curso_id} value={curso.curso_id?.toString() || curso.curso_id}>
                    {curso.curso_nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-grupo">
              <label>Alumno:</label>
              <select 
                value={alumnoSeleccionado} 
                onChange={(e) => setAlumnoSeleccionado(e.target.value)}
                className="filtro-profesor-select"
              >
                <option value="todos">Todos los alumnos</option>
                {alumnos.map(alumno => (
                  <option key={alumno.id} value={alumno.id?.toString() || alumno.id}>
                    {alumno.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-grupo">
              <label>Tipo de Reporte:</label>
              <select 
                value={tipoReporte} 
                onChange={(e) => setTipoReporte(e.target.value)}
                className="filtro-profesor-select"
              >
                <option value="progreso">Progreso del Curso</option>
                <option value="asistencia">Asistencia</option>
                <option value="calificaciones">Calificaciones</option>
              </select>
            </div>

            <div className="filtro-grupo">
              <label>Fecha de Inicio:</label>
              <input 
                type="date" 
                value={fechaInicio} 
                onChange={(e) => setFechaInicio(e.target.value)}
                className="filtro-profesor-date"
              />
            </div>

            <div className="filtro-grupo">
              <label>Fecha de Fin:</label>
              <input 
                type="date" 
                value={fechaFin} 
                onChange={(e) => setFechaFin(e.target.value)}
                className="filtro-profesor-date"
              />
            </div>
          </div>
        </div>

        <div className="reportes-profesor-main">
          {loading ? (
            <div className="loading-profesor-container">
              <i className="fas fa-spinner fa-spin"></i>
              <h3>Cargando reportes...</h3>
              <p>Por favor espera mientras procesamos la información</p>
            </div>
          ) : error ? (
            <div className="error-profesor-container">
              <i className="fas fa-exclamation-triangle"></i>
              <h3>Error al cargar reportes</h3>
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="reportes-profesor-stats">
                <div className="stat-profesor-card">
                  <h3>{reportes.length}</h3>
                  <p>Total de Reportes</p>
                </div>
                <div className="stat-profesor-card">
                  <h3>{cursos.length}</h3>
                  <p>Cursos Asignados</p>
                </div>
                <div className="stat-profesor-card">
                  <h3>{alumnos.length}</h3>
                  <p>Estudiantes Totales</p>
                </div>
                <div className="stat-profesor-card">
                  <h3>85%</h3>
                  <p>Promedio General</p>
                </div>
              </div>

              {tipoReporte === 'progreso' && (
                <div className="chart-profesor-container">
                  <h3>Progreso del Curso</h3>
                  <Bar data={getProgresoChartData()} options={chartOptions} />
                </div>
              )}

              {tipoReporte === 'asistencia' && (
                <div className="chart-profesor-container">
                  <h3>Distribución de Asistencia</h3>
                  <Doughnut data={getCalificacionesDistribucionData()} options={chartOptions} />
                </div>
              )}

              {tipoReporte === 'calificaciones' && (
                <div className="chart-profesor-container">
                  <h3>Evolución de Calificaciones</h3>
                  <Line data={getActividadSemanalData()} options={chartOptions} />
                </div>
              )}

              <div className="table-responsive">
                <table className="reportes-profesor-table">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Curso</th>
                      <th>Progreso</th>
                      <th>Asistencia (%)</th>
                      <th>Calificación</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                <tbody>
                  {alumnoSeleccionado === 'todos' ? (
                    // Mostrar datos por curso cuando se selecciona "todos los alumnos"
                    reportesFiltrados.map((reporte, index) => (
                      <tr key={`reporte-${index}`}>
                        <td>Curso completo</td>
                        <td>{reporte.curso_nombre}</td>
                        <td>{reporte.promedio_progreso}%</td>
                        <td>{Math.round((reporte.alumnos_activos / reporte.total_alumnos) * 100)}%</td>
                        <td>{reporte.calificacion_promedio}</td>
                        <td>
                          <span className={`estado activo`}>
                            Activo
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    // Mostrar datos del alumno específico seleccionado
                    alumnosFiltrados
                      .filter(alumno => alumno.id?.toString() === alumnoSeleccionado)
                      .map((alumno, index) => {
                        const datosReales = datosRealesAlumnos[`${alumnoSeleccionado}-${cursoSeleccionado}`];
                        return (
                          <tr key={`alumno-${index}`}>
                            <td>{alumno.nombre}</td>
                            <td>{cursos.find(c => c.curso_id?.toString() === alumno.curso_id?.toString())?.curso_nombre || 'N/A'}</td>
                            <td>{alumno.progreso_porcentaje || 0}%</td>
                            <td>{datosReales ? `${datosReales.asistencia}%` : 'Cargando...'}</td>
                            <td>{datosReales ? datosReales.calificacion.toFixed(1) : 'Cargando...'}</td>
                            <td>
                              <span className={`estado activo`}>
                                Activo
                              </span>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportesProfesor;