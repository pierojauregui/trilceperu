import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './CrearAsignacion.css';

const CrearAsignacion = ({ setCurrentSection }) => {
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
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [diasSemanaData, setDiasSemanaData] = useState([]);
  const [bloquesHorario, setBloquesHorario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const diasSemana = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];


  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        

        const [profesoresResponse, cursosResponse, categoriasResponse, diasResponse, bloquesResponse] = await Promise.all([
          fetch(`${API_URL}/asignaciones/profesores-disponibles`),
          fetch(`${API_URL}/courses/admin`),
          fetch(`${API_URL}/categorias`),
          fetch(`${API_URL}/asignaciones/dias-semana`),
          fetch(`${API_URL}/asignaciones/bloques-horario`)
        ]);

        if (!profesoresResponse.ok || !cursosResponse.ok || !categoriasResponse.ok || !diasResponse.ok || !bloquesResponse.ok) {
          throw new Error('Error al cargar los datos');
        }

        const profesoresData = await profesoresResponse.json();
        const cursosData = await cursosResponse.json();
        const categoriasData = await categoriasResponse.json();
        const diasData = await diasResponse.json();
        const bloquesData = await bloquesResponse.json();


        const profesoresFormateados = (profesoresData.data || profesoresData.profesores || []).map(profesor => ({
          id: profesor.id,
          nombre: profesor.nombre_completo || `${profesor.nombres || ''} ${profesor.apellidos || ''}`.trim(),
          email: profesor.email || profesor.correo_electronico || '',
          especialidad: profesor.especialidad || profesor.area || '',
          telefono: profesor.celular || '',
          imagen_perfil: profesor.imagen_perfil || null,
          asignaciones_activas: profesor.asignaciones_activas || 0
        }));


        const cursosFormateados = (cursosData.data || cursosData.cursos || []).map(curso => ({
          id: curso.id,
          nombre: curso.nombre,
          categoria_id: curso.categoria_id,
          categoria_nombre: curso.categoria_nombre || curso.categoria || 'Sin categoría',
          duracion: `${curso.duracion_horas || 0} horas`,
          nivel: curso.nivel || 'No especificado',
          modalidad: curso.modalidad || 'sincrono'
        }));

        setProfesores(profesoresFormateados);
        setCursos(cursosFormateados);
        setCategorias(categoriasData.data || []);
        setCursosFiltrados(cursosFormateados);
        setDiasSemanaData(diasData.data || []);
        setBloquesHorario(bloquesData.data || []);
        
      } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar los datos. Por favor, recargue la página.');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    

    if (name === 'cursoId' && value) {
      const curso = cursosFiltrados.find(c => c.id.toString() === value) || 
                   cursos.find(c => c.id.toString() === value);
      setCursoSeleccionado(curso);
    } else if (name === 'cursoId' && !value) {
      setCursoSeleccionado(null);
    }
    

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

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
            nivel: curso.nivel || 'No especificado',
            modalidad: curso.modalidad || 'sincrono' 
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
    setCursoSeleccionado(null);
  };

  const handleHorarioChange = (index, field, value) => {
    const nuevosHorarios = [...horarios];
    nuevosHorarios[index][field] = value;
    setHorarios(nuevosHorarios);
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.profesorId) {
      newErrors.profesorId = 'Debe seleccionar un profesor';
    }

    if (!formData.cursoId) {
      newErrors.cursoId = 'Debe seleccionar un curso';
    }

   
    const horariosValidos = horarios.filter(h => h.dia && h.horaInicio && h.horaFin);
    

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {

      const token = localStorage.getItem('token');
      if (!token) {
        setErrors({ general: 'No hay token de sesión. Por favor, inicia sesión nuevamente.' });
        setIsSubmitting(false);
        return;
      }

     const asignacionData = {
  id_profesor: parseInt(formData.profesorId),
  id_curso: parseInt(formData.cursoId),
  horarios: horarios
    .filter(h => h.dia && h.horaInicio && h.horaFin)
    .map(horario => {

      const diaData = diasSemanaData.find(d => d.id === parseInt(horario.dia));
      return {
        dia_semana: diaData ? diaData.nombre : '', 
        hora_inicio: horario.horaInicio + ':00',
        hora_fin: horario.horaFin + ':00'
      };
    })
};


horarios.filter(h => h.dia && h.horaInicio && h.horaFin).forEach((h, idx) => {
  const diaData = diasSemanaData.find(d => d.id === parseInt(h.dia));
  console.log(`Horario ${idx}: ID=${h.dia}, Nombre="${diaData?.nombre}", Caracteres:`, 
    diaData?.nombre ? Array.from(diaData.nombre).map(c => c.charCodeAt(0)) : 'N/A');
});

      console.log('Enviando asignación:', asignacionData);

      const response = await fetch(`${API_URL}/asignaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(asignacionData)
      });

      const result = await response.json();

      console.log('Respuesta completa del servidor:', result);
console.log('Status de la respuesta:', response.status);
console.log('Response OK?:', response.ok);

      if (response.ok && result.success) {
        Swal.fire({
          title: '¡Éxito!',
          text: '¡Asignación creada exitosamente!',
          icon: 'success',
          confirmButtonColor: '#4CAF50'
        }).then(() => {
         
          setFormData({
            profesorId: '',
            cursoId: ''
          });
          setHorarios([{ dia: '', horaInicio: '', horaFin: '' }]);
          setCategoriaSeleccionada('');
          setCursosFiltrados([]);
         
          setCurrentSection('asignaciones');
        });
      } else {
  console.error('Error del servidor:', result); 
  throw new Error(result.detail || result.message || 'Error al crear la asignación');

}
    } catch (error) {
      console.error('Error al crear asignación:', error);
      setErrors({ submit: error.message || 'Error al crear la asignación' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProfesorInfo = (profesorId) => {
    return profesores.find(p => p.id.toString() === profesorId);
  };

  const getCursoInfo = (cursoId) => {

    const cursoEncontrado = cursosFiltrados.find(c => c.id.toString() === cursoId) || 
                           cursos.find(c => c.id.toString() === cursoId);
    return cursoEncontrado;
  };

  if (loading) {
    return (
      <div className="crear-asignacion-container">
        <div className="loading-spinner">
          <i className='bx bx-loader-alt bx-spin'></i>
          <p>Cargando datos...</p>
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
            <h1>Nueva Asignación</h1>
            <p>Asigna un profesor a un curso y configura los horarios</p>
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
                    {profesor.nombre}
                  </option>
                ))}
              </select>
              {errors.profesorId && <span className="error-message">{errors.profesorId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="categoriaId">Categoría *</label>
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

          {cursoSeleccionado && (
            <div className="modalidad-info-box">
              <div className={`modalidad-badge ${cursoSeleccionado.modalidad === 'asincrono' ? 'asincrono' : 'sincrono'}`}>
                <i className={`bx ${cursoSeleccionado.modalidad === 'asincrono' ? 'bx-cloud' : 'bx-video'}`}></i>
                <span>
                  Modalidad: <strong>{cursoSeleccionado.modalidad === 'asincrono' ? 'Asíncrono' : 'Síncrono'}</strong>
                </span>
              </div>
              {cursoSeleccionado.modalidad === 'asincrono' && (
                <p className="modalidad-hint">
                  <i className='bx bx-info-circle'></i>
                  Este curso es asíncrono, los horarios son opcionales.
                </p>
              )}
            </div>
          )}
        </div>

       
        <div className={`form-section ${cursoSeleccionado?.modalidad === 'asincrono' ? 'section-optional' : ''}`}>
          <div className="section-header">
            <h2>
              <i className='bx bx-calendar'></i>
              Horarios de Clase
              {cursoSeleccionado?.modalidad === 'asincrono' && (
                <span className="optional-label">(Opcional)</span>
              )}
            </h2>
            {cursoSeleccionado?.modalidad !== 'asincrono' && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={agregarHorario}
              >
                <i className='bx bx-plus'></i>
                Agregar Horario
              </button>
            )}
            {cursoSeleccionado?.modalidad === 'asincrono' && (
              <button
                type="button"
                className="btn btn-outline btn-small"
                onClick={agregarHorario}
              >
                <i className='bx bx-plus'></i>
                Agregar horario (opcional)
              </button>
            )}
          </div>
          
          {cursoSeleccionado?.modalidad === 'asincrono' && (
            <div className="async-notice">
              <i className='bx bx-info-circle'></i>
              <p>Los cursos asíncronos no requieren horarios fijos. El estudiante puede acceder al contenido en cualquier momento.</p>
            </div>
          )}
          
          {errors.horarios && <span className="error-message">{errors.horarios}</span>}
          
          <div className="horarios-container-crear">
            {horarios.map((horario, index) => (
              <div key={index} className="horario-item-crear">
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
                        <option key={dia.id} value={dia.id}>
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

      
        {formData.profesorId && formData.cursoId && (
          <div className="form-section preview-section">
            <h2>
              <i className='bx bx-show'></i>
              Vista Previa de la Asignación
            </h2>
            
            <div className="preview-card">
              <div className="preview-header">
                <div className="profesor-preview">
                  <div className="profesor-avatar">
                    {getProfesorInfo(formData.profesorId)?.imagen_perfil ? (
                      <img 
                        src={`${API_URL.replace('/api', '')}/${getProfesorInfo(formData.profesorId)?.imagen_perfil}`} 
                        alt={getProfesorInfo(formData.profesorId)?.nombre}
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
                    <h3>{getProfesorInfo(formData.profesorId)?.nombre}</h3>
                    {getProfesorInfo(formData.profesorId)?.especialidad && getProfesorInfo(formData.profesorId)?.especialidad.trim() && (
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
                  
                  {/* Mostrar modalidad en la vista previa */}
                  <div className={`preview-modalidad ${cursoSeleccionado?.modalidad === 'asincrono' ? 'asincrono' : 'sincrono'}`}>
                    <i className={`bx ${cursoSeleccionado?.modalidad === 'asincrono' ? 'bx-cloud' : 'bx-video'}`}></i>
                    <span>{cursoSeleccionado?.modalidad === 'asincrono' ? 'Asíncrono' : 'Síncrono'}</span>
                  </div>
                </div>
                
                {cursoSeleccionado?.modalidad === 'asincrono' && !horarios.some(h => h.dia && h.horaInicio && h.horaFin) ? (
                  <div className="horarios-preview async-mode">
                    <h5>Horarios:</h5>
                    <p className="no-schedule-text">
                      <i className='bx bx-time-five'></i>
                      Acceso libre - Sin horario fijo
                    </p>
                  </div>
                ) : horarios.some(h => h.dia && h.horaInicio && h.horaFin) && (
                  <div className="horarios-preview">
                    <h5>Horarios:</h5>
                    <div className="horarios-list">
                      {horarios
                        .filter(h => h.dia && h.horaInicio && h.horaFin)
                        .map((h, index) => {
                          const formatTime = (time) => {
                            if (!time) return time;
                            const [hours, minutes] = time.split(':');
                            const hour = parseInt(hours);
                            const ampm = hour >= 12 ? 'PM' : 'AM';
                            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                            return `${displayHour}:${minutes} ${ampm}`;
                          };
                          
                          const diaData = diasSemanaData.find(d => d.id === parseInt(h.dia));
                          const diaNombre = diaData ? diaData.nombre : h.dia;
                          
                          return (
                            <span key={index} className="horario-tag">
                              {diaNombre} - {formatTime(h.horaInicio)} a {formatTime(h.horaFin)}
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
                Creando...
              </>
            ) : (
              <>
                <i className='bx bx-check'></i>
                Crear Asignación
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearAsignacion;