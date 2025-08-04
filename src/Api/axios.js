// src/api/axios.js
import axios from 'axios';
import { apiConfig } from './config';

const api = axios.create(apiConfig);

// API Key configurada globalmente
const API_KEY = 'lety';

// Configurar el interceptor para agregar el token y API key a las solicitudes
api.interceptors.request.use((config) => {
  // Agregar API key automáticamente a todos los headers
  config.headers.apikey = API_KEY;
  
  // Log para debugging (puedes comentar en producción)
  console.log('🔑 API Key agregada automáticamente:', API_KEY);
  console.log('📡 Solicitud a:', config.url);
  
  return config;
});

// Interceptor para respuestas (opcional - para manejo de errores global)
api.interceptors.response.use(
  (response) => {
    // Log de respuesta exitosa (puedes comentar en producción)
    console.log('✅ Respuesta exitosa de:', response.config.url);
    return response;
  },
  (error) => {
    // Log de errores (puedes comentar en producción)
    console.error('❌ Error en solicitud:', error.config?.url, error.response?.status);
    return Promise.reject(error);
  }
);

export default api;