// Componente para procesar pagos con Culqi (Tarjeta y Yape)
// Ruta: frontend/src/components/VistaAlumno/ModalPagoCulqi.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import './ModalPagoCulqi.css';

const ModalPagoCulqi = ({ curso, onClose, onSuccess }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const CULQI_PUBLIC_KEY = import.meta.env.VITE_CULQI_PUBLIC_KEY;
  const { user } = useAuth();
  
  const [metodoPago, setMetodoPago] = useState('tarjeta'); // 'tarjeta' o 'yape'
  const [loading, setLoading] = useState(false);
  const [loadingScript, setLoadingScript] = useState(true);

  // Precio del curso (usar oferta si existe)
  const precioFinal = curso.precio_oferta && parseFloat(curso.precio_oferta) < parseFloat(curso.precio_real || curso.precio)
    ? parseFloat(curso.precio_oferta)
    : parseFloat(curso.precio_real || curso.precio || 0);

  useEffect(() => {
    // Cargar el script de Culqi
    const script = document.createElement('script');
    script.src = 'https://checkout.culqi.com/js/v4';
    script.async = true;
    script.onload = () => {
      setLoadingScript(false);
      configurarCulqi();
    };
    script.onerror = () => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el sistema de pagos'
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const configurarCulqi = () => {
    if (window.Culqi) {
      window.Culqi.publicKey = CULQI_PUBLIC_KEY;
      window.Culqi.options = {
        lang: 'es',
        modal: false,
        style: {
          logo: 'https://trilceperu.com/logo.png',
          mainColor: '#0EC1C3',
          buttonBackground: '#0EC1C3',
          menuColor: '#0EC1C3'
        }
      };

      // Callback cuando se genera el token exitosamente
      window.culqi = function() {
        if (window.Culqi.token) {
          procesarPagoTarjeta(window.Culqi.token.id);
        } else if (window.Culqi.order) {
          // Para Yape y otros métodos
          console.log('Orden creada:', window.Culqi.order);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: window.Culqi.error.user_message
          });
        }
      };
    }
  };

  const procesarPagoTarjeta = async (tokenId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/pagos-culqi/crear-pago-tarjeta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          token_id: tokenId,
          id_alumno: user.id,
          id_curso: curso.id,
          monto: precioFinal,
          email: user.email || 'alumno@trilceperu.com',
          descripcion: `Pago por curso: ${curso.nombre}`
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Pago exitoso!',
          html: `
            <p>Tu pago ha sido procesado correctamente</p>
            <p><strong>Monto:</strong> S/ ${precioFinal.toFixed(2)}</p>
            <p><strong>Curso:</strong> ${curso.nombre}</p>
            <p>Ya estás inscrito en el curso</p>
          `,
          confirmButtonText: 'Ir a mis cursos'
        }).then(() => {
          if (onSuccess) onSuccess();
          onClose();
        });
      } else {
        throw new Error(data.detail || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error en el pago',
        text: error.message || 'No se pudo procesar el pago. Intenta nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const iniciarPagoTarjeta = () => {
    if (!window.Culqi || loadingScript) {
      Swal.fire({
        icon: 'warning',
        title: 'Espera un momento',
        text: 'El sistema de pagos se está cargando...'
      });
      return;
    }

    // Configurar Culqi Checkout
    window.Culqi.settings({
      title: 'Trilce Perú',
      currency: 'PEN',
      amount: Math.round(precioFinal * 100), // Culqi trabaja en centavos
      description: `Pago por curso: ${curso.nombre}`
    });

    window.Culqi.open();
  };

  const iniciarPagoYape = async () => {
    setLoading(true);
    try {
      // Solicitar número de teléfono
      const { value: telefono } = await Swal.fire({
        title: 'Pagar con Yape',
        html: `
          <p>Ingresa tu número de Yape</p>
          <input id="swal-input-phone" class="swal2-input" placeholder="999999999" maxlength="9" pattern="[0-9]{9}">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const phone = document.getElementById('swal-input-phone').value;
          if (!phone || phone.length !== 9) {
            Swal.showValidationMessage('Ingresa un número válido de 9 dígitos');
            return false;
          }
          return phone;
        }
      });

      if (!telefono) {
        setLoading(false);
        return;
      }

      // Crear orden de pago con Yape
      const response = await fetch(`${API_URL}/pagos-culqi/crear-orden-yape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id_alumno: user.id,
          id_curso: curso.id,
          monto: precioFinal,
          email: user.email || 'alumno@trilceperu.com',
          numero_telefono: telefono
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Mostrar código QR o instrucciones de Yape
        Swal.fire({
          title: 'Completa el pago con Yape',
          html: `
            <p><strong>Monto a pagar:</strong> S/ ${precioFinal.toFixed(2)}</p>
            <p>Código de pago:</p>
            <div style="font-size: 24px; font-weight: bold; margin: 10px 0;">${data.data.qr_code || 'Pendiente'}</div>
            <p style="font-size: 12px; color: #666;">
              Abre tu app de Yape y completa el pago con este código
            </p>
            <p style="font-size: 12px; color: #999;">
              El pago expira en 24 horas
            </p>
          `,
          icon: 'info',
          confirmButtonText: 'Ya pagué',
          showCancelButton: true,
          cancelButtonText: 'Cancelar'
        }).then(async (result) => {
          if (result.isConfirmed) {
            // Verificar estado del pago
            await verificarPago(data.data.id_pago);
          }
        });
      } else {
        throw new Error(data.detail || 'Error al crear orden de pago');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo crear la orden de pago'
      });
    } finally {
      setLoading(false);
    }
  };

  const verificarPago = async (idPago) => {
    try {
      const response = await fetch(`${API_URL}/pagos-culqi/verificar-pago`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id_pago: idPago })
      });

      const data = await response.json();

      if (data.success && data.data.estado === 'completado') {
        Swal.fire({
          icon: 'success',
          title: '¡Pago confirmado!',
          text: 'Tu pago con Yape ha sido verificado. Ya estás inscrito en el curso.',
          confirmButtonText: 'Ir a mis cursos'
        }).then(() => {
          if (onSuccess) onSuccess();
          onClose();
        });
      } else if (data.data.estado === 'pendiente') {
        Swal.fire({
          icon: 'warning',
          title: 'Pago pendiente',
          text: 'Aún no hemos recibido la confirmación de tu pago. Por favor espera unos minutos.',
          confirmButtonText: 'Verificar nuevamente',
          showCancelButton: true,
          cancelButtonText: 'Cerrar'
        }).then((result) => {
          if (result.isConfirmed) {
            verificarPago(idPago);
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Pago no completado',
          text: 'No se pudo verificar tu pago. Contacta con soporte.'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo verificar el pago'
      });
    }
  };

  return (
    <div className="modal-pago-culqi-overlay" onClick={onClose}>
      <div className="modal-pago-culqi-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <i className='bx bx-x'></i>
        </button>

        <div className="modal-pago-header">
          <h2>Completar Pago</h2>
          <div className="curso-info-pago">
            <h3>{curso.nombre}</h3>
            <div className="precio-pago">
              {curso.precio_oferta && parseFloat(curso.precio_oferta) < parseFloat(curso.precio_real || curso.precio) ? (
                <>
                  <span className="precio-final">S/ {precioFinal.toFixed(2)}</span>
                  <span className="precio-anterior">S/ {parseFloat(curso.precio_real || curso.precio).toFixed(2)}</span>
                </>
              ) : (
                <span className="precio-final">S/ {precioFinal.toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="metodos-pago">
          <button
            className={`metodo-btn ${metodoPago === 'tarjeta' ? 'active' : ''}`}
            onClick={() => setMetodoPago('tarjeta')}
          >
            <i className='bx bx-credit-card'></i>
            Tarjeta de Crédito/Débito
          </button>
          <button
            className={`metodo-btn ${metodoPago === 'yape' ? 'active' : ''}`}
            onClick={() => setMetodoPago('yape')}
          >
            <img src="/images/yape-logo.png" alt="Yape" style={{width: '24px', height: '24px'}} />
            Yape
          </button>
        </div>

        <div className="modal-pago-body">
          {metodoPago === 'tarjeta' ? (
            <div className="pago-tarjeta-info">
              <p><i className='bx bx-shield-quarter'></i> Pago seguro procesado por Culqi</p>
              <p><i className='bx bx-check-circle'></i> Tus datos están protegidos con encriptación SSL</p>
              <p><i className='bx bx-credit-card'></i> Aceptamos Visa, Mastercard, American Express y Diners</p>
              <button
                className="btn-pagar-culqi"
                onClick={iniciarPagoTarjeta}
                disabled={loading || loadingScript}
              >
                {loadingScript ? 'Cargando...' : loading ? 'Procesando...' : `Pagar S/ ${precioFinal.toFixed(2)}`}
              </button>
            </div>
          ) : (
            <div className="pago-yape-info">
              <p><i className='bx bx-mobile'></i> Paga de forma rápida con Yape</p>
              <p><i className='bx bx-check-circle'></i> Pago confirmado en segundos</p>
              <p><i className='bx bx-shield-quarter'></i> 100% seguro y confiable</p>
              <button
                className="btn-pagar-yape"
                onClick={iniciarPagoYape}
                disabled={loading}
              >
                {loading ? 'Procesando...' : `Pagar con Yape S/ ${precioFinal.toFixed(2)}`}
              </button>
            </div>
          )}
        </div>

        <div className="modal-pago-footer">
          <p className="info-text">
            <i className='bx bx-info-circle'></i>
            Al completar el pago serás inscrito automáticamente en el curso
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModalPagoCulqi;
