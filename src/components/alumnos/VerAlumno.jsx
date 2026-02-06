import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import './VerAlumno.css';

const VerAlumno = ({ alumnoId, alumnoNombre, setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [alumno, setAlumno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [editedAlumno, setEditedAlumno] = useState(null);
  const [cursosInscritos, setCursosInscritos] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [historialPagos, setHistorialPagos] = useState([]);
  const [loadingPagos, setLoadingPagos] = useState(false);


  console.log('VerAlumno - Usuario actual:', currentUser);
  console.log('VerAlumno - Rol del usuario:', currentUser?.rol_nombre);

  useEffect(() => {
    const fetchAlumno = async () => {

      const id = alumnoId || localStorage.getItem('selectedAlumnoId');
      
      console.log('VerAlumno - ID obtenido:', id);
      console.log('VerAlumno - localStorage selectedAlumnoId:', localStorage.getItem('selectedAlumnoId'));
      
      if (!id) {
        console.error('VerAlumno - No se especificó un ID de alumno');
        setError('No se especificó un ID de alumno');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        console.log('VerAlumno - Haciendo fetch a:', `${API_URL}/alumnos/${id}`);
        const response = await fetch(`${API_URL}/alumnos/${id}`, { headers });
        console.log('VerAlumno - Response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Error al cargar los datos del alumno');
        }
        const data = await response.json();
        console.log('VerAlumno - Datos recibidos:', data);
        
       
        if (data.success && data.data && data.data.alumno) {
          setAlumno(data.data.alumno);
        } else if (data.success && data.data) {
          setAlumno(data.data);
        } else {
          setAlumno(data);
        }
      } catch (err) {
        console.error('VerAlumno - Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumno();
  }, [alumnoId]);

  const fetchCursosInscritos = async () => {
    const id = alumnoId || localStorage.getItem('selectedAlumnoId');
    
    if (!id) return;

    setLoadingCursos(true);
    try {
      const response = await fetch(`${API_URL}/inscripciones/alumno/${id}/cursos`);
      
      if (!response.ok) {
        throw new Error('Error al cargar los cursos inscritos');
      }
      
      const data = await response.json();
      console.log('Cursos inscritos:', data);
      
      if (data.success && data.data) {
        setCursosInscritos(data.data);
      } else {
        setCursosInscritos([]);
      }
    } catch (err) {
      console.error('Error al cargar cursos inscritos:', err);
      setCursosInscritos([]);
    } finally {
      setLoadingCursos(false);
    }
  };


  const fetchHistorialPagos = async () => {
    const id = alumnoId || localStorage.getItem('selectedAlumnoId');
    
    if (!id) return;

    setLoadingPagos(true);
    try {
      const response = await fetch(`${API_URL}/alumnos/${id}/pagos`);
      
      if (!response.ok) {
        throw new Error('Error al cargar el historial de pagos');
      }
      
      const data = await response.json();
      console.log('Historial de pagos:', data);
      
      if (data.success && data.data && data.data.pagos) {
        setHistorialPagos(data.data.pagos);
      } else {
        setHistorialPagos([]);
      }
    } catch (err) {
      console.error('Error al cargar historial de pagos:', err);
      setHistorialPagos([]);
    } finally {
      setLoadingPagos(false);
    }
  };


  useEffect(() => {
    if (activeTab === 'cursos' && cursosInscritos.length === 0) {
      fetchCursosInscritos();
    }
  }, [activeTab]);


  useEffect(() => {
    if (activeTab === 'pagos' && historialPagos.length === 0) {
      fetchHistorialPagos();
    }
  }, [activeTab]);


  useEffect(() => {
    if (alumno && cursosInscritos.length === 0) {
      fetchCursosInscritos();
    }
  }, [alumno]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      const response = await fetch(`${API_URL}/alumnos/${alumno.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombres: editedAlumno.nombres,
          apellidos: editedAlumno.apellidos,
          correo: editedAlumno.correo || editedAlumno.correo_electronico,
          celular: editedAlumno.celular,
          dni: editedAlumno.dni,
          nivel: editedAlumno.nivel,
          area: editedAlumno.area,
          fecha_nacimiento: editedAlumno.fecha_nacimiento
        })
      });

      if (response.ok) {
        const updatedData = await response.json();
        setAlumno({...alumno, ...editedAlumno});
        setIsEditing(false);
        setEditedAlumno(null);
        alert('Información del alumno actualizada correctamente');
      } else {
        const errorData = await response.json();
        setError(`Error al actualizar: ${errorData.detail || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      setError('Error de conexión al guardar los cambios');
    }
  };

  const handleDelete = async () => {
    try {

      const result = await Swal.fire({
        title: '¿Estás seguro?',
        html: `
          <div style="text-align: left; margin: 20px 0;">
            <p><strong>¿Confirmas eliminar al alumno?</strong></p>
            <br>
            <p><strong>👤 Nombre:</strong> ${alumno.nombres} ${alumno.apellidos}</p>
            <p><strong>📧 Email:</strong> ${alumno.correo}</p>
            <p><strong>📱 Celular:</strong> ${alumno.celular}</p>
            <br>
            <p style="color: #e74c3c;"><strong>⚠️ Esta acción no se puede deshacer</strong></p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) {
        return;
      }

      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      const response = await fetch(`${API_URL}/alumnos/${alumno.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await Swal.fire({
          title: '¡Eliminado!',
          text: 'El alumno ha sido eliminado exitosamente',
          icon: 'success',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#28a745'
        });
        
        setCurrentSection('alumnos');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al eliminar el alumno');
      }
    } catch (error) {
      console.error('Error al eliminar alumno:', error);
      setError(error.message);
      
      await Swal.fire({
        title: 'Error',
        text: error.message || 'No se pudo eliminar el alumno',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ver-alumno-container">
        <div className="loading">Cargando información del alumno...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ver-alumno-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!alumno) {
    return (
      <div className="ver-alumno-container">
        <div className="error">No se encontró el alumno</div>
      </div>
    );
  }

  return (
    <div className="ver-alumno-container">
      <div className="ver-alumno-header">
        <button className="btn-volver-atras" onClick={() => setCurrentSection('alumnos')}>
          ← Volver
        </button>
        <h1 className="alumno-title">Información del Alumno</h1>
        <div className="header-actions">
          <div className="header-buttons">
            <button 
              className="btn-edit"
              onClick={() => {
                setIsEditing(!isEditing);
                if (!isEditing) {
                  setEditedAlumno({...alumno});
                }
              }}
            >
              <i className='bx bx-edit'></i>
              {isEditing ? 'Cancelar' : 'Editar'}
            </button>
            {(currentUser?.rol_nombre === 'SuperAdmin' || currentUser?.rol_nombre === 'Admin') && (
              <button 
                type="button" 
                className="delete-btn"
                onClick={handleDelete}
              >
                <i className='bx bx-trash'></i>
                Eliminar
              </button>
            )}
          </div>
          <button 
            className="btn-assign"
            onClick={() => setCurrentSection('asignar-alumno', { 
              alumnoId: alumno?.id || alumnoId, 
              alumnoNombre: alumnoNombre || `${alumno?.nombres} ${alumno?.apellidos}` 
            })}
          >
            📚 Asignar a un curso
          </button>
        </div>
      </div>

 
      <div className="student-profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {alumno.imagen_perfil ? (
              <img 
                src={`${API_URL.replace('/api', '')}/${alumno.imagen_perfil}`} 
                alt={`${alumno.nombres} ${alumno.apellidos}`}
                onError={(e) => {
                  console.log('Error cargando imagen del alumno:', e);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
                onLoad={() => {
                  console.log('Imagen del alumno cargada correctamente');
                }}
              />
            ) : null}
            <div 
              className="avatar-placeholder"
              style={{ display: alumno.imagen_perfil ? 'none' : 'flex' }}
            >
              👤
            </div>
          </div>
          <div className="profile-info">
            {isEditing ? (
              <div className="edit-name-section">
                <input 
                  type="text" 
                  className="edit-input edit-name"
                  value={editedAlumno?.nombres || ''}
                  onChange={(e) => setEditedAlumno({...editedAlumno, nombres: e.target.value})}
                  placeholder="Nombres"
                />
                <input 
                  type="text" 
                  className="edit-input edit-name"
                  value={editedAlumno?.apellidos || ''}
                  onChange={(e) => setEditedAlumno({...editedAlumno, apellidos: e.target.value})}
                  placeholder="Apellidos"
                />
              </div>
            ) : (
              <h2>{alumno.nombres} {alumno.apellidos}</h2>
            )}
            <p className="student-email">
              ✉️ {alumno.correo || alumno.correo_electronico || 'No especificado'}
            </p>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-grid">
            <div className="info-item">
              <span className="label">TELÉFONO:</span>
              {isEditing ? (
                <input 
                  type="text" 
                  className="edit-input"
                  value={editedAlumno?.celular || ''}
                  onChange={(e) => setEditedAlumno({...editedAlumno, celular: e.target.value})}
                  placeholder="Teléfono"
                />
              ) : (
                <span className="value">{alumno.celular || 'No especificado'}</span>
              )}
            </div>
            <div className="info-item">
              <span className="label">DNI:</span>
              {isEditing ? (
                <input 
                  type="text" 
                  className="edit-input"
                  value={editedAlumno?.dni || ''}
                  onChange={(e) => setEditedAlumno({...editedAlumno, dni: e.target.value})}
                  placeholder="DNI"
                />
              ) : (
                <span className="value">{alumno.dni}</span>
              )}
            </div>
            <div className="info-item">
              <span className="label">NIVEL:</span>
              {isEditing ? (
                <input 
                  type="text" 
                  className="edit-input"
                  value={editedAlumno?.nivel || ''}
                  onChange={(e) => setEditedAlumno({...editedAlumno, nivel: e.target.value})}
                  placeholder="Nivel"
                />
              ) : (
                <span className="value">{alumno.nivel || 'No especificado'}</span>
              )}
            </div>
            <div className="info-item">
              <span className="label">ÁREA:</span>
              {isEditing ? (
                <input 
                  type="text" 
                  className="edit-input"
                  value={editedAlumno?.area || ''}
                  onChange={(e) => setEditedAlumno({...editedAlumno, area: e.target.value})}
                  placeholder="Área"
                />
              ) : (
                <span className="value">{alumno.area || 'No especificado'}</span>
              )}
            </div>
            <div className="info-item">
              <span className="label">FECHA DE NACIMIENTO:</span>
              {isEditing ? (
                <input 
                  type="date" 
                  className="edit-input"
                  value={editedAlumno?.fecha_nacimiento ? editedAlumno.fecha_nacimiento.split('T')[0] : ''}
                  onChange={(e) => setEditedAlumno({...editedAlumno, fecha_nacimiento: e.target.value})}
                />
              ) : (
                <span className="value">
                  {alumno.fecha_nacimiento 
                    ? new Date(alumno.fecha_nacimiento).toLocaleDateString('es-ES')
                    : 'No especificado'
                  }
                </span>
              )}
            </div>
            <div className="info-item">
              <span className="label">FECHA DE REGISTRO:</span>
              <span className="value">
                {alumno.created_at 
                  ? new Date(alumno.created_at).toLocaleDateString('es-ES')
                  : alumno.fecha_registro 
                    ? new Date(alumno.fecha_registro).toLocaleDateString('es-ES')
                    : 'No especificado'
                }
              </span>
            </div>
            <div className="info-item">
              <span className="label">ROL:</span>
              <span className="value">{alumno.rol_nombre || 'Alumno'}</span>
            </div>
            <div className="info-item">
              <span className="label">CORREO:</span>
              {isEditing ? (
                <input 
                  type="email" 
                  className="edit-input"
                  value={editedAlumno?.correo || editedAlumno?.correo_electronico || ''}
                  onChange={(e) => setEditedAlumno({...editedAlumno, correo: e.target.value})}
                  placeholder="Correo electrónico"
                />
              ) : (
                <span className="value">{alumno.correo || alumno.correo_electronico || 'No especificado'}</span>
              )}
            </div>
          </div>
          
          {isEditing && (
            <div className="edit-actions">
              <button 
                className="btn-save"
                onClick={handleSaveChanges}
              >
                💾 Guardar Cambios
              </button>
              <button 
                className="btn-cancel"
                onClick={() => {
                  setIsEditing(false);
                  setEditedAlumno(null);
                }}
              >
                ✕ Cancelar
              </button>
            </div>
          )}
        </div>

        <div className="summary-stats">
          <div className="stat-item">
            <h3>{cursosInscritos.length}</h3>
            <p>Cursos Inscritos</p>
          </div>
          <div className="stat-item">
            <h3>S/ {cursosInscritos.reduce((total, curso) => {
              return total + (parseFloat(curso.monto_total_pagado) || 0);
            }, 0).toFixed(2)}</h3>
            <p>Total Pagado</p>
          </div>
          <div className="stat-item">
            <h3>{alumno.fecha_ultimo_acceso 
              ? new Date(alumno.fecha_ultimo_acceso).toLocaleDateString('es-ES')
              : 'Nunca'
            }</h3>
            <p>Último Acceso</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-header">
          <button 
            className={`tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => handleTabClick('general')}
          >
            👤 Información General
          </button>
          <button 
            className={`tab ${activeTab === 'cursos' ? 'active' : ''}`}
            onClick={() => handleTabClick('cursos')}
          >
            📚 Cursos y Clases
          </button>
          <button 
            className={`tab ${activeTab === 'pagos' ? 'active' : ''}`}
            onClick={() => handleTabClick('pagos')}
          >
            💰 Historial de Pagos
          </button>
          <button 
            className={`tab ${activeTab === 'actividad' ? 'active' : ''}`}
            onClick={() => handleTabClick('actividad')}
          >
            📊 Actividad Reciente
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === 'general' && (
            <div className="tab-content general-info">
              <h3>Información Personal Detallada</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Nombres Completos:</span>
                  <span className="value">{alumno.nombres}</span>
                </div>
                <div className="info-item">
                  <span className="label">Apellidos:</span>
                  <span className="value">{alumno.apellidos}</span>
                </div>
                <div className="info-item">
                  <span className="label">Documento de Identidad:</span>
                  <span className="value">{alumno.dni}</span>
                </div>
                <div className="info-item">
                  <span className="label">Correo Electrónico:</span>
                  <span className="value">{alumno.correo || alumno.correo_electronico || 'No especificado'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Teléfono Celular:</span>
                  <span className="value">{alumno.celular || 'No especificado'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Nivel Académico:</span>
                  <span className="value">{alumno.nivel || 'No especificado'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Área de Interés:</span>
                  <span className="value">{alumno.area || 'No especificado'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Fecha de Nacimiento:</span>
                  <span className="value">
                    {alumno.fecha_nacimiento 
                      ? new Date(alumno.fecha_nacimiento).toLocaleDateString('es-ES')
                      : 'No especificado'
                    }
                  </span>
                </div>
              </div>
              {alumno.descripcion && (
                <div className="description-section">
                  <h4>Descripción:</h4>
                  <p>{alumno.descripcion}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cursos' && (
            <div className="tab-content courses-detail">
              <h3>Cursos Inscritos</h3>
              {loadingCursos ? (
                <div className="loading-state">
                  <p>Cargando cursos...</p>
                </div>
              ) : cursosInscritos.length > 0 ? (
                <div className="courses-list">
                  {cursosInscritos.map((inscripcion) => (
                    <div key={inscripcion.id} className="course-card">
                      <div className="course-header">
                        <h4>{inscripcion.nombre_curso}</h4>
                        <span className={`status-badge ${inscripcion.estado || 'activo'}`}>
                          {inscripcion.estado || 'Activo'}
                        </span>
                      </div>
                      <p className="course-description">{inscripcion.descripcion_curso}</p>
                      <div className="course-details">
                        <div className="detail-item">
                          <strong>Profesor:</strong> {inscripcion.nombre_profesor} {inscripcion.apellido_profesor}
                        </div>
                        <div className="detail-item">
                          <strong>Fecha de inscripción:</strong> {new Date(inscripcion.fecha_inscripcion).toLocaleDateString()}
                        </div>
                        {inscripcion.horario && (
                          <div className="detail-item">
                            <strong>Horario:</strong> {inscripcion.horario}
                          </div>
                        )}
                        <div className="detail-item">
                          <strong>Progreso:</strong> {inscripcion.porcentaje_completado || 0}% 
                          ({inscripcion.clases_completadas || 0}/{inscripcion.total_clases || 0} clases)
                        </div>
                        {inscripcion.promedio_notas && (
                          <div className="detail-item">
                            <strong>Promedio de notas:</strong> {parseFloat(inscripcion.promedio_notas).toFixed(1)}
                          </div>
                        )}
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${inscripcion.porcentaje_completado || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  📚
                  <h4>No hay cursos registrados</h4>
                  <p>Este alumno aún no se ha inscrito en ningún curso.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pagos' && (
            <div className="tab-content payments-history">
              <h3>Historial de Pagos</h3>
              {loadingPagos ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Cargando historial de pagos...</p>
                </div>
              ) : historialPagos.length > 0 ? (
                <div className="payments-list">
                  {historialPagos.map(pago => (
                    <div key={pago.inscripcion_id} className="payment-item">
                      <div className="payment-info">
                        <h4>{pago.nombre_curso}</h4>
                        <p><strong>Método:</strong> {pago.ultimo_metodo_pago ? pago.ultimo_metodo_pago.toUpperCase() : 'NO ESPECIFICADO'}</p>
                        <p><strong>Fecha de inscripción:</strong> {new Date(pago.fecha_inscripcion).toLocaleDateString('es-ES')}</p>
                        <p><strong>Precio del curso:</strong> S/ {parseFloat(pago.precio_oferta || pago.precio_curso).toFixed(2)}</p>
                      </div>
                      <div className="payment-amount">
                        <span className="amount">S/ {parseFloat(pago.monto_total_pagado || 0).toFixed(2)}</span>
                        <span className={`payment-status ${pago.estado_pago_general}`}>
                          {pago.estado_pago_general === 'pagado' ? 'PAGADO' :
                           pago.estado_pago_general === 'pago_parcial' ? 'PAGO PARCIAL' :
                           pago.estado_pago_general === 'sin_pagar' ? 'SIN PAGAR' :
                           pago.estado_pago_general.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  💰
                  <h4>No hay pagos registrados</h4>
                  <p>Este alumno aún no ha realizado ningún pago.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'actividad' && (
            <div className="tab-content activity-history">
              <h3>Actividad Reciente</h3>
              <div className="empty-state">
                📊
                <h4>No hay actividad reciente</h4>
                <p>No se ha registrado actividad reciente para este alumno.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerAlumno;