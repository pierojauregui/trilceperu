import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../shared/Navbar';
import Footer from './Footer';
import './Contacto.css';

const Contacto = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    celular: '',
    mensaje: ''
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Validación de campos
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'nombres':
      case 'apellidos':
        if (!value.trim()) {
          newErrors[name] = 'Este campo es obligatorio';
        } else if (value.trim().length < 2) {
          newErrors[name] = 'Debe tener al menos 2 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          newErrors[name] = 'Solo se permiten letras y espacios';
        } else {
          delete newErrors[name];
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors[name] = 'El email es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[name] = 'Ingresa un email válido';
        } else {
          delete newErrors[name];
        }
        break;

      case 'celular':
        if (!value.trim()) {
          newErrors[name] = 'El celular es obligatorio';
        } else if (!/^[\+]?[0-9\s\-\(\)]{9,15}$/.test(value)) {
          newErrors[name] = 'Ingresa un celular válido';
        } else {
          delete newErrors[name];
        }
        break;

      case 'mensaje':
        if (!value.trim()) {
          newErrors[name] = 'El mensaje es obligatorio';
        } else if (value.trim().length < 10) {
          newErrors[name] = 'El mensaje debe tener al menos 10 caracteres';
        } else {
          delete newErrors[name];
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar en tiempo real
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todos los campos obligatorios
    const requiredFields = ['nombres', 'apellidos', 'email', 'celular', 'mensaje'];
    let isValid = true;

    requiredFields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    if (!isValid) {
      return;
    }

    setLoading(true);

    // Simular envío del formulario
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          nombres: '',
          apellidos: '',
          email: '',
          celular: '',
          mensaje: ''
        });
        setErrors({});
      }, 5000);
    }, 2000);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="contact-page">
      <Navbar showSearch={false} />
      
      <main className="contact-main fade-in">
        {/* Breadcrumb */}
        <div className="contact-breadcrumb">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            <i className='bx bx-home'></i> Inicio
          </a>
          <i className='bx bx-chevron-right'></i>
          <span>Contacto</span>
        </div>

        {/* Header */}
        <div className="contact-header">
          <h1>Contáctanos</h1>
          <p>Estamos aquí para ayudarte. Envíanos tu consulta y te responderemos a la brevedad</p>
        </div>

        {/* Contact Info Cards */}
        <div className="contact-info-grid slide-up">
          <div className="contact-card">
            <div className="contact-icon">
              <i className='bx bx-phone'></i>
            </div>
            <h3>Teléfono</h3>
            <p>+51 1 619-9000</p>
            <p>+51 987 654 321</p>
            <span>Lun - Vie: 8:00 AM - 6:00 PM</span>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <i className='bx bx-envelope'></i>
            </div>
            <h3>Email</h3>
            <p>informes@trilce.edu.pe</p>
            <p>soporte@trilce.edu.pe</p>
            <span>Respuesta en 24 horas</span>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <i className='bx bx-map'></i>
            </div>
            <h3>Oficina Principal</h3>
            <p>Av. Universitaria 1801</p>
            <p>San Miguel, Lima - Perú</p>
            <span>Atención presencial con cita previa</span>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <i className='bx bx-time'></i>
            </div>
            <h3>Horarios</h3>
            <p>Lunes a Viernes</p>
            <p>8:00 AM - 6:00 PM</p>
            <span>Sábados: 9:00 AM - 1:00 PM</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="contact-main-content slide-up">
          {/* Contact Form */}
          <div className="contact-form-section">
            <h2><i className='bx bx-message-dots'></i> Envíanos tu consulta</h2>
            <p>Completa el formulario y nos pondremos en contacto contigo lo antes posible.</p>

            {submitted ? (
              <div className="success-message">
                <div className="success-icon">
                  <i className='bx bx-check-circle'></i>
                </div>
                <h3>¡Mensaje enviado exitosamente!</h3>
                <p>Gracias por contactarnos. Hemos recibido tu consulta y te responderemos dentro de las próximas 24 horas.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nombres">
                      <i className='bx bx-user'></i> Nombres *
                    </label>
                    <input
                      type="text"
                      id="nombres"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleInputChange}
                      placeholder="Ingresa tus nombres"
                      className={errors.nombres ? 'error' : ''}
                    />
                    {errors.nombres && <span className="error-message">{errors.nombres}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="apellidos">
                      <i className='bx bx-user'></i> Apellidos *
                    </label>
                    <input
                      type="text"
                      id="apellidos"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleInputChange}
                      placeholder="Ingresa tus apellidos"
                      className={errors.apellidos ? 'error' : ''}
                    />
                    {errors.apellidos && <span className="error-message">{errors.apellidos}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">
                      <i className='bx bx-envelope'></i> Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="tu@email.com"
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="celular">
                      <i className='bx bx-phone'></i> Celular *
                    </label>
                    <input
                      type="tel"
                      id="celular"
                      name="celular"
                      value={formData.celular}
                      onChange={handleInputChange}
                      placeholder="+51 987 654 321"
                      className={errors.celular ? 'error' : ''}
                    />
                    {errors.celular && <span className="error-message">{errors.celular}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="mensaje">
                    <i className='bx bx-message-detail'></i> Mensaje *
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    rows="6"
                    placeholder="Describe tu consulta con el mayor detalle posible..."
                    className={errors.mensaje ? 'error' : ''}
                  ></textarea>
                  {errors.mensaje && <span className="error-message">{errors.mensaje}</span>}
                </div>

                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className='bx bx-loader-alt bx-spin'></i>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <i className='bx bx-send'></i>
                      Enviar Consulta
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Google Maps Section */}
          <div className="map-section">
            <h2><i className='bx bx-map-pin'></i> Nuestra Ubicación</h2>
            <p>Visítanos en nuestra oficina principal en San Miguel, Lima.</p>
            
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.3147405726!2d-77.08872368570615!3d-12.077498991456089!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8b5d35662c7%3A0x41d5b4d1e2b4c8a0!2sAv.%20Universitaria%201801%2C%20San%20Miguel%2015088!5e0!3m2!1ses!2spe!4v1647890123456!5m2!1ses!2spe"
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: '15px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación TRILCE PERÚ"
              ></iframe>
            </div>

            <div className="location-details">
              <div className="location-info">
                <h3><i className='bx bx-current-location'></i> Dirección Completa</h3>
                <p>
                  <strong>TRILCE PERÚ - Sede Principal</strong><br/>
                  Av. Universitaria 1801, San Miguel<br/>
                  Lima 15088, Perú
                </p>
              </div>
              
              <div className="transport-info">
                <h3><i className='bx bx-bus'></i> Cómo llegar</h3>
                <ul>
                  <li><strong>Metro de Lima:</strong> Estación Universitaria (Línea 1)</li>
                  <li><strong>Transporte público:</strong> Rutas que pasan por Av. Universitaria</li>
                  <li><strong>En auto:</strong> Estacionamiento disponible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="contact-faq">
          <div className="container">
            <div className="faq-header">
              <h2>Preguntas Frecuentes</h2>
              <p>Encuentra respuestas a las consultas más comunes sobre nuestros cursos y servicios</p>
            </div>
            <div className="faq-list">
              {[
                {
                  question: "¿Cuánto tiempo tardan en responder?",
                  answer: "Nos comprometemos a responder todas las consultas dentro de las 24 horas hábiles."
                },
                {
                  question: "¿Ofrecen soporte técnico?",
                  answer: "Sí, contamos con un equipo de soporte técnico especializado disponible de lunes a viernes."
                },
                {
                  question: "¿Puedo agendar una cita presencial?",
                  answer: "Por supuesto, puedes solicitar una cita presencial a través del formulario o llamando directamente."
                },
                {
                  question: "¿Tienen descuentos para empresas?",
                  answer: "Ofrecemos planes corporativos especiales. Contáctanos para conocer nuestras ofertas empresariales."
                }
              ].map((faq, index) => (
                <div key={index} className={`faq-item ${openFaq === index ? 'active' : ''}`}>
                  <div className="faq-question" onClick={() => toggleFaq(index)}>
                    <h3>{faq.question}</h3>
                    <i className={`bx ${openFaq === index ? 'bx-minus' : 'bx-plus'}`}></i>
                  </div>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contacto;