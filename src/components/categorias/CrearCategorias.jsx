import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './CrearCategorias.css';
import PropTypes from 'prop-types';

const CrearCategorias = ({ setCurrentSection }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // Estado del formulario para categoría
  const [formData, setFormData] = useState({
    descripcion: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/categorias/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          descripcion: formData.descripcion
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error al crear la categoría: ${response.status}`);
      }

      const result = await response.json();
      
      await Swal.fire({
        title: '¡Éxito!',
        text: 'La categoría ha sido creada correctamente.',
        icon: 'success',
        confirmButtonColor: '#4CAF50'
      });

      // Limpiar formulario
      setFormData({
        descripcion: ''
      });
      
      // Navegar a la lista de categorías
      setCurrentSection('categorias');
      
    } catch (error) {
      console.error('Error al crear categoría:', error);
      await Swal.fire({
        title: 'Error',
        text: error.message || 'Hubo un problema al crear la categoría.',
        icon: 'error',
        confirmButtonColor: '#f44336'
      });
    }
  };

  return (
    <div className="crear-categoria-container">
      <div className="header-section">
        <h2>Crear Nueva Categoría</h2>
        <p>Complete la información de la categoría</p>
      </div>

      <form className="categoria-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Descripción:</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            required
            placeholder="Describe brevemente esta categoría..."
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => setCurrentSection('categorias')}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Crear Categoría
          </button>
        </div>
      </form>
    </div>
  );
};

CrearCategorias.propTypes = {
  setCurrentSection: PropTypes.func.isRequired
};

export default CrearCategorias;