import axios from 'axios';
import logger from '../utils/logger';

const API_URL = import.meta.env.VITE_API_URL;


axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
      
        if (error.response?.status === 401) {
            const errorMessage = error.response?.data?.detail || '';
            if (errorMessage.includes('Token expirado') || errorMessage.includes('Token inválido')) {
                logger.auth('Token expirado, limpiando sesión...');
                
              
                const event = new CustomEvent('sessionExpiredByToken', {
                    detail: { reason: 'token_expired' }
                });
                window.dispatchEvent(event);
                
               
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                delete axios.defaults.headers.common['Authorization'];
                
             
                setTimeout(() => {
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                }, 2000);
            }
        }
        return Promise.reject(error);
    }
);

export const login = async (email, password) => {
    try {
        logger.sensitive('Intentando login:', { email, password });
        logger.api("API_URL es:", API_URL);
        
        
        const response = await axios.post(`${API_URL}/login`, {
            correo_electronico: email,
            contrasena: password
        });
        
        logger.sensitive('Respuesta del servidor:', response.data);
        return response.data;
    } catch (error) {
        logger.error('Error en login:', error.response?.data || error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
};

export const getCurrentUser = async () => {
    try {
        const response = await axios.get(`${API_URL}/me`);
        return response.data;
    } catch (error) {
        logger.error('Error obteniendo usuario actual:', error);
        throw error;
    }
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const register = async (userData) => {
    try {
        logger.sensitive('Intentando registro:', userData);
        logger.api("API_URL es:", API_URL);
        
        
        const backendData = {
            nombres: userData.nombres,
            apellidos: userData.apellidos,
            dni: userData.dni,
            celular: userData.celular,
            nivel: userData.nivel,
            area: userData.area,
            correo_electronico: userData.email,
            contraseña: userData.password,
            fecha_nacimiento: null, 
            rol_usuario_id: 4 
        };
        
        const response = await axios.post(`${API_URL}/users/create`, backendData);
        
        logger.sensitive('Respuesta del servidor:', response.data);
        return response.data;
    } catch (error) {
        logger.error('Error en registro:', error.response?.data || error);
        throw error;
    }
};

