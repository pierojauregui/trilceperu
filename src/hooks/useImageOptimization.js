import { useState, useEffect, useCallback } from 'react';

export const useImageOptimization = (src, options = {}) => {
  const {
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q2FyZ2FuZG8uLi48L3RleHQ+PC9zdmc+',
    quality = 80,
    format = 'webp'
  } = options;

  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadImage = useCallback(() => {
    if (!src) return;

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };

    img.src = src;
  }, [src]);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  return {
    src: imageSrc,
    isLoading,
    hasError,
    retry: loadImage
  };
};


export const useLazyImage = (src, options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const [imgRef, setImgRef] = useState(null);

  const { threshold = 0.1, rootMargin = '50px' } = options;

  useEffect(() => {
    if (!imgRef || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(imgRef);

    return () => observer.disconnect();
  }, [imgRef, threshold, rootMargin]);

  const imageOptimization = useImageOptimization(isInView ? src : null, options);

  return {
    ...imageOptimization,
    ref: setImgRef,
    isInView
  };
};


export const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  style,
  lazy = true,
  ...props 
}) => {
  const imageHook = lazy ? useLazyImage(src) : useImageOptimization(src);
  
  return (
    <img
      ref={lazy ? imageHook.ref : undefined}
      src={imageHook.src}
      alt={alt}
      className={className}
      style={{
        transition: 'opacity 0.3s ease',
        opacity: imageHook.isLoading ? 0.7 : 1,
        ...style
      }}
      {...props}
    />
  );
};

export default useImageOptimization;