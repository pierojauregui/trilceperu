import React, { useState, useEffect, useRef } from 'react';
import './GestionBanners.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
// URL base sin /api para archivos estáticos
const BASE_URL = API_URL.replace(/\/api$/, '');

console.log('GestionBanners - API_URL:', API_URL);
console.log('GestionBanners - BASE_URL:', BASE_URL);

const GestionBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [bannerEditando, setBannerEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  // Refs para los inputs de archivo
  const fileInputWebRef = useRef(null);
  const fileInputTabletRef = useRef(null);
  const fileInputMobileRef = useRef(null);

  // Estado para nuevo banner - SOLO imágenes, orden y activo
  const [nuevoBanner, setNuevoBanner] = useState({
    activo: true,
    orden: 1,
    imagen_web: null,
    imagen_tablet: null,
    imagen_mobile: null,
    preview_web: null,
    preview_tablet: null,
    preview_mobile: null
  });

  useEffect(() => {
    cargarBanners();
  }, []);

  const cargarBanners = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/banners/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Banners recibidos del API:', data.banners);
        setBanners(data.banners || []);
      }
    } catch (error) {
      console.error('Error cargando banners:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar los banners' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, tipo) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setMensaje({ tipo: 'error', texto: 'Solo se permiten archivos de imagen' });
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMensaje({ tipo: 'error', texto: 'La imagen no debe superar los 5MB' });
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setNuevoBanner(prev => ({
          ...prev,
          [`imagen_${tipo}`]: file,
          [`preview_${tipo}`]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoBanner(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setNuevoBanner({
      activo: true,
      orden: banners.length + 1,
      imagen_web: null,
      imagen_tablet: null,
      imagen_mobile: null,
      preview_web: null,
      preview_tablet: null,
      preview_mobile: null
    });
    setBannerEditando(null);
    
    // Limpiar inputs de archivo
    if (fileInputWebRef.current) fileInputWebRef.current.value = '';
    if (fileInputTabletRef.current) fileInputTabletRef.current.value = '';
    if (fileInputMobileRef.current) fileInputMobileRef.current.value = '';
  };

  const abrirModalNuevo = () => {
    resetForm();
    setNuevoBanner(prev => ({ ...prev, orden: banners.length + 1 }));
    setMostrarModal(true);
  };

  const abrirModalEditar = (banner) => {
    setBannerEditando(banner);
    setNuevoBanner({
      activo: banner.activo,
      orden: banner.orden,
      imagen_web: null,
      imagen_tablet: null,
      imagen_mobile: null,
      preview_web: banner.imagen_web ? `${BASE_URL}/uploads/banners/${banner.imagen_web}` : null,
      preview_tablet: banner.imagen_tablet ? `${BASE_URL}/uploads/banners/${banner.imagen_tablet}` : null,
      preview_mobile: banner.imagen_mobile ? `${BASE_URL}/uploads/banners/${banner.imagen_mobile}` : null
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    resetForm();
  };

  const guardarBanner = async (e) => {
    e.preventDefault();
    
    // Validar que al menos haya una imagen
    if (!bannerEditando && !nuevoBanner.imagen_web && !nuevoBanner.imagen_tablet && !nuevoBanner.imagen_mobile) {
      setMensaje({ tipo: 'error', texto: 'Debes subir al menos una imagen' });
      return;
    }

    setSaving(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('activo', nuevoBanner.activo);
      formData.append('orden', nuevoBanner.orden);

      if (nuevoBanner.imagen_web) {
        formData.append('imagen_web', nuevoBanner.imagen_web);
      }
      if (nuevoBanner.imagen_tablet) {
        formData.append('imagen_tablet', nuevoBanner.imagen_tablet);
      }
      if (nuevoBanner.imagen_mobile) {
        formData.append('imagen_mobile', nuevoBanner.imagen_mobile);
      }

      const url = bannerEditando 
        ? `${API_URL}/banners/${bannerEditando.id}/`
        : `${API_URL}/banners/`;
      
      const method = bannerEditando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje({ 
          tipo: 'success', 
          texto: bannerEditando ? 'Banner actualizado correctamente' : 'Banner creado correctamente' 
        });
        cargarBanners();
        cerrarModal();
      } else {
        setMensaje({ tipo: 'error', texto: data.detail || 'Error al guardar el banner' });
      }
    } catch (error) {
      console.error('Error guardando banner:', error);
      setMensaje({ tipo: 'error', texto: 'Error de conexión al guardar el banner' });
    } finally {
      setSaving(false);
    }
  };

  const eliminarBanner = async (bannerId) => {
    console.log('Eliminando banner con ID:', bannerId, typeof bannerId);
    if (!confirm('¿Estás seguro de eliminar este banner?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/banners/${bannerId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMensaje({ tipo: 'success', texto: 'Banner eliminado correctamente' });
        cargarBanners();
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al eliminar el banner' });
      }
    } catch (error) {
      console.error('Error eliminando banner:', error);
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    }
  };

  const toggleActivo = async (banner) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/banners/${banner.id}/toggle/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        cargarBanners();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="banners-loading">
        <div className="spinner"></div>
        <p>Cargando banners...</p>
      </div>
    );
  }

  return (
    <div className="gestion-banners">
      <div className="banners-header">
        <div className="header-info">
          <h2>Gestión de Banners</h2>
          <p>Sube imágenes para el slider principal en diferentes tamaños</p>
        </div>
        <button className="btn-nuevo-banner" onClick={abrirModalNuevo}>
          <i className="fas fa-plus"></i>
          Nuevo Banner
        </button>
      </div>

      {mensaje.texto && (
        <div className={`mensaje-alerta ${mensaje.tipo}`}>
          <i className={`fas ${mensaje.tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {mensaje.texto}
        </div>
      )}

      <div className="banners-info-sizes">
        <h3><i className="fas fa-info-circle"></i> Tamaños recomendados</h3>
        <div className="sizes-grid">
          <div className="size-item">
            <i className="fas fa-desktop"></i>
            <span className="size-label">Web</span>
            <span className="size-value">1920 x 600 px</span>
          </div>
          <div className="size-item">
            <i className="fas fa-tablet-alt"></i>
            <span className="size-label">Tablet</span>
            <span className="size-value">1024 x 500 px</span>
          </div>
          <div className="size-item">
            <i className="fas fa-mobile-alt"></i>
            <span className="size-label">Móvil</span>
            <span className="size-value">768 x 400 px</span>
          </div>
        </div>
      </div>

      <div className="banners-lista">
        {banners.length === 0 ? (
          <div className="no-banners">
            <i className="fas fa-image"></i>
            <p>No hay banners configurados</p>
            <span>Crea tu primer banner para el slider</span>
          </div>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className={`banner-card ${!banner.activo ? 'inactivo' : ''}`}>
              <div className="banner-orden">
                <span>#{banner.orden}</span>
              </div>
              
              <div className="banner-previews">
                <div className="preview-item">
                  <span className="preview-label"><i className="fas fa-desktop"></i> Web</span>
                  {banner.imagen_web ? (
                    <img src={`${BASE_URL}/uploads/banners/${banner.imagen_web}`} alt="Web" />
                  ) : (
                    <div className="preview-placeholder">Sin imagen</div>
                  )}
                </div>
                <div className="preview-item">
                  <span className="preview-label"><i className="fas fa-tablet-alt"></i> Tablet</span>
                  {banner.imagen_tablet ? (
                    <img src={`${BASE_URL}/uploads/banners/${banner.imagen_tablet}`} alt="Tablet" />
                  ) : (
                    <div className="preview-placeholder">Sin imagen</div>
                  )}
                </div>
                <div className="preview-item">
                  <span className="preview-label"><i className="fas fa-mobile-alt"></i> Móvil</span>
                  {banner.imagen_mobile ? (
                    <img src={`${BASE_URL}/uploads/banners/${banner.imagen_mobile}`} alt="Móvil" />
                  ) : (
                    <div className="preview-placeholder">Sin imagen</div>
                  )}
                </div>
              </div>

              <div className="banner-actions">
                <label className="switch-activo">
                  <input 
                    type="checkbox" 
                    checked={banner.activo} 
                    onChange={() => toggleActivo(banner)}
                  />
                  <span className="slider-switch"></span>
                  <span className="switch-label">{banner.activo ? 'Activo' : 'Inactivo'}</span>
                </label>
                
                <button className="btn-editar" onClick={() => abrirModalEditar(banner)}>
                  <i className="fas fa-edit"></i>
                </button>
                <button className="btn-eliminar" onClick={() => eliminarBanner(banner.id)}>
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal simplificado - Solo imágenes */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-banner modal-simple" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{bannerEditando ? 'Editar Banner' : 'Nuevo Banner'}</h3>
              <button className="btn-cerrar" onClick={cerrarModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={guardarBanner} className="modal-body">
              <div className="imagenes-section">
                <h4><i className="fas fa-images"></i> Imágenes del Banner</h4>
                <p className="imagenes-hint">Sube la misma imagen en diferentes tamaños para una mejor visualización</p>
                
                <div className="imagen-upload-grid">
                  {/* Web */}
                  <div className="imagen-upload-item">
                    <label className="upload-label">
                      <i className="fas fa-desktop"></i>
                      <span>Escritorio</span>
                      <small>1920 x 600 px</small>
                    </label>
                    <div className="upload-area" onClick={() => fileInputWebRef.current?.click()}>
                      {nuevoBanner.preview_web ? (
                        <img src={nuevoBanner.preview_web} alt="Preview Web" />
                      ) : (
                        <div className="upload-placeholder">
                          <i className="fas fa-cloud-upload-alt"></i>
                          <span>Subir imagen</span>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputWebRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'web')}
                      hidden
                    />
                  </div>

                  {/* Tablet */}
                  <div className="imagen-upload-item">
                    <label className="upload-label">
                      <i className="fas fa-tablet-alt"></i>
                      <span>Tablet</span>
                      <small>1024 x 500 px</small>
                    </label>
                    <div className="upload-area" onClick={() => fileInputTabletRef.current?.click()}>
                      {nuevoBanner.preview_tablet ? (
                        <img src={nuevoBanner.preview_tablet} alt="Preview Tablet" />
                      ) : (
                        <div className="upload-placeholder">
                          <i className="fas fa-cloud-upload-alt"></i>
                          <span>Subir imagen</span>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputTabletRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'tablet')}
                      hidden
                    />
                  </div>

                  {/* Mobile */}
                  <div className="imagen-upload-item">
                    <label className="upload-label">
                      <i className="fas fa-mobile-alt"></i>
                      <span>Móvil</span>
                      <small>768 x 400 px</small>
                    </label>
                    <div className="upload-area" onClick={() => fileInputMobileRef.current?.click()}>
                      {nuevoBanner.preview_mobile ? (
                        <img src={nuevoBanner.preview_mobile} alt="Preview Mobile" />
                      ) : (
                        <div className="upload-placeholder">
                          <i className="fas fa-cloud-upload-alt"></i>
                          <span>Subir imagen</span>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputMobileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'mobile')}
                      hidden
                    />
                  </div>
                </div>
              </div>

              <div className="form-row-simple">
                <div className="form-group form-group-orden">
                  <label>Orden</label>
                  <input
                    type="number"
                    name="orden"
                    value={nuevoBanner.orden}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={nuevoBanner.activo}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Banner activo
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-small"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      {bannerEditando ? 'Actualizar' : 'Crear Banner'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionBanners;
