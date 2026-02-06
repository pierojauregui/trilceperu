import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../shared/Navbar';
import Footer from './Footer';
import './LegalPages.css';

const PoliticaPrivacidad = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="legal-page-container">
      <Navbar />
      
      <main className="legal-page-main">
        <div className="legal-page-header">
          <div className="header-decoration">
            <div className="decoration-dot dot-1"></div>
            <div className="decoration-dot dot-2"></div>
            <div className="decoration-dot dot-3"></div>
          </div>
          <div className="header-content">
            <div className="header-icon">
              <i className='bx bx-shield-check'></i>
            </div>
            <h1 className="legal-page-title">Política de Privacidad</h1>
            <p className="legal-page-subtitle">
              Protegemos tu información personal con los más altos estándares de seguridad
            </p>
            <button onClick={handleBackToHome} className="back-home-btn">
              <i className='bx bx-arrow-back'></i>
              Volver al Inicio
            </button>
          </div>
        </div>

        <div className="legal-page-content">
          <div className="legal-section">
            <div className="section-header">
              <i className='bx bx-info-circle section-icon'></i>
              <h2>1. Introducción</h2>
            </div>
            <div className="section-content">
              <p>
                En nuestra plataforma de cursos online, valoramos y respetamos su privacidad. Esta Política 
                de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos su información 
                personal cuando utiliza nuestros servicios educativos.
              </p>
              <p>
                Al acceder y utilizar nuestra plataforma, usted acepta las prácticas descritas en esta política. 
                Si no está de acuerdo con algún aspecto de esta política, le recomendamos que no utilice nuestros servicios.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <i className='bx bx-data section-icon'></i>
              <h2>2. Información que Recopilamos</h2>
            </div>
            <div className="section-content">
              <div className="subsection-cards">
                <div className="subsection-card">
                  <div className="card-header-legal">
                    <i className='bx bx-user'></i>
                    <h3>2.1 Información Personal Directa</h3>
                  </div>
                  <ul className="responsibility-list">
                    <li><i className='bx bx-check-circle'></i>Nombre completo y datos de identificación</li>
                    <li><i className='bx bx-check-circle'></i>Dirección de correo electrónico</li>
                    <li><i className='bx bx-check-circle'></i>Número de teléfono y dirección postal</li>
                    <li><i className='bx bx-check-circle'></i>Información de facturación y pago</li>
                    <li><i className='bx bx-check-circle'></i>Preferencias educativas y de comunicación</li>
                  </ul>
                </div>

                <div className="subsection-card">
                  <div className="card-header-legal">
                    <i className='bx bx-cog'></i>
                    <h3>2.2 Información Técnica Automática</h3>
                  </div>
                  <ul className="responsibility-list">
                    <li><i className='bx bx-check-circle'></i>Dirección IP y ubicación geográfica aproximada</li>
                    <li><i className='bx bx-check-circle'></i>Tipo de navegador y sistema operativo</li>
                    <li><i className='bx bx-check-circle'></i>Páginas visitadas y tiempo de navegación</li>
                    <li><i className='bx bx-check-circle'></i>Cookies y tecnologías de seguimiento</li>
                    <li><i className='bx bx-check-circle'></i>Progreso en cursos y actividades realizadas</li>
                  </ul>
                </div>

                <div className="subsection-card">
                  <div className="card-header-legal">
                    <i className='bx bx-group'></i>
                    <h3>2.3 Información de Terceros</h3>
                  </div>
                  <ul className="responsibility-list">
                    <li><i className='bx bx-check-circle'></i>Datos de redes sociales (si autoriza la conexión)</li>
                    <li><i className='bx bx-check-circle'></i>Información de socios comerciales</li>
                    <li><i className='bx bx-check-circle'></i>Referencias y recomendaciones</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <i className='bx bx-target-lock section-icon'></i>
              <h2>3. Cómo Utilizamos su Información</h2>
            </div>
            <div className="section-content">
              <div className="subsection-cards">
                <div className="subsection-card">
                  <div className="card-header-legal">
                    <i className='bx bx-bullseye'></i>
                    <h3>3.1 Propósitos Principales</h3>
                  </div>
                  <ul className="responsibility-list">
                    <li><i className='bx bx-check-circle'></i>Proporcionar acceso a cursos y contenido educativo</li>
                    <li><i className='bx bx-check-circle'></i>Procesar pagos y gestionar suscripciones</li>
                    <li><i className='bx bx-check-circle'></i>Brindar soporte técnico y atención al cliente</li>
                    <li><i className='bx bx-check-circle'></i>Personalizar la experiencia de aprendizaje</li>
                    <li><i className='bx bx-check-circle'></i>Emitir certificados y credenciales</li>
                  </ul>
                </div>

                <div className="subsection-card">
                  <div className="card-header-legal">
                    <i className='bx bx-chart'></i>
                    <h3>3.2 Propósitos Secundarios</h3>
                  </div>
                  <ul className="responsibility-list">
                    <li><i className='bx bx-check-circle'></i>Enviar comunicaciones promocionales y educativas</li>
                    <li><i className='bx bx-check-circle'></i>Realizar análisis y mejoras de la plataforma</li>
                    <li><i className='bx bx-check-circle'></i>Prevenir fraudes y garantizar la seguridad</li>
                    <li><i className='bx bx-check-circle'></i>Cumplir con obligaciones legales y regulatorias</li>
                  </ul>
                </div>
              </div>

              <div className="legal-highlight">
                <p>
                  <i className='bx bx-info-circle'></i>
                  <strong>Base Legal:</strong> Procesamos su información basándonos en su consentimiento, 
                  la ejecución de contratos, intereses legítimos y cumplimiento de obligaciones legales.
                </p>
              </div>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <i className='bx bx-share-alt section-icon'></i>
              <h2>4. Compartir Información</h2>
            </div>
            <div className="section-content">
              <div className="subsection-cards">
                <div className="subsection-card">
                  <div className="card-header-legal">
                    <i className='bx bx-time'></i>
                    <h3>4.1 Cuándo Compartimos Información</h3>
                  </div>
                  <ul className="responsibility-list">
                    <li><i className='bx bx-check-circle'></i>Con su consentimiento explícito</li>
                    <li><i className='bx bx-check-circle'></i>Para cumplir con obligaciones legales</li>
                    <li><i className='bx bx-check-circle'></i>Con proveedores de servicios autorizados</li>
                    <li><i className='bx bx-check-circle'></i>En caso de fusión o adquisición empresarial</li>
                    <li><i className='bx bx-check-circle'></i>Para proteger derechos y seguridad</li>
                  </ul>
                </div>

                <div className="subsection-card">
                  <div className="card-header-legal">
                    <i className='bx bx-shield'></i>
                    <h3>4.2 Terceros de Confianza</h3>
                  </div>
                  <ul className="responsibility-list">
                    <li><i className='bx bx-check-circle'></i>Procesadores de pagos seguros</li>
                    <li><i className='bx bx-check-circle'></i>Servicios de hosting y almacenamiento en la nube</li>
                    <li><i className='bx bx-check-circle'></i>Herramientas de análisis y marketing</li>
                    <li><i className='bx bx-check-circle'></i>Servicios de comunicación y soporte</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <i className='bx bx-lock-alt section-icon'></i>
              <h2>5. Seguridad de Datos</h2>
            </div>
            <div className="section-content">
              <div className="subsection-cards">
                <div className="subsection-card">
                  <div className="card-header-legal">
                    <i className='bx bx-chip'></i>
                    <h3>5.1 Medidas Técnicas de Seguridad</h3>
                  </div>
                  <ul className="responsibility-list">
                    <li><i className='bx bx-check-circle'></i>Cifrado SSL/TLS para transmisión de datos</li>
                    <li><i className='bx bx-check-circle'></i>Cifrado de datos almacenados</li>
                    <li><i className='bx bx-check-circle'></i>Firewalls y sistemas de detección de intrusos</li>
                    <li><i className='bx bx-check-circle'></i>Autenticación multifactor</li>
                    <li><i className='bx bx-check-circle'></i>Copias de seguridad regulares y seguras</li>
                  </ul>
                </div>

                <div className="subsection-card">
                  <div className="card-header-legal">
                    <i className='bx bx-group'></i>
                    <h3>5.2 Medidas Organizacionales</h3>
                  </div>
                  <ul className="responsibility-list">
                    <li><i className='bx bx-check-circle'></i>Acceso limitado basado en roles y necesidades</li>
                    <li><i className='bx bx-check-circle'></i>Capacitación regular del personal en seguridad</li>
                    <li><i className='bx bx-check-circle'></i>Políticas estrictas de manejo de datos</li>
                    <li><i className='bx bx-check-circle'></i>Auditorías de seguridad periódicas</li>
                    <li><i className='bx bx-check-circle'></i>Planes de respuesta a incidentes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <i className='bx bx-user-check section-icon'></i>
              <h2>6. Sus Derechos</h2>
            </div>
            <div className="section-content">
              <div className="subsection-cards">
                <div className="subsection-card">
                  <div className="card-header-legal">
                    <i className='bx bx-list-check'></i>
                    <h3>6.1 Derechos Fundamentales</h3>
                  </div>
                  <ul className="responsibility-list">
                    <li><i className='bx bx-check-circle'></i><strong>Acceso:</strong> Solicitar información sobre sus datos personales</li>
                    <li><i className='bx bx-check-circle'></i><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                    <li><i className='bx bx-check-circle'></i><strong>Supresión:</strong> Solicitar la eliminación de sus datos</li>
                    <li><i className='bx bx-check-circle'></i><strong>Portabilidad:</strong> Obtener sus datos en formato estructurado</li>
                    <li><i className='bx bx-check-circle'></i><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
                  </ul>
                </div>

                <div className="subsection-card">
                  <div className="card-header-legal">
                    <i className='bx bx-cog'></i>
                    <h3>6.2 Cómo Ejercer sus Derechos</h3>
                  </div>
                  <ul className="responsibility-list">
                    <li><i className='bx bx-check-circle'></i>Contacte a nuestro equipo de privacidad</li>
                    <li><i className='bx bx-check-circle'></i>Utilice las opciones de configuración de su cuenta</li>
                    <li><i className='bx bx-check-circle'></i>Envíe una solicitud formal por escrito</li>
                    <li><i className='bx bx-check-circle'></i>Responderemos en un plazo máximo de 30 días</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <i className='bx bx-cookie section-icon'></i>
              <h2>7. Cookies y Tecnologías de Seguimiento</h2>
            </div>
            <div className="section-content">
              <div className="subsection-cards">
                <div className="subsection-card">
                  <div className="card-header-legal">
                    <i className='bx bx-category'></i>
                    <h3>7.1 Tipos de Cookies que Utilizamos</h3>
                  </div>
                  <ul className="responsibility-list">
                    <li><i className='bx bx-check-circle'></i><strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento básico</li>
                    <li><i className='bx bx-check-circle'></i><strong>Cookies de Rendimiento:</strong> Para analizar el uso de la plataforma</li>
                    <li><i className='bx bx-check-circle'></i><strong>Cookies de Funcionalidad:</strong> Para recordar sus preferencias</li>
                    <li><i className='bx bx-check-circle'></i><strong>Cookies de Marketing:</strong> Para mostrar contenido relevante</li>
                  </ul>
                </div>

                <div className="subsection-card">
                  <div className="card-header-legal">
                    <i className='bx bx-slider-alt'></i>
                    <h3>7.2 Control de Cookies</h3>
                  </div>
                  <p>
                    Puede controlar las cookies a través de la configuración de su navegador o utilizando 
                    nuestro centro de preferencias de cookies disponible en la plataforma.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <i className='bx bx-time-five section-icon'></i>
              <h2>8. Retención de Datos</h2>
            </div>
            <div className="section-content">
              <p>
                Conservamos su información personal durante el tiempo necesario para cumplir con los 
                propósitos descritos en esta política, a menos que la ley requiera o permita un 
                período de retención más largo.
              </p>

              <div className="subsection-card">
                <div className="card-header-legal">
                  <i className='bx bx-calendar'></i>
                  <h3>8.1 Períodos de Retención</h3>
                </div>
                <ul className="responsibility-list">
                  <li><i className='bx bx-check-circle'></i><strong>Datos de Cuenta Activa:</strong> Mientras mantenga su cuenta</li>
                  <li><i className='bx bx-check-circle'></i><strong>Datos de Transacciones:</strong> 10 años (requisito legal)</li>
                  <li><i className='bx bx-check-circle'></i><strong>Datos de Marketing:</strong> Hasta que retire su consentimiento</li>
                  <li><i className='bx bx-check-circle'></i><strong>Datos de Soporte:</strong> 3 años después de la última interacción</li>
                  <li><i className='bx bx-check-circle'></i><strong>Logs de Seguridad:</strong> 1 año para fines de seguridad</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <i className='bx bx-world section-icon'></i>
              <h2>9. Transferencias Internacionales</h2>
            </div>
            <div className="section-content">
              <p>
                Sus datos pueden ser transferidos y procesados en países fuera del Perú. En tales casos, 
                implementamos salvaguardas apropiadas para proteger su información, incluyendo:
              </p>
              <ul className="responsibility-list">
                <li><i className='bx bx-check-circle'></i>Cláusulas contractuales estándar aprobadas</li>
                <li><i className='bx bx-check-circle'></i>Certificaciones de adecuación de protección de datos</li>
                <li><i className='bx bx-check-circle'></i>Medidas de seguridad técnicas y organizacionales</li>
              </ul>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <i className='bx bx-child section-icon'></i>
              <h2>10. Menores de Edad</h2>
            </div>
            <div className="section-content">
              <p>
                Nuestros servicios están dirigidos a usuarios mayores de 13 años. Si un menor de 13 años 
                ha proporcionado información personal sin el consentimiento parental, los padres pueden 
                contactarnos para solicitar la eliminación de dicha información.
              </p>

              <div className="legal-highlight">
                <p>
                  <i className='bx bx-shield-alt-2'></i>
                  <strong>Protección Especial:</strong> Aplicamos medidas adicionales de protección 
                  para usuarios menores de 18 años.
                </p>
              </div>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <i className='bx bx-edit section-icon'></i>
              <h2>11. Cambios a esta Política</h2>
            </div>
            <div className="section-content">
              <p>
                Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos sobre 
                cambios significativos a través de:
              </p>
              <ul className="responsibility-list">
                <li><i className='bx bx-check-circle'></i>Notificación por correo electrónico</li>
                <li><i className='bx bx-check-circle'></i>Aviso prominente en nuestra plataforma</li>
                <li><i className='bx bx-check-circle'></i>Notificación push (si está habilitada)</li>
              </ul>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <i className='bx bx-building section-icon'></i>
              <h2>12. Autoridad de Control</h2>
            </div>
            <div className="section-content">
              <p>
                Si considera que hemos procesado sus datos personales de manera incorrecta, puede 
                presentar una queja ante la Autoridad Nacional de Protección de Datos Personales 
                del Ministerio de Justicia y Derechos Humanos del Perú.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <i className='bx bx-phone section-icon'></i>
              <h2>13. Contacto</h2>
            </div>
            <div className="section-content">
              <p>
                Si tiene preguntas sobre esta Política de Privacidad o sobre el tratamiento de sus 
                datos personales, puede contactarnos a través de:
              </p>

              <div className="contact-grid">
                <div className="contact-card">
                  <div className="contact-icon">
                    <i className='bx bx-envelope'></i>
                  </div>
                  <div className="contact-info">
                    <h4>Correo Electrónico</h4>
                    <p>privacidad@plataformacursos.com</p>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="contact-icon">
                    <i className='bx bx-phone'></i>
                  </div>
                  <div className="contact-info">
                    <h4>Teléfono</h4>
                    <p>+51 1 234-5678</p>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="contact-icon">
                    <i className='bx bx-map'></i>
                  </div>
                  <div className="contact-info">
                    <h4>Dirección</h4>
                    <p>Av. Javier Prado Este 123<br />San Isidro, Lima, Perú</p>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="contact-icon">
                    <i className='bx bx-time'></i>
                  </div>
                  <div className="contact-info">
                    <h4>Horario de Atención</h4>
                    <p>Lunes a Viernes<br />9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="legal-highlight">
                <p>
                  <i className='bx bx-shield-alt-2'></i>
                  <strong>Delegado de Protección de Datos:</strong> Para consultas específicas sobre 
                  protección de datos, contacte a nuestro DPO en dpo@plataformacursos.com
                </p>
              </div>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <i className='bx bx-calendar-check section-icon'></i>
              <h2>14. Fecha de Vigencia</h2>
            </div>
            <div className="section-content">
              <div className="effective-date-card">
                <div className="date-icon">
                  <i className='bx bx-calendar'></i>
                </div>
                <div className="date-content">
                  <h3>Política Vigente</h3>
                  <p className="date-text">Esta Política de Privacidad entró en vigencia el <strong>1 de enero de 2024</strong></p>
                  <p className="update-text">Última actualización: <strong>15 de marzo de 2024</strong></p>
                </div>
              </div>

              <div className="legal-highlight">
                <p>
                  <i className='bx bx-info-circle'></i>
                  <strong>Versión:</strong> 2.1 - Revisamos y actualizamos esta política regularmente 
                  para asegurar su cumplimiento con las leyes vigentes y mejores prácticas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PoliticaPrivacidad;