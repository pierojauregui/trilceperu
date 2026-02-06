import React, { useState } from 'react';
import MensajesPersonalizados from './MensajesPersonalizados';
import GestionNoticias from './GestionNoticias';
import GestionBanners from './GestionBanners';
import AnunciosTrabajo from './AnunciosTrabajo';
import './Configuraciones.css';

const Configuraciones = () => {
  const [seccionActiva, setSeccionActiva] = useState('mensajes');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'mensajes':
        return <MensajesPersonalizados />;
      case 'noticias':
        return <GestionNoticias />;
      case 'banners':
        return <GestionBanners />;
      case 'anuncios-trabajo':
        return <AnunciosTrabajo />;
      default:
        return <MensajesPersonalizados />;
    }
  };

  return (
    <div className="configuraciones-container">
      <div className="configuraciones-header">
        <h1>Configuraciones del Sistema</h1>
        <p>Gestiona mensajes personalizados, noticias, banners y anuncios de trabajo</p>
      </div>

      <div className="configuraciones-nav">
        <button
          className={`nav-btn ${seccionActiva === 'mensajes' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('mensajes')}
        >
          <i className="fas fa-comment-alt"></i>
          Mensajes Personalizados
        </button>
        <button
          className={`nav-btn ${seccionActiva === 'noticias' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('noticias')}
        >
          <i className="fas fa-newspaper"></i>
          Gestión de Noticias
        </button>
        <button
          className={`nav-btn ${seccionActiva === 'banners' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('banners')}
        >
          <i className="fas fa-images"></i>
          Banners del Slider
        </button>
        <button
          className={`nav-btn ${seccionActiva === 'anuncios-trabajo' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('anuncios-trabajo')}
        >
          <i className="fas fa-briefcase"></i>
          Anuncios de Trabajo
        </button>
      </div>

      <div className="configuraciones-content">
        {renderSeccion()}
      </div>
    </div>
  );
};

export default Configuraciones;