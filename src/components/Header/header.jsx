import React, { useState } from 'react';
import { Bell, User } from 'lucide-react';

const AdminPanelHeader = () => {
  const [hasNotifications, setHasNotifications] = useState(true);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* titulo Panel */}
        <h1 className="text-2xl font-semibold text-gray-800">
          Panel de Administración
        </h1>
        
        {/* parte del usuario */}
        <div className="flex items-center space-x-4">
          {/* Campana de notificaciones */}
          <div className="relative">
            <button 
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
              onClick={() => setHasNotifications(false)}
            >
              <Bell className="w-5 h-5" />
              {hasNotifications && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  •
                </span>
              )}
            </button>
          </div>
          
          {/* Avatar y nombre de usuario */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <span className="text-gray-700 font-medium">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminPanelHeader;