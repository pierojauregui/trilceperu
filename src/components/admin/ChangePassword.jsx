import React, { useState } from 'react';
import axios from 'axios';
import './ChangePassword.css';

const ChangePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    if (!password) {
      setError('La contraseña es obligatoria');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await axios.put(`${API_URL}/superadmin/change-password`, {
        nueva_contrasena: password
      });
      
      setMessage(response.data.message);
      setPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setError(error.response?.data?.detail || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        <h2>Cambiar Contraseña del SuperAdmin</h2>
        <p className="description">
          Cambia la contraseña del usuario SuperAdmin (ID: 1)
        </p>
        
        <form onSubmit={handleSubmit} className="change-password-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {message && (
            <div className="success-message">
              {message}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="password">Nueva Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa la nueva contraseña"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirma la nueva contraseña"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;