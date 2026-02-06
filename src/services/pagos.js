import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;


export const getPagos = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        
        if (filters.search) params.append('search', filters.search);
        if (filters.status && filters.status !== 'todos') params.append('status', filters.status);
        if (filters.method && filters.method !== 'todos') params.append('method', filters.method);
        if (filters.dateRange && filters.dateRange !== 'todos') params.append('date_range', filters.dateRange);
        
        const response = await axios.get(`${API_URL}/pagos?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error obteniendo pagos:', error);
        throw error;
    }
};


export const getEstadisticasPagos = async () => {
    try {
        const response = await axios.get(`${API_URL}/pagos/estadisticas`);
        return response.data;
    } catch (error) {
        console.error('Error obteniendo estadísticas de pagos:', error);
        throw error;
    }
};


export const getDetallePago = async (pagoId) => {
    try {
        const response = await axios.get(`${API_URL}/pagos/${pagoId}`);
        return response.data;
    } catch (error) {
        console.error('Error obteniendo detalle del pago:', error);
        throw error;
    }
};


export const procesarPago = async (pagoData) => {
    try {
        const response = await axios.post(`${API_URL}/pagos/procesar`, pagoData);
        return response.data;
    } catch (error) {
        console.error('Error procesando pago:', error);
        throw error;
    }
};


export const verificarPago = async (pagoId) => {
    try {
        const response = await axios.put(`${API_URL}/pagos/${pagoId}/verificar`);
        return response.data;
    } catch (error) {
        console.error('Error verificando pago:', error);
        throw error;
    }
};


export const reintentarPago = async (pagoId) => {
    try {
        const response = await axios.put(`${API_URL}/pagos/${pagoId}/reintentar`);
        return response.data;
    } catch (error) {
        console.error('Error reintentando pago:', error);
        throw error;
    }
};


export const getMetodosPago = async () => {
    try {
        const response = await axios.get(`${API_URL}/pagos/metodos`);
        return response.data;
    } catch (error) {
        console.error('Error obteniendo métodos de pago:', error);
        throw error;
    }
};


export const getPagosPorInscripcion = async (inscripcionId) => {
    try {
        const response = await axios.get(`${API_URL}/inscripciones/${inscripcionId}/pagos`);
        return response.data;
    } catch (error) {
        console.error('Error obteniendo pagos de inscripción:', error);
        throw error;
    }
};


export const agregarPagoInscripcion = async (inscripcionId, pagoData) => {
    try {
        const response = await axios.post(`${API_URL}/inscripciones/${inscripcionId}/pagos`, pagoData);
        return response.data;
    } catch (error) {
        console.error('Error agregando pago a inscripción:', error);
        throw error;
    }
};