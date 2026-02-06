
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const isProduction = import.meta.env.PROD;
  const hostname = window.location.hostname;


  if (isProduction) {

    return `${window.location.protocol}//${hostname}/api`;
  } else {

    return 'http://localhost:8000/api';
  }
};


export const API_URL = getApiUrl();


export const STATIC_URL = API_URL.replace('/api', '');


export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};


export const ENV_INFO = {
  mode: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  apiUrl: API_URL,
  staticUrl: STATIC_URL
};


if (import.meta.env.DEV) {
  console.log('🔧 Configuración de API:', ENV_INFO);
}

export default API_URL;
