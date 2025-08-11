import React, { useState } from 'react';
import Sidebar from '../components/sidebar/sidebar';
import Dashboard from '../components/dashboard/dashboard';
import PaymentMethod from '../components/paymethod/paymentMethod';
import Application from '../components/Application/application';
import UserPermissions from '../components/UserPermison/userPermisson';
import Header from '../components/Header/Header';
import UsePayment from '../components/usePayment/usePayment';
import { Import } from 'lucide-react';
import TransactionsChart from '../components/TransactionsChart/TransactionsChart';
import PaymentMethodsTable from '../components/PaymentMethodsTable/PaymentMethodsTable';

const Layout = () => {
  // Estado para controlar qué vista está activa
  const [activeView, setActiveView] = useState('dashboard');

  // Función para cambiar la vista activa
  const changeView = (viewName) => {
    setActiveView(viewName);
  };

  // Función que renderiza el contenido según la vista activa
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        // Vista Dashboard: Header + todos los componentes
        return (
          <>
            <div className="flex flex-col flex-1">
              <Header />
            </div>
            <Dashboard />
            <PaymentMethod />
            <Application />
            <UserPermissions />
          </>
        );
      
        case 'payment-methods':
          // Vista Métodos de Pago: Header + Grid Layout
          return (
            <>
              <div className="flex flex-col flex-1">
                <Header />
              </div>
              
              {/* Container principal con padding */}
              <div className="flex-1 p-6 space-y-6">
                
                {/* Grid para las dos gráficas - 2 columnas en pantallas grandes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <UsePayment />
                  <TransactionsChart />
                </div>
                
                {/* Tabla a ancho completo */}
                <div className="w-full">
                  <PaymentMethodsTable />
                </div>
                
              </div>
            </>
          );

      case 'applications':
        // Vista Aplicaciones: Solo Header + espacio vacío
        return (
          <>
            <div className="flex flex-col flex-1">
              <Header />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-600 mb-2">Aplicaciones</h2>
                <p className="text-gray-500">Contenido en desarrollo...</p>
              </div>
            </div>
          </>
        );

      case 'user-permissions':
        // Vista Permisos de Usuario: Solo Header + espacio vacío
        return (
          <>
            <div className="flex flex-col flex-1">
              <Header />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-600 mb-2">Permisos de Usuario</h2>
                <p className="text-gray-500">Contenido en desarrollo...</p>
              </div>
            </div>
          </>
        );

      default:
        // Por defecto muestra Dashboard
        return (
          <>
            <div className="flex flex-col flex-1">
              <Header />
            </div>
            <Dashboard />
            <PaymentMethod />
            <Application />
            <UserPermissions />
          </>
        );
    }
  };

  return (
    <div className="w-full h-screen flex">
      <Sidebar 
        activeView={activeView} 
        onViewChange={changeView} 
      />
      
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
};

export default Layout;