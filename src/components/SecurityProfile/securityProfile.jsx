import React from 'react';

const SecurityProfile = ({ 
  securitySettings = [
    {
      id: 'password',
      title: 'Contraseña',
      description: 'Última actualización: hace 30 días',
      buttonText: 'Cambiar',
      onButtonClick: () => console.log('Cambiar contraseña clicked')
    },
    {
      id: 'recovery',
      title: 'Recuperación de Contraseña',
      description: 'Configurar métodos de recuperación',
      buttonText: 'Configurar',
      onButtonClick: () => console.log('Configurar recuperación clicked')
    }
  ]
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Configuración de Seguridad</h2>
      
      <div className="space-y-4">
        {securitySettings.map((setting) => (
          <div 
            key={setting.id}
            className="flex items-center justify-between p-3 bg-white rounded border"
          >
            <div>
              <p className="text-gray-900 font-medium">{setting.title}</p>
              <p className="text-sm text-gray-600">{setting.description}</p>
            </div>
            <button 
              onClick={setting.onButtonClick}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              {setting.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityProfile;