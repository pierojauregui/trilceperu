import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import 'boxicons/css/boxicons.min.css';
import { useAuth } from '../../contexts/AuthContext'; 
import Profile from '../../assets/images/profile.svg'
import Categorias from '../categorias/Categorias'
import VerCategorias from '../categorias/VerCategorias'
import CrearCategorias from '../categorias/CrearCategorias'
import Cursos from '../cursos/Cursos';
import VerCursos from '../cursos/VerCursos';
import CrearCurso from '../cursos/CrearCurso'
import Profesores from '../profesores/Profesores';
import VerProfesores from '../profesores/VerProfesores';
import CrearProfesor from '../profesores/CrearProfesor';
import Asignaciones from '../asignaciones/Asignaciones';
import CrearAsignacion from '../asignaciones/CrearAsignacion';
import VerAsignaciones from '../asignaciones/VerAsignaciones';
import EditarAsignacion from '../asignaciones/EditarAsignacion';
import Alumnos from '../alumnos/Alumnos';
import VerAlumno from '../alumnos/VerAlumno';
import AsignarAlumno from '../alumnos/AsignarAlumno';
import CrearAlumno from '../alumnos/CrearAlumno';
import Pagos from '../pagos/Pagos';
import ProcesarPago from '../pagos/ProcesarPago';
import Reportes from '../reportes/Reportes';
import Home from '../home/Home';
import HomeAlumno from '../home/HomeAlumno';
import HomeProfesor from '../home/HomeProfesor';
import EditarPerfil from '../EditarPerfil/EditarPerfil';
import Configuraciones from '../configuraciones/Configuraciones';
import Administradores from '../administradores/Administradores';
import CrearAdministrador from '../administradores/CrearAdministrador';

import logo from '/images/trilce_peru.png';
// Componentes del profesor
import VistaProfesor from '../VistaProfesor/VistaProfesor';
import VistaAlumno from '../VistaAlumno/VistaAlumno';

