import React from 'react';

const RolePermissions = ({ 
  accessLevel = {
    title: 'Super Administrador',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  permissions = [
    {
      id: 'payment-methods',
      icon: '💳',
      title: 'Gestión de Métodos de Pago',
      iconBgColor: 'bg-blue-100'
    },
    {
      id: 'app-admin',
      icon: '📱',
      title: 'Administración de Aplicaciones',
      iconBgColor: 'bg-blue-100'
    },
    {
      id: 'user-permissions',
      icon: '👥',
      title: 'Asignación de Permisos de Usuario',
      iconBgColor: 'bg-blue-100'
    }
  ]
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Rol y Permisos</h2>
      
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-2">Nivel de Acceso</label>
        <span className={`inline-block ${accessLevel.badgeColor} text-sm px-3 py-1 rounded-full`}>
          {accessLevel.title}
        </span>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-3">Permisos Asignados</label>
        <div className="space-y-2">
          {permissions.map((permission) => (
            <div 
              key={permission.id}
              className="flex items-center space-x-3 p-3 bg-white rounded border"
            >
              <div className={`w-6 h-6 ${permission.iconBgColor} rounded flex items-center justify-center text-sm`}>
                {permission.icon}
              </div>
              <span className="text-gray-900">{permission.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RolePermissions;