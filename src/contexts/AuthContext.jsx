import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as authService from '../services/auth';
import logger from '../utils/logger';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    logger.auth('Cerrando sesión...');
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    logger.auth('Sesión cerrada correctamente');
  };

  useEffect(() => {

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData && userData !== 'undefined' && userData !== 'null') {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
 
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        logger.error('Error parsing user data:', error);

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
      }
    } else if (userData === 'undefined' || userData === 'null') {

      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    logger.auth('Iniciando proceso de login para:', email);
    try {

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      
      logger.api('Enviando petición de login...');
      const response = await authService.login(email, password);

      logger.sensitive('Respuesta del servidor recibida:', response);
      
     
      const { access_token: token, user: userData } = response;
      

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      logger.auth('Token y datos de usuario guardados en localStorage');
      

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      logger.auth('Header de autorización configurado en axios');
      

      setUser(userData);
      setIsAuthenticated(true);
      logger.auth('LOGIN EXITOSO! Usuario autenticado:', userData.nombres, '- Rol:', userData.rol_nombre);
      
      return { success: true, user: userData };
    } catch (error) {
      logger.error('LOGIN FALLIDO - Error completo:', error);
      logger.error('Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.detail || error.response?.data?.message,
        url: error.config?.url
      });
      return { 
        success: false, 
        message: error.response?.data?.detail || error.response?.data?.message || 'Error al iniciar sesión' 
      };
    }
  };



  const updateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/usuarios/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.success) {
        const updatedUser = response.data.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('✅ Usuario actualizado en el contexto:', updatedUser);
      }
    } catch (error) {
      logger.error('Error al actualizar usuario:', error);
    }
  };

  const isSuperAdmin = () => {
    return user?.rol === 'SuperAdmin';
  };

  const isAdmin = () => {
    return user?.rol === 'Admin' || isSuperAdmin();
  };

  const isProfesor = () => {
    return user?.rol === 'Profesor' || isAdmin();
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    isSuperAdmin,
    isAdmin,
    isProfesor
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};