import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './MensajesModal.css';
import logger from '../../utils/logger';

const MensajesModal = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [mensajes, setMensajes] = useState([]);
  const [mensajeActual, setMensajeActual] = useState(null);
  const [indiceMensaje, setIndiceMensaje] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mensajesCargados, setMensajesCargados] = useState(false); // ✅ NUEVO
  const intervalRef = useRef(null);

  useEffect(() => {
    // Solo cargar mensajes una vez al montar el componente
    if (!mensajesCargados) {
      cargarMensajesActivos();
    }
    
    // ✅ ELIMINADO: El intervalo que recargaba mensajes cada 30 segundos
    // Ya no es necesario porque solo queremos mostrar mensajes al inicio de sesión
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mensajesCargados]); // ✅ CAMBIADO: Dependencia

  const cargarMensajesActivos = async () => {
    try {
      const token = localStorage.getItem('token');
      logger.debug('Token encontrado:', token ? 'Sí' : 'No');
      
      const response = await fetch(`${API_URL}/mensajes-personalizados/activos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      logger.api('Response status:', response.status);
      logger.api('Response ok:', response.ok);

      if (response.ok) {
        const mensajesData = await response.json();
        logger.debug('Mensajes recibidos:', mensajesData);
        
        setMensajesCargados(true); // ✅ NUEVO: Marcar como cargados
        
        if (mensajesData.length > 0) {
          setMensajes(mensajesData);
          setMensajeActual(mensajesData[0]);
          setIndiceMensaje(0);
        }
      } else {
        const errorData = await response.text();
        logger.error('Error en respuesta:', errorData);
      }
    } catch (error) {
      logger.error('Error al cargar mensajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const cerrarMensaje = async () => {
    // Marcar mensaje como visto si tiene la opción mostrar_una_vez
    if (mensajeActual && mensajeActual.mostrar_una_vez) {
      try {
        await fetch(`${API_URL}/mensajes-personalizados/${mensajeActual.id}/marcar-visto`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (error) {
        logger.error('Error al marcar mensaje como visto:', error);
      }
    }

    // Si hay más mensajes, mostrar el siguiente
    if (indiceMensaje < mensajes.length - 1) {
      const siguienteIndice = indiceMensaje + 1;
      setIndiceMensaje(siguienteIndice);
      setMensajeActual(mensajes[siguienteIndice]);
    } else {
      // No hay más mensajes, cerrar completamente
      setMensajeActual(null);
      setMensajes([]);
      
      // ✅ ELIMINADO: setTimeout que recargaba mensajes
      // Los mensajes solo se muestran al inicio de sesión, no después de cerrarlos
    }
  };

  const cerrarTodos = async () => {
    // Marcar todos los mensajes restantes como vistos si tienen la opción mostrar_una_vez
    for (let i = indiceMensaje; i < mensajes.length; i++) {
      const mensaje = mensajes[i];
      if (mensaje && mensaje.mostrar_una_vez) {
        try {
          await fetch(`${API_URL}/mensajes-personalizados/${mensaje.id}/marcar-visto`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        } catch (error) {
          logger.error('Error al marcar mensaje como visto:', error);
        }
      }
    }

    setMensajeActual(null);
    setMensajes([]);
    
    // ✅ ELIMINADO: setTimeout que recargaba mensajes
  };

  if (loading || !mensajeActual) {
    return null;
  }

  return (
    <div className="mensaje-modal-overlay">
      <div className="mensaje-modal-content">
        <div className="mensaje-modal-header">
          <h3>{mensajeActual.titulo}</h3>
          <div className="mensaje-modal-controls">
            {mensajes.length > 1 && (
              <span className="mensaje-contador">
                {indiceMensaje + 1} de {mensajes.length}
              </span>
            )}
            <button 
              className="btn-cerrar-mensaje"
              onClick={cerrarMensaje}
              title="Cerrar mensaje"
            >
              <i className="bx bx-x"></i>
            </button>
          </div>
        </div>

        <div className="mensaje-modal-body">
          {mensajeActual.tipo_contenido === 'imagen' && mensajeActual.imagen_url && (
            <div className="mensaje-imagen">
              <img 
                src={mensajeActual.imagen_url} 
                alt={mensajeActual.titulo}
                className="mensaje-img"
              />
            </div>
          )}

          {mensajeActual.tipo_contenido === 'mixto' && mensajeActual.imagen_url && (
            <div className="mensaje-imagen">
              <img 
                src={mensajeActual.imagen_url} 
                alt={mensajeActual.titulo}
                className="mensaje-img"
              />
            </div>
          )}

          {(mensajeActual.tipo_contenido === 'texto' || mensajeActual.tipo_contenido === 'mixto') && mensajeActual.contenido && (
            <div className="mensaje-contenido">
              <p>{mensajeActual.contenido}</p>
            </div>
          )}
        </div>

        <div className="mensaje-modal-footer">
          {mensajes.length > 1 ? (
            <div className="mensaje-botones">
              <button 
                className="btn-siguiente"
                onClick={cerrarMensaje}
              >
                {indiceMensaje < mensajes.length - 1 ? 'Siguiente' : 'Finalizar'}
              </button>
              <button 
                className="btn-cerrar-todos"
                onClick={cerrarTodos}
              >
                Cerrar todos
              </button>
            </div>
          ) : (
            <button 
              className="btn-entendido"
              onClick={cerrarMensaje}
            >
              Entendido
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MensajesModal;