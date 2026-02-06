import { useState } from 'react';
import './ProcesarPago.css';
import 'boxicons/css/boxicons.min.css';

const ProcesarPago = ({ setCurrentSection }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    estudiante: '',
    curso: '',
    monto: '',
    concepto: 'matricula',
    metodoPago: '',
    numeroTarjeta: '',
    nombreTitular: '',
    fechaVencimiento: '',
    cvv: '',
    numeroYape: '',
    numeroPlin: '',
    bancoCuenta: '',
    numeroCuenta: '',
    codigoTransaccion: '',
    codigoAprobacion: ''
  });

  const estudiantes = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@email.com' },
    { id: 2, nombre: 'María García', email: 'maria@email.com' },
    { id: 3, nombre: 'Carlos López', email: 'carlos@email.com' }
  ];

  const cursos = [
    { id: 1, nombre: 'Matemáticas Básicas', precio: 150 },
    { id: 2, nombre: 'Física Avanzada', precio: 200 },
    { id: 3, nombre: 'Química Orgánica', precio: 180 }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'curso') {
      const curso = cursos.find(c => c.id === (parseInt(value) || 0));
      if (curso) {
        setFormData(prev => ({ ...prev, monto: curso.precio.toString() }));
      }
    }
  };

  const calcularComision = () => {
    const monto = parseFloat(formData.monto) || 0;
    if (isNaN(monto)) return 0;
    
    switch (formData.metodoPago) {
      case 'yape':
      case 'plin':
        return monto * 0.02;
      case 'tarjeta':
        return monto * 0.035;
      case 'transferencia':
        return 5;
      default:
        return 0;
    }
  };

  const generarCodigoTransaccion = () => {
    return 'TXN' + Date.now().toString().slice(-8);
  };

  const generarCodigoAprobacion = () => {
    return 'APR' + Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      
      if (currentStep === 3) {
        setFormData(prev => ({
          ...prev,
          codigoTransaccion: generarCodigoTransaccion(),
          codigoAprobacion: generarCodigoAprobacion()
        }));
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const procesarPago = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    nextStep();
  };

  if (loading) {
    return (
      <div className="procesar-pago">
        <div className="loading">
          <i className="bx bx-loader-alt"></i>
          Procesando pago...
        </div>
      </div>
    );
  }

  return (
    <div className="procesar-pago">
      <div className="procesar-pago-header">
        <h2>Procesar Pago</h2>
        <div className="progress-bar">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className="progress-step">
              <div className={`step-circle ${
                step === currentStep ? 'active' : 
                step < currentStep ? 'completed' : ''
              }`}>
                {step < currentStep ? <i className="bx bx-check"></i> : step}
              </div>
              <div className="step-label">
                {step === 1 && 'Datos Básicos'}
                {step === 2 && 'Método de Pago'}
                {step === 3 && 'Confirmación'}
                {step === 4 && 'Resultado'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {currentStep === 1 && (
        <div className="form-section">
          <h3>Información del Pago</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Estudiante</label>
              <select 
                value={formData.estudiante} 
                onChange={(e) => handleInputChange('estudiante', e.target.value)}
              >
                <option value="">Seleccionar estudiante</option>
                {estudiantes.map(est => (
                  <option key={est.id} value={est.id}>{est.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Curso</label>
              <select 
                value={formData.curso} 
                onChange={(e) => handleInputChange('curso', e.target.value)}
              >
                <option value="">Seleccionar curso</option>
                {cursos.map(curso => (
                  <option key={curso.id} value={curso.id}>
                    {curso.nombre} - S/ {curso.precio}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Monto (S/)</label>
              <input 
                type="number" 
                value={formData.monto}
                onChange={(e) => handleInputChange('monto', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Concepto</label>
              <select 
                value={formData.concepto} 
                onChange={(e) => handleInputChange('concepto', e.target.value)}
              >
                <option value="matricula">Matrícula</option>
                <option value="mensualidad">Mensualidad</option>
                <option value="examen">Examen</option>
                <option value="certificado">Certificado</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="form-section">
          <h3>Seleccionar Método de Pago</h3>
          <div className="payment-methods">
            <div 
              className={`payment-method ${formData.metodoPago === 'yape' ? 'selected' : ''}`}
              onClick={() => handleInputChange('metodoPago', 'yape')}
            >
              <i className="bx bx-mobile"></i>
              <h4>Yape</h4>
              <p>Comisión: 2%</p>
            </div>
            <div 
              className={`payment-method ${formData.metodoPago === 'plin' ? 'selected' : ''}`}
              onClick={() => handleInputChange('metodoPago', 'plin')}
            >
              <i className="bx bx-phone"></i>
              <h4>Plin</h4>
              <p>Comisión: 2%</p>
            </div>
            <div 
              className={`payment-method ${formData.metodoPago === 'tarjeta' ? 'selected' : ''}`}
              onClick={() => handleInputChange('metodoPago', 'tarjeta')}
            >
              <i className="bx bx-credit-card"></i>
              <h4>Tarjeta</h4>
              <p>Comisión: 3.5%</p>
            </div>
            <div 
              className={`payment-method ${formData.metodoPago === 'transferencia' ? 'selected' : ''}`}
              onClick={() => handleInputChange('metodoPago', 'transferencia')}
            >
              <i className="bx bx-bank"></i>
              <h4>Transferencia</h4>
              <p>Comisión: S/ 5</p>
            </div>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="form-section">
          <h3>Confirmar Pago</h3>
          <div className="confirmation-details">
            <div className="detail-row">
                <span className="detail-label">Estudiante:</span>
                <span className="detail-value">
                  {estudiantes.find(e => e.id === (parseInt(formData.estudiante) || 0))?.nombre || 'N/A'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Curso:</span>
                <span className="detail-value">
                  {cursos.find(c => c.id === (parseInt(formData.curso) || 0))?.nombre || 'N/A'}
                </span>
              </div>
            <div className="detail-row">
              <span className="detail-label">Concepto:</span>
              <span className="detail-value">{formData.concepto}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Método de Pago:</span>
              <span className="detail-value">
                {formData.metodoPago === 'yape' && 'Yape'}
                {formData.metodoPago === 'plin' && 'Plin'}
                {formData.metodoPago === 'tarjeta' && 'Tarjeta de Crédito/Débito'}
                {formData.metodoPago === 'transferencia' && 'Transferencia Bancaria'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Subtotal:</span>
              <span className="detail-value">S/ {(parseFloat(formData.monto) || 0).toFixed(2)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Comisión:</span>
              <span className="detail-value">S/ {(calcularComision() || 0).toFixed(2)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Total:</span>
              <span className="detail-value">
                S/ {((parseFloat(formData.monto) || 0) + (calcularComision() || 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="result-section">
          <div className="result-icon success">
            <i className="bx bx-check-circle"></i>
          </div>
          <h3 className="result-title">¡Pago Procesado Exitosamente!</h3>
          <p className="result-message">
            El pago ha sido procesado y registrado en el sistema.
          </p>
          
          <div className="approval-code">
            <p><strong>Código de Transacción:</strong> {formData.codigoTransaccion}</p>
            <p><strong>Código de Aprobación:</strong> {formData.codigoAprobacion}</p>
          </div>
          
          <p className="result-message">
            Guarde estos códigos para futuras referencias.
          </p>
        </div>
      )}

      <div className="form-actions">
        {currentStep > 1 && currentStep < 4 && (
          <button className="btn btn-secondary" onClick={prevStep}>
            <i className="bx bx-chevron-left"></i>
            Anterior
          </button>
        )}
        
        {currentStep < 3 && (
          <button 
            className="btn btn-primary" 
            onClick={nextStep}
            disabled={
              (currentStep === 1 && (!formData.estudiante || !formData.curso || !formData.monto)) ||
              (currentStep === 2 && !formData.metodoPago)
            }
          >
            Siguiente
            <i className="bx bx-chevron-right"></i>
          </button>
        )}
        
        {currentStep === 3 && (
          <button className="btn btn-primary" onClick={procesarPago}>
            <i className="bx bx-credit-card"></i>
            Procesar Pago
          </button>
        )}
        
        {currentStep === 4 && (
          <>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setCurrentStep(1);
                setFormData({
                  estudiante: '', curso: '', monto: '', concepto: 'matricula',
                  metodoPago: '', numeroTarjeta: '', nombreTitular: '',
                  fechaVencimiento: '', cvv: '', numeroYape: '', numeroPlin: '',
                  bancoCuenta: '', numeroCuenta: '', codigoTransaccion: '',
                  codigoAprobacion: ''
                });
              }}
            >
              <i className="bx bx-plus"></i>
              Nuevo Pago
            </button>
            <button 
              className="btn btn-success" 
              onClick={() => setCurrentSection('pagos')}
            >
              <i className="bx bx-list-ul"></i>
              Ver Pagos
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProcesarPago;