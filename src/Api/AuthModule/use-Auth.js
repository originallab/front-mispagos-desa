import { useContext } from 'react';
import { AuthContext } from '../AuthContext';

/**
 * Hook ir al context auth
 * @returns {Object} Contexto de autenticación con estado y métodos
 * @throws {Error} Si se usa fuera del AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error(
      'useAuth debe usarse dentro de un AuthProvider. ' +
      'Asegúrate de envolver tu componente con <AuthProvider>'
    );
  }
  
  return context;
};

export default useAuth;