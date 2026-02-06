import React, { useState, useEffect } from 'react';
import './Alumnos.css';

const API_URL = import.meta.env.VITE_API_URL;

const Alumnos = ({ setCurrentSection }) => {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterInscripcion, setFilterInscripcion] = useState('todos'); // Nuevo filtro
  const [cursos, setCursos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    inscritos_en_cursos: 0,
    sin_inscripcion: 0
  });
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
   
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
      
      const usuariosResponse = await fetch(`${API_URL}/alumnos`, {
        headers: headers
      });
      if (!usuariosResponse.ok) {
        throw new Error(`Error ${usuariosResponse.status}: ${usuariosResponse.statusText}`);
      }
      const usuariosData = await usuariosResponse.json();
      

      if (!usuariosData.success || !usuariosData.data || !usuariosData.data.alumnos) {
        throw new Error('Formato de respuesta inválido del servidor');
      }
      
      const alumnosData = usuariosData.data.alumnos;
        

        const cursosResponse = await fetch(`${API_URL}/cursos`, {
          headers: headers
        });
        if (!cursosResponse.ok) {
          throw new Error(`Error ${cursosResponse.status}: ${cursosResponse.statusText}`);
        }
        const cursosData = await cursosResponse.json();
        
       
        if (!cursosData.success || !cursosData.cursos) {
          throw new Error('Formato de respuesta inválido del servidor para cursos');
        }
        
        const cursosArray = cursosData.cursos;
        

        if (alumnosData.length === 0) {
          setAlumnos([]);
          setCursos(cursosArray);
          setLoading(false);
          return;
        }
        

        const alumnosFormateados = alumnosData.map(alumno => {
          return {
            id: alumno.id,
            nombres: alumno.nombres,
            apellidos: alumno.apellidos,
            dni: alumno.dni,
            correo: alumno.correo_electronico || alumno.correo,
            celular: alumno.celular,
            estado: alumno.estado || 'activo',
            fecha_ultimo_acceso: alumno.fecha_ultimo_acceso,
            imagen_perfil: alumno.imagen_perfil,
            total_inscripciones: alumno.total_inscripciones || 0
          };
        });
        
        setAlumnos(alumnosFormateados);
        setCursos(cursosArray);
        
 
        if (usuariosData.data.estadisticas) {
          setEstadisticas(usuariosData.data.estadisticas);
        }
        
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openVideoModal = (curso) => {
    setSelectedCourse(curso);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedCourse(null);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeVideoModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);


  const handleCreateAlumno = async (formData) => {
    setCreateLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          dni: formData.dni,
          celular: formData.celular,
          fecha_nacimiento: formData.fechaNacimiento,
          correo_electronico: formData.email,
          contrasena: formData.password,
          rol_usuario_id: 3,
          estado: 'activo'
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
  
        window.location.reload();
      } else {
        throw new Error(result.message || 'Error al crear alumno');
      }
    } catch (error) {
      alert('Error al crear alumno: ' + error.message);
    } finally {
      setCreateLoading(false);
      setShowCreateModal(false);
    }
  };


  const alumnosFiltrados = alumnos.filter(alumno => {
    const matchesSearch = alumno.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alumno.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alumno.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alumno.dni.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'todos' || alumno.estado === filterStatus;
    

    let matchesInscripcion = true;
    if (filterInscripcion === 'inscritos') {
      matchesInscripcion = alumno.total_inscripciones > 0;
    } else if (filterInscripcion === 'sin_inscripcion') {
      matchesInscripcion = alumno.total_inscripciones === 0;
    }
    
    return matchesSearch && matchesStatus && matchesInscripcion;
  });


  const totalPages = Math.ceil(alumnosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const alumnosPaginados = alumnosFiltrados.slice(startIndex, endIndex);


  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterInscripcion]);

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'activo': return '#10b981';
      case 'inactivo': return '#ef4444';
      case 'suspendido': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getCourseStatusColor = (estado) => {
    switch (estado) {
      case 'completado': return '#10b981';
      case 'en_progreso': return '#3b82f6';
      case 'pausado': return '#f59e0b';
      case 'no_iniciado': return '#6b7280';
      default: return '#6b7280';
    }
  };



  const formatCurrency = (amount) => {
    return `S/ ${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="alumnos-loading">
        <div className="loading-spinner"></div>
        <p>Cargando alumnos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alumnos-error">
        <h2>Error al cargar datos</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  if (!loading && !error && alumnos.length === 0) {
    return (
      <div className="alumnos-container">
        <div className="alumnos-header">
          <h1>Gestión de Alumnos</h1>
          <p>Administra los estudiantes inscritos y sus cursos</p>
        </div>
        <div className="no-results">
          <p>No existen datos de alumnos</p>
          <button className="btn-primary" onClick={() => setCurrentSection('crear-alumno')}>Crear Primer Alumno</button>
        </div>
      </div>
    );
  }

  return (
    <div className="alumnos-container">
      <div className="alumnos-header">
        <div className="header-content-alumnos">
          <div>
            <h1>Gestión de Alumnos</h1>
            <p>Administra los estudiantes inscritos y sus cursos</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setCurrentSection('crear-alumno')}
          >
            Crear Nuevo Alumno
          </button>
        </div>
      </div>

      <div className="alumnos-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre, email o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-box">
          <select 
            value={filterInscripcion} 
            onChange={(e) => setFilterInscripcion(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos los alumnos</option>
            <option value="inscritos">Inscritos en algún curso</option>
            <option value="sin_inscripcion">Sin inscripción a cursos</option>
          </select>
        </div>
      </div>


      <div className="alumnos-stats">
        <div 
          className={`stat-card ${filterInscripcion === 'todos' ? 'active' : ''}`}
          onClick={() => setFilterInscripcion('todos')}
          style={{ cursor: 'pointer' }}
        >
          <h3>{estadisticas.total}</h3>
          <p>Total Alumnos</p>
        </div>
        <div 
          className={`stat-card ${filterInscripcion === 'inscritos' ? 'active' : ''}`}
          onClick={() => setFilterInscripcion('inscritos')}
          style={{ cursor: 'pointer' }}
        >
          <h3>{estadisticas.inscritos_en_cursos}</h3>
          <p>Inscritos en Cursos</p>
        </div>
        <div 
          className={`stat-card ${filterInscripcion === 'sin_inscripcion' ? 'active' : ''}`}
          onClick={() => setFilterInscripcion('sin_inscripcion')}
          style={{ cursor: 'pointer' }}
        >
          <h3>{estadisticas.sin_inscripcion}</h3>
          <p>Sin Inscripción</p>
        </div>
      </div>


      <div className="alumnos-table-container">
        <table className="alumnos-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>ID</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>DNI</th>
              <th>Correo</th>
              <th>Celular</th>
              <th>Cursos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alumnosPaginados.map(alumno => (
              <tr key={alumno.id}>
                <td>
                  <div className="alumno-foto-container">
                    {alumno.imagen_perfil ? (
                      <img 
                        src={`${API_URL.replace('/api', '')}/${alumno.imagen_perfil}`}
                        alt={`${alumno.nombres} ${alumno.apellidos}`}
                        className="alumno-foto"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="alumno-foto-placeholder" style={{display: alumno.imagen_perfil ? 'none' : 'flex'}}>
                      <i className='bx bx-user'></i>
                    </div>
                  </div>
                </td>
                <td>{alumno.id}</td>
                <td>{alumno.nombres}</td>
                <td>{alumno.apellidos}</td>
                <td>{alumno.dni}</td>
                <td>{alumno.correo}</td>
                <td>{alumno.celular}</td>
                <td>
                  <span className={`inscripcion-badge ${alumno.total_inscripciones > 0 ? 'inscrito' : 'sin-inscripcion'}`}>
                    {alumno.total_inscripciones > 0 ? `${alumno.total_inscripciones} curso${alumno.total_inscripciones > 1 ? 's' : ''}` : 'Sin cursos'}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-ver-detalle"
                    onClick={() => setCurrentSection('ver-alumno', { 
                      alumnoId: alumno.id, 
                      alumnoNombre: `${alumno.nombres} ${alumno.apellidos}` 
                    })}
                  >
                    Ver Detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

   
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

      {alumnosFiltrados.length === 0 && alumnos.length > 0 && (
        <div className="no-results">
          <p>No se encontraron alumnos con los filtros aplicados</p>
        </div>
      )}


      {showCreateModal && (
        <CreateAlumnoModal 
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAlumno}
          loading={createLoading}
        />
      )}

  
      {showVideoModal && selectedCourse && (
        <div className="modal-overlay" onClick={closeVideoModal}>
          <div className="modal-content video-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Vista Previa: {selectedCourse.nombre}</h2>
              <button className="close-btn" onClick={closeVideoModal}>×</button>
            </div>
            <div className="video-container">
              <div className="video-placeholder">
                <div className="play-button">▶</div>
                <p>Vista previa del curso</p>
                <p className="course-description">
                  Progreso actual: {selectedCourse.progreso}%
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeVideoModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const CreateAlumnoModal = ({ onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    celular: '',
    fechaNacimiento: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Crear Nuevo Alumno</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="create-alumno-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombres *</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Apellidos *</label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>DNI *</label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                maxLength="8"
                required
              />
            </div>
            <div className="form-group">
              <label>Celular *</label>
              <input
                type="tel"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha de Nacimiento *</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              minLength="6"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Alumno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Alumnos;