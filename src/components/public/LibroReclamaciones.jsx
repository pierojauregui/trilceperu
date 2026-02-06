import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../shared/Navbar';
import Footer from './Footer';
import './LegalPages.css';

const LibroReclamaciones = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tipoDocumento: '',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    email: '',
    direccion: '',
    tipoConsumidor: '',
    tipoReclamo: '',
    montoReclamado: '',
    descripcionBien: '',
    detalleReclamo: '',
    pedidoConsumidor: '',
    fechaIncidente: ''
  });

  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí se enviaría el formulario al backend
    console.log('Formulario de reclamo enviado:', formData);
    setSubmitted(true);
    setShowForm(false);
  };

  return (
    <div className="legal-page-container">
      <Navbar showSearch={false} />
      
      <main className="legal-page-main fade-in">
        {/* Breadcrumb */}
        <div className="legal-breadcrumb">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            <i className='bx bx-home'></i> Inicio
          </a>
          <i className='bx bx-chevron-right'></i>
          <span>Libro de Reclamaciones</span>
        </div>

        {/* Header */}
        <div className="legal-page-header">
          <h1>Libro de Reclamaciones</h1>
          <p>Tu opinión es importante. Presenta tu reclamo o queja de manera fácil y segura</p>
        </div>

        {/* Content */}
        <div className="legal-page-content slide-up">
          {!showForm && !submitted && (
            <>
              <div className="legal-section">
                <h2>¿Qué es el Libro de Reclamaciones?</h2>
                <p>
                  El Libro de Reclamaciones es un instrumento que permite a los consumidores presentar 
                  sus reclamos y quejas sobre los productos o servicios que han adquirido. En TRILCE PERÚ, 
                  estamos comprometidos con brindar un servicio educativo de calidad y atender todas sus 
                  inquietudes de manera oportuna y eficaz.
                </p>

                <div className="legal-highlight">
                  <p>
                    <i className='bx bx-info-circle'></i>
                    <strong>Marco Legal:</strong> Este libro se encuentra regulado por el Código de 
                    Protección y Defensa del Consumidor (Ley N° 29571) y su Reglamento.
                  </p>
                </div>
              </div>

              <div className="legal-section">
                <h2>Diferencia entre Queja y Reclamo</h2>
                <div className="complaint-types">
                  <div className="complaint-type">
                    <div className="complaint-icon">
                      <i className='bx bx-message-square-detail'></i>
                    </div>
                    <h3>Queja</h3>
                    <p>
                      Manifestación de insatisfacción no relacionada con los productos o servicios, 
                      sino con la atención al público, horarios de atención, o aspectos similares.
                    </p>
                  </div>
                  <div className="complaint-type">
                    <div className="complaint-icon">
                      <i className='bx bx-error-circle'></i>
                    </div>
                    <h3>Reclamo</h3>
                    <p>
                      Manifestación de insatisfacción relacionada con los productos o servicios 
                      adquiridos, solicitando una solución o resarcimiento.
                    </p>
                  </div>
                </div>
              </div>

              <div className="legal-section">
                <h2>Nuestro Compromiso</h2>
                <div className="commitment-grid">
                  <div className="commitment-item">
                    <i className='bx bx-time-five'></i>
                    <h4>Respuesta Rápida</h4>
                    <p>Responderemos a tu reclamo en un máximo de 30 días calendario</p>
                  </div>
                  <div className="commitment-item">
                    <i className='bx bx-shield-check'></i>
                    <h4>Proceso Transparente</h4>
                    <p>Mantendremos informado sobre el estado de tu reclamo</p>
                  </div>
                  <div className="commitment-item">
                    <i className='bx bx-user-check'></i>
                    <h4>Atención Personalizada</h4>
                    <p>Un especialista se encargará de tu caso específico</p>
                  </div>
                  <div className="commitment-item">
                    <i className='bx bx-check-circle'></i>
                    <h4>Solución Efectiva</h4>
                    <p>Buscaremos la mejor solución para tu situación</p>
                  </div>
                </div>
              </div>

              <div className="legal-section">
                <h2>Información Importante</h2>
                <div className="info-boxes">
                  <div className="info-box warning">
                    <i className='bx bx-info-circle'></i>
                    <h4>Requisitos</h4>
                    <ul>
                      <li>Ser mayor de edad o contar con representación legal</li>
                      <li>Haber adquirido productos o servicios de TRILCE PERÚ</li>
                      <li>Proporcionar información veraz y completa</li>
                      <li>Adjuntar documentos de respaldo cuando sea necesario</li>
                    </ul>
                  </div>
                  <div className="info-box success">
                    <i className='bx bx-check-shield'></i>
                    <h4>Tus Derechos</h4>
                    <ul>
                      <li>Recibir atención oportuna y eficaz</li>
                      <li>Obtener respuesta por escrito</li>
                      <li>Ser informado sobre el estado de tu reclamo</li>
                      <li>Recibir una solución justa y adecuada</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="legal-section">
                <h2>Canales de Atención</h2>
                <p>Además del presente formulario, puedes contactarnos a través de:</p>
                <div className="contact-channels">
                  <div className="channel">
                    <i className='bx bx-phone'></i>
                    <div>
                      <h4>Teléfono</h4>
                      <p>(01) 619-9000</p>
                      <small>Lunes a Viernes: 8:00 AM - 8:00 PM<br/>Sábados: 8:00 AM - 1:00 PM</small>
                    </div>
                  </div>
                  <div className="channel">
                    <i className='bx bx-envelope'></i>
                    <div>
                      <h4>Correo Electrónico</h4>
                      <p>reclamos@trilce.edu.pe</p>
                      <small>Respuesta en 24 horas</small>
                    </div>
                  </div>
                  <div className="channel">
                    <i className='bx bx-map'></i>
                    <div>
                      <h4>Oficina Principal</h4>
                      <p>Av. República de Panamá 3145<br/>San Isidro, Lima</p>
                      <small>Lunes a Viernes: 9:00 AM - 6:00 PM</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-action-section">
                <button 
                  className="complaint-form-btn"
                  onClick={() => setShowForm(true)}
                >
                  <i className='bx bx-edit'></i>
                  Presentar Reclamo o Queja
                </button>
              </div>
            </>
          )}

          {showForm && (
            <div className="complaint-form-section">
              <h2><i className='bx bx-edit'></i> Formulario de Reclamo</h2>
              <p>Complete todos los campos requeridos para procesar su reclamo de manera eficiente.</p>
              
              <form onSubmit={handleSubmit} className="complaint-form">
                <div className="form-section">
                  <h3>Datos del Consumidor</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tipo de Documento *</label>
                      <select 
                        name="tipoDocumento" 
                        value={formData.tipoDocumento}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccione...</option>
                        <option value="DNI">DNI</option>
                        <option value="CE">Carné de Extranjería</option>
                        <option value="Pasaporte">Pasaporte</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Número de Documento *</label>
                      <input 
                        type="text" 
                        name="numeroDocumento"
                        value={formData.numeroDocumento}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombres *</label>
                      <input 
                        type="text" 
                        name="nombres"
                        value={formData.nombres}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Apellidos *</label>
                      <input 
                        type="text" 
                        name="apellidos"
                        value={formData.apellidos}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Teléfono *</label>
                      <input 
                        type="tel" 
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Correo Electrónico *</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Dirección *</label>
                    <input 
                      type="text" 
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Tipo de Consumidor *</label>
                    <select 
                      name="tipoConsumidor"
                      value={formData.tipoConsumidor}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccione...</option>
                      <option value="Estudiante">Estudiante</option>
                      <option value="Padre de Familia">Padre de Familia</option>
                      <option value="Profesor">Profesor</option>
                      <option value="Institución Educativa">Institución Educativa</option>
                    </select>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Detalle del Reclamo</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tipo *</label>
                      <select 
                        name="tipoReclamo"
                        value={formData.tipoReclamo}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccione...</option>
                        <option value="Reclamo">Reclamo</option>
                        <option value="Queja">Queja</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fecha del Incidente *</label>
                      <input 
                        type="date" 
                        name="fechaIncidente"
                        value={formData.fechaIncidente}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Monto Reclamado (si aplica)</label>
                    <input 
                      type="number" 
                      name="montoReclamado"
                      value={formData.montoReclamado}
                      onChange={handleInputChange}
                      placeholder="S/. 0.00"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label>Descripción del Bien o Servicio *</label>
                    <textarea 
                      name="descripcionBien"
                      value={formData.descripcionBien}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Describa el curso, servicio o producto relacionado con su reclamo"
                      required
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Detalle del Reclamo o Queja *</label>
                    <textarea 
                      name="detalleReclamo"
                      value={formData.detalleReclamo}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Describa detalladamente su reclamo o queja"
                      required
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Pedido del Consumidor *</label>
                    <textarea 
                      name="pedidoConsumidor"
                      value={formData.pedidoConsumidor}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Indique qué solución espera recibir"
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    <i className='bx bx-arrow-back'></i>
                    Volver
                  </button>
                  <button type="submit" className="btn-primary">
                    <i className='bx bx-send'></i>
                    Enviar Reclamo
                  </button>
                </div>
              </form>
            </div>
          )}

          {submitted && (
            <div className="success-message">
              <div className="success-icon">
                <i className='bx bx-check-circle'></i>
              </div>
              <h2>¡Reclamo Enviado Exitosamente!</h2>
              <p>
                Su reclamo ha sido registrado con el número <strong>REC-{Date.now()}</strong>. 
                Recibirá una respuesta en un máximo de 30 días calendario.
              </p>
              <div className="success-actions">
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      tipoDocumento: '',
                      numeroDocumento: '',
                      nombres: '',
                      apellidos: '',
                      telefono: '',
                      email: '',
                      direccion: '',
                      tipoConsumidor: '',
                      tipoReclamo: '',
                      montoReclamado: '',
                      descripcionBien: '',
                      detalleReclamo: '',
                      pedidoConsumidor: '',
                      fechaIncidente: ''
                    });
                  }}
                >
                  <i className='bx bx-plus'></i>
                  Nuevo Reclamo
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => navigate('/')}
                >
                  <i className='bx bx-home'></i>
                  Ir al Inicio
                </button>
              </div>
            </div>
          )}

          <div className="legal-contact-info">
            <h3><i className='bx bx-support'></i>Información de Contacto</h3>
            <div className="contact-item">
              <i className='bx bx-envelope'></i>
              <span>reclamos@trilce.edu.pe</span>
            </div>
            <div className="contact-item">
              <i className='bx bx-phone'></i>
              <span>(01) 619-9000</span>
            </div>
            <div className="contact-item">
              <i className='bx bx-map'></i>
              <span>Av. República de Panamá 3145, San Isidro, Lima</span>
            </div>
            <div className="contact-item">
              <i className='bx bx-time'></i>
              <span>Horario: Lunes a Viernes 8:00 AM - 8:00 PM</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LibroReclamaciones;