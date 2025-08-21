
import React from 'react';
import { Loader, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../utils/useAuth';

/**
 * Componente para proteger rutas que requieren autenticación
 * Muestra loading, redirige a home si no está autenticado, o renderiza el contenido
 */
export const ProtectedRoute = ({ children, fallback = null }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-lg">Verificando sesión...</p>
          <p className="text-gray-500 text-sm mt-2">
            Esto puede tardar unos segundos
          </p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar el fallback o redirigir
  if (!isAuthenticated) {
    if (fallback) {
      return fallback;
    }
    
    // Mostrar mensaje de acceso denegado
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acceso Restringido
            </h2>
            <p className="text-gray-600 mb-6">
              Necesitas iniciar sesión para acceder a esta página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Usuario autenticado, renderizar el contenido protegido
  return (
    <div className="min-h-screen">
      {/* Header opcional con información de seguridad */}
      <div className="bg-green-50 border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                Sesión segura activa para {user?.name}
              </span>
            </div>
            <div className="text-xs text-green-600">
              ID: {user?.session?.substring(0, 8)}...
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenido protegido */}
      {children}
    </div>
  );
};

export default ProtectedRoute;