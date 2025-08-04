import React, { useState, useEffect } from 'react';
import { AppCompleteService } from '../../Api/services/appService';
import { Methods } from '../../Api/services/method';
import { MethodUtils } from '../../Api/utils/methodUtils';

const Application = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Cargar aplicaciones al montar el componente
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando aplicaciones...');
      const response = await AppCompleteService.getAppsForTable();
      
      if (response.success) {
        // Cargar métodos de pago para cada aplicación
        console.log('🔄 Cargando métodos de pago para cada aplicación...');
        console.log('📋 Aplicaciones encontradas:', response.data.map(app => ({ id: app.id, name: app.name })));
        
        const appsWithPaymentMethods = await Promise.all(
          response.data.map(async (app) => {
            try {
              console.log(`🔍 Procesando aplicación: ${app.name} (ID: ${app.id})`);
              const paymentMethods = await getPaymentMethodsForApp(app.id);
              console.log(`✅ Métodos obtenidos para ${app.name}:`, paymentMethods.length);
              return { ...app, paymentMethods };
            } catch (err) {
              console.warn(`⚠️ No se pudieron cargar métodos de pago para app ${app.id}:`, err.message);
              return { ...app, paymentMethods: [] };
            }
          })
        );

        console.log('📊 Resumen final de aplicaciones con métodos:');
        appsWithPaymentMethods.forEach(app => {
          console.log(`- ${app.name} (ID: ${app.id}): ${app.paymentMethods.length} métodos`);
        });

        // Formatear las aplicaciones para el componente
        const formattedApps = appsWithPaymentMethods.map(app => formatAppForComponent(app));
        setApplications(formattedApps);
        console.log(`✅ ${formattedApps.length} aplicaciones cargadas con métodos de pago`);
      } else {
        throw new Error('No se pudieron obtener las aplicaciones');
      }
    } catch (err) {
      console.error('❌ Error al cargar aplicaciones:', err);
      setError(err.message || 'Error al cargar las aplicaciones');
    } finally {
      setLoading(false);
    }
  };

  // Obtener métodos de pago para una aplicación específica
  const getPaymentMethodsForApp = async (appId) => {
    try {
      console.log(`🔍 Buscando métodos de pago para app_id: ${appId}`);
      
      // 1. Obtener las relaciones paymenthod_app para esta aplicación (nota: nombre correcto con 'h')
      const relations = await Methods.getAllRecords('paymethod_app', { app_id: appId });
      
      console.log(`📋 Relaciones encontradas para app ${appId}:`, relations);
      
      if (!relations.records || relations.records.length === 0) {
        console.log(`ℹ️ No se encontraron métodos de pago para app ${appId}`);
        return [];
      }

      // 2. Obtener los IDs de los métodos de pago
      const methodIds = relations.records.map(relation => relation.method_id);
      console.log(`🔗 Method IDs encontrados para app ${appId}:`, methodIds);

      // 3. Obtener la información completa de cada método de pago
      const paymentMethods = await Promise.all(
        methodIds.map(async (methodId) => {
          try {
            console.log(`🔍 Obteniendo detalles del método ${methodId}...`);
            const method = await MethodUtils.getMethodById(methodId);
            console.log(`✅ Método ${methodId} obtenido:`, method);
            return formatPaymentMethod(method);
          } catch (err) {
            console.warn(`⚠️ No se pudo obtener método ${methodId}:`, err.message);
            return null;
          }
        })
      );

      // 4. Filtrar métodos nulos y retornar
      const validMethods = paymentMethods.filter(method => method !== null);
      console.log(`✅ Métodos válidos para app ${appId}:`, validMethods);
      return validMethods;
    } catch (error) {
      console.error(`❌ Error al obtener métodos de pago para app ${appId}:`, error);
      return [];
    }
  };

  // Formatear un método de pago para mostrar en la UI
  const formatPaymentMethod = (method) => {
    if (!method) {
      console.warn('⚠️ Método de pago nulo recibido');
      return null;
    }

    console.log('🔧 Formateando método de pago:', method);

    // Obtener el nombre del método con diferentes posibles campos
    const methodName = method.name || method.method_name || method.name_method || 'Método sin nombre';
    const methodType = method.type || method.method_type || '';
    const methodId = method.method_id || method.id;
    
    console.log(`🏷️ Método formateado: ${methodName} (ID: ${methodId}, Tipo: ${methodType})`);
    
    // Generar icono y color basado en el nombre/tipo del método
    let icon = 'credit-card';
    let color = 'bg-blue-100 text-blue-800';

    const name = methodName.toLowerCase();
    
    if (name.includes('visa')) {
      icon = 'fab fa-cc-visa';
      color = 'bg-blue-100 text-blue-800';
    } else if (name.includes('mastercard') || name.includes('master')) {
      icon = 'fab fa-cc-mastercard';
      color = 'bg-red-100 text-red-800';
    } else if (name.includes('paypal')) {
      icon = 'fab fa-paypal';
      color = 'bg-blue-100 text-blue-800';
    } else if (name.includes('american express') || name.includes('amex')) {
      icon = 'fab fa-cc-amex';
      color = 'bg-green-100 text-green-800';
    } else if (name.includes('bitcoin') || name.includes('crypto')) {
      icon = 'fab fa-bitcoin';
      color = 'bg-yellow-100 text-yellow-800';
    } else if (name.includes('stripe')) {
      icon = 'fab fa-stripe';
      color = 'bg-purple-100 text-purple-800';
    } else if (name.includes('cash') || name.includes('efectivo')) {
      icon = 'money-bill-wave';
      color = 'bg-green-100 text-green-800';
    } else if (name.includes('transfer') || name.includes('transferencia')) {
      icon = 'exchange-alt';
      color = 'bg-indigo-100 text-indigo-800';
    } else if (name.includes('mercado pago') || name.includes('mercadopago')) {
      icon = 'shopping-bag';
      color = 'bg-blue-100 text-blue-800';
    } else if (methodType.toLowerCase().includes('digital')) {
      icon = 'mobile-alt';
      color = 'bg-cyan-100 text-cyan-800';
    }

    const formattedMethod = {
      id: methodId,
      name: methodName,
      icon: icon,
      color: color,
      type: methodType,
      status: method.status,
      commission: method.commission || 0
    };

    console.log('✅ Método formateado exitosamente:', formattedMethod);
    return formattedMethod;
  };

  // Formatear datos de la API para el componente
  const formatAppForComponent = (app) => {
    // Generar icono basado en el nombre de la aplicación
    const iconData = generateAppIcon(app.name);
    
    return {
      id: app.id,
      name: app.name,
      icon: iconData.icon,
      iconColor: iconData.iconColor,
      iconBg: iconData.iconBg,
      status: app.statusText,
      statusColor: app.statusClass,
      paymentMethods: app.paymentMethods || [], // Usar los métodos de pago reales
      users: 0, // Se puede obtener de otra tabla si existe
      transactions: 0, // Se puede obtener de otra tabla si existe
      actionButton: {
        text: app.isActive ? 'Desactivar' : 'Activar',
        color: app.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
      },
      apiKey: app.api_key_short,
      configurationStatus: app.configurationStatus
    };
  };

  // Generar icono basado en el nombre de la aplicación
  const generateAppIcon = (appName) => {
    const name = (appName || '').toLowerCase();
    
    if (name.includes('ecommerce') || name.includes('tienda') || name.includes('comercio')) {
      return {
        icon: 'shopping-cart',
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100'
      };
    } else if (name.includes('mobile') || name.includes('movil') || name.includes('app')) {
      return {
        icon: 'mobile-alt',
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100'
      };
    } else if (name.includes('web') || name.includes('portal') || name.includes('site')) {
      return {
        icon: 'globe',
        iconColor: 'text-purple-600',
        iconBg: 'bg-purple-100'
      };
    } else if (name.includes('restaurante') || name.includes('food') || name.includes('comida')) {
      return {
        icon: 'utensils',
        iconColor: 'text-orange-600',
        iconBg: 'bg-orange-100'
      };
    } else if (name.includes('transporte') || name.includes('taxi') || name.includes('uber')) {
      return {
        icon: 'taxi',
        iconColor: 'text-yellow-600',
        iconBg: 'bg-yellow-100'
      };
    } else if (name.includes('admin') || name.includes('dashboard') || name.includes('panel')) {
      return {
        icon: 'cogs',
        iconColor: 'text-indigo-600',
        iconBg: 'bg-indigo-100'
      };
    }
    
    // Icono por defecto
    return {
      icon: 'desktop',
      iconColor: 'text-gray-600',
      iconBg: 'bg-gray-100'
    };
  };

  const handleAddApplication = () => {
    setShowAddModal(true);
  };

  const handleEditApplication = (appId) => {
    console.log(`Editar aplicación: ${appId}`);
  };

  const handleManagePayments = (appId, appName) => {
    const app = applications.find(a => a.id === appId);
    const methodCount = app ? app.paymentMethods.length : 0;
    
    console.log(`Gestionar pagos para: ${appName} (${appId})`);
    console.log(`Métodos actuales: ${methodCount}`);
    
    if (app && app.paymentMethods.length > 0) {
      console.log('Métodos configurados:', app.paymentMethods.map(m => m.name).join(', '));
    }
    
    // Aquí puedes abrir un modal o navegar a otra página para gestionar los métodos de pago
    alert(`Gestión de métodos de pago para "${appName}"\n\nMétodos actuales: ${methodCount}\n\n(Esta funcionalidad se puede expandir con un modal o página dedicada)`);
  };

  const handleToggleStatus = async (appId) => {
    try {
      console.log(`🔄 Cambiando estado de aplicación: ${appId}`);
      
      // Encontrar la aplicación actual
      const currentApp = applications.find(app => app.id === appId);
      if (!currentApp) return;

      // Cambiar el estado en la API
      const newStatus = !currentApp.status.includes('Activ');
      await AppCompleteService.toggleStatus(appId, newStatus);

      // Actualizar el estado local
      setApplications(apps => 
        apps.map(app => {
          if (app.id === appId) {
            const newStatusText = newStatus ? 'Activa' : 'Inactiva';
            const newStatusColor = newStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
            const newActionButton = newStatus 
              ? { text: 'Desactivar', color: 'text-red-600 hover:text-red-800' }
              : { text: 'Activar', color: 'text-green-600 hover:text-green-800' };
            
            return {
              ...app,
              status: newStatusText,
              statusColor: newStatusColor,
              actionButton: newActionButton
            };
          }
          return app;
        })
      );

      console.log(`✅ Estado de aplicación ${appId} cambiado exitosamente`);
    } catch (err) {
      console.error(`❌ Error al cambiar estado de aplicación ${appId}:`, err);
      alert('Error al cambiar el estado de la aplicación: ' + err.message);
    }
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Aplicaciones</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600 font-medium">Cargando aplicaciones...</p>
            <p className="text-sm text-gray-500 mt-1">Obteniendo métodos de pago asociados</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Aplicaciones</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <i className="fas fa-exclamation-triangle text-red-400 mr-2 mt-1"></i>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error al cargar aplicaciones</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button 
                onClick={loadApplications}
                className="mt-2 text-sm text-red-800 underline hover:text-red-900"
              >
                Intentar nuevamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Aplicaciones</h2>
          <div className="flex items-center space-x-4 mt-1">
            <p className="text-sm text-gray-600">
              {applications.length} aplicaciones registradas
            </p>
            <span className="text-gray-300">•</span>
            <p className="text-sm text-gray-600">
              {applications.reduce((total, app) => total + app.paymentMethods.length, 0)} métodos de pago configurados
            </p>
            <span className="text-gray-300">•</span>
            <p className="text-sm text-gray-600">
              {applications.filter(app => app.paymentMethods.length === 0).length} sin configurar
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={loadApplications}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center space-x-2 transition duration-200"
            disabled={loading}
          >
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
            <span>Actualizar</span>
          </button>
          <button 
            onClick={handleAddApplication}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition duration-200"
          >
            <i className="fas fa-plus"></i>
            <span>Agregar Aplicación</span>
          </button>
        </div>
      </div>

      {/* Applications Cards */}
      {applications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <i className="fas fa-desktop text-4xl text-gray-400 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay aplicaciones</h3>
          <p className="text-gray-600 mb-4">Agrega tu primera aplicación para comenzar</p>
          <button 
            onClick={handleAddApplication}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Agregar Aplicación
          </button>
        </div>
      ) : (
        <div className="flex flex-row gap-6 mx-8 overflow-x-auto">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-lg shadow-md border border-gray-200 flex-1 min-w-0 hover:shadow-lg transition-shadow duration-200">
              <div className="p-5">
                {/* App Header with Icon, Name and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center flex-1">
                    <div className={`h-12 w-12 rounded-lg ${app.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <i className={`fas fa-${app.icon} ${app.iconColor} text-xl`}></i>
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-gray-900 truncate" title={app.name}>
                        {app.name}
                      </h3>
                      <p className="text-sm text-gray-500">ID: {app.id}</p>
                      {app.apiKey && (
                        <p className="text-xs text-gray-400">API: {app.apiKey}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${app.statusColor} flex-shrink-0 mb-1`}>
                      {app.status}
                    </span>
                    {app.paymentMethods.length === 0 && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                        Sin métodos
                      </span>
                    )}
                  </div>
                </div>

                {/* Configuration Status */}
                {app.configurationStatus && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Configuración:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${app.configurationStatus.class}`}>
                        {app.configurationStatus.status}
                      </span>
                    </div>
                  </div>
                )}

                {/* Payment Methods Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Métodos de Pago:</span>
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-gray-900 mr-1">{app.paymentMethods.length}</span>
                      <i className="fas fa-credit-card text-blue-500 text-sm"></i>
                    </div>
                  </div>
                  
                  {/* Payment Methods Pills */}
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {app.paymentMethods.length > 0 ? (
                      app.paymentMethods.map((method, index) => (
                        <span 
                          key={method.id || index} 
                          className={`px-2 py-1 text-xs font-medium rounded-full ${method.color} flex items-center`}
                          title={`${method.name}${method.commission ? ` - Comisión: ${method.commission}%` : ''}`}
                        >
                          <i className={`${method.icon} mr-1`}></i>
                          <span className="truncate max-w-20">{method.name}</span>
                        </span>
                      ))
                    ) : (
                      <div className="flex items-center text-sm text-gray-500">
                        <i className="fas fa-exclamation-circle mr-2 text-yellow-500"></i>
                        <span>Sin métodos asignados</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Summary info for many payment methods */}
                  {app.paymentMethods.length > 3 && (
                    <div className="mt-2 text-xs text-gray-500">
                      <i className="fas fa-info-circle mr-1"></i>
                      {app.paymentMethods.filter(m => m.status === 'activo').length} activos de {app.paymentMethods.length} total
                    </div>
                  )}
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Usuarios:</span>
                    <div className="font-semibold text-gray-900">{app.users}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Transacciones:</span>
                    <div className="font-semibold text-gray-900">{app.transactions.toLocaleString()}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => handleEditApplication(app.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleManagePayments(app.id, app.name)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Gestionar Pagos
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(app.id)}
                    className={`text-sm font-medium ${app.actionButton.color}`}
                  >
                    {app.actionButton.text}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All Applications Link */}
      {applications.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
            <span>Ver todas las aplicaciones</span>
            <i className="fas fa-chevron-right ml-2"></i>
          </button>
        </div>
      )}

      {/* Add Application Modal (Simple version - you can expand this) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Agregar Aplicación</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="Nombre de la aplicación"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea 
                  rows="3" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="Descripción de la aplicación"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    console.log('Guardando nueva aplicación...');
                    setShowAddModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Application;