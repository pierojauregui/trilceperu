import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import logger from '../../utils/logger';
import './Home.css';

const API_URL = import.meta.env.VITE_API_URL;

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Home = ({ isDark }) => {
  const [loading, setLoading] = useState(true);
  const [loadingUsuariosActivos, setLoadingUsuariosActivos] = useState(true);
  const [usuariosActivos, setUsuariosActivos] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalCursos: 0,
    cursosActivos: 0,
    totalProfesores: 0,
    totalCategorias: 0,
    totalEstudiantes: 0,
    estudiantesActivos: 0
  });

  // Función para obtener estadísticas reales del backend
  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/reportes/estadisticas-generales`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Los datos vienen en data.data desde el backend
        const stats = data.data || data;
        setDashboardStats({
          totalCursos: stats.totalCursos || stats.total_cursos || 0,
          cursosActivos: stats.cursosActivos || stats.cursos_activos || 0,
          totalProfesores: stats.totalProfesores || stats.total_profesores || 0,
          totalCategorias: stats.totalCategorias || stats.total_categorias || 0,
          totalEstudiantes: stats.totalEstudiantes || stats.total_estudiantes || 0,
          estudiantesActivos: stats.estudiantesActivos || stats.estudiantes_activos || 0
        });
      } else {
        // Fallback a datos mock si hay error
        console.error('Error al cargar estadísticas:', response.status);
        setDashboardStats({
          totalCursos: 0,
          cursosActivos: 0,
          totalProfesores: 0,
          totalCategorias: 0,
          totalEstudiantes: 0,
          estudiantesActivos: 0
        });
      }
    } catch (error) {
      logger.error('Error al cargar estadísticas:', error);
      // Fallback si hay error de conexión
      setDashboardStats({
        totalCursos: 0,
        cursosActivos: 0,
        totalProfesores: 0,
        totalCategorias: 0,
        totalEstudiantes: 0,
        estudiantesActivos: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  // Función para cargar usuarios activos reales
  const cargarUsuariosActivos = async () => {
    try {
      setLoadingUsuariosActivos(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/usuarios_conectados`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUsuariosActivos(data.data);
        } else {
          setUsuariosActivos([]);
        }
      } else {
        logger.error('Error al obtener usuarios conectados:', response.status);
        setUsuariosActivos([]);
      }
    } catch (error) {
      logger.error('Error al cargar usuarios conectados:', error);
      setUsuariosActivos([]);
    } finally {
      setLoadingUsuariosActivos(false);
    }
  };

  useEffect(() => {
    cargarUsuariosActivos();
    
    // Actualizar usuarios activos cada 30 segundos
    const interval = setInterval(cargarUsuariosActivos, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Datos para el gráfico de cursos
  const cursosData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Cursos Totales',
        data: [
          Math.max(4, dashboardStats.totalCursos ? dashboardStats.totalCursos - 8 : 4),
          Math.max(5, dashboardStats.totalCursos ? dashboardStats.totalCursos - 7 : 5),
          Math.max(6, dashboardStats.totalCursos ? dashboardStats.totalCursos - 6 : 6),
          Math.max(7, dashboardStats.totalCursos ? dashboardStats.totalCursos - 5 : 7),
          Math.max(8, dashboardStats.totalCursos ? dashboardStats.totalCursos - 4 : 8),
          Math.max(9, dashboardStats.totalCursos ? dashboardStats.totalCursos - 3 : 9),
          Math.max(10, dashboardStats.totalCursos ? dashboardStats.totalCursos - 2 : 10),
          Math.max(11, dashboardStats.totalCursos ? dashboardStats.totalCursos - 1 : 11),
          dashboardStats.totalCursos || 12,
          dashboardStats.totalCursos || 12,
          dashboardStats.totalCursos || 12,
          dashboardStats.totalCursos || 12
        ],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4
      }
    ]
  };

  const profesoresData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Profesores',
        data: [
          Math.max(3, dashboardStats.totalProfesores ? dashboardStats.totalProfesores - 12 : 3),
          Math.max(4, dashboardStats.totalProfesores ? dashboardStats.totalProfesores - 11 : 4),
          Math.max(5, dashboardStats.totalProfesores ? dashboardStats.totalProfesores - 10 : 5),
          Math.max(6, dashboardStats.totalProfesores ? dashboardStats.totalProfesores - 9 : 6),
          Math.max(7, dashboardStats.totalProfesores ? dashboardStats.totalProfesores - 8 : 7),
          Math.max(8, dashboardStats.totalProfesores ? dashboardStats.totalProfesores - 7 : 8),
          Math.max(9, dashboardStats.totalProfesores ? dashboardStats.totalProfesores - 6 : 9),
          Math.max(10, dashboardStats.totalProfesores ? dashboardStats.totalProfesores - 5 : 10),
          Math.max(11, dashboardStats.totalProfesores ? dashboardStats.totalProfesores - 4 : 11),
          Math.max(12, dashboardStats.totalProfesores ? dashboardStats.totalProfesores - 3 : 12),
          Math.max(13, dashboardStats.totalProfesores ? dashboardStats.totalProfesores - 2 : 13),
          dashboardStats.totalProfesores || 15
        ],
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.4
      }
    ]
  };

  // Datos para el gráfico de distribución de cursos
  const distribucionCursosData = {
    labels: ['Cursos Activos', 'Cursos Inactivos'],
    datasets: [
      {
        data: [
          dashboardStats.cursosActivos || 8, 
          (dashboardStats.totalCursos - dashboardStats.cursosActivos) || 4
        ],
        backgroundColor: [
          'rgba(33, 150, 243, 0.7)',
          'rgba(255, 152, 0, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Opciones para los gráficos de línea
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Opciones para el gráfico de pie
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      }
    }
  };

  // Formateador de fecha y hora en horario Perú (UTC-5)
  const formatFechaHora = (fechaStr) => {
    if (!fechaStr) return "N/A";
    
    try {
      // Crear fecha desde el string
      const fecha = new Date(fechaStr);
      
      // Verificar si la fecha es válida
      if (isNaN(fecha.getTime())) return "Fecha inválida";
      
      // Formatear en zona horaria de Perú (America/Lima)
      const opciones = {
        timeZone: 'America/Lima',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      
      const fechaFormateada = fecha.toLocaleString('es-PE', opciones);
      return fechaFormateada;
    } catch (error) {
      logger.error('Error al formatear fecha:', error);
      return "Error de formato";
    }
  };

  // Obtener fecha actual formateada
  const getCurrentDate = () => {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('es-ES', options);
  };

  return (
    <div className={`home-body ${isDark ? 'dark' : ''}`}>
      <div className="home-container">
      <div className="home-header">
        <h1>Panel de Control - Aula Virtual Educativa</h1>
        <p className="date">{getCurrentDate()}</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card-home">
          <div className="stat-header-home">
            <h3>Cursos Totales</h3>
            <span className="growth positive">+5%</span>
          </div>
          <div className="stat-value-home">{loading ? '...' : dashboardStats.totalCursos}</div>
          <div className="stat-footer-home">Total de cursos</div>
        </div>

        

        <div className="stat-card-home">
          <div className="stat-header-home">
            <h3>Profesores</h3>
          </div>
          <div className="stat-value-home">{loading ? '...' : dashboardStats.totalProfesores}</div>
          <div className="stat-footer-home">Profesores registrados</div>
        </div>

        <div className="stat-card-home">
          <div className="stat-header-home">
            <h3>Estudiantes Activos</h3>
            <span className="growth positive">+8%</span>
          </div>
          <div className="stat-value-home">{loading ? '...' : dashboardStats.estudiantesActivos}</div>
          <div className="stat-footer-home">Activos últimos 30 días</div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-column">
          <div className="chart-container">
            <h2>Tendencia de Cursos</h2>
            <div className="chart-wrapper">
              <Line data={cursosData} options={lineOptions} />
            </div>
          </div>

          <div className="news-container">
            <h2>👥 Usuarios Activos</h2>
            <div className="active-users-indicator">
              <span className="pulse-dot"></span>
              <span className="active-count">{usuariosActivos.length} usuarios conectados</span>
            </div>
            <div className="news-list">
              {loadingUsuariosActivos ? (
                <div className="loading-container" style={{padding: "20px", color: "white"}}>
                  <div className="loading-spinner"></div>
                  <p>Cargando usuarios activos...</p>
                </div>
              ) : usuariosActivos.length > 0 ? (
                usuariosActivos.map((usuario) => (
                  <div key={usuario.id} className="news-item active-user-item">
                    <div className="user-avatar">
                      <span>{usuario.avatar_initials}</span>
                    </div>
                    <div className="news-content">
                      <h3>{usuario.nombres} {usuario.apellidos}</h3>
                      <div className="user-role">{usuario.rol_nombre}</div>
                      <small className="news-original">
                        Último acceso: {formatFechaHora(usuario.ultimo_login)}
                      </small>
                    </div>
                    <div className="online-status">
                      <span className="status-dot online"></span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="news-item">
                  <div className="news-content">
                    <h3>No hay usuarios conectados</h3>
                    <small className="news-original">No hay usuarios conectados actualmente</small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-column">
          <div className="chart-container">
            <h2>Distribución de Cursos</h2>
            <div className="chart-wrapper pie-chart">
              <Pie data={distribucionCursosData} options={pieOptions} />
            </div>
          </div>

          <div className="chart-container">
            <h2>Crecimiento de Profesores</h2>
            <div className="chart-wrapper">
              <Line data={profesoresData} options={lineOptions} />
            </div>
          </div>
        </div>
      </div>

    
    </div>
    </div>
  );
};

export default Home;