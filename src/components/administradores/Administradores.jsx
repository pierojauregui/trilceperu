import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Administradores.css';

const API_URL = import.meta.env.VITE_API_URL;

const Administradores = ({ setCurrentSection }) => {
  const [administradores, setAdministradores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdministradores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');

      if (!token) {
        console.error("No hay token de sesión.");
        setError('No hay token de sesión. Por favor, inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/administradores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAdministradores(response.data.data || response.data || []);

    } catch (err) {
      console.error('Error al cargar administradores:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Error de autorización. Verifica tus permisos.');
      } else {
        setError(err.response?.data?.detail || err.message || 'No se pudo cargar los administradores');
      }
      
      setAdministradores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdministradores();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEliminar = async (id, nombre) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al administrador ${nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/administradores/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        Swal.fire('Eliminado', 'El administrador ha sido eliminado.', 'success');
        fetchAdministradores();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.detail || 'No se pudo eliminar el administrador', 'error');
      }
    }
  };

  const filteredAdministradores = administradores.filter(admin => 
    admin.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.dni?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.correo_electronico?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAdministradores.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredAdministradores.length / itemsPerPage);

  if (loading) {
    return <div className="loading-state">Cargando administradores...</div>;
  }

  return (
    <div className="administradores-container">
      <h1>
        <i className='bx bx-shield-quarter'></i>
        Gestión de Administradores
      </h1>
      <p className="admin-subtitle">
        Los administradores pueden gestionar cursos, profesores, asignaciones y alumnos. 
        <strong> No tienen acceso a Pagos ni Reportes.</strong>
      </p>
      
      <div className="administradores-header">
        <input
          type="text"
          placeholder="Buscar por Nombre, Apellidos, DNI o Correo"
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <button 
          className="agregar-btn"
          onClick={() => setCurrentSection('crear-administrador')}
        >
          <i className='bx bx-plus'></i>
          Agregar Administrador
        </button>
      </div>

      <div className="administradores-controls">
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
        <span className="total-count">
          Total: {filteredAdministradores.length} administrador(es)
        </span>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="administradores-table">
        {filteredAdministradores.length > 0 ? (
          <>
            <table>
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>ID</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>DNI</th>
                  <th>Correo</th>
                  <th>Celular</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentPageItems().map(admin => (
                  <tr key={admin.id}>
                    <td>
                      <div className="admin-foto-container">
                        {admin.imagen_perfil ? (
                          <img 
                            src={`${API_URL.replace('/api', '')}/${admin.imagen_perfil}`}
                            alt={`${admin.nombres} ${admin.apellidos}`}
                            className="admin-foto"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const placeholder = e.target.parentNode.querySelector('.foto-placeholder');
                              if (placeholder) {
                                placeholder.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div className="foto-placeholder" style={{display: admin.imagen_perfil ? 'none' : 'flex'}}>
                          <i className='bx bx-user'></i>
                        </div>
                      </div>
                    </td>
                    <td>{admin.id}</td>
                    <td>{admin.nombres}</td>
                    <td>{admin.apellidos}</td>
                    <td>{admin.dni}</td>
                    <td>{admin.correo_electronico}</td>
                    <td>{admin.celular || '-'}</td>
                    <td>
                      <div className="acciones-btns">
                        <button 
                          className="editar-btn"
                          onClick={() => {
                            localStorage.setItem('selectedAdminId', admin.id);
                            setCurrentSection('editar-administrador');
                          }}
                          title="Editar"
                        >
                          <i className='bx bx-edit'></i>
                        </button>
                        <button 
                          className="eliminar-btn"
                          onClick={() => handleEliminar(admin.id, `${admin.nombres} ${admin.apellidos}`)}
                          title="Eliminar"
                        >
                          <i className='bx bx-trash'></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(1)} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <i className='bx bx-chevrons-left'></i>
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <i className='bx bx-chevron-left'></i>
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
                  <i className='bx bx-chevron-right'></i>
                </button>
                <button 
                  onClick={() => setCurrentPage(totalPages)} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  <i className='bx bx-chevrons-right'></i>
                </button>
              </div>
            )}
          </>
        ) : (
          !error && (
            <div className="no-administradores">
              <i className='bx bx-user-x'></i>
              <p>No se encontraron administradores</p>
              <button 
                className="agregar-btn-empty"
                onClick={() => setCurrentSection('crear-administrador')}
              >
                <i className='bx bx-plus'></i>
                Crear el primer administrador
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

Administradores.propTypes = {
  setCurrentSection: PropTypes.func.isRequired
};

export default Administradores;
