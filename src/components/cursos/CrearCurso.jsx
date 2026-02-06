import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './CrearCurso.css';
import PropTypes from 'prop-types';

const CrearCurso = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const navigate = useNavigate();

  // Estado del formulario para curso
  const [formData, setFormData] = useState({
    nombre_curso: '',
    descripcion: '',
    precio_real: '',
    precio_oferta: '',
    duracion_horas: '',
    categoria_id: '',
    modalidad: 'asincrono',
    requisitos: '',
    que_aprenderas: '',
    contenido: '',
    numero_modulos: '',
    publicado: true,
    banner: null,
    video_preview: null
  });

  // Estados para las previsualizaciones
  const [bannerPreview, setBannerPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  
  // Estados para categorías
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar categorías e instructores al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar categorías desde el backend
        const categoriasResponse = await fetch(`${API_URL}/categorias`);
        if (categoriasResponse.ok) {
          const categoriasResult = await categoriasResponse.json();
          if (categoriasResult.success) {
            // El backend devuelve 'categorias' no 'data'
            setCategorias(categoriasResult.categorias || []);
          }
        }


        
      } catch (error) {
        console.error('Error al cargar datos:', error);
        // Fallback a datos mock si falla la carga
        setCategorias([
          { id: 1, descripcion: 'Programación' },
          { id: 2, descripcion: 'Diseño' },
          { id: 3, descripcion: 'Marketing' },
          { id: 4, descripcion: 'Negocios' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Cleanup function para revocar URLs cuando el componente se desmonte
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };





  const handleBannerClick = () => {
    if (bannerInputRef.current) {
      bannerInputRef.current.click();
    }
  };

  const handleVideoClick = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };



  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBannerPreview(event.target.result);
      };
      reader.readAsDataURL(file);
      
      setFormData(prev => ({
        ...prev,
        banner: file
      }));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Revocar URL anterior si existe para evitar memory leaks
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
      
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
      
      setFormData(prev => ({
        ...prev,
        video_preview: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const formDataToSend = new FormData();
      
      // Agregar todos los campos del curso
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'banner' && value) {
          formDataToSend.append('banner', value);
        } else if (key === 'video_preview' && value) {
          formDataToSend.append('video_preview', value);
        } else if (value && value !== '') {
          formDataToSend.append(key, value);
        }
      });

      const response = await fetch(`${API_URL}/cursos/create`, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error al crear el curso: ${response.status}`);
      }

      const result = await response.json();
      
      await Swal.fire({
        title: '¡Éxito!',
        text: 'El curso ha sido creado correctamente.',
        icon: 'success',
        confirmButtonColor: '#4CAF50'
      });

      // Limpiar formulario
      setFormData({
        nombre_curso: '',
        descripcion: '',
        precio_real: '',
        precio_oferta: '',
        duracion_horas: '',
        categoria_id: '',
        modalidad: 'asincrono',
        requisitos: '',
        que_aprenderas: '',
        contenido: '',
        numero_modulos: '',
        publicado: true,
        banner: null,
        video_preview: null
      });

      // Limpiar previsualizaciones y revocar URLs
      setBannerPreview(null);
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
      setVideoPreview(null);
      
      // Navegar a la lista de cursos
      setCurrentSection('cursos');
      
      // Recargar la lista de cursos si la función está disponible
      if (window.reloadCursos) {
        setTimeout(() => window.reloadCursos(), 100);
      }
      
    } catch (error) {
      console.error('Error al crear curso:', error);
      await Swal.fire({
        title: 'Error',
        text: error.message || 'Hubo un problema al crear el curso.',
        icon: 'error',
        confirmButtonColor: '#f44336'
      });
    }
  };

  return (
    <div className="crear-curso-container">
      <div className="header-section">
        <h2>Crear Nuevo Curso</h2>
        <p>Complete la información del curso</p>
      </div>



      {/* Input oculto para banner */}
      <input
        type="file"
        ref={bannerInputRef}
        onChange={handleBannerChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Input oculto para video */}
      <input
        type="file"
        ref={videoInputRef}
        onChange={handleVideoChange}
        accept="video/*"
        style={{ display: 'none' }}
      />

      {/* Sección de medios del curso */}
      <div className="media-upload-section">
        {/* Banner que abarca de izquierda a derecha */}
        <div className="banner-upload-full">
          <div 
            className="upload-box banner-box-full"
            onClick={handleBannerClick}
          >
            {bannerPreview ? (
              <img 
                src={bannerPreview} 
                alt="Banner preview"
                className="preview-image banner-preview-full"
              />
            ) : (
              <>
                <span>+</span>
                <p>Subir banner del curso</p>
                <small>(Recomendado: 1200x400px)</small>
              </>
            )}
          </div>
        </div>

        {/* Video de vista previa */}
        <div className="video-upload-section">
          <h4>Video de vista previa</h4>
          <div 
            className="upload-box video-box"
            onClick={handleVideoClick}
          >
            {videoPreview ? (
              <video 
                src={videoPreview} 
                className="preview-video"
                controls
              />
            ) : (
              <>
                <span>📹</span>
                <p>Subir video de vista previa</p>
                <small>(Máximo 50MB)</small>
              </>
            )}
          </div>
        </div>
      </div>

      <form className="curso-form" onSubmit={handleSubmit}>
        <div className="form-row nombre-categoria">
          <div className="form-group">
            <label>Nombre del Curso:</label>
            <input
              type="text"
              name="nombre_curso"
              value={formData.nombre_curso}
              onChange={handleInputChange}
              required
              placeholder="Ej: Curso de React Avanzado"
            />
          </div>
          <div className="form-group">
            <label>Categoría:</label>
            <select 
              name="categoria_id" 
              value={formData.categoria_id} 
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.descripcion}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Modalidad:</label>
            <select 
              name="modalidad" 
              value={formData.modalidad} 
              onChange={handleInputChange}
              required
            >
              <option value="asincrono">Asíncrono (Grabado)</option>
              <option value="sincrono">Síncrono (En vivo)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Duración (horas):</label>
            <input
              type="number"
              name="duracion_horas"
              value={formData.duracion_horas}
              onChange={handleInputChange}
              required
              min="1"
              placeholder="Ej: 20"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Precio Real:</label>
            <input
              type="number"
              name="precio_real"
              value={formData.precio_real}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              placeholder="Ej: 99.99"
            />
          </div>
          <div className="form-group">
            <label>Precio de Oferta:</label>
            <input
              type="number"
              name="precio_oferta"
              value={formData.precio_oferta}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="Ej: 79.99 (opcional)"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Número de Módulos:</label>
            <input
              type="number"
              name="numero_modulos"
              value={formData.numero_modulos}
              onChange={handleInputChange}
              required
              min="1"
              placeholder="Ej: 8"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Descripción del Curso:</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            required
            rows="4"
            placeholder="Describe de qué trata el curso, sus objetivos y beneficios..."
          />
        </div>

        <div className="form-group full-width">
          <label>Requisitos:</label>
          <textarea
            name="requisitos"
            value={formData.requisitos}
            onChange={handleInputChange}
            rows="3"
            placeholder="Conocimientos previos necesarios, software requerido, etc..."
          />
        </div>

        <div className="form-group full-width">
          <label>¿Qué aprenderás?:</label>
          <textarea
            name="que_aprenderas"
            value={formData.que_aprenderas}
            onChange={handleInputChange}
            rows="4"
            placeholder="Lista los principales conocimientos y habilidades que se adquirirán..."
          />
        </div>

        <div className="form-group full-width">
          <label>Contenido del Curso:</label>
          <textarea
            name="contenido"
            value={formData.contenido}
            onChange={handleInputChange}
            rows="6"
            placeholder="Detalla el contenido completo del curso, módulos, lecciones, etc..."
          />
        </div>

        <div className="form-group full-width">
          <label>Estado de Publicación:</label>
          <div className="toggle-container">
            <input
              type="checkbox"
              id="publicado"
              name="publicado"
              checked={formData.publicado}
              onChange={(e) => setFormData(prev => ({...prev, publicado: e.target.checked}))}
              className="toggle-input"
            />
            <label htmlFor="publicado" className="toggle-label">
              
              <span className="toggle-text">
                {formData.publicado ? 'Publicado' : 'Borrador'}
              </span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => setCurrentSection('cursos')}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Crear Curso
          </button>
        </div>
      </form>
    </div>
  );
};

CrearCurso.propTypes = {
  setCurrentSection: PropTypes.func.isRequired
};

export default CrearCurso;