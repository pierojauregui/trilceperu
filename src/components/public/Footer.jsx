import React from 'react';
import './Footer.css';
import logo from '/images/trilce_peru.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Sección principal del footer */}
        <div className="footer-main">
          {/* Logo y descripción */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={logo} alt="TRILCE PERÚ" className="footer-logo-image" />
            </div>
            <p className="footer-description">
              Plataforma educativa líder en Perú, comprometida con la excelencia académica 
              y el desarrollo integral de nuestros estudiantes.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">
                <i className='bx bxl-facebook'></i>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <i className='bx bxl-instagram'></i>
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <i className='bx bxl-youtube'></i>
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <i className='bx bxl-linkedin'></i>
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="footer-links">
            <h4>Enlaces Rápidos</h4>
            <ul>
              
              <li><a href="/acerca-de-nosotros">Acerca de Nosotros</a></li>
              <li><a href="/trabaja-con-nosotros">Trabaja con Nosotros</a></li>
              <li><a href="/contacto">Contacto</a></li>
              
            </ul>
          </div>

         

          {/* Información legal */}
          <div className="footer-links">
            <h4>Información Legal</h4>
            <ul>
              <li><a href="/terminos-condiciones">Términos y Condiciones</a></li>
              <li><a href="/politica-privacidad">Política de Privacidad</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="footer-contact">
            <h4>Contacto</h4>
            <div className="contact-info">
              <div className="contact-item-footer">
                <i className='bx bx-phone'></i>
                <span>(01) 619-9000</span>
              </div>
              <div className="contact-item-footer">
                <i className='bx bx-envelope'></i>
                <span>informes@trilce.edu.pe</span>
              </div>
              <div className="contact-item-footer">
                <i className='bx bx-map'></i>
                <span>Lima, Perú</span>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="footer-divider"></div>

        {/* Copyright */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>
              © {currentYear} <strong>TRILCE PERÚ</strong> - TODOS LOS DERECHOS RESERVADOS
            </p>
          </div>
          <div className="footer-legal-links">
            <a href="/libro-reclamaciones" className="legal-link">
              <i className='bx bx-book'></i>
              Libro de Reclamaciones
            </a>
          
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;