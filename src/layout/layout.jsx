import React, { useState } from 'react';
import Sidebar from '../components/sidebar/sidebar';
import Dashboard from '../components/dashboard/dashboard';
import PaymentMethod from '../components/paymethod/paymentMethod';
import Application from '../components/Application/application';
import UserPermissions from '../components/UserPermison/userPermisson';
import Header from '../components/Header/Header';
import AppCharts from '../components/AppCharts/AppCharts.jsx';


const Layout = () => {
  return (
    <div className="w-full h-screen flex">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto flex flex-col">
    <div className="flex flex-col flex-1">
      <Header />
    </div>
        <Dashboard />
        <PaymentMethod />
        <Application />
        <UserPermissions/>
      </div>
    </div>
  );
};
export default Layout;