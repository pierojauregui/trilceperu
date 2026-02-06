import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './VerAsignaciones.css';

const VerAsignaciones = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  // Estados principales
  const [asignacionData, setAsignacionData] = useState(null);
  const [originalAsignacionData, setOriginalAsignacionData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para formulario
  const [formData, setFormData] = useState({
    profesorId: '',
    cursoId: ''
  });

  const [horarios, setHorarios] = useState([
    { dia: '', horaInicio: '', horaFin: '' }
  ]);

  // Estados para datos de apoyo
  const [profesores, setProfesores] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [cursosFiltrados, setCursosFiltrados] = useState([]);
  const [diasSemanaData, setDiasSemanaData] = useState([]);
  const [bloquesHorario, setBloquesHorario] = useState([]);
  const [errors, setErrors] = useState({});

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        const selectedAsignacionId = localStorage.getItem('selectedAsignacionId');
        const token = localStorage.getItem('token');
        
        if (!selectedAsignacionId) {
          Swal.fire({
            title: 'Error',
            text: 'No se ha seleccionado ninguna asignación',
            icon: 'error',
            confirmButtonColor: '#4CAF50'
          });
          setCurrentSection('asignaciones');
          return;
        }
        
        // Headers con autenticación
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Cargar datos de la asignación específica
        const asignacionResponse = await fetch(`${API_URL}/asignaciones/${selectedAsignacionId}`, {
          headers
        });
        
        if (!asignacionResponse.ok) {
          throw new Error('Error al cargar la asignación');
        }

        const asignacionData = await asignacionResponse.json();
        
        // Cargar datos adicionales necesarios para el formulario
        const [
          profesoresResponse, 
          cursosResponse, 
          categoriasResponse, 
          diasResponse, 
          bloquesResponse
        ] = await Promise.all([
          fetch(`${API_URL}/asignaciones/profesores-disponibles`, { headers }),
          fetch(`${API_URL}/courses/admin`, { headers }),
          fetch(`${API_URL}/categorias`, { headers }),
          fetch(`${API_URL}/asignaciones/dias-semana`, { headers }),
          fetch(`${API_URL}/asignaciones/bloques-horario`, { headers })
        ]);

        // Procesar respuestas adicionales solo si son exitosas
        let profesoresData = { data: [] };
        let cursosData = { data: [] };
        let categoriasData = { data: [] };
        let diasData = { data: [] };
        let bloquesData = { data: [] };

        if (profesoresResponse.ok) {
          profesoresData = await profesoresResponse.json();
        }
        if (cursosResponse.ok) {
          cursosData = await cursosResponse.json();
        }
        if (categoriasResponse.ok) {
          categoriasData = await categoriasResponse.json();
        }
        if (diasResponse.ok) {
          diasData = await diasResponse.json();
        }
        if (bloquesResponse.ok) {
          bloquesData = await bloquesResponse.json();
        }

        // Formatear datos
        const profesoresFormateados = (profesoresData.data || profesoresData.profesores || []).map(profesor => ({
          id: profesor.id,
          nombre: profesor.nombre_completo || `${profesor.nombres || ''} ${profesor.apellidos || ''}`.trim(),
          email: profesor.email || profesor.correo_electronico || 'No especificado',
          especialidad: profesor.especialidad || profesor.area || 'No especificado',
          telefono: profesor.celular || 'No especificado',
          imagen_perfil: profesor.imagen_perfil || null,
          asignaciones_activas: profesor.asignaciones_activas || 0
        }));

        const cursosFormateados = (cursosData.data || cursosData.cursos || []).map(curso => ({
          id: curso.id,
          nombre: curso.nombre,
          categoria_id: curso.categoria_id,
          categoria_nombre: curso.categoria_nombre || curso.categoria || 'Sin categoría',
          duracion: `${curso.duracion_horas || 0} horas`,
          nivel: curso.nivel || 'No especificado'
        }));

        const categoriasFormateadas = (categoriasData.data || categoriasData.categorias || []).map(categoria => ({
          id: categoria.id,
          nombre: categoria.nombre || categoria.descripcion
        }));

        // Establecer datos
        setProfesores(profesoresFormateados);
        setCursos(cursosFormateados);
        setCategorias(categoriasFormateadas);
        setDiasSemanaData(diasData.data || diasData.dias || []);
        setBloquesHorario(bloquesData.data || bloquesData.bloques || []);

        // Procesar datos de la asignación
        // Procesar datos de la asignación
const asignacion = asignacionData.data || asignacionData;

// IMPORTANTE: Asegurarse de que los IDs coincidan con los profesores cargados
const profesorId = asignacion.profesor_id || asignacion.id_profesor || asignacion.id_profesor;
const cursoId = asignacion.curso_id || asignacion.id_curso;

// Verificar que el profesor existe en la lista cargada
const profesorExiste = profesoresFormateados.find(p => p.id === profesorId || p.id === parseInt(profesorId));
console.log('Profesor ID de asignación:', profesorId);
console.log('Profesor encontrado:', profesorExiste);
console.log('Lista de profesores:', profesoresFormateados);

// Configurar el formulario con el ID correcto
setFormData({
  profesorId: profesorExiste ? profesorExiste.id.toString() : profesorId?.toString() || '',
  cursoId: cursoId?.toString() || '',
  fechaInicio: asignacion.fecha_inicio || '',
  fechaFin: asignacion.fecha_fin || '',
  estado: asignacion.estado || 'activo'
});
        
        // Configurar categoría y cursos filtrados
        const cursoAsignado = cursosFormateados.find(c => c.id === cursoId);
        if (cursoAsignado) {
          setCategoriaSeleccionada(cursoAsignado.categoria_id?.toString() || '');
          setCursosFiltrados(cursosFormateados.filter(c => c.categoria_id === cursoAsignado.categoria_id));
        } else {
          setCursosFiltrados(cursosFormateados);
        }
        
        // Configurar horarios con los datos correctos
        if (asignacion.horarios && asignacion.horarios.length > 0) {
          const horariosFormateados = asignacion.horarios.map(horario => {
            // Formatear hora para input time (HH:MM)
            const formatearHora = (hora) => {
              if (!hora) return '';
              const horaStr = hora.toString();
              if (horaStr.includes(':')) {
                const partes = horaStr.split(':');
                return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
              }
              return '';
            };
            
            // Buscar ID del día
            let diaId = horario.dia_semana_id?.toString() || '';
            if (!diaId && horario.dia_semana) {
              const diaEncontrado = (diasData.data || diasData.dias || []).find(d => 
                d.nombre === horario.dia_semana
              );
              diaId = diaEncontrado?.id?.toString() || '';
            }
            
            return {
              dia: diaId,
              horaInicio: formatearHora(horario.hora_inicio),
              horaFin: formatearHora(horario.hora_fin)
            };
          });
          setHorarios(horariosFormateados);
        } else {
          setHorarios([{ dia: '', horaInicio: '', horaFin: '' }]);
        }
        
        setAsignacionData(asignacion);
        setOriginalAsignacionData(JSON.parse(JSON.stringify(asignacion)));

      } catch (error) {
        console.error('Error al cargar datos:', error);
        Swal.fire({
          title: 'Error',
          text: 'Error al cargar los datos de la asignación',
          icon: 'error',
          confirmButtonColor: '#4CAF50'
        });
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [setCurrentSection]);

  // Manejar cambios en inputs
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

  // Manejar cambio de categoría
  const handleCategoriaChange = async (e) => {
    const categoriaId = e.target.value;
    setCategoriaSeleccionada(categoriaId);
    
    if (categoriaId === '') {
      setCursosFiltrados(cursos);
    } else {
      try {
        const response = await fetch(`${API_URL}/cursos/categoria/${categoriaId}`);
        if (response.ok) {
          const data = await response.json();
          const cursosFormateados = (data.data || []).map(curso => ({
            id: curso.id,
            nombre: curso.nombre,
            categoria_id: curso.categoria_id,
            categoria_nombre: curso.categoria_nombre || curso.categoria || 'Sin categoría',
            duracion: `${curso.duracion_horas || 0} horas`,
            nivel: curso.nivel || 'No especificado'
          }));
          setCursosFiltrados(cursosFormateados);
        } else {
          const cursosFiltrados = cursos.filter(curso => curso.categoria_id === parseInt(categoriaId));
          setCursosFiltrados(cursosFiltrados);
        }
      } catch (error) {
        console.error('Error al cargar cursos por categoría:', error);
        const cursosFiltrados = cursos.filter(curso => curso.categoria_id === parseInt(categoriaId));
        setCursosFiltrados(cursosFiltrados);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      cursoId: ''
    }));
  };

  // Manejar cambios en horarios
  const handleHorarioChange = (index, field, value) => {
    const nuevosHorarios = [...horarios];
    nuevosHorarios[index][field] = value;
    setHorarios(nuevosHorarios);
  };

  // Agregar horario
  const agregarHorario = () => {
    setHorarios([...horarios, { dia: '', horaInicio: '', horaFin: '' }]);
  };

  // Eliminar horario
  const eliminarHorario = (index) => {
    if (horarios.length > 1) {
      const nuevosHorarios = horarios.filter((_, i) => i !== index);
      setHorarios(nuevosHorarios);
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.profesorId) {
      newErrors.profesorId = 'Debe seleccionar un profesor';
    }

    if (!formData.cursoId) {
      newErrors.cursoId = 'Debe seleccionar un curso';
    }

    const horariosValidos = horarios.filter(h => h.dia && h.horaInicio && h.horaFin);
    if (horariosValidos.length === 0) {
      newErrors.horarios = 'Debe agregar al menos un horario válido';
    }

    horariosValidos.forEach((horario, index) => {
      if (horario.horaInicio >= horario.horaFin) {
        newErrors[`horario_${index}`] = 'La hora de fin debe ser posterior a la hora de inicio';
      }
    });

    const horariosUnicos = new Set();
    horariosValidos.forEach((horario, index) => {
      const key = `${horario.dia}-${horario.horaInicio}-${horario.horaFin}`;
      if (horariosUnicos.has(key)) {
        newErrors[`horario_${index}`] = 'No puede haber horarios duplicados';
      }
      horariosUnicos.add(key);
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

// Manejar actualización
const handleUpdate = async () => {
  if (!validateForm()) {
    Swal.fire({
      title: 'Error de validación',
      text: 'Por favor, corrija los errores en el formulario',
      icon: 'error',
      confirmButtonColor: '#4CAF50'
    });
    return;
  }

    try {
    setIsSubmitting(true);

    const asignacionId = localStorage.getItem('selectedAsignacionId');
    const token = localStorage.getItem('token');
    
    // Enviar con el formato que espera el backend actualizado
    const horariosParaEnviar = horarios
      .filter(h => h.dia && h.horaInicio && h.horaFin)
      .map(h => ({
        dia_semana_id: parseInt(h.dia),  // Enviar como entero
        hora_inicio: h.horaInicio + ':00',
        hora_fin: h.horaFin + ':00'
      }));

    const dataToSend = {
      profesor_id: parseInt(formData.profesorId),
      curso_id: parseInt(formData.cursoId),
      horarios: horariosParaEnviar
    };

    console.log('Datos a enviar:', dataToSend); // Debug

    // Headers con autenticación
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/asignaciones/${asignacionId}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(dataToSend)
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      // Manejar errores específicos del backend
      let errorMessage = 'Error al actualizar la asignación';
      
      if (responseData.detail) {
        // Si detail es un array de errores
        if (Array.isArray(responseData.detail)) {
          errorMessage = responseData.detail.map(err => 
            typeof err === 'object' ? err.msg || JSON.stringify(err) : err
          ).join(', ');
        } else {
          errorMessage = responseData.detail;
        }
      } else if (responseData.message) {
        errorMessage = responseData.message;
      }
      
      throw new Error(errorMessage);
    }

    await Swal.fire({
      title: '¡Éxito!',
      text: 'Asignación actualizada correctamente',
      icon: 'success',
      confirmButtonColor: '#4CAF50'
    });

    // Recargar la página para actualizar los datos
    window.location.reload();

  } catch (error) {
    console.error('Error completo:', error);
    Swal.fire({
      title: 'Error',
      text: error.message || 'Error al actualizar la asignación',
      icon: 'error',
      confirmButtonColor: '#4CAF50'
    });
  } finally {
    setIsSubmitting(false);
  }
};

  // Manejar cancelación
  const handleCancel = () => {
    if (originalAsignacionData) {
      const profesorId = originalAsignacionData.profesor_id || originalAsignacionData.id_profesor;
      const cursoId = originalAsignacionData.curso_id || originalAsignacionData.id_curso;
      
      setFormData({
        profesorId: profesorId?.toString() || '',
        cursoId: cursoId?.toString() || '',
        fechaInicio: originalAsignacionData.fecha_inicio || '',
        fechaFin: originalAsignacionData.fecha_fin || '',
        estado: originalAsignacionData.estado || 'activo'
      });

      const cursoOriginal = cursos.find(c => c.id === cursoId);
      if (cursoOriginal) {
        setCategoriaSeleccionada(cursoOriginal.categoria_id?.toString() || '');
        setCursosFiltrados(cursos.filter(c => c.categoria_id === cursoOriginal.categoria_id));
      }

      if (originalAsignacionData.horarios && originalAsignacionData.horarios.length > 0) {
        const horariosOriginales = originalAsignacionData.horarios.map(h => {
          const formatearHora = (hora) => {
            if (!hora) return '';
            if (typeof hora === 'string' && hora.includes(':')) {
              const partes = hora.split(':');
              return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
            }
            return '';
          };
          
          let diaId = h.dia_semana_id?.toString() || '';
          if (!diaId && h.dia_semana) {
            const diaEncontrado = diasSemanaData.find(d => d.nombre === h.dia_semana);
            diaId = diaEncontrado?.id?.toString() || '';
          }
          
          return {
            dia: diaId,
            horaInicio: formatearHora(h.hora_inicio),
            horaFin: formatearHora(h.hora_fin)
          };
        });
        setHorarios(horariosOriginales);
      } else {
        setHorarios([{ dia: '', horaInicio: '', horaFin: '' }]);
      }
    }

    setErrors({});
    setIsEditing(false);
  };

  // Manejar eliminación
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const asignacionId = localStorage.getItem('selectedAsignacionId');
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/asignaciones/${asignacionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al eliminar la asignación');
        }

        await Swal.fire({
          title: '¡Eliminado!',
          text: 'La asignación ha sido eliminada correctamente',
          icon: 'success',
          confirmButtonColor: '#4CAF50'
        });

        setCurrentSection('asignaciones');
      } catch (error) {
        console.error('Error eliminando asignación:', error);
        Swal.fire({
          title: 'Error',
          text: 'Error al eliminar la asignación',
          icon: 'error',
          confirmButtonColor: '#4CAF50'
        });
      }
    }
  };

  // Obtener nombre del profesor
  const getNombreProfesor = () => {
    if (asignacionData?.profesor_nombre) {
      return asignacionData.profesor_nombre;
    }
    const profesorId = asignacionData?.profesor_id || asignacionData?.id_profesor;
    const profesor = profesores.find(p => p.id === profesorId);
    return profesor ? profesor.nombre : 'Profesor no encontrado';
  };

  // Obtener nombre del curso
  const getNombreCurso = () => {
    if (asignacionData?.curso_nombre) {
      return asignacionData.curso_nombre;
    }
    const cursoId = asignacionData?.curso_id || asignacionData?.id_curso;
    const curso = cursos.find(c => c.id === cursoId);
    return curso ? curso.nombre : 'Curso no encontrado';
  };

  // Obtener nombre de la categoría
  const getNombreCategoria = () => {
    if (asignacionData?.curso_categoria) {
      return asignacionData.curso_categoria;
    }
    const cursoId = asignacionData?.curso_id || asignacionData?.id_curso;
    const curso = cursos.find(c => c.id === cursoId);
    if (curso) {
      const categoria = categorias.find(cat => cat.id === curso.categoria_id);
      return categoria ? categoria.nombre : 'Categoría no encontrada';
    }
    return 'Categoría no encontrada';
  };

  // Obtener nombre del día
  const getNombreDia = (diaId) => {
    if (!diaId) return 'Día no encontrado';
    const dia = diasSemanaData.find(d => d.id === parseInt(diaId));
    return dia ? dia.nombre : 'Día no encontrado';
  };

  // Formatear tiempo para mostrar en formato 12 horas
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    if (typeof timeString === 'string' && timeString.includes(':')) {
      const timeParts = timeString.split(':');
      const hour = parseInt(timeParts[0]);
      const minute = timeParts[1];
      
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour >= 12 ? 'PM' : 'AM';
      
      return `${displayHour}:${minute} ${period}`;
    }
    
    return 'Hora no válida';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando datos de la asignación...</p>
      </div>
    );
  }

  if (!asignacionData) {
    return (
      <div className="error-container">
        <p>No se pudieron cargar los datos de la asignación</p>
        <button onClick={() => setCurrentSection('asignaciones')}>Volver</button>
      </div>
    );
  }

  return (
    <div className="ver-asignaciones-container">
      <div className="header-section">
        <div className="header-left">
          <button 
            type="button" 
            className="back-btn" 
            onClick={() => setCurrentSection('asignaciones')}
          >
            <i className="bx bx-arrow-back"></i>
            Volver
          </button>
          <h2>{isEditing ? 'Editar Asignación' : 'Ver Asignación'}</h2>
        </div>
        <div className="action-buttons">
          {!isEditing ? (
            <>
              <button 
                type="button" 
                className="edit-btn" 
                onClick={() => setIsEditing(true)}
              >
                <i className="bx bx-edit"></i>
                Editar
              </button>
              <button 
                type="button" 
                className="delete-btn" 
                onClick={handleDelete}
              >
                <i className="bx bx-trash"></i>
                Eliminar
              </button>
            </>
          ) : (
            <>
              <button 
                type="button"
                className="save-btn" 
                onClick={handleUpdate}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="bx bx-loader-alt bx-spin"></i>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bx bx-check"></i>
                    Guardar Cambios
                  </>
                )}
              </button>
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <i className="bx bx-x"></i>
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>

      <div className="asignacion-form">
        {/* Información del Profesor */}
        <div className="form-section-asignaciones">
          <h3>Información del Profesor</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Profesor:</label>
              {isEditing ? (
                <select
                  name="profesorId"
                  value={formData.profesorId}
                  onChange={handleInputChange}
                  className={errors.profesorId ? 'error' : ''}
                >
                  <option value="">Seleccionar profesor</option>
                  {profesores.map(profesor => (
                    <option key={profesor.id} value={profesor.id}>
                      {profesor.nombre} - {profesor.email}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={getNombreProfesor()}
                  disabled
                  className="readonly-input"
                />
              )}
              {errors.profesorId && <span className="error-message">{errors.profesorId}</span>}
            </div>
          </div>
        </div>

        {/* Información del Curso */}
        <div className="form-section-asignaciones">
          <h3>Información del Curso</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Categoría:</label>
              {isEditing ? (
                <select
                  value={categoriaSeleccionada}
                  onChange={handleCategoriaChange}
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={getNombreCategoria()}
                  disabled
                  className="readonly-input"
                />
              )}
            </div>
            <div className="form-group">
              <label>Curso:</label>
              {isEditing ? (
                <select
                  name="cursoId"
                  value={formData.cursoId}
                  onChange={handleInputChange}
                  className={errors.cursoId ? 'error' : ''}
                  disabled={!categoriaSeleccionada}
                >
                  <option value="">Seleccionar curso</option>
                  {cursosFiltrados.map(curso => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={getNombreCurso()}
                  disabled
                  className="readonly-input"
                />
              )}
              {errors.cursoId && <span className="error-message">{errors.cursoId}</span>}
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div className="form-section-asignaciones">
          <h3>Horarios</h3>
          {horarios.map((horario, index) => (
            <div key={index} className="horario-item-asignaciones">
              <div className="form-row">
                <div className="form-group">
                  <label>Día:</label>
                  {isEditing ? (
                    <select
                      value={horario.dia}
                      onChange={(e) => handleHorarioChange(index, 'dia', e.target.value)}
                      className={errors[`horario_${index}`] ? 'error' : ''}
                    >
                      <option value="">Seleccionar día</option>
                      {diasSemanaData.map(dia => (
                        <option key={dia.id} value={dia.id}>
                          {dia.nombre}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={getNombreDia(horario.dia)}
                      disabled
                      className="readonly-input"
                    />
                  )}
                </div>
                <div className="form-group">
                  <label>Hora Inicio:</label>
                  {isEditing ? (
                    <input
                      type="time"
                      value={horario.horaInicio}
                      onChange={(e) => handleHorarioChange(index, 'horaInicio', e.target.value)}
                      className={errors[`horario_${index}`] ? 'error' : ''}
                    />
                  ) : (
                    <input
                      type="text"
                      value={formatTime(horario.horaInicio)}
                      disabled
                      className="readonly-input"
                    />
                  )}
                </div>
                <div className="form-group">
                  <label>Hora Fin:</label>
                  {isEditing ? (
                    <input
                      type="time"
                      value={horario.horaFin}
                      onChange={(e) => handleHorarioChange(index, 'horaFin', e.target.value)}
                      className={errors[`horario_${index}`] ? 'error' : ''}
                    />
                  ) : (
                    <input
                      type="text"
                      value={formatTime(horario.horaFin)} 
                      disabled
                      className="readonly-input"
                    />
                  )}
                </div>
                {isEditing && horarios.length > 1 && (
                  <div className="form-group">
                    <button
                      type="button"
                      className="remove-horario-btn"
                      onClick={() => eliminarHorario(index)}
                    >
                      <i className="bx bx-trash"></i>
                    </button>
                  </div>
                )}
              </div>
              {errors[`horario_${index}`] && (
                <span className="error-message">{errors[`horario_${index}`]}</span>
              )}
            </div>
          ))}
          
          {isEditing && (
            <button
              type="button"
              className="add-horario-btn"
              onClick={agregarHorario}
            >
              <i className="bx bx-plus"></i>
              Agregar Horario
            </button>
          )}
        </div>

        {/* Botones de acción */}
        <div className="form-actions">
          {isEditing ? (
            <>
              <button 
                type="button"
                className="save-btn" 
                onClick={handleUpdate}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="bx bx-loader-alt bx-spin"></i>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default VerAsignaciones;