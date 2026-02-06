import React from 'react';
import Navbar from '../shared/Navbar';
import Footer from '../public/Footer';
import './AcercaDeNosotros.css';

const AcercaDeNosotros = () => {
  return (
    <div className="about-page">
      <Navbar />
      
      <main className="about-main">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero-content">
            <h1>Acerca de Nosotros</h1>
            <p>
              Institución líder en capacitación y desarrollo profesional para docentes 
              nombrados y contratados del Estado Peruano
            </p>
            <div className="about-stats">
              <div className="about-stat-item">
                <span className="about-stat-number">25+</span>
                <span className="about-stat-label">Años de Experiencia</span>
              </div>
              <div className="about-stat-item">
                <span className="about-stat-number">15,000+</span>
                <span className="about-stat-label">Docentes Capacitados</span>
              </div>
              <div className="about-stat-item">
                <span className="about-stat-number">200+</span>
                <span className="about-stat-label">Programas Especializados</span>
              </div>
              <div className="about-stat-item">
                <span className="about-stat-number">96%</span>
                <span className="about-stat-label">Satisfacción Docente</span>
              </div>
            </div>
          </div>
        </section>

        <div className="about-content">
          {/* Historia Section */}
          <section className="about-section">
            <h2>Nuestra Historia</h2>
            <p>
              <strong>TRILCE PERÚ</strong> nació en 1998 con la misión de fortalecer la educación 
              pública peruana a través de la capacitación continua de sus docentes. Fundada por 
              un equipo de pedagogos especializados en formación docente, nuestra institución 
              ha sido pionera en programas de desarrollo profesional para educadores del sector público.
            </p>
            <p>
              Durante más de 25 años, hemos capacitado a miles de docentes nombrados y contratados 
              que hoy lideran la transformación educativa en instituciones públicas de todo el país. 
              Nuestra evolución constante nos ha llevado a desarrollar esta plataforma digital 
              especializada, manteniendo siempre nuestro compromiso con la excelencia en la 
              formación docente.
            </p>
          </section>

          {/* Mision y Vision */}
          <section className="about-section">
            <h2>Misión y Visión</h2>
            <div className="about-mission-vision">
              <div className="about-mission">
                <div className="mission-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <h3>Nuestra Misión</h3>
                <p>
                  Fortalecer la calidad educativa del sistema público peruano mediante 
                  programas de capacitación integral, formando docentes competentes y 
                  comprometidos con la excelencia académica y el desarrollo nacional.
                </p>
              </div>
              <div className="about-vision">
                <div className="vision-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12S9.24 7 12 7S17 9.24 17 12S14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12S10.34 15 12 15S15 13.66 15 12S13.66 9 12 9Z"/>
                  </svg>
                </div>
                <h3>Nuestra Visión</h3>
                <p>
                  Ser la institución líder en formación docente para el sector público, 
                  reconocida por la excelencia de nuestros programas y el impacto positivo 
                  en la calidad educativa del Perú.
                </p>
              </div>
            </div>
          </section>

          {/* Valores */}
          <section className="about-section">
            <h2>Nuestros Valores</h2>
            <div className="about-values-grid">
              <div className="about-value-card">
                <div className="value-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <h4>Excelencia Académica</h4>
                <p>Buscamos la más alta calidad en todos nuestros programas de formación docente.</p>
              </div>
              <div className="about-value-card">
                <div className="value-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z"/>
                  </svg>
                </div>
                <h4>Compromiso Social</h4>
                <p>Nos dedicamos al fortalecimiento de la educación pública peruana.</p>
              </div>
              <div className="about-value-card">
                <div className="value-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.58 10.76C10.22 11.12 10 11.6 10 12.1V23H12V16H14V23H16V12.1C16 11.6 15.78 11.12 15.42 10.76L12.83 8.17L14.5 6.5L21 9Z"/>
                  </svg>
                </div>
                <h4>Innovación Pedagógica</h4>
                <p>Implementamos metodologías modernas adaptadas al contexto educativo peruano.</p>
              </div>
              <div className="about-value-card">
                <div className="value-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 4C18.2 4 20 5.8 20 8C20 10.2 18.2 12 16 12C13.8 12 12 10.2 12 8C12 5.8 13.8 4 16 4ZM16 14C18.39 14 23 15.21 23 17.6V20H9V17.6C9 15.21 13.61 14 16 14ZM8 12C10.21 12 12 10.21 12 8C12 5.79 10.21 4 8 4C5.79 4 4 5.79 4 8C4 10.21 5.79 12 8 12ZM8 14C5.33 14 0 15.34 0 18V20H8V17.6C8 16.5 8.45 15.6 9.22 14.94C8.87 14.31 8.43 14 8 14Z"/>
                  </svg>
                </div>
                <h4>Inclusión Educativa</h4>
                <p>Promovemos la equidad y accesibilidad en la formación docente.</p>
              </div>
            </div>
          </section>

          {/* Metodologia */}
          <section className="about-section">
            <h2>Nuestra Metodología</h2>
            <p>
              Implementamos un enfoque pedagógico integral que combina la experiencia tradicional 
              con las más avanzadas herramientas digitales para la formación docente.
            </p>
            <div className="about-methodology-steps">
              <div className="about-methodology-step">
                <div className="step-number">1</div>
                <h4>Diagnóstico Inicial</h4>
                <p>Evaluamos las competencias actuales del docente para personalizar su programa de capacitación.</p>
              </div>
              <div className="about-methodology-step">
                <div className="step-number">2</div>
                <h4>Diseño Curricular</h4>
                <p>Desarrollamos un plan de formación adaptado a las necesidades específicas del docente.</p>
              </div>
              <div className="about-methodology-step">
                <div className="step-number">3</div>
                <h4>Implementación</h4>
                <p>Ejecutamos sesiones interactivas con seguimiento continuo del progreso académico.</p>
              </div>
              <div className="about-methodology-step">
                <div className="step-number">4</div>
                <h4>Evaluación y Certificación</h4>
                <p>Medimos el aprendizaje y otorgamos certificaciones reconocidas por el MINEDU.</p>
              </div>
            </div>
          </section>

          {/* Equipo */}
          <section className="about-section">
            <h2>Nuestro Equipo Directivo</h2>
            <div className="about-team-grid">
              <div className="about-team-member">
                <div className="about-team-avatar">DR</div>
                <h4>Dr. Ricardo Mendoza</h4>
                <div className="position">Director Académico</div>
                <p>PhD en Educación con 20 años de experiencia en formación docente y políticas educativas.</p>
              </div>
              <div className="about-team-member">
                <div className="about-team-avatar">MA</div>
                <h4>Mg. Ana Flores</h4>
                <div className="position">Coordinadora Pedagógica</div>
                <p>Especialista en desarrollo curricular y metodologías de enseñanza para educación pública.</p>
              </div>
              <div className="about-team-member">
                <div className="about-team-avatar">CG</div>
                <h4>Ing. Carlos García</h4>
                <div className="position">Director de Tecnología Educativa</div>
                <p>Experto en plataformas digitales y sistemas de gestión del aprendizaje para docentes.</p>
              </div>
            </div>
          </section>

          {/* Reconocimientos */}
          <section className="about-section">
            <h2>Reconocimientos y Certificaciones</h2>
            <div className="about-certifications-grid">
              <div className="about-certification">
                <div className="cert-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <h4>ISO 9001:2015</h4>
                <p>Certificación de Calidad en Gestión Educativa</p>
              </div>
              <div className="about-certification">
                <div className="cert-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 16L3 14L5 12L4 11L2 13L5 16L10 11L9 10L5 16ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"/>
                  </svg>
                </div>
                <h4>Premio Nacional</h4>
                <p>Mejor Institución Educativa Digital 2023</p>
              </div>
              <div className="about-certification">
                <div className="cert-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,1L9,9L1,9L7.5,14L5.5,22L12,18L18.5,22L16.5,14L23,9L15,9L12,1Z"/>
                  </svg>
                </div>
                <h4>Acreditación SUNEDU</h4>
                <p>Reconocimiento oficial del Ministerio de Educación</p>
              </div>
              <div className="about-certification">
                <div className="cert-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.62L12 2L9.19 8.62L2 9.24L7.46 13.97L5.82 21L12 17.27Z"/>
                  </svg>
                </div>
                <h4>5 Estrellas QS</h4>
                <p>Calificación máxima en satisfacción estudiantil</p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="about-cta">
            <div className="about-cta-content">
              <h3>¿Listo para comenzar tu transformación educativa?</h3>
              <p>
                Únete a miles de docentes que ya han confiado en TRILCE PERÚ 
                para alcanzar sus metas de desarrollo profesional y mejorar la calidad educativa.
              </p>
              <div className="about-cta-buttons">
                <a href="/registro" className="about-cta-btn primary">
                  Inscríbete Ahora
                </a>
                <a href="/contacto" className="about-cta-btn secondary">
                  Contáctanos
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AcercaDeNosotros;