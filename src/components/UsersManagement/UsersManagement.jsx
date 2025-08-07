import React, { useState } from 'react';
import { BarChart3, Users, Settings, Database, TrendingUp, Globe, HelpCircle } from 'lucide-react';

const UsersManagement = () => {
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  const users = [
    {
      id: 'US#001',
      email: 'admin@empresa.com',
      role: 'Administrador',
      roleType: 'admin',
      joinDate: '2024-01',
      appsLinked: 4,
      color: 'bg-red-500',
      actions: ['Dashboard', 'Analytics', 'Users', 'Settings']
    },
    {
      id: 'US#002',
      email: 'tech-lead@empresa.com',
      role: 'Admin Técnico',
      roleType: 'tech',
      joinDate: '2024-02',
      appsLinked: 1,
      color: 'bg-blue-500',
      actions: ['Analytics', 'Monitoring', 'API']
    },
    {
      id: 'US#003',
      email: 'cliente1@gmail.com',
      role: 'Cliente',
      roleType: 'client',
      joinDate: '2024-01',
      appsLinked: 2,
      color: 'bg-green-500',
      actions: ['Portal', 'Support']
    },
    {
      id: 'US#004',
      email: 'admin2@empresa.com',
      role: 'Administrador',
      roleType: 'admin',
      joinDate: '2024-03',
      appsLinked: 3,
      color: 'bg-red-500',
      actions: ['Dashboard', 'Users', 'Reports']
    },
    {
      id: 'US#005',
      email: 'developer@empresa.com',
      role: 'Admin Técnico',
      roleType: 'tech',
      joinDate: '2024-02',
      appsLinked: 1,
      color: 'bg-blue-500',
      actions: ['API', 'Database', 'Monitoring']
    },
    {
      id: 'US#006',
      email: 'cliente2@hotmail.com',
      role: 'Cliente',
      roleType: 'client',
      joinDate: '2024-03',
      appsLinked: 2,
      color: 'bg-green-500',
      actions: ['Portal']
    }
  ];

  const filters = [
    { label: 'Todos', value: 'Todos' },
    { label: 'Administradores', value: 'admin' },
    { label: 'Admin Técnicos', value: 'tech' },
    { label: 'Clientes', value: 'client' }
  ];

  const getFilteredUsers = () => {
    if (selectedFilter === 'Todos') return users;
    return users.filter(user => user.roleType === selectedFilter);
  };

  const getInitials = (email) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getActionIcon = (action) => {
    const icons = {
      'Dashboard': BarChart3,
      'Analytics': TrendingUp,
      'Users': Users,
      'Settings': Settings,
      'API': Globe,
      'Database': Database,
      'Monitoring': TrendingUp,
      'Reports': BarChart3,
      'Portal': Globe,
      'Support': HelpCircle
    };
    return icons[action] || Settings;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Filtros */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium text-gray-700">Filtrar por rol:</span>
          <div className="flex gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === filter.value
                    ? filter.value === 'Todos' 
                      ? 'bg-gray-800 text-white'
                      : filter.value === 'admin'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : filter.value === 'tech'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de usuarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredUsers().map((user) => (
            <div key={user.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              {/* Header con avatar y info */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 ${user.color} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                  {getInitials(user.email)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate text-sm">
                    {user.email}
                  </h3>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>

              {/* Información del usuario */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID Usuario:</span>
                  <span className="font-medium text-gray-900">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha Ingreso:</span>
                  <span className="font-medium text-gray-900">{user.joinDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Apps Vinculadas:</span>
                  <span className="font-medium text-gray-900">{user.appsLinked}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-2">
                {user.actions.map((action, index) => {
                  const IconComponent = getActionIcon(action);
                  return (
                    <button
                      key={index}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition-colors"
                    >
                      <IconComponent size={12} />
                      <span>{action}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;