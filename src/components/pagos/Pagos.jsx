import React, { useState, useEffect } from 'react';
import './Pagos.css';
import { 
  getPagos, 
  getEstadisticasPagos, 
  getDetallePago, 
  verificarPago, 
  reintentarPago,
  getMetodosPago 
} from '../../services/pagos';

const Pagos = ({ setCurrentSection }) => {
  const [pagos, setPagos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [metodosPago, setMetodosPago] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterMethod, setFilterMethod] = useState('todos');
  const [dateRange, setDateRange] = useState('todos');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Los filtros ahora se aplican localmente, no necesitamos recargar desde el servidor
  // useEffect(() => {
  //   if (!loading) {
  //     loadPagos();
  //   }
  // }, [searchTerm, filterStatus, filterMethod, dateRange]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar datos en paralelo - sin filtros para obtener todos los pagos
      const [pagosData, estadisticasData, metodosData] = await Promise.all([
        getPagos({}), // Sin filtros para cargar todos los pagos
        getEstadisticasPagos(),
        getMetodosPago()
      ]);

      setPagos(pagosData.data || []);
      setEstadisticas(estadisticasData.data || {});
      setMetodosPago(metodosData.data || []);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos de pagos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadPagos = async () => {
    try {
      const filters = {
        search: searchTerm,
        status: filterStatus,
        method: filterMethod,
        dateRange: dateRange
      };
      
      const response = await getPagos(filters);
      setPagos(response.data || []);
      
      // También actualizar estadísticas con los filtros aplicados
      const estadisticasResponse = await getEstadisticasPagos();
      setEstadisticas(estadisticasResponse.data || {});
      
    } catch (error) {
      console.error('Error cargando pagos:', error);
      setError('Error al cargar los pagos filtrados.');
    }
  };

  // Función para filtrar pagos localmente
  const filtrarPagosLocalmente = (pagos) => {
    return pagos.filter(pago => {
      // Filtro de búsqueda
      const searchMatch = !searchTerm || 
        (pago.alumno_nombre && pago.alumno_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pago.curso_nombre && pago.curso_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pago.codigo_transaccion && pago.codigo_transaccion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pago.comprobante_numero && pago.comprobante_numero.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pago.alumno_email && pago.alumno_email.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtro de estado
      const statusMatch = filterStatus === 'todos' || 
        (pago.estado_pago && pago.estado_pago.toLowerCase() === filterStatus.toLowerCase());

      // Filtro de método de pago
      const methodMatch = filterMethod === 'todos' || 
        (pago.metodo_pago && pago.metodo_pago.toLowerCase() === filterMethod.toLowerCase());

      // Filtro de fecha
      let dateMatch = true;
      if (dateRange !== 'todos' && pago.fecha_pago) {
        const fechaPago = new Date(pago.fecha_pago);
        const ahora = new Date();
        
        switch (dateRange) {
          case 'hoy':
            dateMatch = fechaPago.toDateString() === ahora.toDateString();
            break;
          case 'semana':
            const unaSemanaAtras = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateMatch = fechaPago >= unaSemanaAtras;
            break;
          case 'mes':
            const unMesAtras = new Date(ahora.getFullYear(), ahora.getMonth() - 1, ahora.getDate());
            dateMatch = fechaPago >= unMesAtras;
            break;
          case 'trimestre':
            const tresMesesAtras = new Date(ahora.getFullYear(), ahora.getMonth() - 3, ahora.getDate());
            dateMatch = fechaPago >= tresMesesAtras;
            break;
          case 'año':
            dateMatch = fechaPago.getFullYear() === ahora.getFullYear();
            break;
          default:
            dateMatch = true;
        }
      }

      return searchMatch && statusMatch && methodMatch && dateMatch;
    });
  };

  const getStatusColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completado': 
      case 'pagado': 
        return '#10b981';
      case 'pendiente': 
        return '#f59e0b';
      case 'fallido': 
      case 'rechazado':
        return '#ef4444';
      case 'reembolsado': 
        return '#6b7280';
      case 'procesando':
        return '#3b82f6';
      default: 
        return '#6b7280';
    }
  };

  const getMethodIcon = (metodo) => {
    switch (metodo?.toLowerCase()) {
      case 'yape': return '📱';
      case 'plin': return '💳';
      case 'tarjeta de crédito':
      case 'tarjeta_credito': 
        return '💳';
      case 'tarjeta de débito':
      case 'tarjeta_debito': 
        return '💳';
      case 'transferencia bancaria':
      case 'transferencia': 
        return '🏦';
      case 'efectivo': 
        return '💵';
      default: 
        return '💰';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return 'S/ 0.00';
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return 'S/ 0.00';
    return `S/ ${numAmount.toFixed(2)}`;
  };

  // Calcular estadísticas desde los datos filtrados
// Aplicar filtros localmente
  const pagosFiltrados = filtrarPagosLocalmente(pagos);
  
  const calcularEstadisticas = () => {
  if (!Array.isArray(pagosFiltrados) || pagosFiltrados.length === 0) {
    return {
      totalPagos: 0,
      totalMonto: 0,
      totalComisiones: 0,
      totalNeto: 0,
      pagosCompletados: 0,
      pagosPendientes: 0,
      pagosFallidos: 0
    };
  }

  const totalPagos = pagosFiltrados.length;
  const totalMonto = pagosFiltrados.reduce((sum, pago) => {
    const monto = Number(pago.monto_pagado);
    return sum + (isNaN(monto) ? 0 : monto);
  }, 0);
  
  const totalComisiones = pagosFiltrados.reduce((sum, pago) => {
    const comision = Number(pago.comision);
    return sum + (isNaN(comision) ? 0 : comision);
  }, 0);
  
  const totalNeto = totalMonto - totalComisiones;
  
  const pagosCompletados = pagosFiltrados.filter(p => 
    ['completado', 'pagado'].includes(p.estado_pago?.toLowerCase())
  ).length;
  
  const pagosPendientes = pagosFiltrados.filter(p => 
    p.estado_pago?.toLowerCase() === 'pendiente'
  ).length;
  
  const pagosFallidos = pagosFiltrados.filter(p => 
    ['fallido', 'rechazado'].includes(p.estado_pago?.toLowerCase())
  ).length;

  return {
    totalPagos: totalPagos || 0,
    totalMonto: isNaN(totalMonto) ? 0 : totalMonto,
    totalComisiones: isNaN(totalComisiones) ? 0 : totalComisiones,
    totalNeto: isNaN(totalNeto) ? 0 : totalNeto,
    pagosCompletados: pagosCompletados || 0,
    pagosPendientes: pagosPendientes || 0,
    pagosFallidos: pagosFallidos || 0
  };
};

  const stats = calcularEstadisticas();

  const handleViewDetails = async (pago) => {
    try {
      setLoading(true);
      const detalleResponse = await getDetallePago(pago.id);
      setSelectedPayment(detalleResponse.data);
      setShowDetails(true);
    } catch (error) {
      console.error('Error obteniendo detalles:', error);
      setError('Error al cargar los detalles del pago.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarPago = async (pagoId) => {
    try {
      setProcessingPayment(pagoId);
      await verificarPago(pagoId);
      
      // Recargar datos
      await loadPagos();
      
      alert('Pago verificado exitosamente');
    } catch (error) {
      console.error('Error verificando pago:', error);
      alert('Error al verificar el pago. Intente nuevamente.');
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleReintentarPago = async (pagoId) => {
    try {
      setProcessingPayment(pagoId);
      await reintentarPago(pagoId);
      
      // Recargar datos
      await loadPagos();
      
      alert('Pago reintentado exitosamente');
    } catch (error) {
      console.error('Error reintentando pago:', error);
      alert('Error al reintentar el pago. Intente nuevamente.');
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleProcessPayment = () => {
    setCurrentSection('procesar-pago');
  };

  const handleRefresh = () => {
    loadInitialData();
  };

  if (loading && pagos.length === 0) {
    return (
      <div className="pagos-loading">
        <div className="loading-spinner"></div>
        <p>Cargando información de pagos...</p>
      </div>
    );
  }

  return (
    <div className="pagos-container">
      {/* Header */}
      <div className="pagos-header">
        <div className="header-content-pagos">
          <h1>Gestión de Pagos</h1>
          <p>Administra todas las transacciones y métodos de pago de la plataforma</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            🔄 Actualizar
          </button>
          <button 
            className="btn-primary"
            onClick={handleProcessPayment}
          >
            + Procesar Nuevo Pago
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Filtros */}
      <div className="pagos-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por alumno, curso, código de transacción o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="completado">Completado</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
            <option value="procesando">Procesando</option>
            <option value="fallido">Fallido</option>
            <option value="rechazado">Rechazado</option>
            <option value="reembolsado">Reembolsado</option>
          </select>
          
          <select 
            value={filterMethod} 
            onChange={(e) => setFilterMethod(e.target.value)}
          >
            <option value="todos">Todos los métodos</option>
            {metodosPago.map((metodo, index) => (
              <option key={metodo.value || metodo.label || index} value={metodo.value || metodo.label || metodo}>
                {metodo.label || metodo.value || metodo}
              </option>
            ))}
          </select>
          
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="todos">Todas las fechas</option>
            <option value="hoy">Hoy</option>
            <option value="semana">Última semana</option>
            <option value="mes">Último mes</option>
            <option value="trimestre">Último trimestre</option>
            <option value="año">Este año</option>
          </select>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="pagos-stats">
        <div className="stat-card">
          <h3>{stats.totalPagos || 0}</h3>
          <p>Total Transacciones</p>
        </div>
        <div className="stat-card">
          <h3>{formatCurrency(stats.totalMonto)}</h3>
          <p>Monto Total</p>
        </div>
        <div className="stat-card">
          <h3>{formatCurrency(stats.totalComisiones)}</h3>
          <p>Total Comisiones</p>
        </div>
        <div className="stat-card">
          <h3>{formatCurrency(stats.totalNeto)}</h3>
          <p>Monto Neto</p>
        </div>
        <div className="stat-card success">
          <h3>{stats.pagosCompletados || 0}</h3>
          <p>Completados</p>
        </div>
        <div className="stat-card warning">
          <h3>{stats.pagosPendientes || 0}</h3>
          <p>Pendientes</p>
        </div>
        <div className="stat-card danger">
          <h3>{stats.pagosFallidos || 0}</h3>
          <p>Fallidos</p>
        </div>
      </div>

      {/* Lista de Pagos */}
      <div className="pagos-list">
        {pagosFiltrados.length === 0 ? (
          <div className="no-results">
            <p>No se encontraron pagos que coincidan con los filtros seleccionados.</p>
            <button onClick={handleRefresh} className="btn-secondary">
              Actualizar datos
            </button>
          </div>
        ) : (
          <div className="pagos-grid">
            {pagosFiltrados.map(pago => (
              <div key={pago.id} className="pago-card">
                <div className="pago-header">
                  <div className="pago-method">
                    <span className="method-icon">{getMethodIcon(pago.metodo_pago)}</span>
                    <span className="method-name">{pago.metodo_pago}</span>
                  </div>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(pago.estado_pago) }}
                  >
                    {pago.estado_pago?.charAt(0).toUpperCase() + pago.estado_pago?.slice(1)}
                  </span>
                </div>
                
                <div className="pago-info">
                  <h3>{pago.alumno_nombre || 'N/A'}</h3>
                  <p className="curso-name">{pago.curso_nombre || 'N/A'}</p>
                  <p className="transaction-code">
                    Código: {pago.codigo_transaccion || pago.comprobante_numero || 'N/A'}
                  </p>
                  {pago.alumno_email && (
                    <p className="alumno-email">{pago.alumno_email}</p>
                  )}
                </div>
                
                <div className="pago-amount">
                  <span className="amount">{formatCurrency(pago.monto_pagado)}</span>
                  <span className="date">{formatDate(pago.fecha_pago)}</span>
                </div>
                
                <div className="pago-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => handleViewDetails(pago)}
                    disabled={loading}
                  >
                    Ver Detalles
                  </button>
                  {pago.estado_pago?.toLowerCase() === 'pendiente' && (
                    <button 
                      className="btn-warning"
                      onClick={() => handleVerificarPago(pago.id)}
                      disabled={processingPayment === pago.id}
                    >
                      {processingPayment === pago.id ? 'Verificando...' : 'Verificar'}
                    </button>
                  )}
                  {['fallido', 'rechazado'].includes(pago.estado_pago?.toLowerCase()) && (
                    <button 
                      className="btn-primary"
                      onClick={() => handleReintentarPago(pago.id)}
                      disabled={processingPayment === pago.id}
                    >
                      {processingPayment === pago.id ? 'Reintentando...' : 'Reintentar'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {showDetails && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles del Pago</h2>
              <button 
                className="modal-close"
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>Información de la Transacción</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">ID del Pago:</span>
                    <span className="value">{selectedPayment.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Código de Transacción:</span>
                    <span className="value">{selectedPayment.codigo_transaccion || selectedPayment.comprobante_numero || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Estado:</span>
                    <span 
                      className="value status"
                      style={{ color: getStatusColor(selectedPayment.estado_pago) }}
                    >
                      {selectedPayment.estado_pago?.charAt(0).toUpperCase() + selectedPayment.estado_pago?.slice(1)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Método de Pago:</span>
                    <span className="value">{selectedPayment.metodo_pago}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Fecha de Transacción:</span>
                    <span className="value">{formatDate(selectedPayment.fecha_pago)}</span>
                  </div>
                  {selectedPayment.fecha_aprobacion && (
                    <div className="detail-item">
                      <span className="label">Fecha de Aprobación:</span>
                      <span className="value">{formatDate(selectedPayment.fecha_aprobacion)}</span>
                    </div>
                  )}
                  {selectedPayment.codigo_aprobacion && (
                    <div className="detail-item">
                      <span className="label">Código de Aprobación:</span>
                      <span className="value">{selectedPayment.codigo_aprobacion}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="detail-section">
                <h3>Información del Alumno</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Nombre:</span>
                    <span className="value">{selectedPayment.alumno_nombre || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{selectedPayment.alumno_email || 'N/A'}</span>
                  </div>
                  {selectedPayment.alumno_dni && (
                    <div className="detail-item">
                      <span className="label">DNI:</span>
                      <span className="value">{selectedPayment.alumno_dni}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="detail-section">
                <h3>Información del Curso</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Curso:</span>
                    <span className="value">{selectedPayment.curso_nombre || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Precio del Curso:</span>
                    <span className="value">{formatCurrency(selectedPayment.curso_precio)}</span>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h3>Detalles Financieros</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Monto Pagado:</span>
                    <span className="value">{formatCurrency(selectedPayment.monto_pagado)}</span>
                  </div>
                  {selectedPayment.comision && (
                    <div className="detail-item">
                      <span className="label">Comisión:</span>
                      <span className="value">{formatCurrency(selectedPayment.comision)}</span>
                    </div>
                  )}
                  {selectedPayment.monto_neto && (
                    <div className="detail-item">
                      <span className="label">Monto Neto:</span>
                      <span className="value">{formatCurrency(selectedPayment.monto_neto)}</span>
                    </div>
                  )}
                  {selectedPayment.comprobante_url && (
                    <div className="detail-item">
                      <span className="label">Comprobante:</span>
                      <span className="value">
                        <a href={selectedPayment.comprobante_url} target="_blank" rel="noopener noreferrer">
                          Ver comprobante
                        </a>
                      </span>
                    </div>
                  )}
                  {selectedPayment.observaciones && (
                    <div className="detail-item">
                      <span className="label">Observaciones:</span>
                      <span className="value">{selectedPayment.observaciones}</span>
                    </div>
                  )}
                  {selectedPayment.procesado_por_nombre && (
                    <div className="detail-item">
                      <span className="label">Procesado por:</span>
                      <span className="value">{selectedPayment.procesado_por_nombre}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagos;