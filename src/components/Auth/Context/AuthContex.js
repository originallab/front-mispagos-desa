import { createContext } from 'react';
/**
 * Contexto de autenticación
 * Proporciona el estado y métodos de autenticación a toda la aplicación
 */
export const AuthContext = createContext({
  // Estado del usuario
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isRedirecting: false,
  
  // Métodos de autenticación
  preLogin: () => {},
  validateSession: () => Promise.resolve(false),
  logout: () => {},
  
  // Métodos auxiliares
  refreshUserData: () => Promise.resolve(),
  clearAuthData: () => {}
});

export default AuthContext;