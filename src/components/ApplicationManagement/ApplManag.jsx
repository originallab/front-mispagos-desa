import React from 'react';
import { Star, Search, ChevronDown, Settings, Eye } from 'lucide-react';

const ApplicationManagement = () => {
  const applications = [
    {
      id: 1,
      name: 'TaskMaster Pro',
      icon: '📋',
      users: '12,450',
      revenue: '$28,500',
      rating: 4.8,
      status: 'Activo',
      progress: 85,
      color: 'blue'
    },
    {
      id: 2,
      name: 'SocialConnect',
      icon: '💬',
      users: '8,920',
      revenue: '$15,200',
      rating: 4.5,
      status: 'Activo',
      progress: 68,
      color: 'blue'
    },
    {
      id: 3,
      name: 'GameZone',
      icon: '🎮',
      users: '15,600',
      revenue: '$42,300',
      rating: 4.9,
      status: 'Activo',
      progress: 92,
      color: 'blue'
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={12}
        className={index < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="w-4 h-4 bg-purple-500 rounded mr-2"></span>
              Gestión de Aplicaciones
            </h1>
          </div>
          
          {/* Controls */}
          <div className="flex gap-4 items-center">
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Todos los estados</option>
                <option>Activo</option>
                <option>Inactivo</option>
                <option>En desarrollo</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar aplicaciones..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* App Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl mr-3">
                    {app.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{app.name}</h3>
                  </div>
                </div>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  {app.status}
                </span>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-800">{app.users}</span>
                  <span className="text-2xl font-bold text-green-600">{app.revenue}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Usuarios</span>
                  <span>Ingresos</span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <span className="text-sm font-medium text-gray-700 mr-2">{app.rating}</span>
                <div className="flex items-center mr-2">
                  {renderStars(app.rating)}
                </div>
                <span className="text-xs text-gray-500">Calificación</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${app.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{app.progress}%</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <Eye size={16} className="mr-1" />
                  Ver Detalles
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center">
                  <Settings size={16} />
                  <span className="ml-1 hidden sm:inline">Config</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplicationManagement;