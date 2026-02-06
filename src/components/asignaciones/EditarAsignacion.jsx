import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './CrearAsignacion.css';

const EditarAsignacion = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    profesorId: '',
    cursoId: ''
  });

  const [horarios, setHorarios] = useState([
    { dia: '', horaInicio: '', horaFin: '' }
  ]);

  const [profesores, setProfesores] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [cursosFiltrados, setCursosFiltrados] = useState([]);
  const [diasSemanaData, setDiasSemanaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [asignacionOriginal, setAsignacionOriginal] = useState(null);

  // Cargar datos de la asignación existente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Obtener el ID de la asignación del localStorage
        const selectedAsignacionId = localStorage.getItem('selectedAsignacionId');
        
        if (!selectedAsignacionId) {
          Swal.fire({
            title: 'Error',
            text: 'No se ha seleccionado ninguna asignación para editar',
            icon: 'error',
            confirmButtonColor: '#f44336'
          });
          setCurrentSection('asignaciones');
          return;
        }
        
        // Cargar datos básicos
        const [profesoresRes, cursosRes, categoriasRes, diasRes] = await Promise.all([
          axios.get(`${API_URL}/profesores`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/cursos`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/categorias`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/dias-semana`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        setProfesores(profesoresRes.data.data || profesoresRes.data);
        setCursos(cursosRes.data.data || cursosRes.data);
        setCategorias(categoriasRes.data.data || categoriasRes.data);
        setDiasSemanaData(diasRes.data.data || diasRes.data);

        // Cargar datos de la asignación específica
        const asignacionRes = await axios.get(`${API_URL}/asignaciones/${selectedAsignacionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const asignacion = asignacionRes.data.data || asignacionRes.data;
        setAsignacionOriginal(asignacion);
        
        // Llenar el formulario con los datos existentes
        setFormData({
          profesorId: asignacion.profesor_id || asignacion.profesor?.id || '',
          cursoId: asignacion.curso_id || asignacion.curso?.id || ''
        });

        // Configurar categoría seleccionada
        const cursoSeleccionado = (cursosRes.data.data || cursosRes.data).find(
          curso => curso.id === (asignacion.curso_id || asignacion.curso?.id)
        );
        if (cursoSeleccionado) {
          setCategoriaSeleccionada(cursoSeleccionado.categoria_id);
        }

        // Configurar horarios
        if (asignacion.horarios && asignacion.horarios.length > 0) {
          setHorarios(asignacion.horarios.map(h => ({
            dia: h.dia_semana || h.dia,
            horaInicio: h.hora_inicio,
            horaFin: h.hora_fin
          })));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error cargando datos:', error);
        Swal.fire({
          title: 'Error',
          text: 'Error al cargar los datos de la asignación',
          icon: 'error',
          confirmButtonColor: '#f44336'
        });
        setLoading(false);
      }
    };

    cargarDatos();
  }, [setCurrentSection]);

  // Filtrar cursos por categoría
  useEffect(() => {
    if (categoriaSeleccionada) {
      const cursosFiltrados = cursos.filter(curso => 
        curso.categoria_id === parseInt(categoriaSeleccionada)
      );
      setCursosFiltrados(cursosFiltrados);
    } else {
      setCursosFiltrados([]);
    }
  }, [categoriaSeleccionada, cursos]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCategoriaChange = (e) => {
    const categoriaId = e.target.value;
    setCategoriaSeleccionada(categoriaId);
    
    // Limpiar curso seleccionado si cambia la categoría
    setFormData(prev => ({
      ...prev,
      cursoId: ''
    }));
  };

  const handleHorarioChange = (index, field, value) => {
    const nuevosHorarios = [...horarios];
    nuevosHorarios[index][field] = value;
    setHorarios(nuevosHorarios);
    
    // Limpiar errores de horario
    if (errors[`horario_${index}`]) {
      setErrors(prev => ({
        ...prev,
        [`horario_${index}`]: ''
      }));
    }
  };

  const agregarHorario = () => {
    setHorarios([...horarios, { dia: '', horaInicio: '', horaFin: '' }]);
  };

  const eliminarHorario = (index) => {
    if (horarios.length > 1) {
      const nuevosHorarios = horarios.filter((_, i) => i !== index);
      setHorarios(nuevosHorarios);
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.profesorId) {
      nuevosErrores.profesorId = 'Debe seleccionar un profesor';
    }

    if (!formData.cursoId) {
      nuevosErrores.cursoId = 'Debe seleccionar un curso';
    }

    // Validar horarios
    let horariosValidos = true;
    horarios.forEach((horario, index) => {
      if (!horario.dia || !horario.horaInicio || !horario.horaFin) {
        nuevosErrores[`horario_${index}`] = 'Todos los campos del horario son obligatorios';
        horariosValidos = false;
      } else if (horario.horaInicio >= horario.horaFin) {
        nuevosErrores[`horario_${index}`] = 'La hora de inicio debe ser menor que la hora de fin';
        horariosValidos = false;
      }
    });

    if (!horariosValidos) {
      nuevosErrores.horarios = 'Debe configurar al menos un horario válido';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      const datosActualizacion = {
        profesor_id: parseInt(formData.profesorId),
        curso_id: parseInt(formData.cursoId),
        horarios: horarios.map(h => ({
          dia_semana: h.dia,
          hora_inicio: h.horaInicio,
          hora_fin: h.horaFin
        }))
      };

      console.log('Actualizando asignación:', datosActualizacion);

      const response = await axios.put(
        `${API_URL}/asignaciones/${asignacionId}`,
        datosActualizacion,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Respuesta del servidor:', response.data);

      await Swal.fire({
        title: '¡Éxito!',
        text: 'Asignación actualizada exitosamente',
        icon: 'success',
        confirmButtonColor: '#4CAF50'
      });

      setCurrentSection('asignaciones');

    } catch (error) {
      console.error('Error actualizando asignación:', error);
      
      let mensajeError = 'Error al actualizar la asignación';
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProfesorInfo = (profesorId) => {
    return profesores.find(p => p.id === parseInt(profesorId));
  };

  const getCursoInfo = (cursoId) => {
    return cursos.find(c => c.id === parseInt(cursoId));
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="crear-asignacion-container">
        <div className="loading-spinner">
          <i className='bx bx-loader-alt bx-spin'></i>
          <p>Cargando datos de la asignación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="crear-asignacion-container">
      <div className="crear-asignacion-header">
        <div className="header-left">
          <button 
            className="btn-volver-atras"
            onClick={() => setCurrentSection('asignaciones')}
          >
            <i className='bx bx-arrow-back'></i>
          </button>
          <div>
            <h1>Editar Asignación</h1>
            <p>Modifica los datos de la asignación profesor-curso</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="crear-asignacion-form">
        <div className="form-section">
          <h2>
            <i className='bx bx-user'></i>
            Información Básica
          </h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="profesorId">Profesor *</label>
              <select
                id="profesorId"
                name="profesorId"
                value={formData.profesorId}
                onChange={handleInputChange}
                className={errors.profesorId ? 'error' : ''}
                required
              >
                <option value="">Seleccionar profesor...</option>
                {profesores.map(profesor => (
                  <option key={profesor.id} value={profesor.id}>
                    {profesor.nombres} {profesor.apellidos}
                  </option>
                ))}
              </select>
              {errors.profesorId && <span className="error-message">{errors.profesorId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="categoriaId">Categoría del Curso *</label>
              <select
                id="categoriaId"
                name="categoriaId"
                value={categoriaSeleccionada}
                onChange={handleCategoriaChange}
                required
              >
                <option value="">Seleccionar categoría...</option>
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.descripcion}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cursoId">Curso *</label>
              <select
                id="cursoId"
                name="cursoId"
                value={formData.cursoId}
                onChange={handleInputChange}
                className={errors.cursoId ? 'error' : ''}
                required
                disabled={!categoriaSeleccionada}
              >
                <option value="">Seleccionar curso...</option>
                {cursosFiltrados.map(curso => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nombre}
                  </option>
                ))}
              </select>
              {errors.cursoId && <span className="error-message">{errors.cursoId}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2>
              <i className='bx bx-calendar'></i>
              Horarios de Clase
            </h2>
            <button
              type="button"
              className="btn btn-outline"
              onClick={agregarHorario}
            >
              <i className='bx bx-plus'></i>
              Agregar Horario
            </button>
          </div>
          
          {errors.horarios && <span className="error-message">{errors.horarios}</span>}
          
          <div className="horarios-grid">
            {horarios.map((horario, index) => (
              <div key={index} className="horario-card">
                <div className="horario-header">
                  <h4>Horario {index + 1}</h4>
                  {horarios.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => eliminarHorario(index)}
                    >
                      <i className='bx bx-trash'></i>
                    </button>
                  )}
                </div>
                
                <div className="horario-fields">
                  <div className="form-group">
                    <label>Día de la semana</label>
                    <select
                      value={horario.dia}
                      onChange={(e) => handleHorarioChange(index, 'dia', e.target.value)}
                    >
                      <option value="">Seleccionar día...</option>
                      {diasSemanaData.map(dia => (
                        <option key={dia.id} value={dia.nombre}>
                          {dia.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Hora de inicio</label>
                    <input
                      type="time"
                      value={horario.horaInicio}
                      onChange={(e) => handleHorarioChange(index, 'horaInicio', e.target.value)}
                      placeholder="HH:MM"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Hora de fin</label>
                    <input
                      type="time"
                      value={horario.horaFin}
                      onChange={(e) => handleHorarioChange(index, 'horaFin', e.target.value)}
                      placeholder="HH:MM"
                    />
                  </div>
                </div>
                
                {errors[`horario_${index}`] && (
                  <span className="error-message">{errors[`horario_${index}`]}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Preview de la asignación */}
        {formData.profesorId && formData.cursoId && (
          <div className="form-section preview-section">
            <h2>
              <i className='bx bx-show'></i>
              Vista Previa de los Cambios
            </h2>
            
            <div className="preview-card">
              <div className="preview-header">
                <div className="profesor-preview">
                  <div className="profesor-avatar">
                    {getProfesorInfo(formData.profesorId)?.imagen_perfil ? (
                      <img 
                        src={`${API_URL.replace('/api', '')}${getProfesorInfo(formData.profesorId)?.imagen_perfil}`} 
                        alt={getProfesorInfo(formData.profesorId)?.nombres}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="avatar-placeholder" style={{display: getProfesorInfo(formData.profesorId)?.imagen_perfil ? 'none' : 'flex'}}>
                      <i className='bx bx-user'></i>
                    </div>
                  </div>
                  <div className="profesor-info">
                    <h3>{getProfesorInfo(formData.profesorId)?.nombres} {getProfesorInfo(formData.profesorId)?.apellidos}</h3>
                    {getProfesorInfo(formData.profesorId)?.especialidad && (
                      <p>{getProfesorInfo(formData.profesorId)?.especialidad}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="preview-content">
                <div className="curso-preview">
                  <h4>
                    <i className='bx bx-book'></i>
                    {getCursoInfo(formData.cursoId)?.nombre}
                  </h4>
                  <p>{getCursoInfo(formData.cursoId)?.categoria_nombre}</p>
                </div>
                
                {horarios.some(h => h.dia && h.horaInicio && h.horaFin) && (
                  <div className="horarios-preview">
                    <h5>Horarios:</h5>
                    <div className="horarios-list">
                      {horarios
                        .filter(h => h.dia && h.horaInicio && h.horaFin)
                        .map((h, index) => {
                          return (
                            <span key={index} className="horario-tag">
                              {h.dia} - {formatTime(h.horaInicio)} a {formatTime(h.horaFin)}
                            </span>
                          );
                        })
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setCurrentSection('asignaciones')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className='bx bx-loader-alt bx-spin'></i>
                Actualizando...
              </>
            ) : (
              <>
                <i className='bx bx-save'></i>
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarAsignacion;