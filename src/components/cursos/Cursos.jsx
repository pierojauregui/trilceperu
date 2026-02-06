import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Cursos.css';

const Cursos = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [searchTerm, setSearchTerm] = useState('');
  const [cursos, setCursos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  


  // Cargar datos reales de la API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar categorías
        const categoriasResponse = await fetch(`${API_URL}/categorias`);
        if (categoriasResponse.ok) {
          const categoriasData = await categoriasResponse.json();
          setCategorias(categoriasData.categorias || []);
        }

        // Cargar cursos
        const cursosResponse = await fetch(`${API_URL}/cursos`);
        if (cursosResponse.ok) {
          const cursosData = await cursosResponse.json();
          console.log('📚 Cursos cargados:', cursosData.cursos?.length || 0);
          setCursos(cursosData.cursos || []);
        } else {
          console.error('Error al cargar cursos:', cursosResponse.status);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Función para recargar cursos (útil después de crear uno nuevo)
  const reloadCursos = async () => {
    try {
      const cursosResponse = await fetch(`${API_URL}/cursos`);
      if (cursosResponse.ok) {
        const cursosData = await cursosResponse.json();
        setCursos(cursosData.cursos || []);
      }
    } catch (error) {
      console.error('Error recargando cursos:', error);
    }
  };

  // Exponer la función de recarga para uso externo
  useEffect(() => {
    window.reloadCursos = reloadCursos;
    return () => {
      delete window.reloadCursos;
    };
  }, []);

  // Función para obtener el nombre de la categoría
  const getCategoriaName = (categoriaId) => {
    const categoria = categorias.find(cat => cat.id === categoriaId);
    return categoria ? categoria.descripcion : 'Sin categoría';
  };

  // Función para filtrar cursos
  const getFilteredCursos = () => {
    return cursos.filter(curso => {
      const matchesSearch = !searchTerm || 
        curso.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curso.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoriaName(curso.categoria_id)?.toLowerCase().includes(searchTerm.toLowerCase());
  
      return matchesSearch;
    });
  };

  // Funciones auxiliares
  const handleCreateCurso = () => {
    setCurrentSection('crear-cursos');
  };

  const handleVerCurso = (id) => {
    setCurrentSection('ver-cursos', id);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getCurrentPageItems = (items) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  // Total de páginas para la paginación
  const totalPages = Math.ceil(getFilteredCursos().length / itemsPerPage);

  // Función para formatear precio
  const formatPrice = (price) => {
    if (!price) return 'Gratis';
    return `S/ ${parseFloat(price).toFixed(2)}`;
  };

  // Función para formatear duración
  const formatDuration = (duration) => {
    if (!duration) return 'No especificada';
    return `${duration} horas`;
  };

  if (loading) {
    return (
      <div className="cursos-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cursos-container">
      {/* Header y barra de búsqueda */}
      <div className="cursos-header">
        <h1>Buscar Cursos</h1>
        <div className="search-bar">
          <input 
            type="text" 
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Buscar por nombre, descripción o categoría" 
            className="search-input"
          />

          <button className="create-btn" onClick={handleCreateCurso}>
            + Crear Curso
          </button>
        </div>
      </div>



      {/* Control de items por página */}
      <div className="cursos-controls">
        <select 
          value={itemsPerPage} 
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="items-per-page-select"
        >
          <option value={5}>5 por página</option>
          <option value={10}>10 por página</option>
          <option value={20}>20 por página</option>
        </select>
        <div className="results-info">
          {(() => {
            const filteredCursos = getFilteredCursos();
            const currentItems = getCurrentPageItems(filteredCursos);
            const startIndex = (currentPage - 1) * itemsPerPage + 1;
            const endIndex = Math.min(startIndex + currentItems.length - 1, filteredCursos.length);
            
            if (filteredCursos.length === 0) {
              return 'No se encontraron cursos';
            }
            
            return `Mostrando ${startIndex} - ${endIndex} de ${filteredCursos.length} curso(s)`;
          })()}
        </div>
      </div>

      {/* Tabla de cursos */}
      <div className="cursos-table">
        {getFilteredCursos().length > 0 ? (
          <>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Modalidad</th>
                  <th>Duración</th>
                  <th>Módulos</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentPageItems(getFilteredCursos()).map(curso => (
                  <tr key={curso.id}>
                    <td>{curso.id}</td>
                    <td>{curso.nombre}</td>
                    <td>{getCategoriaName(curso.categoria_id)}</td>
                    <td>
                      <span className={`modalidad-badge ${curso.modalidad || 'asincrono'}`}>
                        {curso.modalidad === 'sincrono' ? '🔴 En vivo' : '📹 Grabado'}
                      </span>
                    </td>
                    <td>{curso.duracion_horas ? `${curso.duracion_horas} horas` : 'No especificada'}</td>
                    <td>{curso.numero_modulos || 'No especificado'}</td>
                    <td className="precio">
                      {curso.precio_oferta ? 
                        `S/ ${curso.precio_oferta}` : 
                        curso.precio_real ? 
                        `S/ ${curso.precio_real}` : 
                        'No especificado'
                      }
                    </td>
                    <td>
                      <span className={`estado-badge ${curso.publicado ? 'publicado' : 'no-publicado'}`}>
                        {curso.publicado ? 'Publicado' : 'No Publicado'}
                      </span>
                    </td>
                    <td>
                      <button className="ver-btn" onClick={() => handleVerCurso(curso.id)}>
                        VER
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación completa */}
            {totalPages >= 1 && (
              <div className="pagination">
                {/* Botón Primero */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                >
                  Primero
                </button>

                {/* Botón Anterior */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                >
                  Anterior
                </button>

                {/* Números de página */}
                {(() => {
                  const pages = [];
                  const startPage = Math.max(1, currentPage - 2);
                  const endPage = Math.min(totalPages, startPage + 4);
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
                      >
                        {i}
                      </button>
                    );
                  }
                  return pages;
                })()}

                {/* Botón Siguiente */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                >
                  Siguiente
                </button>

                {/* Botón Último */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                >
                  Último
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-cursos">
            <div className="empty-state">
              <h3>No se encontraron cursos</h3>
              <p>No hay cursos que coincidan con los criterios de búsqueda.</p>
              <button className="create-btn" onClick={handleCreateCurso}>
                + Crear Primer Curso
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Cursos.propTypes = {
  setCurrentSection: PropTypes.func.isRequired
};

export default Cursos;