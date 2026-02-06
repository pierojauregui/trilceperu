import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './HeroSlider.css';

const HeroSlider = () => {
  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);
  const currentSlideRef = useRef(0);

  // Banners estáticos de respaldo (solo gradientes si no hay banners en BD)
  const defaultSlides = [
    {
      id: 1,
      imagen_web: null,
      imagen_tablet: null,
      imagen_mobile: null,
      gradiente: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      id: 2,
      imagen_web: null,
      imagen_tablet: null,
      imagen_mobile: null,
      gradiente: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      id: 3,
      imagen_web: null,
      imagen_tablet: null,
      imagen_mobile: null,
      gradiente: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    }
  ];

  // Cargar banners desde la API
  useEffect(() => {
    const cargarBanners = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_URL}/banners/activos`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.banners && data.banners.length > 0) {
            setSlides(data.banners);
          } else {
            setSlides(defaultSlides);
          }
        } else {
          setSlides(defaultSlides);
        }
      } catch (error) {
        console.warn('No se pudieron cargar los banners, usando valores predeterminados');
        setSlides(defaultSlides);
      } finally {
        setLoading(false);
      }
    };

    cargarBanners();
  }, []);

  // Obtener URL de imagen según el tamaño de pantalla
  const getImageUrl = (slide) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    // Remover /api del final para obtener la URL base
    const BASE_URL = API_URL.replace(/\/api$/, '');
    const width = window.innerWidth;
    
    let imagen = null;
    if (width >= 1024 && slide.imagen_web) {
      imagen = slide.imagen_web;
    } else if (width >= 768 && slide.imagen_tablet) {
      imagen = slide.imagen_tablet;
    } else if (slide.imagen_mobile) {
      imagen = slide.imagen_mobile;
    } else if (slide.imagen_web) {
      imagen = slide.imagen_web;
    } else if (slide.imagen_tablet) {
      imagen = slide.imagen_tablet;
    }
    
    return imagen ? `${BASE_URL}/uploads/banners/${imagen}` : null;
  };

  useEffect(() => {
    if (loading || slides.length === 0) return;

    const slider = sliderRef.current;
    if (!slider) return;

    // Configuración inicial
    gsap.set(slider.children, { opacity: 0, scale: 0.8 });
    gsap.set(slider.children[0], { opacity: 1, scale: 1 });

    // Auto-play
    const startAutoPlay = () => {
      intervalRef.current = setInterval(() => {
        const nextIndex = (currentSlideRef.current + 1) % slides.length;
        changeSlide(nextIndex);
      }, 5000);
    };

    startAutoPlay();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loading, slides]);

  const nextSlide = () => {
    const nextIndex = (currentSlide + 1) % slides.length;
    changeSlide(nextIndex);
  };

  const prevSlide = () => {
    const prevIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    changeSlide(prevIndex);
  };

  const changeSlide = (newIndex) => {
    if (newIndex === currentSlideRef.current) return;

    const slider = sliderRef.current;
    if (!slider || !slider.children[currentSlideRef.current] || !slider.children[newIndex]) return;

    const currentSlideEl = slider.children[currentSlideRef.current];
    const nextSlideEl = slider.children[newIndex];

    // Animación de salida
    gsap.to(currentSlideEl, {
      opacity: 0,
      scale: 0.8,
      duration: 0.5,
      ease: "power2.inOut"
    });

    // Animación de entrada
    gsap.fromTo(nextSlideEl, 
      { opacity: 0, scale: 1.2 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 0.5, 
        ease: "power2.inOut",
        delay: 0.2
      }
    );

    setCurrentSlide(newIndex);
    currentSlideRef.current = newIndex;
  };

  const goToSlide = (index) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    changeSlide(index);
    
    // Reiniciar auto-play
    setTimeout(() => {
      intervalRef.current = setInterval(() => {
        const nextIndex = (currentSlideRef.current + 1) % slides.length;
        changeSlide(nextIndex);
      }, 5000);
    }, 1000);
  };

  if (loading) {
    return (
      <section className="hero-slider hero-slider-simple">
        <div className="slider-loading">
          <div className="loading-spinner"></div>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="hero-slider hero-slider-simple">
      <div className="slider-container" ref={sliderRef}>
        {slides.map((slide, index) => {
          const imageUrl = getImageUrl(slide);
          
          return (
            <div 
              key={slide.id} 
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{ 
                background: imageUrl 
                  ? `url(${imageUrl}) center center / cover no-repeat` 
                  : (slide.gradiente || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
              }}
            />
          );
        })}
      </div>

      {/* Controles de navegación */}
      {slides.length > 1 && (
        <div className="slider-controls">
          <button className="control-btn prev-btn" onClick={prevSlide}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button className="control-btn next-btn" onClick={nextSlide}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      )}

      {/* Indicadores */}
      {slides.length > 1 && (
        <div className="slider-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSlider;