import React, { useState } from 'react';
import Sidebar from '../components/sidebar/sidebar';
import Dashboard from '../components/dashboard/dashboard';
import PaymentMethod from '../components/paymethod/paymentMethod';
import Application from '../components/Application/application';
import UserPermissions from '../components/UserPermison/userPermisson';
import Header from '../components/Header/Header';
import UsePayment from '../components/UsePayment/UsePayment';
import { Import } from 'lucide-react';
import TransactionsChart from '../components/TransactionsChart/TransactionsChart';
import PaymentMethodsTable from '../components/PaymentMethodsTable/PaymentMethodsTable';
import AppCharts from '../components/AppCharts/AppCharts.jsx';
import ApplicationManagement from '../components/ApplicationManagement/ApplicationManagement.jsx';
import AnalyticsUser from '../components/AnalyticsUser/AnalyticsUser.jsx';
import UsersManagement from '../components/UsersManagement/UsersManagement.jsx';
import ProfileHeader from '../components/ProfileHeader/profileHeader.jsx';
import RolePermissions from '../components/RolePermisson/rolePermisson.jsx';
import PersonalInfoSection from '../components/PersonalInfoSection/personalInfoSection.jsx';

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
                  <PaymentMethod />
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
            <AppCharts />
            <ApplicationManagement/>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
              </div>
            </div>
          </>
        );

      case 'user-permissions':
        // Vista Permisos de Usuario
        return (
          <>
            <div className="flex flex-col flex-1">
              <Header />
            </div>
            <AnalyticsUser/>
            <UsersManagement/>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
              </div>
            </div>
          </>
        );

        case 'perfil':
        // Vista Perfil
        return (
          <>
            <div className="flex flex-col flex-1">
              <ProfileHeader/>
            </div>
            <PersonalInfoSection/>
            <RolePermissions/>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
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