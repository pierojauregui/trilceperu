import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import './CursosDisponibles.css';

const CursosDisponibles = ({ setCurrentSection, setCursoSeleccionado }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [cursos, setCursos] = useState([]);
  const [cursosInscritos, setCursosInscritos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    cargarDatos();
  }, []);

const cargarDatos = async () => {
  try {
    setLoading(true);
    
    // Cargar categorías primero
    const categoriasResponse = await fetch(`${API_URL}/categorias`);
    if (categoriasResponse.ok) {
      const categoriasData = await categoriasResponse.json();
      setCategorias(categoriasData.data || []);
    }
    
    // Cargar todos los cursos disponibles
    const cursosResponse = await fetch(`${API_URL}/cursos-disponibles`);
    if (!cursosResponse.ok) {
      throw new Error('Error al cargar cursos');
    }
    const cursosData = await cursosResponse.json();
    console.log('Cursos recibidos:', cursosData); // Para debug
    setCursos(cursosData.data || []);
    
    // Cargar cursos ya inscritos del alumno
    const inscritosResponse = await fetch(
      `${API_URL}/inscripciones/alumno/${user.id}`
    );
    if (!inscritosResponse.ok) {
      console.error('Error al cargar inscripciones');
    } else {
      const inscritosData = await inscritosResponse.json();
      const cursosInscritosIds = inscritosData.data?.map(i => i.id_curso) || [];
      setCursosInscritos(cursosInscritosIds);
    }
    
  } catch (error) {
    console.error('Error al cargar cursos:', error);
    // Mostrar mensaje de error al usuario
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar los cursos disponibles'
    });
  } finally {
    setLoading(false);
  }
};

  const inscribirseEnCurso = async (cursoId, asignacionId) => {
    const result = await Swal.fire({
      title: '¿Confirmar inscripción?',
      html: `
        <p>¿Deseas inscribirte en este curso?</p>
        <p><strong>Importante:</strong> Una vez inscrito, deberás asistir según el horario seleccionado.</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, inscribirme',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const dataToSend = {
          id_alumno: user.id,
          id_curso: cursoId,
          id_asignacion: asignacionId
        };

        const response = await fetch(`${API_URL}/inscripciones`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
          await cargarDatos();
          Swal.fire({
            icon: 'success',
            title: '¡Inscripción exitosa!',
            text: 'Te has inscrito correctamente en el curso'
          });
        }
      } catch (error) {
        console.error('Error al inscribirse:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo completar la inscripción'
        });
      }
    }
  };

  const cursosFiltrados = cursos.filter(curso => {
    const cumpleBusqueda = curso.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const cumpleCategoria = filtroCategoria === 'todos' || curso.categoria === filtroCategoria;
    return cumpleBusqueda && cumpleCategoria;
  });

  if (loading) {
    return (
      <div className="cursos-disponibles-loading">
        <div className="spinner"></div>
        <p>Cargando cursos disponibles...</p>
      </div>
    );
  }

  return (
    <div className="cursos-disponibles-container">
      <div className="cursos-disponibles-header">
        <h1>Cursos Disponibles</h1>
        <p>Explora y matricúlate en los cursos de tu interés</p>
      </div>

      <div className="cursos-disponibles-filtros">
        <div className="busqueda-container">
          <i className='bx bx-search'></i>
          <input 
            type="text"
            placeholder="Buscar cursos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        
        <select 
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="todos">Todas las categorías</option>
          {categorias.map(categoria => (
            <option key={categoria.id} value={categoria.descripcion}>
              {categoria.descripcion}
            </option>
          ))}
        </select>
      </div>

      <div className="cursos-disponibles-grid">
        {cursosFiltrados.map(curso => (
          <article 
            key={curso.id} 
            className="course-card"
            onClick={() => {
              setCursoSeleccionado(curso);
              setCurrentSection('detalle-curso');
            }}
            style={{ cursor: 'pointer' }}
          >
            {/* Imagen del curso */}
            <div className="course-image-wrapper">
              <img 
                src={curso.imagen_url ? `${API_URL.replace('/api', '')}${curso.imagen_url}` : '/images/default-course.svg'} 
                alt={curso.nombre}
                className="course-image"
                loading="lazy"
                onError={(e) => {
                  e.target.src = '/images/default-course.svg';
                }}
              />
              <div className="course-category-badge">
                {curso.categoria || 'Sin categoría'}
              </div>
              {cursosInscritos.includes(curso.id) && (
                <div className="enrolled-badge">Inscrito</div>
              )}
            </div>
            
            {/* Contenido del curso */}
            <div className="course-content">
              <h4 className="course-title">{curso.nombre}</h4>
              <p className="course-description">{curso.descripcion}</p>
              
              <div className="course-meta">
                <div className="course-info-cursos">
                  <span className="course-modules">
                    📚 {curso.numero_modulos || 0} módulos
                  </span>
                  <span className="course-duration">
                    ⏱️ {curso.duracion_horas || curso.duracion_semanas || 0} {curso.duracion_horas ? 'horas' : 'semanas'}
                  </span>
                </div>
                
                <div className="course-pricing">
                  {curso.precio_oferta && parseFloat(curso.precio_oferta) < parseFloat(curso.precio_real || curso.precio) ? (
                    <>
                      <span className="price-offer">S/ {parseFloat(curso.precio_oferta).toFixed(2)}</span>
                      <span className="price-original">S/ {parseFloat(curso.precio_real || curso.precio).toFixed(2)}</span>
                      <span className="price-discount">
                        -{Math.round(((parseFloat(curso.precio_real || curso.precio) - parseFloat(curso.precio_oferta)) / parseFloat(curso.precio_real || curso.precio)) * 100)}%
                      </span>
                    </>
                  ) : (
                    <span className="price-current">S/ {parseFloat(curso.precio_real || curso.precio || 0).toFixed(2)}</span>
                  )}
                </div>
              </div>
              
              {/* Información de horarios disponibles (solo informativa) */}
              {curso.asignaciones && curso.asignaciones.length > 0 && (
                <div className="course-schedule-info">
                  <div className="schedule-count">
                    📅 {curso.asignaciones.length} horario{curso.asignaciones.length > 1 ? 's' : ''} disponible{curso.asignaciones.length > 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {cursosFiltrados.length === 0 && (
        <div className="no-cursos">
          <i className='bx bx-search-alt-2'></i>
          <p>No se encontraron cursos que coincidan con tu búsqueda</p>
        </div>
      )}
    </div>
  );
};

export default CursosDisponibles;