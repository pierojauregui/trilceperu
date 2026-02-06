import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../shared/Navbar';
import Footer from './Footer';
import './LegalPages.css';

const TerminosCondiciones = () => {
  const navigate = useNavigate();

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
          <span>Términos y Condiciones</span>
        </div>

        {/* Header */}
        <div className="legal-page-header">
          <div className="header-icon">
            <i className='bx bx-shield-check'></i>
          </div>
          <h1>Términos y Condiciones</h1>
          <p>Conoce los términos que rigen el uso de nuestra plataforma educativa</p>
          <div className="header-decoration">
            <div className="decoration-circle"></div>
            <div className="decoration-circle"></div>
            <div className="decoration-circle"></div>
          </div>
        </div>

        {/* Content */}
        <div className="legal-page-content slide-up">
          <div className="legal-section">
            <div className="section-header">
              <div className="section-icon">
                <i className='bx bx-info-circle'></i>
              </div>
              <h2>1. Información General</h2>
            </div>
            <p>
              Bienvenido a TRILCE PERÚ, la plataforma educativa líder en el país. Estos términos y condiciones 
              regulan el uso de nuestros servicios educativos digitales, cursos en línea y todas las 
              funcionalidades disponibles en nuestra plataforma.
            </p>
            <p>
              Al acceder y utilizar nuestros servicios, usted acepta estar sujeto a estos términos y condiciones. 
              Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
            </p>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <div className="section-icon">
                <i className='bx bx-book-open'></i>
              </div>
              <h2>2. Definiciones</h2>
            </div>
            <p>Para efectos de estos términos, se entiende por:</p>
            <div className="definitions-grid">
              <div className="definition-card">
                <div className="definition-icon">
                  <i className='bx bx-desktop'></i>
                </div>
                <h4>"Plataforma"</h4>
                <p>El sitio web y aplicaciones de TRILCE PERÚ</p>
              </div>
              <div className="definition-card">
                <div className="definition-icon">
                  <i className='bx bx-user'></i>
                </div>
                <h4>"Usuario"</h4>
                <p>Cualquier persona que acceda a nuestros servicios</p>
              </div>
              <div className="definition-card">
                <div className="definition-icon">
                  <i className='bx bx-graduation'></i>
                </div>
                <h4>"Estudiante"</h4>
                <p>Usuario registrado que accede a contenido educativo</p>
              </div>
              <div className="definition-card">
                <div className="definition-icon">
                  <i className='bx bx-chalkboard'></i>
                </div>
                <h4>"Profesor"</h4>
                <p>Usuario autorizado para crear y gestionar cursos</p>
              </div>
              <div className="definition-card">
                <div className="definition-icon">
                  <i className='bx bx-file-doc'></i>
                </div>
                <h4>"Contenido"</h4>
                <p>Material educativo, videos, documentos y recursos disponibles</p>
              </div>
              <div className="definition-card">
                <div className="definition-icon">
                  <i className='bx bx-cog'></i>
                </div>
                <h4>"Servicios"</h4>
                <p>Todas las funcionalidades ofrecidas por la plataforma</p>
              </div>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <div className="section-icon">
                <i className='bx bx-user-plus'></i>
              </div>
              <h2>3. Registro y Cuenta de Usuario</h2>
            </div>
            
            <div className="subsection-card">
              <h3><i className='bx bx-check-circle'></i> 3.1 Requisitos de Registro</h3>
              <p>
                Para acceder a nuestros servicios, debe crear una cuenta proporcionando información veraz, 
                actual y completa. Es responsable de mantener la confidencialidad de sus credenciales de acceso.
              </p>
            </div>
            
            <div className="subsection-card">
              <h3><i className='bx bx-shield-alt-2'></i> 3.2 Responsabilidades del Usuario</h3>
              <div className="responsibility-list">
                <div className="responsibility-item">
                  <i className='bx bx-check'></i>
                  <span>Proporcionar información personal veraz y actualizada</span>
                </div>
                <div className="responsibility-item">
                  <i className='bx bx-check'></i>
                  <span>Mantener la seguridad de su cuenta y contraseña</span>
                </div>
                <div className="responsibility-item">
                  <i className='bx bx-check'></i>
                  <span>Notificar inmediatamente cualquier uso no autorizado</span>
                </div>
                <div className="responsibility-item">
                  <i className='bx bx-check'></i>
                  <span>Cumplir con todas las políticas de la plataforma</span>
                </div>
              </div>
            </div>

            <div className="legal-highlight enhanced-highlight">
              <div className="highlight-icon">
                <i className='bx bx-info-circle'></i>
              </div>
              <div className="highlight-content">
                <strong>Importante:</strong> Usted es responsable de todas las actividades que ocurran 
                bajo su cuenta, independientemente de si fueron autorizadas por usted.
              </div>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <div className="section-icon">
                <i className='bx bx-graduation'></i>
              </div>
              <h2>4. Servicios Educativos</h2>
            </div>
            
            <div className="subsection-card">
              <h3><i className='bx bx-book-open'></i> 4.1 Acceso a Cursos</h3>
              <p>
                TRILCE PERÚ ofrece cursos digitales para diferentes niveles educativos. El acceso a los cursos 
                está sujeto al pago de las tarifas correspondientes y al cumplimiento de los requisitos específicos.
              </p>
            </div>

            <div className="subsection-card">
              <h3><i className='bx bx-video'></i> 4.2 Contenido Educativo</h3>
              <p>
                Nuestro contenido educativo incluye videos, materiales de lectura, ejercicios interactivos, 
                evaluaciones y recursos complementarios. Todo el contenido está protegido por derechos de autor.
              </p>
            </div>

            <div className="subsection-card">
              <h3><i className='bx bx-award'></i> 4.3 Certificaciones</h3>
              <p>
                Los certificados se otorgan únicamente a estudiantes que completen satisfactoriamente los 
                requisitos del curso, incluyendo evaluaciones y proyectos asignados.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <div className="section-icon">
                <i className='bx bx-credit-card'></i>
              </div>
              <h2>5. Pagos y Facturación</h2>
            </div>
            
            <div className="subsection-card">
              <h3><i className='bx bx-dollar-circle'></i> 5.1 Tarifas</h3>
              <p>
                Las tarifas de nuestros cursos se muestran claramente en la plataforma. Todos los precios 
                incluyen los impuestos aplicables según la legislación peruana.
              </p>
            </div>

            <div className="subsection-card">
              <h3><i className='bx bx-wallet'></i> 5.2 Métodos de Pago</h3>
              <p>Aceptamos los siguientes métodos de pago:</p>
              <div className="payment-methods">
                <div className="payment-item">
                  <i className='bx bx-credit-card'></i>
                  <span>Tarjetas de crédito y débito (Visa, Mastercard)</span>
                </div>
                <div className="payment-item">
                  <i className='bx bx-transfer'></i>
                  <span>Transferencias bancarias</span>
                </div>
                <div className="payment-item">
                  <i className='bx bx-money'></i>
                  <span>Pagos en efectivo en puntos autorizados</span>
                </div>
                <div className="payment-item">
                  <i className='bx bx-mobile'></i>
                  <span>Billeteras digitales (Yape, Plin)</span>
                </div>
              </div>
            </div>

            <div className="subsection-card">
              <h3><i className='bx bx-undo'></i> 5.3 Política de Reembolsos</h3>
              <p>
                Los reembolsos se procesarán según nuestra política específica, disponible en la sección 
                de ayuda de la plataforma. Generalmente, se permite la cancelación dentro de los primeros 
                7 días del curso.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <div className="section-icon">
                <i className='bx bx-copyright'></i>
              </div>
              <h2>6. Propiedad Intelectual</h2>
            </div>
            <p>
              Todo el contenido disponible en la plataforma, incluyendo textos, imágenes, videos, audio, 
              software y otros materiales, es propiedad de TRILCE PERÚ o de sus licenciantes y está 
              protegido por las leyes de propiedad intelectual.
            </p>

            <div className="subsection-card">
              <h3><i className='bx bx-check-circle'></i> 6.1 Uso Permitido</h3>
              <div className="permission-list">
                <div className="permission-item">
                  <i className='bx bx-check'></i>
                  <span>Acceso personal y no comercial al contenido</span>
                </div>
                <div className="permission-item">
                  <i className='bx bx-check'></i>
                  <span>Descarga temporal para uso offline (donde esté disponible)</span>
                </div>
                <div className="permission-item">
                  <i className='bx bx-check'></i>
                  <span>Impresión de materiales para uso personal de estudio</span>
                </div>
              </div>
            </div>

            <div className="subsection-card">
              <h3><i className='bx bx-x-circle'></i> 6.2 Uso Prohibido</h3>
              <div className="prohibition-list">
                <div className="prohibition-item">
                  <i className='bx bx-x'></i>
                  <span>Reproducción, distribución o venta del contenido</span>
                </div>
                <div className="prohibition-item">
                  <i className='bx bx-x'></i>
                  <span>Modificación o creación de obras derivadas</span>
                </div>
                <div className="prohibition-item">
                  <i className='bx bx-x'></i>
                  <span>Uso comercial sin autorización expresa</span>
                </div>
                <div className="prohibition-item">
                  <i className='bx bx-x'></i>
                  <span>Ingeniería inversa del software de la plataforma</span>
                </div>
              </div>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <div className="section-icon">
                <i className='bx bx-user-check'></i>
              </div>
              <h2>7. Conducta del Usuario</h2>
            </div>
            <p>Al utilizar nuestros servicios, se compromete a:</p>
            
            <div className="conduct-rules">
              <div className="rule-item">
                <i className='bx bx-check'></i>
                <span>Respetar a otros usuarios y profesores</span>
              </div>
              <div className="rule-item">
                <i className='bx bx-check'></i>
                <span>No publicar contenido ofensivo, discriminatorio o ilegal</span>
              </div>
              <div className="rule-item">
                <i className='bx bx-check'></i>
                <span>No interferir con el funcionamiento de la plataforma</span>
              </div>
              <div className="rule-item">
                <i className='bx bx-check'></i>
                <span>No intentar acceder a cuentas de otros usuarios</span>
              </div>
              <div className="rule-item">
                <i className='bx bx-check'></i>
                <span>Cumplir con todas las leyes aplicables</span>
              </div>
            </div>

            <div className="legal-highlight enhanced-highlight">
              <div className="highlight-icon">
                <i className='bx bx-shield-alt-2'></i>
              </div>
              <div className="highlight-content">
                <strong>Política de Tolerancia Cero:</strong> Cualquier comportamiento que viole estos 
                términos puede resultar en la suspensión o terminación inmediata de su cuenta.
              </div>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <div className="section-icon">
                <i className='bx bx-shield-alt'></i>
              </div>
              <h2>8. Privacidad y Protección de Datos</h2>
            </div>
            
            <div className="subsection-card">
              <h3><i className='bx bx-data'></i> 8.1 Recopilación de Datos</h3>
              <p>
                Recopilamos información personal necesaria para brindar nuestros servicios educativos, 
                incluyendo datos de registro, progreso académico y preferencias de aprendizaje.
              </p>
            </div>
            
            <div className="subsection-card">
              <h3><i className='bx bx-lock-alt'></i> 8.2 Protección de la Información</h3>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas para proteger su información 
                personal contra acceso no autorizado, alteración, divulgación o destrucción.
              </p>
            </div>

            <div className="legal-highlight enhanced-highlight">
              <div className="highlight-icon">
                <i className='bx bx-shield-check'></i>
              </div>
              <div className="highlight-content">
                <strong>Política de Privacidad:</strong> Para información detallada sobre el tratamiento 
                de sus datos personales, consulte nuestra Política de Privacidad.
              </div>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <div className="section-icon">
                <i className='bx bx-error-circle'></i>
              </div>
              <h2>9. Limitación de Responsabilidad</h2>
            </div>
            
            <div className="subsection-card">
              <h3><i className='bx bx-info-circle'></i> 9.1 Disponibilidad del Servicio</h3>
              <p>
                Aunque nos esforzamos por mantener la plataforma disponible las 24 horas, no garantizamos 
                que el servicio esté libre de interrupciones, errores o defectos.
              </p>
            </div>
            
            <div className="subsection-card">
              <h3><i className='bx bx-shield-x'></i> 9.2 Exclusión de Garantías</h3>
              <p>
                Los servicios se proporcionan "tal como están" sin garantías de ningún tipo, ya sean 
                expresas o implícitas, incluyendo garantías de comerciabilidad o idoneidad para un propósito particular.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <div className="section-icon">
                <i className='bx bx-edit-alt'></i>
              </div>
              <h2>10. Modificaciones</h2>
            </div>
            
            <div className="subsection-card">
              <h3><i className='bx bx-refresh'></i> 10.1 Cambios en los Términos</h3>
              <p>
                TRILCE PERÚ se reserva el derecho de modificar estos términos y condiciones en cualquier momento. 
                Los cambios entrarán en vigor inmediatamente después de su publicación en la plataforma.
              </p>
            </div>
            
            <div className="subsection-card">
              <h3><i className='bx bx-bell'></i> 10.2 Notificación de Cambios</h3>
              <p>
                Le notificaremos sobre cambios significativos a través de correo electrónico o mediante 
                un aviso prominente en la plataforma.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <div className="section-icon">
                <i className='bx bx-x-circle'></i>
              </div>
              <h2>11. Terminación</h2>
            </div>
            
            <div className="subsection-card">
              <h3><i className='bx bx-user-x'></i> 11.1 Terminación por el Usuario</h3>
              <p>
                Puede terminar su cuenta en cualquier momento contactando nuestro servicio de atención al cliente 
                o utilizando las opciones disponibles en su perfil.
              </p>
            </div>
            
            <div className="subsection-card">
              <h3><i className='bx bx-block'></i> 11.2 Terminación por TRILCE PERÚ</h3>
              <p>
                Podemos suspender o terminar su cuenta si viola estos términos y condiciones o por otras 
                razones legítimas con previo aviso cuando sea posible.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <div className="section-icon">
                <i className='bx bx-balance-scale'></i>
              </div>
              <h2>12. Ley Aplicable y Jurisdicción</h2>
            </div>
            <p>
              Estos términos se rigen por las leyes de la República del Perú. Cualquier disputa será 
              resuelta en los tribunales competentes de Lima, Perú.
            </p>
          </div>

          <div className="legal-section">
            <div className="section-header">
              <div className="section-icon">
                <i className='bx bx-phone'></i>
              </div>
              <h2>13. Contacto</h2>
            </div>
            
            <div className="legal-contact-info enhanced-contact">
              <h3><i className='bx bx-support'></i> Información de Contacto</h3>
              <p>Si tiene preguntas sobre estos términos y condiciones, puede contactarnos:</p>
              
              <div className="contact-grid">
                <div className="contact-item">
                  <i className='bx bx-envelope'></i>
                  <div>
                    <strong>Email:</strong>
                    <span>legal@trilceperu.edu.pe</span>
                  </div>
                </div>
                
                <div className="contact-item">
                  <i className='bx bx-phone'></i>
                  <div>
                    <strong>Teléfono:</strong>
                    <span>+51 1 234-5678</span>
                  </div>
                </div>
                
                <div className="contact-item">
                  <i className='bx bx-map'></i>
                  <div>
                    <strong>Dirección:</strong>
                    <span>Av. Universitaria 1801, San Miguel, Lima, Perú</span>
                  </div>
                </div>
                
                <div className="contact-item">
                  <i className='bx bx-time'></i>
                  <div>
                    <strong>Horario:</strong>
                    <span>Lunes a Viernes: 8:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="legal-section final-section">
            <div className="section-header">
              <div className="section-icon">
                <i className='bx bx-calendar'></i>
              </div>
              <h2>Fecha de Vigencia</h2>
            </div>
            
            <div className="effective-date-card">
              <div className="date-icon">
                <i className='bx bx-calendar-check'></i>
              </div>
              <div className="date-content">
                <h3>Última Actualización</h3>
                <p>Estos términos y condiciones fueron actualizados por última vez el <strong>15 de enero de 2024</strong></p>
                <p>Al continuar utilizando nuestros servicios después de esta fecha, usted acepta estar sujeto a estos términos actualizados.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TerminosCondiciones;