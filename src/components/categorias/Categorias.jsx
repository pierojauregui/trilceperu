import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Categorias.css';

const Categorias = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [searchTerm, setSearchTerm] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  


  // Cargar categorías desde la API
  useEffect(() => {
    const loadCategorias = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(`${API_URL}/categorias`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Usar 'data' en lugar de 'categorias' para consistencia con CursosDisponibles
            setCategorias(result.data || []);
          } else {
            console.error('Error en la respuesta:', result.message);
            setCategorias([]);
          }
        } else {
          console.error('Error al cargar categorías:', response.status);
          setCategorias([]);
        }
      } catch (error) {
        console.error('Error al conectar con la API:', error);
        setCategorias([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategorias();
  }, []);

  // Función para filtrar categorías
  const getFilteredCategorias = () => {
    // Verificación de seguridad: asegurar que categorias sea un array
    if (!Array.isArray(categorias)) {
      return [];
    }
    
    return categorias.filter(categoria => {
      const matchesSearch = !searchTerm || 
        categoria.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
  
      // Por ahora no filtramos por estado activo ya que la tabla no tiene ese campo
      // const matchesStatus = !filtros.activo || 
      //   (filtros.activo === 'true' && categoria.activo) ||
      //   (filtros.activo === 'false' && !categoria.activo);
  
      return matchesSearch; // && matchesStatus;
    });
  };

  // Funciones auxiliares
  const handleCreateCategoria = () => {
    setCurrentSection('crear-categorias');
  };

  const handleVerCategoria = (id) => {
    setCurrentSection('ver-categorias', id);
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
  const totalPages = Math.ceil(getFilteredCategorias().length / itemsPerPage);

  if (loading) {
    return (
      <div className="categorias-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categorias-container">
      {/* Header y barra de búsqueda */}
      <div className="categorias-header">
        <h1>Buscar Categorías</h1>
        <div className="search-bar">
          <input 
            type="text" 
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Buscar categoría" 
            className="search-input"
          />
          <button className="create-btn" onClick={handleCreateCategoria}>
            + Crear Categoría
          </button>
        </div>
      </div>



      {/* Control de items por página */}
      <div className="categorias-controls">
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
          Mostrando {getFilteredCategorias().length} categoría(s)
        </div>
      </div>

      {/* Tabla de categorías */}
      <div className="categorias-table">
        {getFilteredCategorias().length > 0 ? (
          <>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Categoría</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentPageItems(getFilteredCategorias()).map(categoria => (
                  <tr key={categoria.id}>
                    <td>{categoria.id}</td>
                    <td>{categoria.descripcion}</td>
                    <td>
                      <button className="ver-btn" onClick={() => handleVerCategoria(categoria.id)}>
                        VER
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(1)} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Primero
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Anterior
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Mostrar solo algunas páginas alrededor de la actual
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 3 ||
                    pageNumber === currentPage + 3
                  ) {
                    return <span key={pageNumber} className="pagination-ellipsis">...</span>;
                  }
                  return null;
                })}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Siguiente
                </button>
                <button 
                  onClick={() => setCurrentPage(totalPages)} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Último
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-categorias">
            <div className="empty-state">
              <h3>No se encontraron categorías</h3>
              <p>No hay categorías que coincidan con los criterios de búsqueda.</p>
              <button className="create-btn" onClick={handleCreateCategoria}>
                + Crear Primera Categoría
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Categorias.propTypes = {
  setCurrentSection: PropTypes.func.isRequired
};

export default Categorias;