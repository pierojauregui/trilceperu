import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './Reportes.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = import.meta.env.VITE_API_URL;

const Reportes = ({ setCurrentSection }) => {
  const [loading, setLoading] = useState(true);
  const [reporteActivo, setReporteActivo] = useState('general');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoReporte, setTipoReporte] = useState('mensual');
  const [descargando, setDescargando] = useState(false);
  
  // Estados para datos de reportes
  const [estadisticasGenerales, setEstadisticasGenerales] = useState({
    totalCursos: 0,
    totalEstudiantes: 0,
    totalProfesores: 0,
    totalCategorias: 0,
    cursosActivos: 0,
    estudiantesActivos: 0,
    ingresosTotales: 0,
    tasaCompletacion: 0
  });
  
  const [datosVentas, setDatosVentas] = useState([]);
  const [datosCursos, setDatosCursos] = useState([]);
  const [datosEstudiantes, setDatosEstudiantes] = useState([]);
  const [datosCategorias, setDatosCategorias] = useState([]);

  useEffect(() => {
    cargarDatosReportes();
  }, [tipoReporte, fechaInicio, fechaFin]);

  const cargarDatosReportes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Cargar estadísticas generales
      const statsResponse = await fetch(`${API_URL}/reportes/estadisticas-generales`, { headers });
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setEstadisticasGenerales(statsData.data);
      }
      
      // Cargar datos de ventas
      let ventasUrl = `${API_URL}/reportes/ventas?periodo=${tipoReporte}`;
      if (fechaInicio) ventasUrl += `&fecha_inicio=${fechaInicio}`;
      if (fechaFin) ventasUrl += `&fecha_fin=${fechaFin}`;
      
      const ventasResponse = await fetch(ventasUrl, { headers });
      const ventasData = await ventasResponse.json();
      if (ventasData.success) {
        setDatosVentas(ventasData.data || []);
      }
      
      // Cargar cursos por categoría
      const cursosResponse = await fetch(`${API_URL}/reportes/cursos-por-categoria`, { headers });
      const cursosData = await cursosResponse.json();
      if (cursosData.success) {
        setDatosCursos(cursosData.data || []);
      }
      
      // Cargar distribución de estudiantes
      const estudiantesResponse = await fetch(`${API_URL}/reportes/distribucion-estudiantes`, { headers });
      const estudiantesData = await estudiantesResponse.json();
      if (estudiantesData.success) {
        setDatosEstudiantes(estudiantesData.data || []);
      }
      
      // Cargar rendimiento por categorías
      const categoriasResponse = await fetch(`${API_URL}/reportes/rendimiento-categorias`, { headers });
      const categoriasData = await categoriasResponse.json();
      if (categoriasData.success) {
        setDatosCategorias(categoriasData.data || []);
      }
      
    } catch (error) {
      console.error('Error al cargar datos de reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarReporte = async (formato, tipoReporteExport = 'general') => {
    try {
      setDescargando(true);
      const token = localStorage.getItem('token');
      
      let url = '';
      if (formato === 'excel') {
        url = `${API_URL}/reportes/exportar/excel?tipo_reporte=${tipoReporteExport}`;
      } else if (formato === 'csv') {
        url = `${API_URL}/reportes/exportar/csv?tipo_reporte=${tipoReporteExport}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al exportar el reporte');
      }
      
      // Obtener el blob
      const blob = await response.blob();
      
      // Crear URL temporal
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Crear elemento <a> temporal para descargar
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Obtener nombre del archivo desde el header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `reporte_${tipoReporteExport}_${new Date().toISOString().split('T')[0]}.${formato === 'excel' ? 'xlsx' : 'csv'}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log(`Reporte exportado exitosamente: ${filename}`);
      
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      alert('Error al exportar el reporte. Por favor, intenta nuevamente.');
    } finally {
      setDescargando(false);
    }
  };

  const generarReportePersonalizado = () => {
    alert('Funcionalidad de reporte personalizado: permite elegir métricas específicas, rangos de fechas personalizados y filtros avanzados.');
  };

  // Configuración de gráficos
  const opcionesGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
  };

  // Datos para gráfico de ingresos
  const datosIngresos = {
    labels: datosVentas.map(item => item.periodo),
    datasets: [
      {
        label: 'Ingresos (S/)',
        data: datosVentas.map(item => item.ingresos),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      },
      {
        label: 'Inscripciones',
        data: datosVentas.map(item => item.inscripciones),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        yAxisID: 'y1',
      }
    ],
  };

  const opcionesIngresos = {
    ...opcionesGrafico,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Ingresos (S/)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Inscripciones'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Datos para gráfico de cursos por categoría
  const datosCursosPorCategoria = {
    labels: datosCursos.map(item => item.categoria),
    datasets: [
      {
        label: 'Activos',
        data: datosCursos.map(item => item.activos),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
      },
      {
        label: 'Completados',
        data: datosCursos.map(item => item.completados),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
      },
      {
        label: 'Abandonados',
        data: datosCursos.map(item => item.abandonados),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      }
    ],
  };

  // Datos para gráfico de distribución de estudiantes
  const datosDistribucionEstudiantes = {
    labels: datosEstudiantes.map(item => item.rango),
    datasets: [
      {
        data: datosEstudiantes.map(item => item.cantidad),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const renderEstadisticasGenerales = () => (
    <div className="estadisticas-grid">
      <div className="stat-card">
        <div className="stat-icon">
          <i className="bx bx-book-open"></i>
        </div>
        <div className="stat-content">
          <h3>{estadisticasGenerales.totalCursos}</h3>
          <p>Total Cursos</p>
          <span className="stat-change neutral">{estadisticasGenerales.cursosActivos} activos</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <i className="bx bx-user-circle"></i>
        </div>
        <div className="stat-content">
          <h3>{estadisticasGenerales.totalEstudiantes.toLocaleString()}</h3>
          <p>Total Estudiantes</p>
          <span className="stat-change positive">+{estadisticasGenerales.estudiantesActivos} activos</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <i className="bx bx-chalkboard"></i>
        </div>
        <div className="stat-content">
          <h3>{estadisticasGenerales.totalProfesores}</h3>
          <p>Total Profesores</p>
          <span className="stat-change neutral">Registrados</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <i className="bx bx-dollar-circle"></i>
        </div>
        <div className="stat-content">
          <h3>S/ {estadisticasGenerales.ingresosTotales.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
          <p>Ingresos Totales</p>
          <span className="stat-change positive">Acumulado</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <i className="bx bx-category"></i>
        </div>
        <div className="stat-content">
          <h3>{estadisticasGenerales.totalCategorias}</h3>
          <p>Categorías</p>
          <span className="stat-change neutral">Activas</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <i className="bx bx-check-circle"></i>
        </div>
        <div className="stat-content">
          <h3>{estadisticasGenerales.tasaCompletacion}%</h3>
          <p>Tasa Completación</p>
          <span className="stat-change neutral">Promedio</span>
        </div>
      </div>
    </div>
  );

  const renderGraficos = () => (
    <div className="graficos-grid">
      <div className="grafico-card">
        <div className="grafico-header">
          <h3>Ingresos e Inscripciones</h3>
          <div className="grafico-actions">
            <button 
              onClick={() => exportarReporte('excel', 'ventas')} 
              className="btn-export"
              disabled={descargando}
            >
              <i className="bx bx-download"></i> Excel
            </button>
            <button 
              onClick={() => exportarReporte('csv', 'ventas')} 
              className="btn-export"
              disabled={descargando}
            >
              <i className="bx bx-download"></i> CSV
            </button>
          </div>
        </div>
        <div className="grafico-content">
          <Line data={datosIngresos} options={opcionesIngresos} />
        </div>
      </div>
      
      <div className="grafico-card">
        <div className="grafico-header">
          <h3>Cursos por Categoría</h3>
          <div className="grafico-actions">
            <button 
              onClick={() => exportarReporte('excel', 'categorias')} 
              className="btn-export"
              disabled={descargando}
            >
              <i className="bx bx-download"></i>
            </button>
          </div>
        </div>
        <div className="grafico-content">
          <Bar data={datosCursosPorCategoria} options={opcionesGrafico} />
        </div>
      </div>
      
      <div className="grafico-card">
        <div className="grafico-header">
          <h3>Distribución de Estudiantes por Edad</h3>
          <div className="grafico-actions">
            <button 
              onClick={() => exportarReporte('csv', 'estudiantes')} 
              className="btn-export"
              disabled={descargando}
            >
              <i className="bx bx-download"></i>
            </button>
          </div>
        </div>
        <div className="grafico-content">
          <Doughnut data={datosDistribucionEstudiantes} options={opcionesGrafico} />
        </div>
      </div>
    </div>
  );

  const renderTablaDetallada = () => (
    <div className="tabla-reportes">
      <div className="tabla-header">
        <h3>Rendimiento por Categoría</h3>
        <button onClick={generarReportePersonalizado} className="btn-personalizado">
          <i className="bx bx-customize"></i>
          Reporte Personalizado
        </button>
      </div>
      <div className="tabla-content">
        <table>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Cursos</th>
              <th>Estudiantes</th>
              <th>Ingresos</th>
              <th>Promedio por Curso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosCategorias.map((categoria, index) => (
              <tr key={index}>
                <td>
                  <div className="categoria-info">
                    <span className="categoria-nombre">{categoria.nombre}</span>
                  </div>
                </td>
                <td>{categoria.cursos}</td>
                <td>{categoria.estudiantes}</td>
                <td>S/ {categoria.ingresos.toLocaleString('es-PE', {minimumFractionDigits: 2})}</td>
                <td>
                  S/ {categoria.cursos > 0 
                    ? Math.round(categoria.ingresos / categoria.cursos).toLocaleString('es-PE') 
                    : '0'}
                </td>
                <td>
                  <div className="acciones">
                    <button 
                      className="btn-accion" 
                      title="Exportar"
                      onClick={() => exportarReporte('excel', 'categorias')}
                      disabled={descargando}
                    >
                      <i className="bx bx-download"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="reportes-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reportes-container">
      <div className="reportes-header">
        <div className="header-content-pagos">
          <h1>Reportes y Análisis</h1>
          <p>Panel de control de métricas y estadísticas</p>
        </div>
        <div className="header-actions">
          <div className="filtros-fecha">
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="input-fecha"
            />
            <span>hasta</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="input-fecha"
            />
          </div>
          <select
            value={tipoReporte}
            onChange={(e) => setTipoReporte(e.target.value)}
            className="select-tipo"
          >
            <option value="diario">Diario</option>
            <option value="semanal">Semanal</option>
            <option value="mensual">Mensual</option>
            <option value="anual">Anual</option>
          </select>
          <button 
            onClick={() => exportarReporte('excel', 'general')}
            className="btn-primary"
            disabled={descargando}
          >
            {descargando ? 'Descargando...' : '📥 Exportar Todo'}
          </button>
        </div>
      </div>

      <div className="reportes-tabs">
        <button
          className={`tab-button ${reporteActivo === 'general' ? 'active' : ''}`}
          onClick={() => setReporteActivo('general')}
        >
          <i className="bx bx-bar-chart"></i>
          General
        </button>
        <button
          className={`tab-button ${reporteActivo === 'ventas' ? 'active' : ''}`}
          onClick={() => setReporteActivo('ventas')}
        >
          <i className="bx bx-dollar"></i>
          Ventas
        </button>
        <button
          className={`tab-button ${reporteActivo === 'cursos' ? 'active' : ''}`}
          onClick={() => setReporteActivo('cursos')}
        >
          <i className="bx bx-book"></i>
          Cursos
        </button>
        <button
          className={`tab-button ${reporteActivo === 'estudiantes' ? 'active' : ''}`}
          onClick={() => setReporteActivo('estudiantes')}
        >
          <i className="bx bx-user"></i>
          Estudiantes
        </button>
      </div>

      <div className="reportes-content">
        {reporteActivo === 'general' && (
          <>
            {renderEstadisticasGenerales()}
            {renderGraficos()}
            {renderTablaDetallada()}
          </>
        )}
        
        {reporteActivo === 'ventas' && (
          <div className="seccion-ventas">
            <div className="grafico-card full-width">
              <div className="grafico-header">
                <h3>Análisis de Ventas e Inscripciones</h3>
                <div className="grafico-actions">
                  <button 
                    onClick={() => exportarReporte('excel', 'ventas')} 
                    className="btn-export"
                    disabled={descargando}
                  >
                    <i className="bx bx-file"></i> Excel
                  </button>
                  <button 
                    onClick={() => exportarReporte('csv', 'ventas')} 
                    className="btn-export"
                    disabled={descargando}
                  >
                    <i className="bx bx-file"></i> CSV
                  </button>
                </div>
              </div>
              <div className="grafico-content large">
                <Line data={datosIngresos} options={opcionesIngresos} />
              </div>
            </div>
          </div>
        )}
        
        {reporteActivo === 'cursos' && (
          <div className="seccion-cursos">
            <div className="grafico-card full-width">
              <div className="grafico-header">
                <h3>Análisis de Cursos por Categoría</h3>
                <div className="grafico-actions">
                  <button 
                    onClick={() => exportarReporte('excel', 'categorias')} 
                    className="btn-export"
                    disabled={descargando}
                  >
                    <i className="bx bx-file"></i> Excel
                  </button>
                </div>
              </div>
              <div className="grafico-content large">
                <Bar data={datosCursosPorCategoria} options={opcionesGrafico} />
              </div>
            </div>
          </div>
        )}
        
        {reporteActivo === 'estudiantes' && (
          <div className="seccion-estudiantes">
            <div className="grafico-card full-width">
              <div className="grafico-header">
                <h3>Distribución Demográfica de Estudiantes</h3>
                <div className="grafico-actions">
                  <button 
                    onClick={() => exportarReporte('csv', 'estudiantes')} 
                    className="btn-export"
                    disabled={descargando}
                  >
                    <i className="bx bx-file"></i> CSV
                  </button>
                </div>
              </div>
              <div className="grafico-content large">
                <Doughnut data={datosDistribucionEstudiantes} options={opcionesGrafico} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Reportes.propTypes = {
  setCurrentSection: PropTypes.func.isRequired
};

export default Reportes;