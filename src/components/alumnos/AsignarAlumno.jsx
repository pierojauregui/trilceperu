import React, { useState, useEffect } from 'react';
import './AsignarAlumno.css';
import Swal from 'sweetalert2';

const AsignarAlumno = ({ alumnoId, alumnoNombre, setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [comprobanteNumero, setComprobanteNumero] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [monto, setMonto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    fetchCursos();
  }, []);

 const fetchCursos = async () => {
  try {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No se encontró el token de autenticación');
      return;
    }

    const response = await fetch(`${API_URL}/asignaciones`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      const asignacionesArray = data?.data || [];
      

      const cursosMap = new Map();
      
      asignacionesArray.forEach(asignacion => {
        if (asignacion.estado === 'activo' && asignacion.profesor_id && asignacion.curso_id) {
          const cursoKey = asignacion.curso_id;
          

          if (!cursosMap.has(cursoKey)) {
            cursosMap.set(cursoKey, {
              id: asignacion.curso_id,
              nombre: asignacion.curso_nombre,
              categoria: asignacion.curso_categoria || 'Sin categoría',
              duracion: asignacion.duracion_horas ? `${asignacion.duracion_horas} horas` : 'No especificada',
              precio_real: asignacion.precio_real || 0,
              precio_oferta: asignacion.precio_oferta || null,
              asignaciones: [] 
            });
          }
          
  
          cursosMap.get(cursoKey).asignaciones.push({
            id: asignacion.id, 
            profesor: asignacion.profesor_nombre || 'Profesor asignado',
            horarios: asignacion.horarios || 'Sin horarios definidos'
          });
        }
      });
      
      const cursosDisponibles = Array.from(cursosMap.values());
      console.log('Cursos con asignaciones y precios:', cursosDisponibles);
      setCursos(cursosDisponibles);
    } else {
      const errorData = await response.json();
      setError(errorData.detail || 'Error al cargar los cursos');
    }
  } catch (error) {
    console.error('Error:', error);
    setError('Error de conexión al cargar los cursos');
  } finally {
    setLoading(false);
  }
};

  const handleAsignarCurso = async () => {

  if (!selectedCurso) {
    await Swal.fire({
      icon: 'warning',
      title: 'Selección requerida',
      text: 'Por favor selecciona un curso y una asignación',
      confirmButtonText: 'Entendido'
    });
    return;
  }

  if (!monto || parseFloat(monto) <= 0) {
    await Swal.fire({
      icon: 'warning',
      title: 'Monto inválido',
      text: 'Por favor ingresa un monto válido mayor a 0',
      confirmButtonText: 'Entendido'
    });
    return;
  }

  if (!metodoPago) {
    await Swal.fire({
      icon: 'warning',
      title: 'Método de pago requerido',
      text: 'Por favor selecciona un método de pago',
      confirmButtonText: 'Entendido'
    });
    return;
  }


  const result = await Swal.fire({
    title: '¿Confirmar inscripción?',
    html: `
      <div style="text-align: left; margin: 20px 0;">
        <p><strong>¿Confirmas inscribir a ${alumnoNombre}?</strong></p>
        <br>
        <p><strong>📚 Curso:</strong> ${selectedCurso.curso.nombre}</p>
        <p><strong>👨‍🏫 Profesor:</strong> ${selectedCurso.profesor}</p>
        <p><strong>💰 Monto:</strong> S/ ${parseFloat(monto).toFixed(2)}</p>
        <p><strong>💳 Método:</strong> ${metodoPago.toUpperCase()}</p>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#6c757d',
    confirmButtonText: '✓ Sí, inscribir',
    cancelButtonText: '✕ Cancelar',
    reverseButtons: true
  });

  if (!result.isConfirmed) return;

  setProcesando(true);
  setError(null);

  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/inscripciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id_alumno: alumnoId,
        id_curso: selectedCurso.curso.id,
        id_asignacion: selectedCurso.id, 
        metodo_pago: metodoPago,
        monto_pagado: parseFloat(monto),
        comprobante_numero: comprobanteNumero || null,
        observaciones: observaciones || null
      })
    });

    const result = await response.json();

    if (response.ok) {
      await Swal.fire({
        icon: 'success',
        title: '¡Inscripción exitosa!',
        html: `
          <div style="text-align: left; margin: 20px 0;">
            <p><strong>👤 Alumno:</strong> ${alumnoNombre}</p>
            <p><strong>📚 Curso:</strong> ${selectedCurso.curso.nombre}</p>
            <p><strong>💰 Monto pagado:</strong> S/ ${result.data.monto_pagado}</p>
            <p><strong>📊 Estado:</strong> ${result.data.estado_pago === 'pagado' ? '✅ PAGADO COMPLETO' : '⏳ PAGO PARCIAL'}</p>
          </div>
        `,
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#28a745'
      });
      setCurrentSection('ver-alumno', { alumnoId });
    } else {
      setError(result.detail || 'Error al procesar la inscripción');
    }
  } catch (error) {
    console.error('Error:', error);
    setError('Error de conexión al procesar la inscripción');
  } finally {
    setProcesando(false);
  }
};

  if (loading) {
    return (
      <div className="asignar-alumno-container">
        <div className="loading">Cargando cursos disponibles...</div>
      </div>
    );
  }

  return (
    <div className="asignar-alumno-container">
      <div className="asignar-header">
        <button className="btn-volver-atras" onClick={() => setCurrentSection('ver-alumno', { alumnoId })}>
          ← Volver
        </button>
        <h1 className="asignar-title">Asignar Alumno a Curso</h1>
      </div>

      <div className="alumno-info-card">
        <h2>👤{alumnoNombre}</h2>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="cursos-disponibles">
        <h3>📚 Cursos Disponibles</h3>
        {cursos.length === 0 ? (
          <div className="no-cursos">
            <p>No hay cursos disponibles para asignar.</p>
            <p>Los cursos deben estar publicados y tener profesores asignados.</p>
          </div>
        ) : (
          <div className="cursos-list">
  {cursos.map(curso => (
    <div key={curso.id} className="curso-grupo">

      <div className="curso-header-info">
        <h4>{curso.nombre}</h4>
        <span className="curso-badge">{curso.categoria}</span>
        <span className="curso-duracion">⏱️ {curso.duracion}</span>
      </div>

      <div className="asignaciones-list">
        <p className="asignaciones-label">
          Selecciona una asignación (profesor + horario):
        </p>
        
        {curso.asignaciones.map(asignacion => (
          <div 
            key={asignacion.id}
            className={`asignacion-card ${
              selectedCurso?.id === asignacion.id ? 'selected' : ''
            }`}
            onClick={() => {
              const precioFinal = curso.precio_oferta || curso.precio_real;
              setSelectedCurso({
                id: asignacion.id,       
                curso: curso,            
                profesor: asignacion.profesor,
                horarios: asignacion.horarios,
                precio: precioFinal
              });
              setMonto(precioFinal.toString()); 
            }}
          >
            <div className="asignacion-info">
              <p><strong>👨‍🏫 Profesor:</strong> {asignacion.profesor}</p>
              <p><strong>📅 Horarios:</strong> {asignacion.horarios}</p>
            </div>
            
            {selectedCurso?.id === asignacion.id && (
              <div className="selected-indicator">✓ Seleccionado</div>
            )}
          </div>
        ))}
      </div>
    </div>
  ))}
</div>
        )}
      </div>

      {selectedCurso && (
        <div className="pago-section">
          <h3>💳 Información de Pago</h3>
          <div className="pago-form">
            <div className="form-group">
              <label>Método de Pago:</label>
              <select 
                value={metodoPago} 
                onChange={(e) => setMetodoPago(e.target.value)}
                className="form-select"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="yape">Yape</option>
                <option value="plin">Plin</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Monto a Pagar (S/):</label>
              <input 
                type="number" 
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder={selectedCurso ? 
                  `Precio del curso: S/ ${selectedCurso.precio}` : 
                  'Selecciona un curso primero'
                }
                className="form-input"
                min="0"
                step="0.01"
              />
              {selectedCurso && (
                <small className="precio-info">
                  💡 Precio {selectedCurso.curso.precio_oferta ? 'con oferta' : 'regular'}: 
                  S/ {selectedCurso.precio}
                  {selectedCurso.curso.precio_oferta && selectedCurso.curso.precio_real && (
                    <span className="precio-original">
                      {' '}(antes: S/ {selectedCurso.curso.precio_real})
                    </span>
                  )}
                </small>
              )}
            </div>
            
            <div className="form-group">
              <label>Observaciones (opcional):</label>
              <textarea 
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas adicionales sobre la inscripción..."
                className="form-textarea"
                rows="3"
              />
            </div>
          </div>

          <div className="resumen-pago">
            <h4>📋 Resumen de Inscripción</h4>
            <div className="resumen-item">
              <span>Curso:</span>
              <strong>{selectedCurso.curso.nombre}</strong>
            </div>
            <div className="resumen-item">
              <span>Profesor:</span>
              <strong>{selectedCurso.profesor}</strong>
            </div>
            <div className="resumen-item">
              <span>Monto a pagar:</span>
              <strong className="monto-total">
                S/ {monto ? parseFloat(monto).toFixed(2) : '0.00'}
              </strong>
            </div>
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button 
          className="btn-cancel"
          onClick={() => setCurrentSection('ver-alumno', { alumnoId })}
        >
          Cancelar
        </button>
        <button 
          className="btn-inscribir"
          onClick={handleAsignarCurso}
          disabled={!selectedCurso || procesando}
        >
          {procesando ? 'Procesando...' : '✓ Inscribir Alumno'}
        </button>
      </div>
    </div>
  );
};

export default AsignarAlumno;