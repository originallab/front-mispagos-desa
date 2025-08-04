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

const Sidebar = () => {
  return (
    <div className="bg-gradient-to-b from-blue-800 to-blue-900 text-white w-64 space-y-6 py-5 px-2 absolute inset-y-0 left-0 transform md:
    relative md:translate-x-0 transition duration-200 ease-in-out z-20">
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
        <a href="#dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700 flex items-center space-x-2 bg-blue-700">
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </a>
        
        <div className="px-4 py-2 mt-6 text-gray-300 uppercase text-xs font-semibold">Administración</div>
        <a href="#payment-methods" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700 flex items-center space-x-2">
          <Banknote className="h-5 w-5" />
          <span>Métodos de Pago</span>
        </a>
        <a href="#applications" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700 flex items-center space-x-2">
          <Grid3X3 className="h-5 w-5" />
          <span>Aplicaciones</span>
        </a>
        <a href="#user-permissions" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700 flex items-center space-x-2">
          <UserCog className="h-5 w-5" />
          <span>Permisos de Usuario</span>
        </a>
        
        <div className="px-4 py-2 mt-6 text-gray-300 uppercase text-xs font-semibold">Configuración</div>
        <a href="#settings" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700 flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Configuración</span>
        </a>
        <a href="#profile" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700 flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Perfil</span>
        </a>
        <a href="#logout" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700 flex items-center space-x-2 mt-6 text-red-300">
          <LogOut className="h-5 w-5" />
          <span>Cerrar Sesión</span>
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;