const Dashboard = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [currentSection, setCurrentSection] = useState('home');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [mostrarEditarPerfil, setMostrarEditarPerfil] = useState(false);

  const [user, setUser] = useState(null);
  const { user: authUser } = useAuth(); 
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleSectionChange = (section, data = null) => {
    console.log('Dashboard - handleSectionChange llamado con:', { section, data });
    setCurrentSection(section);
    
    // Manejar diferentes tipos de datos pasados
    if (typeof data === 'object' && data !== null) {
      console.log('Dashboard - Datos recibidos como objeto:', data);
      // Si es un objeto con propiedades específicas
      if (data.alumnoId) {
        console.log('Dashboard - Estableciendo alumnoId:', data.alumnoId);
        setSelectedId(data.alumnoId);
        setSelectedData(data); // Guardar todos los datos adicionales
        localStorage.setItem('selectedAlumnoId', data.alumnoId);
      } else if (data.id) {
        setSelectedId(data.id);
      }
    } else if (data) {
      // Si es un ID simple
      console.log('Dashboard - Datos recibidos como ID simple:', data);
      setSelectedId(data);
    }
    
    // Guardar el ID en localStorage para componentes que lo necesiten
    if (section === 'ver-cursos' && data) {
      localStorage.setItem('selectedCursoId', data);
    } else if (section === 'ver-profesores' && data) {
      localStorage.setItem('selectedUserId', data);
    } else if (section === 'ver-categorias' && data) {
      localStorage.setItem('selectedCategoriaId', data);
    } else if (section === 'ver-asignacion-detalle' && data) {
      localStorage.setItem('selectedAsignacionId', data);
    } else if (section === 'editar-asignacion' && data) {
      localStorage.setItem('selectedAsignacionId', data);
    } else if (section === 'ver-alumno' && data) {
      const alumnoId = typeof data === 'object' ? data.alumnoId : data;
      console.log('Dashboard - Guardando alumnoId en localStorage:', alumnoId);
      localStorage.setItem('selectedAlumnoId', alumnoId);
    }
  };

  const renderContent = () => {
    switch(currentSection) {
      case 'categorias':
        return <Categorias setCurrentSection={handleSectionChange} />;
      case 'ver-categorias':
        return <VerCategorias categoriaId={selectedId} setCurrentSection={handleSectionChange} />;
      case 'crear-categorias':
        return <CrearCategorias setCurrentSection={setCurrentSection} />;
      case 'cursos':
        return <Cursos setCurrentSection={handleSectionChange} />; 
      case 'ver-cursos':
        return <VerCursos cursoId={selectedId} setCurrentSection={handleSectionChange} />;
      case 'crear-cursos':
        return <CrearCurso setCurrentSection={setCurrentSection} />;
      case 'profesores':
        return <Profesores setCurrentSection={setCurrentSection} />;
      case 'ver-profesores':
        return <VerProfesores setCurrentSection={setCurrentSection} />;
      case 'crear-profesores':
        return <CrearProfesor setCurrentSection={setCurrentSection} />;
      case 'asignaciones':
        return <Asignaciones setCurrentSection={handleSectionChange} />;
      case 'crear-asignacion':
        return <CrearAsignacion setCurrentSection={setCurrentSection} />;
      case 'ver-asignaciones':
        return <VerAsignaciones setCurrentSection={setCurrentSection} />;
      case 'ver-asignacion-detalle':
        return <VerAsignaciones setCurrentSection={handleSectionChange} />;
      case 'editar-asignacion':
        return <EditarAsignacion asignacionId={selectedId} setCurrentSection={handleSectionChange} />;
      case 'alumnos':
        return <Alumnos setCurrentSection={handleSectionChange} />;
      case 'ver-alumno':
        return <VerAlumno alumnoId={selectedId} alumnoNombre={selectedData?.alumnoNombre} setCurrentSection={setCurrentSection} />;
      case 'asignar-alumno':
        return <AsignarAlumno alumnoId={selectedId} alumnoNombre={selectedData?.alumnoNombre} setCurrentSection={setCurrentSection} />;
      case 'crear-alumno':
        return <CrearAlumno setCurrentSection={setCurrentSection} />;
      case 'pagos':
        return <Pagos setCurrentSection={setCurrentSection} />;
      case 'procesar-pago':
        return <ProcesarPago setCurrentSection={setCurrentSection} />;
      case 'reportes':
        return <Reportes setCurrentSection={setCurrentSection} />;
      case 'configuraciones':
        return <Configuraciones />;
      case 'administradores':
        return <Administradores setCurrentSection={setCurrentSection} />;
      case 'crear-administrador':
        return <CrearAdministrador setCurrentSection={setCurrentSection} modo="crear" />;
      case 'editar-administrador':
        return <CrearAdministrador setCurrentSection={setCurrentSection} modo="editar" />;
      // Secciones específicas del profesor
      case 'mis-cursos':
      case 'mis-alumnos':
      case 'asistencias':
      case 'gestionar-clases':
      case 'clases-modulo':
      case 'clase-individual':
      case 'reportes-profesor':
      case 'examenes-profesor':
      case 'foros-profesor':
        return <VistaProfesor currentSection={currentSection} setCurrentSection={setCurrentSection} />;
      // Secciones del alumno
      case 'cursos-disponibles':
      case 'detalle-curso':
      case 'formulario-compra':
      case 'mis-cursos-alumno':
      case 'clases-alumno':
      case 'clases-modulo-alumno':
      case 'clase-individual-alumno':
      case 'examenes-alumno':
      case 'examenes-curso':
      case 'mis-asistencias':
      case 'foros-alumno':
      case 'mis-calificaciones':
      case 'mis-reportes':
        return <VistaAlumno currentSection={currentSection} setCurrentSection={setCurrentSection} />;
      case 'home':
        return user?.rol_usuario_id === 4 ? <HomeAlumno setCurrentSection={handleSectionChange} /> : 
               user?.rol_usuario_id === 3 ? <HomeProfesor setCurrentSection={handleSectionChange} /> : <Home isDark={isDark} />;
      case 'inicio':
      default:
        return user?.rol_usuario_id === 4 ? <HomeAlumno setCurrentSection={handleSectionChange} /> : 
               user?.rol_usuario_id === 3 ? <HomeProfesor setCurrentSection={handleSectionChange} /> : <Home isDark={isDark} />;
    }
  };

  useEffect(() => {
    // Si el usuario del contexto de autenticación existe,
    // lo establecemos en el estado local del Dashboard.
    if (authUser) {
      setUser(authUser);
    }
    // Este efecto se ejecutará cada vez que el usuario del contexto cambie.
  }, [authUser]);// navigate es una función estable de react-router-dom

  // Escuchar eventos de actualización de perfil
  useEffect(() => {
    const handleProfileUpdate = () => {
      // Forzar re-render del componente para actualizar la imagen
      if (authUser) {
        setUser({...authUser});
      }
    };

    const handleRedirectToHome = () => {
      // Redirigir al home según el rol del usuario
      setCurrentSection('home');
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    window.addEventListener('redirectToHome', handleRedirectToHome);
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
      window.removeEventListener('redirectToHome', handleRedirectToHome);
    };
  }, [authUser]);

  // Eliminado useEffect de parámetros URL que causaba bucle infinito

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
  
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(prev => !prev);
  };

  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  const handleExpandClick = () => {
    const sidebar = document.querySelector(".sidebar");
    sidebar?.classList.remove("close", "hoverable");
    setIsSidebarOpen(true);
  };
  
  const handleCollapseClick = () => {
    const sidebar = document.querySelector(".sidebar");
    sidebar?.classList.add("close", "hoverable");
    setIsSidebarOpen(false);
  };

  if (!user) return null;

  return (
    <div className={`dashboard-container dashboard-body ${isDark ? 'dark' : ''}`}>
     <nav className="navbar">
        <i 
          className="bx bx-menu" 
          id="sidebarOpen" 
          onClick={handleSidebarToggle}
        ></i>
        
        <div className="logo_item">
          <img src={logo} alt="Trilce Peru" />
        </div>

        <div className="greeting_bar">
         <span>
  {getGreeting()}, {user.nombres.split(" ")[0]} {user.apellidos.split(" ")[0]} - 
  {user.rol_usuario_id === 1 ? ' SuperAdmin' : 
   user.rol_usuario_id === 2 ? ' Admin' : 
   user.rol_usuario_id === 3 ? ' Profesor' : 
   user.rol_usuario_id === 4 ? ' Estudiante' : ' Usuario'}
</span>
        </div>

        <div className="navbar_content">
          <i className="bi bi-grid"></i>
          <i
            className={`bx ${isDark ? 'bx-moon' : 'bx-sun'}`}
            id="darkLight"
            onClick={toggleDarkMode}
          ></i>
          <i className="bx bx-bell"></i>
          <div className="profile-container">
            <img 
              src={user?.imagen_perfil ? `${API_URL.replace('/api', '')}/${user.imagen_perfil}` : Profile} 
              alt="Profile" 
              className="profile" 
              onClick={() => setMostrarEditarPerfil(true)}
            />
            <div className="profile-tooltip">Editar Perfil</div>
          </div>
        </div>
      </nav>

      <nav className={`sidebar ${!isSidebarOpen ? 'close hoverable' : ''}`}>
        <div className="menu_content">
          <ul className="menu_items">
          <div className="menu_title menu_dahsboard"></div>
            
        {user && user.rol_usuario_id === 3 ? (
  /* Menú para Profesores (rol_usuario_id = 3) */
  <>
    <li className="item">
      <a onClick={() => setCurrentSection('home')} className="nav_link">
        <span className="navlink_icon"><i className="bx bx-home-alt"></i></span>
        <span className="navlink">Inicio</span>
      </a>
    </li>
    <li className="item">
      <a onClick={() => setCurrentSection('mis-cursos')} className="nav_link">
        <span className="navlink_icon"><i className='bx bx-book-content'></i></span>
        <span className="navlink">Mis Cursos</span>
      </a>
    </li>
    <li className="item">
      <a onClick={() => setCurrentSection('mis-alumnos')} className="nav_link">
        <span className="navlink_icon"><i className='bx bx-group'></i></span>
        <span className="navlink">Mis Alumnos</span>
      </a>
    </li>

    <li className="item">
      <a onClick={() => setCurrentSection('asistencias')} className="nav_link">
        <span className="navlink_icon"><i className='bx bx-check'></i></span>
        <span className="navlink">Asistencias</span>
      </a>
    </li>

    <li className="item">
      <a onClick={() => setCurrentSection('gestionar-clases')} className="nav_link">
        <span className="navlink_icon"><i className='bx bx-folder-plus'></i></span>
        <span className="navlink">Gestionar Clases</span>
      </a>
    </li>


    <li className="item">
      <a onClick={() => setCurrentSection('examenes-profesor')} className="nav_link">
        <span className="navlink_icon"><i className='bx bx-edit'></i></span>
        <span className="navlink">Exámenes</span>
      </a>
    </li>
    <li className="item">
      <a onClick={() => setCurrentSection('foros-profesor')} className="nav_link">
        <span className="navlink_icon"><i className='bx bx-chat'></i></span>
        <span className="navlink">Foros</span>
      </a>
    </li>
    <li className="item">
      <a onClick={() => setCurrentSection('reportes-profesor')} className="nav_link">
        <span className="navlink_icon"><i className='bx bx-line-chart'></i></span>
        <span className="navlink">Reportes</span>
      </a>
    </li>
  </>
) : user && (user.rol_usuario_id === 1 || user.rol_usuario_id === 2) ? (
  /* Menú para SuperAdmin (1) y Admin (2) */
  <>
    <li className="item">
      <a onClick={() => setCurrentSection('home')} className="nav_link">
        <span className="navlink_icon"><i className="bx bx-home-alt"></i></span>
        <span className="navlink">Inicio</span>
      </a>
    </li>
    <li className="item">
      <a onClick={() => setCurrentSection('categorias')} className="nav_link">
        <span className="navlink_icon"><i className='bx bx-cube'></i></span>
        <span className="navlink">Categorias</span>
      </a>
    </li>
    <li className="item">
      <a onClick={() => setCurrentSection('cursos')} className="nav_link">
        <span className="navlink_icon"><i className="bx bx-grid-alt"></i></span>
        <span className="navlink">Cursos</span>
      </a>
    </li>
    <li className="item">
      <a onClick={() => setCurrentSection('profesores')} className="nav_link">
        <span className="navlink_icon"><i className='bx bx-group'></i></span>
        <span className="navlink">Profesores</span>
      </a>
    </li>
    <li className="item">
      <a onClick={() => setCurrentSection('asignaciones')} className="nav_link">
        <span className="navlink_icon"><i className='bx bx-calendar-check'></i></span>
        <span className="navlink">Asignaciones</span>
      </a>
    </li>
    <li className="item">
      <a onClick={() => setCurrentSection('alumnos')} className="nav_link">
        <span className="navlink_icon"><i className='bx bx-user-circle'></i></span>
        <span className="navlink">Alumnos</span>
      </a>
    </li>
    {user.rol_usuario_id === 1 && (
      /* Solo SuperAdmin puede ver Administradores */
      <li className="item">
        <a onClick={() => setCurrentSection('administradores')} className="nav_link">
          <span className="navlink_icon"><i className='bx bx-shield-quarter'></i></span>
          <span className="navlink">Administradores</span>
        </a>
      </li>
    )}
    {user.rol_usuario_id === 1 && (
      /* Solo SuperAdmin puede ver Pagos */
      <li className="item">
        <a onClick={() => setCurrentSection('pagos')} className="nav_link">
          <span className="navlink_icon"><i className='bx bx-credit-card'></i></span>
          <span className="navlink">Pagos</span>
        </a>
      </li>
    )}
    {user.rol_usuario_id === 1 && (
      /* Solo SuperAdmin puede ver Reportes */
      <li className="item">
        <a onClick={() => setCurrentSection('reportes')} className="nav_link">
          <span className="navlink_icon"><i className='bx bx-pie-chart'></i></span>
          <span className="navlink">Reportes</span>
        </a>
      </li>
    )}
    {user.rol_usuario_id === 1 && (
      /* Solo SuperAdmin puede ver Configuraciones */
      <li className="item">
        <a onClick={() => setCurrentSection('configuraciones')} className="nav_link">
          <span className="navlink_icon"><i className="bx bx-cog"></i></span>
          <span className="navlink">Configuraciones</span>
        </a>
      </li>
    )}
    {user.rol_usuario_id === 2 && (
      /* Admin también puede ver Configuraciones */
      <li className="item">
        <a onClick={() => setCurrentSection('configuraciones')} className="nav_link">
          <span className="navlink_icon"><i className="bx bx-cog"></i></span>
          <span className="navlink">Configuraciones</span>
        </a>
      </li>
    )}
  </>
) : user && user.rol_usuario_id === 4 ? (
  /* Menú para Estudiantes (rol_usuario_id = 4) */
  <>
    <li className="item">
      <a onClick={() => setCurrentSection('home')} className="nav_link">
        <span className="navlink_icon"><i className="bx bx-home-alt"></i></span>
        <span className="navlink">Inicio</span>
      </a>
    </li>
    <li className="item">
      <a onClick={() => setCurrentSection('cursos-disponibles')} className="nav_link">
        <span className="navlink_icon"><i className='bx bx-search-alt'></i></span>
        <span className="navlink">Explorar Cursos</span>
      </a>
    </li>
    <li className="item">
      <a onClick={() => setCurrentSection('mis-cursos-alumno')} className="nav_link">
        <span className="navlink_icon"><i className='bx bx-book'></i></span>
        <span className="navlink">Mis Cursos</span>
      </a>
    </li>
    <li className="item">
      <a onClick={() => setCurrentSection('mis-asistencias')} className="nav_link">
        <span className="navlink_icon"><i className='bx bx-calendar-check'></i></span>
        <span className="navlink">Mis Asistencias</span>
      </a>
    </li>
    <li className="item">
      <a onClick={() => setCurrentSection('mis-calificaciones')} className="nav_link">
        <span className="navlink_icon"><i className='bx bx-medal'></i></span>
        <span className="navlink">Mis Calificaciones</span>
      </a>
    </li>
    <li className="item">
      <a onClick={() => setCurrentSection('foros-alumno')} className="nav_link">
        <span className="navlink_icon"><i className='bx bx-chat'></i></span>
        <span className="navlink">Foros</span>
      </a>
    </li>
    <li className="item">
      <a onClick={() => setCurrentSection('examenes-alumno')} className="nav_link">
        <span className="navlink_icon"><i className='bx bx-edit'></i></span>
        <span className="navlink">Exámenes</span>
      </a>
    </li>
    <li className="item">
      <a onClick={() => setCurrentSection('mis-reportes')} className="nav_link">
        <span className="navlink_icon"><i className='bx bx-line-chart'></i></span>
        <span className="navlink">Mis Reportes</span>
      </a>
    </li>
  </>
) : null}

{/* Cerrar Sesión - Común para todos */}
<li className="item">
  <a href="#" className="nav_link" onClick={handleLogout}>
    <span className="navlink_icon"><i className="bx bx-door-open"></i></span>
    <span className="navlink">Cerrar Sesión</span>
  </a>
</li>

          </ul>

          

         


        
          <div className="bottom_content">
            <div className="bottom expand_sidebar" onClick={handleExpandClick}>
              <span>Expandir</span>
              <i className='bx bx-log-in'></i>
            </div>
            <div className="bottom collapse_sidebar" onClick={handleCollapseClick}>
              <span>Colapsar</span>
              <i className='bx bx-log-out'></i>
            </div>
          </div>

        </div>
      </nav>

      <div className="container">
    {renderContent()}
  </div>

  {/* Modal de Editar Perfil */}
  {mostrarEditarPerfil && (
    <EditarPerfil 
      usuario={user}
      onClose={() => setMostrarEditarPerfil(false)}
      onUsuarioActualizado={(usuarioActualizado) => {
        setUser(usuarioActualizado);
        setMostrarEditarPerfil(false);
      }}
    />
  )}
   </div>
 );
};

export default Dashboard;