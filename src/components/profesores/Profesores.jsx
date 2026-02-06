import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './Profesores.css';

const API_URL = import.meta.env.VITE_API_URL;

const Profesores = ({ setCurrentSection }) => {
  const [profesores, setProfesores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Removido useNavigate para evitar redirecciones no deseadas 

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');

        if (!token) {
          // Si no hay token, mostramos error pero no redirigimos
          console.error("No hay token de sesión.");
          setError('No hay token de sesión. Por favor, inicia sesión nuevamente.');
          setLoading(false);
          return;
        }

        // Usar el endpoint específico para profesores
        const response = await axios.get(`${API_URL}/profesores`);
        
        // axios maneja automáticamente los errores HTTP y el token de autorización
        setProfesores(response.data);

      } catch (err) {
        console.error('Error al cargar profesores:', err);
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Error de autorización. Verifica tus permisos.');
        } else {
          setError(err.response?.data?.detail || err.message || 'No se pudo cargar los profesores');
        }
        
        setProfesores([]); // Aseguramos que la lista esté vacía si hay un error
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []); // navigate es una función estable de react-router-dom

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetear a primera página cuando se busca
  };

  // Filtrar profesores basado en el término de búsqueda
  const filteredUsuarios = profesores.filter(usuario => 
    usuario.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.dni?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener los profesores de la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsuarios.slice(startIndex, endIndex);
  };

  // Calcular el número total de páginas
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);

   if (loading) {
    return <div className="loading-state">Cargando profesores...</div>;
  }

  return (
    <div className="profesores-container">
      <h1>Lista de Profesores</h1>
      <div className="profesores-header">
        <input
          type="text"
          placeholder="Buscar por Nombre, Apellidos, DNI"
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <button 
          className="agregar-btn"
          onClick={() => setCurrentSection('crear-profesores')}
        >
          + Agregar Profesor
        </button>
      </div>

      {/* Control de items por página */}
      <div className="profesores-controls">
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
        </select>
      </div>

      <div className="profesores-table">
        {filteredUsuarios.length > 0 ? (
          <>
            <table>
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>id</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Correo</th>
                  <th>Descripción</th>
                  <th>Rol</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentPageItems().map(usuario => (
                  <tr key={usuario.id}>
                    <td>
                      <div className="profesor-foto-container">
                        {usuario.imagen_perfil ? (
                          <img 
                            src={`${API_URL.replace('/api', '')}/${usuario.imagen_perfil}`}
                            alt={`${usuario.nombres} ${usuario.apellidos}`}
                            className="profesor-foto"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const placeholder = e.target.parentNode.querySelector('.foto-placeholder');
                              if (placeholder) {
                                placeholder.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div className="foto-placeholder" style={{display: usuario.imagen_perfil ? 'none' : 'flex'}}>
                          <i className='bx bx-user'></i>
                        </div>
                      </div>
                    </td>
                    <td>{usuario.id}</td>
                    <td>{usuario.nombres}</td>
                    <td>{usuario.apellidos}</td>
                    <td>{usuario.correo}</td>
                    <td>{usuario.descripcion ? (usuario.descripcion.length > 50 ? usuario.descripcion.substring(0, 50) + '...' : usuario.descripcion) : 'Sin descripción'}</td>
                    <td>{usuario.rol_nombre}</td>
                    <td>
                      <button 
                        className="ver-btn"
                        onClick={() => {
                          localStorage.setItem('selectedUserId', usuario.id);
                          setCurrentSection('ver-profesores');
                        }}
                      >
                        VER
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
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
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                >
                  {index + 1}
                </button>
              ))}

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
          </>
        ) : (
          // Evitar mostrar "No se encontraron" si hay un error
          !error && <div className="no-profesores">No se encontraron profesores</div>
        )}
      </div>
    </div>
  );
};

Profesores.propTypes = {
  setCurrentSection: PropTypes.func.isRequired
};

export default Profesores;