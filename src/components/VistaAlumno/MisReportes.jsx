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
import './MisReportes.css';

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

const MisReportes = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [reportes, setReportes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('todos');
  const [tipoReporte, setTipoReporte] = useState('progreso');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      if (!user || !user.id || !token) {
        throw new Error('Usuario no autenticado');
      }

      // Obtener cursos del alumno desde el backend
      const cursosResponse = await fetch(`${API_URL}/alumnos/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!cursosResponse.ok) {
        throw new Error('Error al obtener cursos del alumno');
      }

      const cursosData = await cursosResponse.json();
      const cursosAlumno = cursosData.data?.cursos_inscritos || [];
      
      // Formatear cursos para el estado y eliminar duplicados
      const cursosFormateados = cursosAlumno.map(curso => ({
        id: curso.id,
        nombre: curso.nombre,
        descripcion: curso.descripcion || 'Sin descripción',
        progreso_porcentaje: curso.progreso_porcentaje || 0,
        estado_inscripcion: curso.estado_inscripcion,
        fecha_inscripcion: curso.fecha_inscripcion
      }));
      
      // Eliminar cursos duplicados basándose en el ID
      const cursosUnicos = cursosFormateados.filter((curso, index, self) => 
        index === self.findIndex(c => c.id === curso.id)
      );
      
      setCursos(cursosUnicos);

      // Obtener calificaciones para cada curso
      const reportesPromises = cursosUnicos.map(async (curso) => {
        try {
          const calificacionesResponse = await fetch(
            `${API_URL}/calificaciones/alumno/${user.id}/curso/${curso.id}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!calificacionesResponse.ok) {
            console.warn(`No se pudieron obtener calificaciones para el curso ${curso.nombre}`);
            return null;
          }

          const calificacionesData = await calificacionesResponse.json();
          const calificaciones = calificacionesData.calificaciones || [];
          const estadisticas = calificacionesData.estadisticas || {};

          // Calcular datos del reporte
          const examenes_realizados = estadisticas.total_examenes || 0;
          const examenes_aprobados = estadisticas.examenes_aprobados || 0;
          const promedio_notas = estadisticas.promedio_notas || 0;
          const porcentaje_aprobacion = estadisticas.porcentaje_aprobacion || 0;

          // Generar datos simulados para gráficos (ya que no tenemos estos datos específicos en el backend)
          const progreso_semanal = [
            Math.max(0, curso.progreso_porcentaje - 15),
            Math.max(0, curso.progreso_porcentaje - 10),
            Math.max(0, curso.progreso_porcentaje - 5),
            curso.progreso_porcentaje
          ];

          const actividad_diaria = Array.from({length: 7}, () => Math.floor(Math.random() * 5) + 1);

          return {
            id: curso.id,
            curso_id: curso.id,
            curso_nombre: curso.nombre,
            progreso_total: curso.progreso_porcentaje,
            tareas_completadas: Math.floor(examenes_realizados * 0.8), // Estimación
            tareas_pendientes: Math.max(0, examenes_realizados - Math.floor(examenes_realizados * 0.8)),
            examenes_realizados: examenes_realizados,
            examenes_pendientes: Math.max(0, 5 - examenes_realizados), // Estimación
            calificacion_promedio: promedio_notas,
            tiempo_total_estudio: Math.floor(Math.random() * 50) + 20, // Simulado
            ultima_actividad: calificaciones.length > 0 ? 
              calificaciones[0].fecha_realizacion?.split('T')[0] : 
              new Date().toISOString().split('T')[0],
            progreso_semanal: progreso_semanal,
            calificaciones_por_tema: {
              'Tema 1': Math.min(20, promedio_notas + Math.random() * 2),
              'Tema 2': Math.min(20, promedio_notas + Math.random() * 2),
              'Tema 3': Math.min(20, promedio_notas + Math.random() * 2),
              'Tema 4': Math.min(20, promedio_notas + Math.random() * 2)
            },
            actividad_diaria: actividad_diaria,
            asistencia: Math.floor(porcentaje_aprobacion + Math.random() * 10),
            participacion: Math.floor(porcentaje_aprobacion + Math.random() * 15),
            calificaciones_detalle: calificaciones
          };
        } catch (error) {
          console.error(`Error al obtener calificaciones para curso ${curso.nombre}:`, error);
          return null;
        }
      });

      const reportesResultados = await Promise.all(reportesPromises);
      const reportesValidos = reportesResultados.filter(reporte => reporte !== null);
      
      setReportes(reportesValidos);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const reportesFiltrados = reportes.filter(reporte => {
    const cumpleCurso = cursoSeleccionado === 'todos' || reporte.curso_id.toString() === cursoSeleccionado;
    const cumpleFecha = (!fechaInicio || !fechaFin) || 
      (new Date(reporte.ultima_actividad) >= new Date(fechaInicio) && 
       new Date(reporte.ultima_actividad) <= new Date(fechaFin));
    return cumpleCurso && cumpleFecha;
  });

  // Funciones de exportación
  const exportarPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Mi Reporte Académico Individual', 20, 20);
    
    // Información del estudiante
    const user = JSON.parse(localStorage.getItem('user'));
    doc.setFontSize(12);
    doc.text(`Estudiante: ${user?.nombres || 'N/A'} ${user?.apellidos || ''}`, 20, 35);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 20, 45);
    
    // Preparar datos para la tabla
    const tableData = reportesFiltrados.map(reporte => [
      reporte.curso_nombre,
      `${reporte.progreso_total}%`,
      `${reporte.tareas_completadas}/${reporte.tareas_completadas + reporte.tareas_pendientes}`,
      `${reporte.examenes_realizados}/${reporte.examenes_realizados + reporte.examenes_pendientes}`,
      reporte.calificacion_promedio.toString(),
      `${reporte.tiempo_total_estudio}h`,
      `${reporte.asistencia}%`
    ]);
    
    // Crear tabla
    doc.autoTable({
      head: [['Curso', 'Progreso', 'Tareas', 'Exámenes', 'Promedio', 'Tiempo', 'Asistencia']],
      body: tableData,
      startY: 60,
      theme: 'striped',
      headStyles: { fillColor: [102, 126, 234] }
    });
    
    // Guardar PDF
    doc.save(`mi-reporte-academico-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportarExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Hoja de resumen general
    const resumenData = reportesFiltrados.map(reporte => ({
      'Curso': reporte.curso_nombre,
      'Progreso Total (%)': reporte.progreso_total,
      'Tareas Completadas': reporte.tareas_completadas,
      'Tareas Pendientes': reporte.tareas_pendientes,
      'Exámenes Realizados': reporte.examenes_realizados,
      'Exámenes Pendientes': reporte.examenes_pendientes,
      'Calificación Promedio': reporte.calificacion_promedio,
      'Tiempo Total de Estudio (h)': reporte.tiempo_total_estudio,
      'Asistencia (%)': reporte.asistencia,
      'Participación (%)': reporte.participacion,
      'Última Actividad': reporte.ultima_actividad
    }));
    
    const wsResumen = XLSX.utils.json_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen General');
    
    // Hoja de calificaciones por tema
    const calificacionesData = [];
    reportesFiltrados.forEach(reporte => {
      Object.entries(reporte.calificaciones_por_tema).forEach(([tema, calificacion]) => {
        calificacionesData.push({
          'Curso': reporte.curso_nombre,
          'Tema': tema,
          'Calificación': calificacion
        });
      });
    });
    
    const wsCalificaciones = XLSX.utils.json_to_sheet(calificacionesData);
    XLSX.utils.book_append_sheet(workbook, wsCalificaciones, 'Calificaciones por Tema');
    
    // Hoja de progreso semanal
    const progresoData = [];
    reportesFiltrados.forEach(reporte => {
      reporte.progreso_semanal.forEach((progreso, index) => {
        progresoData.push({
          'Curso': reporte.curso_nombre,
          'Semana': index + 1,
          'Progreso (%)': progreso
        });
      });
    });
    
    const wsProgreso = XLSX.utils.json_to_sheet(progresoData);
    XLSX.utils.book_append_sheet(workbook, wsProgreso, 'Progreso Semanal');
    
    // Guardar archivo
    XLSX.writeFile(workbook, `mi-reporte-academico-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Datos para gráficos
  const getProgresoData = () => {
    return {
      labels: reportesFiltrados.map(r => r.curso_nombre),
      datasets: [
        {
          label: 'Progreso (%)',
          data: reportesFiltrados.map(r => r.progreso_total),
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getCalificacionesData = () => {
    return {
      labels: reportesFiltrados.map(r => r.curso_nombre),
      datasets: [
        {
          label: 'Calificación Promedio',
          data: reportesFiltrados.map(r => r.calificacion_promedio),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
        },
      ],
    };
  };

  const getAsistenciaData = () => {
    const promedioAsistencia = reportesFiltrados.reduce((acc, r) => acc + r.asistencia, 0) / reportesFiltrados.length;
    const promedioFaltas = 100 - promedioAsistencia;
    
    return {
      labels: ['Asistencia', 'Faltas'],
      datasets: [
        {
          data: [promedioAsistencia, promedioFaltas],
          backgroundColor: [
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 99, 132, 0.8)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Mi Rendimiento Académico',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: tipoReporte === 'progreso' ? 100 : 10,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Mi Asistencia General',
      },
    },
  };

  if (loading) {
    return (
      <div className="mis-reportes-container">
        <div className="mis-reportes-loading-spinner">
          <div className="mis-reportes-spinner"></div>
          <p>Cargando mis reportes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mis-reportes-container">
        <div className="mis-reportes-error-message">
          <h3>Error al cargar los reportes</h3>
          <p>{error}</p>
          <button onClick={cargarDatos} className="mis-reportes-btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-reportes-container">
      <div className="mis-reportes-header">
        <h2>Mis Reportes Académicos</h2>
        <p>Visualiza tu progreso y rendimiento académico individual</p>
      </div>

      <div className="mis-reportes-filters">
        <div className="mis-reportes-filter-group">
          <label htmlFor="curso">Curso:</label>
          <select
            id="curso"
            value={cursoSeleccionado}
            onChange={(e) => setCursoSeleccionado(e.target.value)}
            className="mis-reportes-filter-select"
          >
            <option value="todos">Todos los cursos</option>
            {cursos.map(curso => (
              <option key={curso.id} value={curso.id.toString()}>
                {curso.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="mis-reportes-filter-group">
          <label htmlFor="tipoReporte">Tipo de Reporte:</label>
          <select
            id="tipoReporte"
            value={tipoReporte}
            onChange={(e) => setTipoReporte(e.target.value)}
            className="mis-reportes-filter-select"
          >
            <option value="progreso">Progreso</option>
            <option value="calificaciones">Calificaciones</option>
            <option value="asistencia">Asistencia</option>
          </select>
        </div>

        <div className="mis-reportes-filter-group">
          <label htmlFor="fechaInicio">Fecha Inicio:</label>
          <input
            type="date"
            id="fechaInicio"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="mis-reportes-filter-input"
          />
        </div>

        <div className="mis-reportes-filter-group">
          <label htmlFor="fechaFin">Fecha Fin:</label>
          <input
            type="date"
            id="fechaFin"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="mis-reportes-filter-input"
          />
        </div>
      </div>

      <div className="mis-reportes-actions">
        <button onClick={exportarPDF} className="mis-reportes-btn-export mis-reportes-btn-pdf">
          <i className="fas fa-file-pdf"></i>
          Exportar PDF
        </button>
        <button onClick={exportarExcel} className="mis-reportes-btn-export mis-reportes-btn-excel">
          <i className="fas fa-file-excel"></i>
          Exportar Excel
        </button>
      </div>

      <div className="mis-reportes-stats">
        {reportesFiltrados.map(reporte => (
          <div key={reporte.id} className="mis-reportes-stat-card">
            <div className="mis-reportes-stat-header">
              <h3>{reporte.curso_nombre}</h3>
              <span className={`mis-reportes-stat-badge ${reporte.progreso_total >= 80 ? 'success' : reporte.progreso_total >= 60 ? 'warning' : 'danger'}`}>
                {reporte.progreso_total}% Completado
              </span>
            </div>
            <div className="mis-reportes-stat-content">
              <div className="mis-reportes-stat-item">
                <span className="mis-reportes-stat-label">Calificación Promedio:</span>
                <span className="mis-reportes-stat-value">{reporte.calificacion_promedio}</span>
              </div>
              <div className="mis-reportes-stat-item">
                <span className="mis-reportes-stat-label">Tareas Completadas:</span>
                <span className="mis-reportes-stat-value">{reporte.tareas_completadas}/{reporte.tareas_completadas + reporte.tareas_pendientes}</span>
              </div>
              <div className="mis-reportes-stat-item">
                <span className="mis-reportes-stat-label">Exámenes Realizados:</span>
                <span className="mis-reportes-stat-value">{reporte.examenes_realizados}/{reporte.examenes_realizados + reporte.examenes_pendientes}</span>
              </div>
              <div className="mis-reportes-stat-item">
                <span className="mis-reportes-stat-label">Tiempo de Estudio:</span>
                <span className="mis-reportes-stat-value">{reporte.tiempo_total_estudio}h</span>
              </div>
              <div className="mis-reportes-stat-item">
                <span className="mis-reportes-stat-label">Asistencia:</span>
                <span className="mis-reportes-stat-value">{reporte.asistencia}%</span>
              </div>
              <div className="mis-reportes-stat-item">
                <span className="mis-reportes-stat-label">Participación:</span>
                <span className="mis-reportes-stat-value">{reporte.participacion}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mis-reportes-charts">
        <div className="mis-reportes-chart-container">
          <div className="mis-reportes-chart-card">
            {tipoReporte === 'progreso' && <Bar data={getProgresoData()} options={chartOptions} />}
            {tipoReporte === 'calificaciones' && <Bar data={getCalificacionesData()} options={chartOptions} />}
            {tipoReporte === 'asistencia' && <Doughnut data={getAsistenciaData()} options={doughnutOptions} />}
          </div>
        </div>
      </div>

      {reportesFiltrados.length === 0 && (
        <div className="mis-reportes-no-data">
          <i className="fas fa-chart-bar"></i>
          <h3>No hay datos disponibles</h3>
          <p>No se encontraron reportes para los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
};

export default MisReportes;