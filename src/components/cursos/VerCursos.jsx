import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import axios from 'axios';
import './VerCursos.css';

const VerCursos = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
    const [cursoData, setCursoData] = useState(null);
    const [originalCursoData, setOriginalCursoData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [newCourseImage, setNewCourseImage] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [newCourseVideo, setNewCourseVideo] = useState(null);
    
    const videoInputRef = useRef(null);

    useEffect(() => {
        const fetchCursoData = async () => {
            const cursoId = localStorage.getItem('selectedCursoId');
            const token = localStorage.getItem('token');
            
            if (!cursoId) {
                Swal.fire({
                    title: 'Error',
                    text: 'No se ha seleccionado ningún curso',
                    icon: 'error',
                    confirmButtonColor: '#4CAF50'
                });
                return;
            }
            
            if (!token) {
                Swal.fire({
                    title: 'Error',
                    text: 'No hay token de sesión. Por favor, inicia sesión nuevamente.',
                    icon: 'error',
                    confirmButtonColor: '#4CAF50'
                });
                return;
            }
            
            try {
                // Cargar categorías
                const categoriasResponse = await axios.get(`${API_URL}/categorias`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (categoriasResponse.data.success) {
                    setCategorias(categoriasResponse.data.categorias);
                }
                
                // Cargar curso específico usando endpoint individual
                const response = await axios.get(`${API_URL}/cursos/${cursoId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const cursoEspecifico = response.data.success ? response.data.curso : response.data;
                
                if (!cursoEspecifico) {
                    throw new Error('Curso no encontrado');
                }
                
                setCursoData(cursoEspecifico);
                setOriginalCursoData(cursoEspecifico); // Almacenar datos originales para comparación
                
            } catch (error) {
                console.error('Error:', error);
                let errorMessage = 'Error al cargar los datos del curso';
                
                if (error.response?.status === 401) {
                    errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
                } else if (error.response?.status === 404) {
                    errorMessage = 'Curso no encontrado.';
                }
                
                Swal.fire({
                    title: 'Error',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonColor: '#4CAF50'
                });
            }
        };

        fetchCursoData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCursoData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        console.log('File selected:', file);
        
        if (file) {
            // Validar tipo de archivo
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                Swal.fire({
                    title: 'Error',
                    text: 'Por favor selecciona un archivo de imagen válido.',
                    icon: 'error',
                    confirmButtonColor: '#4CAF50'
                });
                return;
            }

            setNewCourseImage(file);
            
            // Crear preview
            const reader = new FileReader();
            reader.onload = (event) => {
                console.log('Setting preview image:', event.target.result ? 'Image loaded successfully' : 'Failed to load');
                setPreviewImage(event.target.result);
                console.log('Preview image state updated');
            };
            reader.readAsDataURL(file);
        } else {
            // Si no hay archivo, limpiar el preview
            console.log('No file selected, clearing preview');
            setPreviewImage(null);
            setNewCourseImage(null);
        }
    };

    const handleVideoClick = () => {
        if (videoInputRef.current) {
            videoInputRef.current.click();
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
            setNewCourseVideo(file);
        }
    };





    const handleUpdate = async () => {
        const token = localStorage.getItem('token');
        const cursoId = localStorage.getItem('selectedCursoId');
        
        console.log('=== DEBUG HANDLEUPDATE ===');
        console.log('cursoData completo:', cursoData);
        console.log('originalCursoData:', originalCursoData);
        
        if (!token) {
            Swal.fire({
                title: 'Error',
                text: 'No hay token de sesión. Por favor, inicia sesión nuevamente.',
                icon: 'error',
                confirmButtonColor: '#4CAF50'
            });
            return;
        }
        
        // Validaciones básicas
        if (!cursoData.nombre || !cursoData.descripcion) {
            Swal.fire({
                title: 'Error',
                text: 'Por favor completa todos los campos obligatorios',
                icon: 'error',
                confirmButtonColor: '#4CAF50'
            });
            return;
        }
        
        setIsLoading(true);
        
        try {
            const formData = new FormData();
            
            // Enviar todos los campos para evitar problemas de detección de cambios
            console.log('Enviando todos los campos del curso:', cursoData);
            
            // Agregar todos los campos del curso
            Object.keys(cursoData).forEach(key => {
                if (cursoData[key] !== null && cursoData[key] !== undefined) {
                    formData.append(key, cursoData[key]);
                    console.log(`Agregando campo ${key}:`, cursoData[key], 'Tipo:', typeof cursoData[key]);
                }
            });
            
            // Agregar imagen si hay una nueva
            if (newCourseImage) {
                formData.append('imagen', newCourseImage);
            }
            
            // Agregar video si hay uno nuevo
            if (newCourseVideo) {
                formData.append('video_preview', newCourseVideo);
            }
            
            console.log('Enviando FormData al servidor...');
            
            const response = await axios.put(`${API_URL}/cursos/${cursoId}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log('Respuesta del servidor:', response.data);
            
            await Swal.fire({
                title: '¡Éxito!',
                text: 'Curso actualizado exitosamente',
                icon: 'success',
                confirmButtonColor: '#4CAF50'
            });
            
            setIsEditing(false);
            setPreviewImage(null);
            setNewCourseImage(null);
            setVideoPreview(null);
            setNewCourseVideo(null);
            
            // Recargar los datos del curso usando endpoint específico
            console.log('Recargando datos del curso...');
            const updatedResponse = await axios.get(`${API_URL}/cursos/${cursoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Respuesta del curso actualizado:', updatedResponse.data);
            
            if (updatedResponse.data.success && updatedResponse.data.curso) {
                const cursoActualizado = updatedResponse.data.curso;
                console.log('Curso actualizado encontrado:', cursoActualizado);
                setCursoData(cursoActualizado);
                setOriginalCursoData(cursoActualizado); // Actualizar datos originales
            } else {
                console.error('No se pudo obtener el curso actualizado');
                // Fallback: recargar la página para mostrar los cambios
                window.location.reload();
            }
            
        } catch (error) {
            console.error('Error completo:', error);
            console.error('Respuesta del error:', error.response?.data);
            
            const errorMessage = error.response?.data?.detail || 
                              error.response?.data?.message || 
                              'Error al actualizar curso';
            
            await Swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonColor: '#4CAF50'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        const token = localStorage.getItem('token');
        const cursoId = localStorage.getItem('selectedCursoId');
        
        if (!token) {
            Swal.fire({
                title: 'Error',
                text: 'No hay token de sesión. Por favor, inicia sesión nuevamente.',
                icon: 'error',
                confirmButtonColor: '#4CAF50'
            });
            return;
        }
        
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/cursos/${cursoId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                await Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El curso ha sido eliminado exitosamente',
                    icon: 'success',
                    confirmButtonColor: '#4CAF50'
                });
                
                setCurrentSection('cursos');
                
            } catch (error) {
                console.error('Error:', error);
                
                const errorMessage = error.response?.data?.detail || 
                                  error.response?.data?.message || 
                                  'Error al eliminar curso';
                
                Swal.fire({
                    title: 'Error',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonColor: '#4CAF50'
                });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando curso...</p>
            </div>
        );
    }

    if (!cursoData) {
        return (
            <div className="no-data">
                <h2>Curso no encontrado</h2>
                <button onClick={() => setCurrentSection('cursos')} className="btn-volver-atras">
                    Volver a Cursos
                </button>
            </div>
        );
    }

    return (
        <div className="ver-cursos-container">
            <div className="header-section">
                <h2>Ver Curso</h2>
                {!isEditing && (
                    <div className="header-buttons">
                        <button type="button" className="edit-btn" onClick={() => setIsEditing(true)}>
                            <i className="bx bx-edit"></i>
                            Editar
                        </button>
                        <button type="button" className="delete-btn" onClick={handleDelete}>
                            <i className="bx bx-trash"></i>
                            Eliminar
                        </button>
                    </div>
                )}
            </div>

            {/* Sección de banner del curso */}
            <div className="media-upload-section">
                <div className="banner-upload-full">
                    <div className="banner-box-full">
                        {console.log('Rendering banner - previewImage:', previewImage ? 'exists' : 'null', 'cursoData:', cursoData ? 'exists' : 'null')}
                        {previewImage ? (
                            <img 
                                src={previewImage} 
                                alt="Preview" 
                                className="preview-image banner-preview-full" 
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '10px',
                                    zIndex: 10
                                }}
                                onLoad={() => console.log('Preview image loaded successfully')}
                                onError={(e) => console.log('Preview image failed to load:', e)}
                            />
                        ) : cursoData && cursoData.imagen_url ? (
                            <img 
                                src={cursoData.imagen_url.startsWith('http') ? cursoData.imagen_url : `${API_URL.replace('/api', '')}${cursoData.imagen_url}`} 
                                alt="Banner del curso" 
                                className="preview-image banner-preview-full" 
                                onError={(e) => {
                                    console.log('Error cargando imagen:', cursoData.imagen_url);
                                    e.target.style.display = 'none';
                                    const placeholder = e.target.parentNode.querySelector('.placeholder-content');
                                    if (placeholder) {
                                        placeholder.style.display = 'flex';
                                    }
                                }}
                            />
                        ) : null}
                        {!previewImage && (!cursoData || !cursoData.imagen_url) && (
                            <div className="placeholder-content" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                                <span>+</span>
                                <p>Banner del curso</p>
                                <small>(Recomendado: 1200x400px)</small>
                            </div>
                        )}
                        {!previewImage && cursoData && cursoData.imagen_url && (
                            <div className="placeholder-content" style={{display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                                <i className="bx bx-image"></i>
                                <span>Error al cargar imagen</span>
                            </div>
                        )}
                    </div>
                    {isEditing && (
                        <div className="photo-upload-controls">
                            <input
                                type="file"
                                id="imagen_curso"
                                name="imagen_curso"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="imagen_curso" className="file-input-label">
                                <i className="bx bx-upload"></i>
                                {previewImage ? 'Cambiar banner' : 'Seleccionar banner'}
                            </label>
                            {previewImage && (
                                <button 
                                    type="button" 
                                    className="remove-image-btn"
                                    onClick={() => {
                                        setPreviewImage(null);
                                        setNewCourseImage(null);
                                        document.getElementById('imagen_curso').value = '';
                                    }}
                                >
                                    <i className="bx bx-trash"></i>
                                    Quitar
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <form className="ver-cursos-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>Nombre del Curso:</label>
                        <input
                            type="text"
                            name="nombre"
                            value={cursoData.nombre || ''}
                            onChange={handleChange}
                            placeholder="Ingrese nombre del curso"
                            disabled={!isEditing}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Categoría:</label>
                        {isEditing ? (
                            <select
                                name="categoria_id"
                                value={cursoData.categoria_id || ''}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccionar categoría</option>
                                {categorias.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.descripcion}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={cursoData.categoria || 'Sin categoría'}
                                disabled
                                className="readonly-input"
                            />
                        )}
                    </div>
                    <div className="form-group">
                        <label>Modalidad:</label>
                        {isEditing ? (
                            <select
                                name="modalidad"
                                value={cursoData.modalidad || 'asincrono'}
                                onChange={handleChange}
                                required
                            >
                                <option value="asincrono">Asíncrono (Grabado)</option>
                                <option value="sincrono">Síncrono (En vivo)</option>
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={cursoData.modalidad === 'sincrono' ? 'Síncrono (En vivo)' : 'Asíncrono (Grabado)'}
                                disabled
                                className="readonly-input"
                            />
                        )}
                    </div>
                    <div className="form-group">
                        <label>Duración (horas):</label>
                        <input
                            type="number"
                            name="duracion_horas"
                            value={cursoData.duracion_horas || ''}
                            onChange={handleChange}
                            placeholder="Duración en horas"
                            disabled={!isEditing}
                            min="1"
                        />
                    </div>
                    <div className="form-group">
                        <label>Número de Módulos:</label>
                        <input
                            type="number"
                            name="numero_modulos"
                            value={cursoData.numero_modulos || ''}
                            onChange={handleChange}
                            placeholder="Número de módulos"
                            disabled={!isEditing}
                            min="1"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group full-width">
                        <label>Video de Vista Previa:</label>
                        <div className="video-preview">
                            {videoPreview ? (
                                <video 
                                    src={videoPreview} 
                                    controls 
                                    className="preview-video"
                                    style={{ width: '100%', maxHeight: '300px' }}
                                />
                            ) : cursoData.video_url ? (
                                <video 
                                    src={cursoData.video_url.startsWith('http') ? cursoData.video_url : `${API_URL.replace('/api', '')}${cursoData.video_url}`}
                                    controls 
                                    className="preview-video"
                                    style={{ width: '100%', maxHeight: '300px' }}
                                    onError={(e) => {
                                        console.log('Error cargando video:', cursoData.video_url);
                                        console.log('URL completa intentada:', e.target.src);
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : (
                                <div className="no-video">
                                    <i className="bx bx-video"></i>
                                    <span>Sin video de vista previa</span>
                                </div>
                            )}
                            {cursoData.video_url && (
                                <div className="no-video" style={{display: 'none'}}>
                                    <i className="bx bx-video"></i>
                                    <span>Error al cargar video</span>
                                </div>
                            )}
                        </div>
                        {isEditing && (
                            <div className="video-upload-controls">
                                <input
                                    type="file"
                                    ref={videoInputRef}
                                    accept="video/*"
                                    onChange={handleVideoChange}
                                    style={{ display: 'none' }}
                                />
                                <button 
                                    type="button" 
                                    className="file-input-label"
                                    onClick={handleVideoClick}
                                >
                                    <i className="bx bx-video-plus"></i>
                                    Seleccionar video
                                </button>
                                {videoPreview && (
                                    <button 
                                        type="button" 
                                        className="remove-image-btn"
                                        onClick={() => {
                                            if (videoPreview) {
                                                URL.revokeObjectURL(videoPreview);
                                            }
                                            setVideoPreview(null);
                                            setNewCourseVideo(null);
                                            if (videoInputRef.current) {
                                                videoInputRef.current.value = '';
                                            }
                                        }}
                                    >
                                        <i className="bx bx-trash"></i>
                                        Quitar video
                                    </button>
                                )}
                                <small className="file-help-text">
                                    Formatos permitidos: MP4, AVI, MOV (máx. 50MB)
                                </small>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Estado de Publicación:</label>
                        <div className="toggle-container">
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    name="publicado"
                                    checked={cursoData.publicado === true || cursoData.publicado === 1}
                                    onChange={(e) => {
                                        const newValue = e.target.checked;
                                        setCursoData(prev => ({
                                            ...prev,
                                            publicado: newValue
                                        }));
                                    }}
                                    disabled={!isEditing}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                            <span className={`toggle-label ${(cursoData.publicado === true || cursoData.publicado === 1) ? 'published' : 'unpublished'}`}>
                                {(cursoData.publicado === true || cursoData.publicado === 1) ? 'Publicado' : 'No Publicado'}
                            </span>
                        </div>
                        {!isEditing && (
                            <small className="field-help">
                                {(cursoData.publicado === true || cursoData.publicado === 1)
                                    ? 'Este curso es visible para los estudiantes' 
                                    : 'Este curso no es visible para los estudiantes'
                                }
                            </small>
                        )}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Precio:</label>
                        <input
                            type="number"
                            name="precio_real"
                            value={cursoData.precio_real || ''}
                            onChange={handleChange}
                            placeholder="Precio del curso"
                            disabled={!isEditing}
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div className="form-group">
                        <label>Precio Oferta:</label>
                        <input
                            type="number"
                            name="precio_oferta"
                            value={cursoData.precio_oferta || ''}
                            onChange={handleChange}
                            placeholder="Precio en oferta (opcional)"
                            disabled={!isEditing}
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group full-width">
                        <label>Descripción:</label>
                        <textarea
                            name="descripcion"
                            value={cursoData.descripcion || ''}
                            onChange={handleChange}
                            placeholder="Descripción del curso"
                            disabled={!isEditing}
                            rows="4"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group full-width">
                        <label>Contenido del Curso:</label>
                        <textarea
                            name="contenido"
                            value={cursoData.contenido || ''}
                            onChange={handleChange}
                            placeholder="Contenido detallado del curso"
                            disabled={!isEditing}
                            rows="6"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group full-width">
                        <label>Requisitos:</label>
                        <textarea
                            name="requisitos"
                            value={cursoData.requisitos || ''}
                            onChange={handleChange}
                            placeholder="Requisitos del curso"
                            disabled={!isEditing}
                            rows="4"
                        />
                    </div>
                </div>



                <div className="form-actions">
                    {isEditing ? (
                        <>
                            <button 
                                type="button" 
                                className="update-btn" 
                                onClick={handleUpdate}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <i className="bx bx-loader-alt bx-spin"></i>
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar Cambios'
                                )}
                            </button>
                            <button 
                                type="button" 
                                className="cancel-btn" 
                                onClick={() => {
                                    setIsEditing(false);
                                    setPreviewImage(null);
                                    setNewCourseImage(null);
                                    setVideoPreview(null);
                                    setNewCourseVideo(null);
                                }}
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                        </>
                    ) : (
                        <>
                          
                            <button type="button" className="back-btn" onClick={() => setCurrentSection('cursos')}>
                                Volver
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
};

VerCursos.propTypes = {
    cursoId: PropTypes.number,
    setCurrentSection: PropTypes.func.isRequired
};

export default VerCursos;
