/**
 * Realiza una llamada a la API con la configuración adecuada
 * @param {string} endpoint - Endpoint a llamar (ej: '/callback')
 * @param {Object} data - Datos a enviar en el body
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Object>} Respuesta de la API
 */
export const apiCall = async (endpoint, data = {}, options = {}) => {
    const url = `${"https://theoriginallab-api-automatizacionestol-prod.m0oqwu.easypanel.host"}${endpoint}`;
    
    const defaultOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'lety',
        ...options.headers
      },
      body: JSON.stringify(data),
      timeout: 10000
    };
  
    const finalOptions = { ...defaultOptions, ...options };
  
    try {
      console.log(`Llamando API: ${url}`, data);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout);
      
      const response = await fetch(url, {
        ...finalOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`Respuesta API: ${url}`, result);
      
      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout: La llamada a la API tardó demasiado');
      }
      
      console.error(`Error en API call a ${url}:`, error);
      throw error;
    }
  };
  
  /**
   * Llama al endpoint de callback
   * @param {Object} callbackData - Datos del callback
   * @returns {Promise<Object>} Respuesta del callback
   */
  export const callbackAPI = async (callbackData) => {
    return await apiCall('/callback', callbackData);
  };
  
  /**
   * Llama al endpoint de validación de sesión
   * @param {string} session - Sesión a validar
   * @returns {Promise<Object>} Respuesta de la validación
   */
  export const validateSessionAPI = async (session) => {
    return await apiCall('/validate_session', { session });
  };
  
  /**
   * Simula el callback que vendría de la API externa de login
   * @param {string} session - Sesión generada
   * @returns {Promise<Object>} Datos simulados del usuario
   */
  export const simulateExternalLoginCallback = async (session) => {
    // En producción, esto vendría realmente de la API externa
    const simulatedCallbackData = {
      session: 'session',
      token_app: 'csbjsN9jvhrhNWYEU0Uc',
      secret_key: '5ZcaBXG4P3fImUskQpBC',
      email: "usuario@ejemplo.com",
      name: "Usuario Bolita",
      phone: "6184654546",
      profile_img: "https://i.imgur.com/a4yjlrf.png"
    };
  
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return simulatedCallbackData;
  };