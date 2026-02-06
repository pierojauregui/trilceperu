import { useState, useEffect } from 'react';
import './VerCategorias.css';
import Swal from 'sweetalert2';


const VerCategorias = ({ categoriaId, setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    descripcion: ''
  });

  useEffect(() => {
    const fetchCategoria = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/categorias/${categoriaId}`);
        if (!response.ok) {
          throw new Error('Error al cargar la categoría');
        }
        const result = await response.json();
        // El backend devuelve 'categoria' no 'data'
        const categoriaData = result.categoria;
        setCategoria(categoriaData);
        setEditFormData({
          descripcion: categoriaData.descripcion || ''
        });
      } catch (error) {
        console.error('Error al cargar datos de la categoría:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información de la categoría',
        });
      } finally {
        setLoading(false);
      }
    };

    if (categoriaId) {
      fetchCategoria();
    }
  }, [categoriaId]);

  const handleBackToCategorias = () => {
    setCurrentSection('categorias');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditFormData({
      descripcion: categoria.descripcion || ''
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({
      descripcion: categoria.descripcion || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdate = async () => {
    try {
      // Verificar si hay cambios
      const hasChanges = Object.keys(editFormData).some(key => {
        const originalValue = categoria[key];
        const newValue = editFormData[key];
        return originalValue !== newValue;
      });

      if (!hasChanges) {
        Swal.fire({
          icon: 'info',
          title: 'Sin cambios',
          text: 'No se detectaron cambios para actualizar.',
        });
        setIsEditing(false);
        return;
      }

      // Validaciones
      if (!editFormData.descripcion?.trim()) {
        Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'La descripción de la categoría es obligatoria.',
        });
        return;
      }

      const response = await fetch(`${API_URL}/categorias/${categoriaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al actualizar la categoría');
      }

      const result = await response.json();
      // El backend devuelve 'categoria' no 'data'
      const updatedCategoria = result.categoria;
      setCategoria(updatedCategoria);
      setIsEditing(false);

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Categoría actualizada correctamente',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al actualizar la categoría',
      });
    }
  };

  const handleDelete = async () => {
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
        const response = await fetch(`${API_URL}/categorias/${categoriaId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Error al eliminar la categoría');
        }

        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'La categoría ha sido eliminada correctamente',
          timer: 2000,
          showConfirmButton: false
        });

        // Redirigir a la lista de categorías
        setCurrentSection('categorias');

      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Error al eliminar la categoría',
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="categoria-loading">
        <div className="spinner"></div>
        <p>Cargando información de la categoría...</p>
      </div>
    );
  }

  if (!categoria) {
    return (
      <div className="categoria-error">
        <h2>Categoría no encontrada</h2>
        <button onClick={handleBackToCategorias} className="back-btn">
          Volver a Categorías
        </button>
      </div>
    );
  }

  return (
    <div className="ver-categorias-container">
      <div className="categoria-header">
        <h1>Detalles de la Categoría</h1>
        <div className="header-actions">
          {!isEditing ? (
            <>
              <button className="edit-btn" onClick={handleEdit}>
                Editar Categoría
              </button>
              <button className="delete-btn" onClick={handleDelete}>
                Eliminar Categoría
              </button>

               <button onClick={handleBackToCategorias} className="back-btn">
          ← Volver a Categorías
        </button>
            </>
          ) : (
            <>
              <button className="save-btn" onClick={handleUpdate}>
                Guardar Cambios
              </button>
              <button className="cancel-btn" onClick={handleCancelEdit}>
                Cancelar
              </button>
            </>
          )}
        </div>
       
      </div>

      <div className="categoria-content">
        <div className="categoria-info-panel">
          <div className="categoria-section">
            <h2>Información General</h2>
            
            <div className="form-group">
              <label>ID:</label>
              <p>{categoria.id}</p>
            </div>

            <div className="form-group">
              <label>Descripción:</label>
              {isEditing ? (
                <textarea
                  name="descripcion"
                  value={editFormData.descripcion || ''}
                  onChange={handleInputChange}
                  placeholder="Ingrese la descripción de la categoría"
                  rows="4"
                  required
                />
              ) : (
                <p>{categoria.descripcion || 'Sin descripción'}</p>
              )}
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default VerCategorias;
