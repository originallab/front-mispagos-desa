

/**
 * Genera una sesión única usando timestamp y string aleatorio
 * @returns {string} Sesión única
 */
export const generateSession = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}_${random}`;
  };
  
  /**
   * Guarda la sesión en localStorage
   * @param {string} session - Sesión a guardar
   */
  export const saveSession = (session) => {
    try {
      localStorage.setItem('session', session);
      console.log('Sesión guardada:', session);
    } catch (error) {
      console.error('Error guardando sesión:', error);
      throw new Error('No se pudo guardar la sesión');
    }
  };
  
  /**
   * Obtiene la sesión desde localStorage
   * @returns {string|null} Sesión o null si no existe
   */
  export const getSession = () => {
    try {
      return localStorage.getItem('session');
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
      return null;
    }
  };
  
  /**
   * Elimina la sesión del localStorage
   */
  export const removeSession = () => {
    try {
      localStorage.removeItem('session');
      localStorage.removeItem('user_data');
      console.log('Sesión eliminada');
    } catch (error) {
      console.error('Error eliminando sesión:', error);
    }
  };
  
  /**
   * Construye la URL de redirección al login externo
   * @param {string} session - Sesión única
   * @returns {string} URL completa para redirección
   */
  export const buildLoginUrl = (session) => {
    const loginUrl = new URL('https://originalauth.com/login');
    
    // Agregar los parámetros específicos según la URL real
    // XjHUqpCaMIclqn2sdgVk es el nombre del parámetro para el token
    loginUrl.searchParams.append('token_app', 'csbjsN9jvhrhNWYEU0Uc');
    loginUrl.searchParams.append('session', session);
    
    // Debug: verificar que los valores estén presentes
    console.log('🔍 Debug buildLoginUrl:');
    console.log('  - APP_TOKEN:', 'csbjsN9jvhrhNWYEU0Uc');
    console.log('  - Session:', session);
    console.log('  - URL final:', loginUrl.toString());
    
    return loginUrl.toString();
  };
  
  /**
   * Verifica si hay una sesión válida en localStorage
   * @returns {boolean} True si existe una sesión
   */
  export const hasValidSession = () => {
    const session = getSession();
    return session !== null && session.length > 0;
  };