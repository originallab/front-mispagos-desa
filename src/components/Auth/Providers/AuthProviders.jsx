// providers/AuthProvider.jsx
import React, { useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { 
  generateSession, 
  saveSession, 
  getSession, 
  removeSession, 
  buildLoginUrl 
} from '../utils/session';
import { 
  validateSessionAPI
} from '../utils/api';

/**
 * Provider de autenticación
 * Maneja todo el estado y lógica de autenticación de la aplicación
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  /**
   * Función para iniciar el proceso de login
   * Genera sesión única y redirige al login externo
   */
  const preLogin = async () => {
    try {
      setIsLoading(true);
      setIsRedirecting(true);
      
      // Generar sesión única
      const session = generateSession();
      console.log('✅ Sesión generada:', session);
      
      // Guardar sesión en localStorage
      saveSession(session);
      console.log('✅ Sesión guardada en localStorage');
      
      // Construir URL de redirección
      const loginUrl = buildLoginUrl(session);
      console.log('✅ URL construida:', loginUrl);
      
      // Delay para mostrar loading
      console.log('🔄 Esperando 1 segundo antes de redirección...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // REDIRECCIÓN REAL
      console.log('🌐 EJECUTANDO REDIRECCIÓN A ORIGINALAUTH.COM');
      window.location.href = loginUrl;
      
    } catch (error) {
      console.error('❌ Error en preLogin:', error);
      alert(`Error: ${error.message}`);
      removeSession();
      setIsRedirecting(false);
      setIsLoading(false);
    }
  };

  /**
   * Valida la sesión actual con la API
   */
  const validateSession = async () => {
    try {
      setIsLoading(true);
      
      const session = getSession();
      if (!session) {
        console.log('❌ No hay sesión en localStorage');
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      console.log('🔍 Validando sesión:', session);
      
      // Llamar al endpoint de validación
      const response = await validateSessionAPI(session);
      
      console.log('📦 Respuesta de validateSession:', response);
      
      // Verificar respuesta según tu API real
      if (response && (response.validated === 1 || response.success || response.valid || response.status === 'ok')) {
        // Usar datos reales de la API
        const userData = {
          email: response.email || "usuario@ejemplo.com",
          name: response.name || response.email?.split('@')[0] || "Usuario",
          phone: response.phone || "6184654546",
          profile_img: response.profile_img || "https://i.imgur.com/a4yjlrf.png",
          session: session,
          validated: response.validated,
          ...response
        };
        
        setIsAuthenticated(true);
        setUser(userData);
        console.log('✅ Usuario autenticado con datos reales:', userData);
        return true;
      } else {
        console.log('❌ Sesión inválida - Respuesta completa:', response);
        removeSession();
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error validando sesión:', error);
      removeSession();
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = () => {
    console.log('🚪 Cerrando sesión...');
    removeSession();
    setIsAuthenticated(false);
    setUser(null);
    setIsRedirecting(false);
  };

  /**
   * Refrescar datos del usuario
   */
  const refreshUserData = async () => {
    if (isAuthenticated) {
      await validateSession();
    }
  };

  /**
   * Limpiar todos los datos
   */
  const clearAuthData = () => {
    removeSession();
    setIsAuthenticated(false);
    setUser(null);
    setIsRedirecting(false);
  };

  // Inicializar autenticación al cargar
  useEffect(() => {
    const init = async () => {
      try {
        await validateSession();
      } catch (error) {
        console.error('Error inicializando:', error);
        clearAuthData();
      }
    };
    init();
  }, []);

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'session') {
        if (e.newValue === null) {
          setIsAuthenticated(false);
          setUser(null);
        } else if (e.newValue !== e.oldValue) {
          validateSession();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    isRedirecting,
    preLogin,
    validateSession,
    logout,
    refreshUserData,
    clearAuthData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;