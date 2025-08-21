// config/app.js
export const APP_CONFIG = {
    // URL base de tu API principal
    API_BASE_URL: 'https://theoriginallab-api-mispagos-desa.m0oqwu.easypanel.host',
    
    // API Key para autenticación con tu API
    API_KEY: 'lety',
    
    // Token de la aplicación (IMPORTANTE: Este va en el parámetro token_app)
    APP_TOKEN: 'csbjsN9jvhrhNWYEU0Uc',
    
    // Clave secreta
    SECRET_KEY: '5ZcaBXG4P3fImUskQpBC',
    
    // URL de la API de login externa
    LOGIN_API_URL: 'https://originalauth.com/login',
    
    // Endpoints de la API
    ENDPOINTS: {
      CALLBACK: '/callback',
      VALIDATE_SESSION: '/validate_session'
    },
    
    // Configuración de localStorage
    STORAGE_KEYS: {
      SESSION: 'session',
      USER_DATA: 'user_data'
    },
    
    // Configuración de timeouts
    TIMEOUTS: {
      API_CALL: 10000, // 10 segundos
      SESSION_CHECK: 5000 // 5 segundos
    }
  };
  
  // Debug: Verificar que la configuración se carga correctamente
  console.log('🔧 Configuración APP_CONFIG cargada:');
  console.log('  - APP_TOKEN:', APP_CONFIG.APP_TOKEN);
  console.log('  - LOGIN_API_URL:', APP_CONFIG.LOGIN_API_URL);
  
  export default APP_CONFIG;