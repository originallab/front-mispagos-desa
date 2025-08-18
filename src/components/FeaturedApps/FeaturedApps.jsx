import React from 'react';

const FeaturedApps = () => {
  const apps = [
    {
      id: 1,
      name: 'GameZone',
      category: 'Juegos y entretenimiento',
      rating: 4.9,
      downloads: '+16.5k descargas',
      icon: '🎮',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700'
    },
    {
      id: 2,
      name: 'TaskMaster Pro',
      category: 'Productividad',
      rating: 4.8,
      downloads: '+12.3k descargas',
      icon: '📋',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700'
    },
    {
      id: 3,
      name: 'BusinessFlow',
      category: 'Negocios',
      rating: 4.7,
      downloads: '+8.7k descargas',
      icon: '💼',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700'
    }
  ];

  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center gap-1">
        <span className="text-yellow-400 text-sm">⭐</span>
        <span className="text-sm font-medium text-gray-700">{rating}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xl">⭐</span>
          <h2 className="text-lg font-semibold text-gray-800">Apps Destacadas</h2>
        </div>
        <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
          Ver todas
        </button>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {apps.map((app) => (
          <div
            key={app.id}
            className={`${app.bgColor} rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border border-opacity-20`}
          >
            <div className="flex items-start gap-3">
              {/* App Icon */}
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl shadow-sm">
                {app.icon}
              </div>
              
              {/* App Info */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold ${app.textColor} text-base mb-1 truncate`}>
                  {app.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2 truncate">
                  {app.category}
                </p>
                
                {/* Rating and Downloads */}
                <div className="flex items-center justify-between">
                  <StarRating rating={app.rating} />
                  <span className="text-xs text-gray-500 bg-white bg-opacity-70 px-2 py-1 rounded-full">
                    {app.downloads}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedApps;