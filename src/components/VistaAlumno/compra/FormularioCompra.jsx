import { useState, useEffect } from 'react';
import './FormularioCompra.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_BASE_URL = API_URL.replace('/api', '');
const CULQI_PUBLIC_KEY = import.meta.env.VITE_CULQI_PUBLIC_KEY || 'pk_test_39HQNbXOo1eEzG40';

const FormularioCompra = ({ curso, onVolver, onCompraExitosa }) => {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);
  const [culqiListo, setCulqiListo] = useState(false);

  // Calcular precios
  const precioOriginal = parseFloat(curso?.precio_real || curso?.precio || 0);
  const precioOferta = parseFloat(curso?.precio_oferta || 0);
  const precioFinal = precioOferta > 0 && precioOferta < precioOriginal ? precioOferta : precioOriginal;
  const descuento = precioOferta > 0 && precioOriginal > precioFinal 
    ? Math.round(((precioOriginal - precioFinal) / precioOriginal) * 100) 
    : 0;
  const montoEnCentavos = Math.round(precioFinal * 100);

  // Obtener datos del usuario
  const getUserData = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return {
        id: user.id,
        nombre: user.nombres || user.nombre || user.username || '',
        apellido: user.apellidos || user.apellido || '',
        email: user.correo_electronico || user.email || '',
        telefono: user.celular || user.telefono || ''
      };
    }
    return { id: null, nombre: '', apellido: '', email: '', telefono: '' };
  };

  // Cargar Culqi Checkout v4
  useEffect(() => {
    if (!curso) return;

    const loadCulqi = () => {
      if (window.Culqi) {
        configurarCulqi();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.culqi.com/js/v4';
      script.async = true;
      script.onload = () => {
        console.log('✅ Culqi Checkout cargado');
        configurarCulqi();
      };
      script.onerror = () => setError('Error al cargar pasarela de pagos');
      document.body.appendChild(script);
    };

    const configurarCulqi = () => {
      if (!window.Culqi) return;
      
      window.Culqi.publicKey = CULQI_PUBLIC_KEY;
      
      window.Culqi.settings({
        title: 'Trilce Perú',
        currency: 'PEN',
        amount: montoEnCentavos
      });

      window.Culqi.options({
        lang: 'es',
        installments: false,
        paymentMethods: {
          tarjeta: true,
          yape: true,
          billetera: false,
          bancaMovil: false,
          agente: false,
          cuotealo: false
        },
        style: {
          bannerColor: '#e94560',
          buttonBackground: '#e94560',
          menuColor: '#1a1a2e',
          linksColor: '#e94560',
          buttonText: 'Pagar',
          buttonTextColor: '#ffffff',
          priceColor: '#1a1a2e'
        }
      });

      setCulqiListo(true);
      console.log('✅ Culqi configurado - Monto:', montoEnCentavos, 'centavos');
    };

    loadCulqi();

    // Cleanup
    return () => {
      if (window.Culqi) {
        try { window.Culqi.close(); } catch (e) {}
      }
    };
  }, [curso, montoEnCentavos]);

  // Callback global de Culqi - Se ejecuta cuando el usuario completa el pago
  useEffect(() => {
    // La función debe llamarse "culqi" (sin parámetros)
    window.culqi = function() {
      if (Culqi.token) {
        // ¡Token creado exitosamente!
        console.log('🎫 Token recibido:', Culqi.token.id);
        procesarPago(Culqi.token);
      } else if (Culqi.order) {
        // Orden creada (PagoEfectivo, billeteras, etc.)
        console.log('📦 Order creado:', Culqi.order);
      } else {
        // Error
        console.error('❌ Error Culqi:', Culqi.error);
        setError(Culqi.error?.user_message || 'Error al procesar el pago');
      }
    };

    return () => {
      window.culqi = null;
    };
  }, [curso]);

  const abrirCulqi = () => {
    setError(null);
    
    if (!culqiListo || !window.Culqi) {
      setError('Cargando pasarela de pagos...');
      return;
    }

    // Actualizar configuración antes de abrir
    window.Culqi.settings({
      title: 'Trilce Perú',
      currency: 'PEN',
      amount: montoEnCentavos
    });

    window.Culqi.open();
  };

  const procesarPago = async (token) => {
    setProcesando(true);
    setError(null);

    try {
      const userData = getUserData();

      const response = await fetch(`${API_URL}/pagos-culqi/crear-pago-tarjeta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          token_id: token.id,
          id_curso: curso.id,
          id_alumno: userData.id,
          email: token.email || userData.email,
          monto: precioFinal,
          descripcion: `Curso: ${curso.nombre}`
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Pago exitoso:', data);
        if (onCompraExitosa) {
          onCompraExitosa(curso);
        }
      } else {
        setError(data.detail || data.message || 'Error al procesar el pago');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setProcesando(false);
    }
  };

  if (!curso) {
    return (
      <div className="checkout-container">
        <div className="checkout-header">
          <button className="btn-volver" onClick={onVolver}>
            <i className="bx bx-arrow-back"></i>
          </button>
          <h1>No hay curso seleccionado</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      {/* Header */}
      <div className="checkout-header">
        <button className="btn-volver" onClick={onVolver}>
          <i className="bx bx-arrow-back"></i>
        </button>
        <h1>Finalizar compra</h1>
      </div>

      {/* 2 Cards Layout */}
      <div className="checkout-content">
        {/* Card 1: Detalle del Curso */}
        <div className="checkout-card">
          <div className="card-header">
            <i className="bx bx-book-open"></i>
            <h2>Detalle del curso</h2>
          </div>

          <div className="curso-detalle">
            <div className="curso-imagen-wrapper">
              <img 
                src={curso.imagen_url ? `${API_BASE_URL}${curso.imagen_url}` : '/images/default-course.svg'} 
                alt={curso.nombre}
                className="curso-imagen"
                onError={(e) => { e.target.src = '/images/default-course.svg'; }}
              />
              {descuento > 0 && (
                <span className="descuento-badge">-{descuento}%</span>
              )}
            </div>
            <div className="curso-info">
              {curso.categoria && (
                <span className="curso-categoria">{curso.categoria}</span>
              )}
              <h3 className="curso-nombre">{curso.nombre}</h3>
              <p className="curso-descripcion">{curso.descripcion}</p>
            </div>
          </div>

          <div className="precio-section">
            {descuento > 0 && (
              <div className="precio-linea">
                <span>Precio original</span>
                <span className="precio-tachado">S/ {precioOriginal.toFixed(2)}</span>
              </div>
            )}
            {descuento > 0 && (
              <div className="precio-linea descuento">
                <span>Descuento ({descuento}%)</span>
                <span className="precio-descuento">-S/ {(precioOriginal - precioFinal).toFixed(2)}</span>
              </div>
            )}
            <div className="precio-linea total">
              <span>Total a pagar</span>
              <span className="precio-total">S/ {precioFinal.toFixed(2)}</span>
            </div>
          </div>

          <div className="garantias">
            <div className="garantia">
              <i className="bx bx-check-circle"></i>
              <span>Acceso inmediato</span>
            </div>
            <div className="garantia">
              <i className="bx bx-check-circle"></i>
              <span>Certificado incluido</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pago */}
        <div className="checkout-card">
          <div className="card-header">
            <i className="bx bx-credit-card"></i>
            <h2>Método de pago</h2>
          </div>

          <div className="metodos-disponibles">
            <p>Acepta múltiples métodos de pago:</p>
            <div className="metodos-icons">
              <div className="metodo-icon">
                <i className="bx bx-credit-card-front"></i>
                <span>Tarjeta</span>
              </div>
              <div className="metodo-icon">
                <img src="/images/yape.png" alt="Yape" />
                <span>Yape</span>
              </div>
              <div className="metodo-icon">
                <i className="bx bx-wallet"></i>
                <span>Billetera</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-msg">
              <i className="bx bx-error-circle"></i> {error}
            </div>
          )}

          <button 
            className="btn-pagar"
            onClick={abrirCulqi}
            disabled={procesando || !culqiListo}
          >
            {procesando ? (
              <>
                <div className="spinner"></div>
                Procesando...
              </>
            ) : !culqiListo ? (
              <>
                <div className="spinner"></div>
                Cargando...
              </>
            ) : (
              <>
                <i className="bx bx-lock-alt"></i>
                Pagar S/ {precioFinal.toFixed(2)}
              </>
            )}
          </button>

          <div className="security-footer">
            <div className="powered-by">
              <span>Powered by</span>
              <span className="culqi">Culqi</span>
            </div>
            <div className="ssl-badge">
              <i className="bx bx-lock-alt"></i>
              <span>256-bit SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioCompra;
