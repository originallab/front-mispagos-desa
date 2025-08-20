import React, { useState, useEffect } from 'react';
import { ProfileService } from '../../Api/services/profileService.js';
import { ProfileUtils } from '../../Api/utils/profileUtils';

const ProfileHeader = ({ 
  userId = 1,
  user = null,
  role = null,
  loading = false,
  customColors = null
}) => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(loading);
  const [error, setError] = useState(null);

  // Efecto para cargar datos del perfil si se proporciona userId
  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await ProfileService.getUserBasicProfile(userId);
        
        if (response.success) {
          setProfileData(response.data);
        } else {
          setError('Error al cargar perfil');
        }
      } catch (err) {
        console.error('Error cargando perfil:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  // Determinar qué datos usar (props directos o datos cargados)
  const currentData = profileData || (user && role ? { user, role } : null);
  
  if (isLoading) {
    return (
      <div className="bg-gray-600 text-white">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <div className="h-8 bg-gray-500 rounded mb-2 w-48 mx-auto animate-pulse"></div>
            <div className="h-4 bg-gray-500 rounded w-32 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-600 text-white">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
              ⚠️
            </div>
            <h1 className="text-2xl font-semibold mb-1">Error</h1>
            <p className="text-red-100">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentData) {
    return (
      <div className="bg-gray-600 text-white">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
              👤
            </div>
            <h1 className="text-2xl font-semibold mb-1">Usuario</h1>
            <p className="text-gray-100">Sin datos de perfil</p>
          </div>
        </div>
      </div>
    );
  }

  // Formatear datos para mostrar
  const formattedData = ProfileUtils.formatProfileForHeader(currentData);
  const themeColors = customColors || ProfileUtils.getThemeColorsForRole(formattedData.role.role_name);

  return (
    <div className={`${themeColors.bgColor} text-white`}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="text-center">
          <div className={`w-24 h-24 ${themeColors.avatarBgColor} rounded-full mx-auto mb-4 flex items-center justify-center text-3xl`}>
            {formattedData.profile.avatar}
          </div>
          <h1 className="text-2xl font-semibold mb-1">
            {formattedData.profile.displayName}
          </h1>
          <p className="text-blue-100">{formattedData.role.role_name}</p>
          <p className="text-blue-200 text-sm mt-1">{formattedData.user.email}</p>
          {formattedData.profile.applicationCount > 0 && (
            <p className="text-blue-200 text-xs mt-1">
              {formattedData.profile.applicationCount} aplicación{formattedData.profile.applicationCount !== 1 ? 'es' : ''} vinculada{formattedData.profile.applicationCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;