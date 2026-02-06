import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Asignaciones.css';

const Asignaciones = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProfesor, setFilterProfesor] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterCurso, setFilterCurso] = useState('');
  const [profesores, setProfesores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [cursosOriginales, setCursosOriginales] = useState([]);
  const [error, setError] = useState(null);


  const cargarAsignaciones = async () => {
    try {
      setLoading(true);
      setError(null);

    
      const [asignacionesRes, profesoresRes, cursosRes, categoriasRes] = await Promise.all([
        fetch(`${API_URL}/asignaciones`),
        fetch(`${API_URL}/asignaciones/profesores-disponibles`),
        fetch(`${API_URL}/cursos`),
        fetch(`${API_URL}/categorias`)
      ]);

      if (!asignacionesRes.ok || !profesoresRes.ok || !cursosRes.ok || !categoriasRes.ok) {
        throw new Error('Error al cargar los datos');
      }

      const asignacionesData = await asignacionesRes.json();
      const profesoresData = await profesoresRes.json();
      const cursosData = await cursosRes.json();
      const categoriasData = await categoriasRes.json();

      const asignacionesArray = asignacionesData?.data || [];
      const profesoresArray = profesoresData?.data || [];
      const cursosArray = cursosData?.cursos || [];
      const categoriasArray = categoriasData?.data || [];

     
    const asignacionesTransformadas = asignacionesArray.map(asignacion => ({
  id: asignacion.id,
  codigo: asignacion.codigo_asignacion,
  profesor: {
    id: asignacion.profesor_id || 'N/A',
    nombre: asignacion.profesor_nombre || 'Sin asignar',
    especialidad: 'Profesor',
    email: asignacion.profesor_email || 'N/A',
    imagen_perfil: asignacion.profesor_imagen_perfil || null 
  },
        curso: {
          id: asignacion.curso_id || 'N/A',
          nombre: asignacion.curso_nombre || 'Sin asignar',
          categoria: asignacion.curso_categoria || 'Sin categoría',
          duracion: `${asignacion.duracion_horas || 'N/A'} horas`
        },
        horarios: asignacion.horarios ? 
          asignacion.horarios.split(', ').map(horario => {
            const [dia, tiempo, aula] = horario.split(' ');
            const [horaInicio, horaFin] = tiempo ? tiempo.split('-') : ['N/A', 'N/A'];
            return {
              dia: dia || 'N/A',
              horaInicio: horaInicio || 'N/A',
              horaFin: horaFin || 'N/A',
              aula: aula ? aula.replace(/[()]/g, '') : 'Por definir'
            };
          }) : [],
        fechaInicio: asignacion.fecha_inicio,
        fechaFin: asignacion.fecha_fin,
        estado: asignacion.estado === 'activo' ? 'Activo' : 
               asignacion.estado === 'programado' ? 'Programado' :
               asignacion.estado === 'finalizado' ? 'Finalizado' :
               asignacion.estado === 'cancelado' ? 'Cancelado' : 'Desconocido',
        observaciones: asignacion.observaciones
      }));


      const profesoresTransformados = profesoresArray.map(profesor => ({
        id: profesor.id,
        nombre: profesor.nombre_completo
      }));


      const cursosTransformados = cursosArray.map(curso => ({
        id: curso.id,
        nombre: curso.nombre,
        categoria_id: curso.categoria_id,
        categoria_nombre: curso.categoria_nombre
      }));


      const categoriasTransformadas = categoriasArray.map(categoria => ({
        id: categoria.id,
        nombre: categoria.descripcion
      }));

      setAsignaciones(asignacionesTransformadas);
      setProfesores(profesoresTransformados);
      setCursos(cursosTransformados);
      setCursosOriginales(cursosTransformados);
      setCategorias(categoriasTransformadas);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAsignaciones();
  }, []);


  useEffect(() => {
    if (filterCategoria === '') {
      setCursos(cursosOriginales);
    } else {

      const categoriaSeleccionada = categorias.find(cat => cat.id.toString() === filterCategoria);
      if (categoriaSeleccionada) {
        const cursosFiltrados = cursosOriginales.filter(curso => 
          curso.categoria_nombre === categoriaSeleccionada.nombre
        );
        setCursos(cursosFiltrados);
      }
    }

    setFilterCurso('');
  }, [filterCategoria, cursosOriginales, categorias]);

  const eliminarAsignacion = async (asignacionId, profesorNombre, cursoNombre) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas eliminar la asignación de ${profesorNombre} para el curso ${cursoNombre}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        
        await axios.delete(`${API_URL}/asignaciones/${asignacionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        await Swal.fire({
          title: '¡Eliminado!',
          text: 'La asignación ha sido eliminada exitosamente.',
          icon: 'success',
          confirmButtonColor: '#4CAF50'
        });


        cargarAsignaciones();
      }
    } catch (error) {
      console.error('Error eliminando asignación:', error);
      
      let mensajeError = 'Error al eliminar la asignación';
      if (error.response?.data?.message) {
        mensajeError = error.response.data.message;
      } else if (error.response?.data?.detail) {
        mensajeError = error.response.data.detail;
      }

      Swal.fire({
        title: 'Error',
        text: mensajeError,
        icon: 'error',
        confirmButtonColor: '#f44336'
      });
    }
  };

  const filteredAsignaciones = asignaciones.filter(asignacion => {
    const matchesSearch = asignacion.profesor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asignacion.curso.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProfesor = filterProfesor === '' || asignacion.profesor.id.toString() === filterProfesor;
    
  
    const matchesCategoria = filterCategoria === '' || (() => {
      const categoria = categorias.find(cat => cat.id.toString() === filterCategoria);
      return categoria && asignacion.curso.categoria === categoria.nombre;
    })();
    
    const matchesCurso = filterCurso === '' || asignacion.curso.id.toString() === filterCurso;
    
    return matchesSearch && matchesProfesor && matchesCategoria && matchesCurso;
  });

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Activo': return '#4CAF50';
      case 'Programado': return '#FF9800';
      case 'Finalizado': return '#9E9E9E';
      case 'Cancelado': return '#F44336';
      default: return '#2196F3';
    }
  };

  const formatHorarios = (horarios) => {
    const formatTime = (time) => {
      if (!time || time === 'N/A') return time;

      const timeParts = time.split(':');
      const hours = timeParts[0];
      const minutes = timeParts[1];
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    
    return horarios.map(h => {
      const horaInicio = formatTime(h.horaInicio);
      const horaFin = formatTime(h.horaFin);
      return `${h.dia} ${horaInicio}-${horaFin}`;
    }).join(', ');
  };

  if (loading) {
    return (
      <div className="asignaciones-container">
        <div className="loading-spinner">
          <i className='bx bx-loader-alt bx-spin'></i>
          <p>Cargando asignaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="asignaciones-container">
        <div className="error-container">
          <div className="error-message">
            <h3>⚠️ Error</h3>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="asignaciones-container">
      <div className="asignaciones-header">
        <div className="header-left">
          <h1>Gestión de Asignaciones</h1>
          <p>Administra las asignaciones de profesores a cursos y sus horarios</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setCurrentSection('crear-asignacion')}
          >
            <i className='bx bx-plus'></i>
            Nueva Asignación
          </button>
        </div>
      </div>

      <div className="asignaciones-filters">
        <div className="search-box">
          <i className='bx bx-search'></i>
          <input
            type="text"
            placeholder="Buscar por profesor o curso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select
            value={filterProfesor}
            onChange={(e) => setFilterProfesor(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los profesores</option>
            {profesores.map(profesor => (
              <option key={profesor.id} value={profesor.id}>
                {profesor.nombre}
              </option>
            ))}
          </select>

          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>

          <select
            value={filterCurso}
            onChange={(e) => setFilterCurso(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los cursos</option>
            {cursos.map(curso => (
              <option key={curso.id} value={curso.id}>
                {curso.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="asignaciones-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className='bx bx-user-check'></i>
          </div>
          <div className="stat-content">
            <h3>{asignaciones.filter(a => a.estado === 'Activo').length}</h3>
            <p>Asignaciones Activas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className='bx bx-time'></i>
          </div>
          <div className="stat-content">
            <h3>{asignaciones.filter(a => a.estado === 'Programado').length}</h3>
            <p>Programadas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className='bx bx-group'></i>
          </div>
          <div className="stat-content">
            <h3>{new Set(asignaciones.map(a => a.profesor.id)).size}</h3>
            <p>Profesores Asignados</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className='bx bx-book'></i>
          </div>
          <div className="stat-content">
            <h3>{new Set(asignaciones.map(a => a.curso.id)).size}</h3>
            <p>Cursos Asignados</p>
          </div>
        </div>
      </div>

      <div className="asignaciones-grid">
        {filteredAsignaciones.length === 0 ? (
          <div className="no-results">
            <i className='bx bx-search-alt'></i>
            <h3>No se encontraron asignaciones</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          filteredAsignaciones.map(asignacion => (
            <div key={asignacion.id} className="asignacion-card">
              <div className="card-header">
                <div className="profesor-info">
                  <div className="profesor-avatar">
  {asignacion.profesor.imagen_perfil ? (
    <img 
      src={`${API_URL.replace('/api', '')}/${asignacion.profesor.imagen_perfil}`} 
      alt={asignacion.profesor.nombre}
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
  ) : null}
  <div 
    className="avatar-placeholder" 
    style={{display: asignacion.profesor.imagen_perfil ? 'none' : 'flex'}}
  >
    <i className='bx bx-user'></i>
  </div>
</div>
                  <div className="profesor-details">
                    <h3>{asignacion.profesor.nombre}</h3>
                    <p>{asignacion.profesor.especialidad}</p>
                    <span className="email">{asignacion.profesor.email}</span>
                  </div>
                </div>
                <div className="estado-badge" style={{ backgroundColor: getEstadoColor(asignacion.estado) }}>
                  {asignacion.estado}
                </div>
              </div>

              <div className="card-content">
                <div className="curso-info">
                  <h4>
                    <i className='bx bx-book'></i>
                    {asignacion.curso.nombre}
                  </h4>
                  <p className="categoria">{asignacion.curso.categoria}</p>
                  <p className="duracion">
                    <i className='bx bx-time'></i>
                    {asignacion.curso.duracion}
                  </p>
                </div>

                <div className="horarios-info">
                  <h5>
                    <i className='bx bx-calendar'></i>
                    Horarios
                  </h5>
                  <p className="horarios-text">{formatHorarios(asignacion.horarios)}</p>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    console.log('Ver/Editar asignación:', asignacion.id);
                    localStorage.setItem('selectedAsignacionId', asignacion.id);
                    setCurrentSection('ver-asignaciones');
                  }}
                >
                  <i className='bx bx-show'></i>
                  Ver Detalles
                </button>

               
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Asignaciones;