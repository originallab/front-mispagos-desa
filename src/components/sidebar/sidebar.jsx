import React from 'react';
import { 
  CreditCard, 
  LayoutDashboard, 
  Banknote, 
  Grid3X3, 
  UserCog, 
  Settings, 
  User, 
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ activeView, onViewChange }) => {
  
  // Función para manejar clics en el menú
  const handleMenuClick = (viewName) => {
    console.log('Clicked:', viewName); // Para debug
    onViewChange(viewName);
  };

  // Función para verificar si un elemento está activo
  const isActive = (viewName) => activeView === viewName;

  // Función para obtener las clases CSS
  const getMenuItemClasses = (viewName) => {
    const baseClasses = "w-full text-left py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700 flex items-center space-x-2 cursor-pointer";
    return isActive(viewName) ? `${baseClasses} bg-blue-700` : baseClasses;
  };

  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-900 text-white w-64 space-y-6 py-5 px-2 absolute inset-y-0 left-0 transform md:relative md:translate-x-0 transition duration-200 ease-in-out z-20">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-6 w-6" />
          <span className="text-xl font-bold">PayAdmin</span>
        </div>
        <button className="md:hidden p-2 rounded-md hover:bg-blue-700">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <nav className="mt-10">
        <div className="px-4 py-2 text-gray-300 uppercase text-xs font-semibold">Principal</div>
        
        {/* Dashboard */}
        <div 
          className={getMenuItemClasses('dashboard')}
          onClick={() => handleMenuClick('dashboard')}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </div>
        
        <div className="px-4 py-2 mt-6 text-gray-300 uppercase text-xs font-semibold">Administración</div>
        
        {/* Métodos de Pago */}
        <div 
          className={getMenuItemClasses('payment-methods')}
          onClick={() => handleMenuClick('payment-methods')}
        >
          <Banknote className="h-5 w-5" />
          <span>Métodos de Pago</span>
        </div>
        
        {/* Aplicaciones */}
        <div 
          className={getMenuItemClasses('applications')}
          onClick={() => handleMenuClick('applications')}
        >
          <Grid3X3 className="h-5 w-5" />
          <span>Aplicaciones</span>
        </div>
        
        {/* Permisos de Usuario */}
        <div 
          className={getMenuItemClasses('user-permissions')}
          onClick={() => handleMenuClick('user-permissions')}
        >
          <UserCog className="h-5 w-5" />
          <span>Permisos de Usuario</span>
        </div>
        
        <div className="px-4 py-2 mt-6 text-gray-300 uppercase text-xs font-semibold">Configuración</div>
        
        {/* Configuración */}
        <div className="w-full text-left py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700 flex items-center space-x-2 cursor-pointer">
          <Settings className="h-5 w-5" />
          <span>Configuración</span>
        </div>
        
        {/* Perfil */}
        <div className="w-full text-left py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700 flex items-center space-x-2 cursor-pointer">
          <User className="h-5 w-5" />
          <span>Perfil</span>
        </div>
        
        {/* Cerrar Sesión */}
        <div 
          className="w-full text-left py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700 flex items-center space-x-2 mt-6 text-red-300 cursor-pointer"
          onClick={() => {
            console.log('Logout clicked');
            // Aquí puedes agregar la lógica de logout
          }}
        >
          <LogOut className="h-5 w-5" />
          <span>Cerrar Sesión</span>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;