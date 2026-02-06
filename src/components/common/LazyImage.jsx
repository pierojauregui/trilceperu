import React, { useState, useRef, useEffect } from 'react';
import { useLazyImage } from '../../hooks/useImageOptimization';

/**
 * Componente LazyImage optimizado con lazy loading y placeholder
 */
const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  style = {},
  placeholder,
  onLoad,
  onError,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  
  const {
    src: optimizedSrc,
    isLoading,
    isInView,
    ref: setRef
  } = useLazyImage(src, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  // Combinar refs
  useEffect(() => {
    if (imgRef.current) {
      setRef(imgRef.current);
    }
  }, [setRef]);

  const handleLoad = (e) => {
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  const defaultPlaceholder = (
    <div 
      className={`lazy-image-placeholder ${className}`}
      style={{
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        color: '#999',
        fontSize: '14px',
        ...style
      }}
    >
      {isLoading ? 'Cargando...' : 'Imagen no disponible'}
    </div>
  );

  if (hasError) {
    return placeholder || defaultPlaceholder;
  }

  return (
    <div className="lazy-image-container" style={{ position: 'relative' }}>
      {/* Placeholder mientras carga */}
      {isLoading && (placeholder || defaultPlaceholder)}
      
      {/* Imagen optimizada */}
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        className={`lazy-image ${className}`}
        style={{
          ...style,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
          position: isLoading ? 'absolute' : 'static',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  );
};

/**
 * Componente para imágenes de avatar con fallback
 */
export const AvatarImage = ({ 
  src, 
  alt, 
  size = 40, 
  className = '',
  fallbackText,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  
  const fallbackAvatar = (
    <div
      className={`avatar-fallback ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 'bold',
        color: '#666',
        textTransform: 'uppercase'
      }}
    >
      {fallbackText ? fallbackText.charAt(0) : '?'}
    </div>
  );

  if (hasError || !src) {
    return fallbackAvatar;
  }

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={`avatar-image ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover'
      }}
      placeholder={fallbackAvatar}
      onError={() => setHasError(true)}
      {...props}
    />
  );
};

/**
 * Componente para imágenes de cursos con aspect ratio fijo
 */
export const CourseImage = ({ 
  src, 
  alt, 
  className = '',
  aspectRatio = '16/9',
  ...props 
}) => {
  return (
    <div 
      className={`course-image-container ${className}`}
      style={{
        aspectRatio,
        overflow: 'hidden',
        borderRadius: '8px'
      }}
    >
      <LazyImage
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        placeholder={
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999'
          }}>
            📚 Curso
          </div>
        }
        {...props}
      />
    </div>
  );
};

export default LazyImage;