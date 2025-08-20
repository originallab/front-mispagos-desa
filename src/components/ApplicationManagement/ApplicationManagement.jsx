import React, { useState, useEffect } from 'react';
import { AppCompleteService } from '../../Api/services/appService';
import { Methods } from '../../Api/services/method';
import { MethodUtils } from '../../Api/utils/methodUtils';
import { UserAppService } from '../../Api/services/UserAppService';
import { TransactionService } from '../../Api/services/TransactionService';

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  
  // Estados para el modal de edición - CORREGIDO con originalApiKey y allMethodsWithStatus
  const [editingApp, setEditingApp] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    apiKey: '',
    originalApiKey: '', // Campo para comparar cambios
    currentMethods: [],
    availableMethods: [],
    allMethodsWithStatus: [] // Nueva lista unificada para checkboxes
  });
  const [editLoading, setEditLoading] = useState(false);

  // Cargar aplicaciones al montar el componente
  useEffect(() => {
    loadApplications();
  }, []);

  // Filtrar aplicaciones cuando cambie el término de búsqueda
  useEffect(() => {
    handleSearch();
  }, [searchTerm, applications]);

  // Obtener métodos de pago para una aplicación específica
  const getPaymentMethodsForApp = async (appId) => {
    try {
      // 1. Obtener TODAS las relaciones paymethod_app primero para debug
      const allRelations = await Methods.getAllRecords('paymethod_app', null);
      
      // 2. Intentar obtener las relaciones filtradas por app_id
      const relations = await Methods.getAllRecords('paymethod_app', { app_id: appId });
      
      // 3. Si el filtro no funcionó, hacer filtrado manual
      let finalRelations;
      if (relations.records && allRelations.records && 
          relations.records.length === allRelations.records.length) {
        finalRelations = {
          records: allRelations.records.filter(relation => 
            relation.app_id === appId || relation.app_id === appId.toString()
          )
        };
      } else {
        finalRelations = relations;
      }
      
      if (!finalRelations.records || finalRelations.records.length === 0) {
        return [];
      }

      // 4. Obtener los IDs de los métodos de pago con sus relaciones
      const methodRelations = finalRelations.records.map(relation => ({
        paymethod_app_id: relation.paymethod_app_id,
        method_id: relation.method_id,
        app_id: relation.app_id
      }));

      // 5. Obtener la información completa de cada método de pago
      const paymentMethods = await Promise.all(
        methodRelations.map(async (relation) => {
          try {
            const method = await MethodUtils.getMethodById(relation.method_id);
            
            if (!method) {
              return null;
            }
            
            return formatPaymentMethod(method, relation);
          } catch (err) {
            return null;
          }
        })
      );

      // 6. Filtrar métodos nulos y retornar
      const validMethods = paymentMethods.filter(method => method !== null);
      return validMethods;
    } catch (error) {
      console.error(`Error al obtener métodos de pago para app ${appId}:`, error);
      return [];
    }
  };

  // Formatear un método de pago para mostrar en la UI
  const formatPaymentMethod = (method, relation) => {
    if (!method) {
      return null;
    }

    // Obtener el nombre del método desde la estructura de la BD
    const methodName = method.method_name || method.name || method.name_method || 'Método sin nombre';
    const methodType = method.type || method.method_type || '';
    const methodId = method.method_id || method.id;
    const countryId = method.country_id || '';
    const isGlobal = method.global === '1' || method.global === 1;
    
    // Usar paymethod_app_id como ID único para React keys
    const uniqueId = relation.paymethod_app_id || `${relation.app_id}-${methodId}`;
    
    // Generar icono y color basado en el nombre del método
    let icon = 'fas fa-credit-card';
    let color = 'bg-blue-100 text-blue-800';

    const name = methodName.toLowerCase().trim();
    
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
      icon = 'fas fa-money-bill-wave';
      color = 'bg-green-100 text-green-800';
    } else if (name.includes('transfer') || name.includes('transferencia')) {
      icon = 'fas fa-exchange-alt';
      color = 'bg-indigo-100 text-indigo-800';
    } else if (name.includes('mercado pago') || name.includes('mercadopago')) {
      icon = 'fas fa-shopping-bag';
      color = 'bg-cyan-100 text-cyan-800';
    } else if (methodType.toLowerCase().includes('digital')) {
      icon = 'fas fa-mobile-alt';
      color = 'bg-cyan-100 text-cyan-800';
    }

    return {
      // ID único para React (usar paymethod_app_id)
      id: uniqueId,
      // ID del método real para referencia
      method_id: methodId,
      // ID de la relación para referencia
      paymethod_app_id: relation.paymethod_app_id,
      app_id: relation.app_id,
      
      name: methodName,
      icon: icon,
      color: color,
      type: methodType,
      status: method.status || 'activo',
      commission: method.commission || 0,
      country_id: countryId,
      global: isGlobal
    };
  };

  // Obtener estadísticas de usuarios y transacciones para una aplicación
  const getAppStatistics = async (appId) => {
    try {
      // Obtener usuarios de la aplicación desde user_app
      let userCount = 0;
      try {
        const userResult = await UserAppService.getByAppId(appId);
        userCount = userResult.count || 0;
      } catch (userError) {
        console.warn(`No se pudieron obtener usuarios para app ${appId}:`, userError.message);
        userCount = 0;
      }

      // Obtener transacciones de la aplicación desde transaction
      let transactionCount = 0;
      try {
        const transactionResult = await TransactionService.getByAppId(appId);
        transactionCount = transactionResult.count || 0;
      } catch (transactionError) {
        console.warn(`No se pudieron obtener transacciones para app ${appId}:`, transactionError.message);
        transactionCount = 0;
      }

      return {
        users: userCount,
        transactions: transactionCount
      };
    } catch (error) {
      console.error(`Error al obtener estadísticas para app ${appId}:`, error);
      return {
        users: 0,
        transactions: 0
      };
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AppCompleteService.getAppsForTable();
      
      if (response.success) {
        // Cargar métodos de pago y estadísticas para cada aplicación
        const appsWithCompleteData = await Promise.all(
          response.data.map(async (app) => {
            try {
              // Obtener métodos de pago
              const paymentMethods = await getPaymentMethodsForApp(app.id);
              
              // Obtener estadísticas de usuarios y transacciones
              const statistics = await getAppStatistics(app.id);
              
              return { 
                ...app, 
                paymentMethods,
                ...statistics // users y transactions
              };
            } catch (err) {
              return { 
                ...app, 
                paymentMethods: [],
                users: 0,
                transactions: 0
              };
            }
          })
        );

        // Formatear las aplicaciones para el componente
        const formattedApps = appsWithCompleteData.map(app => formatAppForComponent(app));
        setApplications(formattedApps);
        setFilteredApplications(formattedApps);
      } else {
        throw new Error('No se pudieron obtener las aplicaciones');
      }
    } catch (err) {
      console.error('Error al cargar aplicaciones:', err);
      setError(err.message || 'Error al cargar las aplicaciones');
    } finally {
      setLoading(false);
    }
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
      paymentMethods: app.paymentMethods || [],
      users: app.users || 0, // Usar datos reales de user_app
      transactions: app.transactions || 0, // Usar datos reales de transaction
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
    
    if (name.includes('ecommerce') || name.includes('tienda') || name.includes('comercio') || name.includes('comida')) {
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
    } else if (name.includes('servicio') || name.includes('service')) {
      return {
        icon: 'concierge-bell',
        iconColor: 'text-teal-600',
        iconBg: 'bg-teal-100'
      };
    } else if (name.includes('pago') || name.includes('payment')) {
      return {
        icon: 'credit-card',
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

  // Manejar búsqueda
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredApplications(applications);
      return;
    }

    setSearching(true);
    const term = searchTerm.toLowerCase().trim();
    
    const filtered = applications.filter(app => 
      app.name.toLowerCase().includes(term) ||
      app.id.toString().includes(term) ||
      app.apiKey.toLowerCase().includes(term)
    );

    setFilteredApplications(filtered);
    setSearching(false);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
    setFilteredApplications(applications);
  };

  const handleAddApplication = () => {
    setShowAddModal(true);
  };

  // FUNCIÓN CORREGIDA - handleEditApplication con lista unificada de métodos
  const handleEditApplication = async (appId) => {
    try {
      setEditLoading(true);
      
      // Encontrar la aplicación actual
      const currentApp = applications.find(app => app.id === appId);
      if (!currentApp) {
        alert('Aplicación no encontrada');
        return;
      }

      console.log('🔄 Cargando datos para edición de la aplicación:', appId);

      // Obtener la aplicación completa con todos los datos desde la API
      const fullAppData = await AppCompleteService.getById(appId);
      console.log('📋 Datos completos de la aplicación obtenidos:', fullAppData.data);

      // Obtener todos los métodos disponibles del sistema
      const allMethods = await MethodUtils.getAllMethods();
      console.log('🔧 Métodos disponibles en el sistema:', allMethods.length);

      // Obtener métodos actuales de la aplicación (recalcular para asegurar datos frescos)
      const currentPaymentMethods = await getPaymentMethodsForApp(appId);
      console.log('💳 Métodos actuales de la aplicación:', currentPaymentMethods.length);

      // Crear lista unificada de todos los métodos con estado de vinculación
      const allMethodsWithStatus = allMethods.map(method => {
        const isLinked = currentPaymentMethods.some(current => 
          parseInt(current.method_id) === parseInt(method.method_id)
        );
        
        const linkedMethod = isLinked ? 
          currentPaymentMethods.find(current => parseInt(current.method_id) === parseInt(method.method_id)) : 
          null;

        return {
          ...method,
          isLinked: isLinked,
          linkedData: linkedMethod, // Datos adicionales si está vinculado
          displayName: method.method_name || method.name || 'Método sin nombre'
        };
      });

      console.log('📊 Lista unificada de métodos creada:', allMethodsWithStatus.length);
      
      // Configurar el formulario de edición con los valores actuales
      setEditingApp(currentApp);
      setEditForm({
        name: currentApp.name,
        apiKey: fullAppData.data.api_key || '', // Usar la API key completa
        originalApiKey: fullAppData.data.api_key || '', // Guardar la original para comparar
        currentMethods: [...currentPaymentMethods], // Mantener para compatibilidad
        availableMethods: allMethods.filter(method => 
          !currentPaymentMethods.some(current => current.method_id === method.method_id)
        ), // Mantener para compatibilidad
        allMethodsWithStatus: allMethodsWithStatus // Nueva lista unificada
      });
      
      console.log('✅ Formulario de edición configurado correctamente');
      setShowEditModal(true);
    } catch (error) {
      console.error('❌ Error al cargar datos para edición:', error);
      alert('Error al cargar los datos de la aplicación: ' + error.message);
    } finally {
      setEditLoading(false);
    }
  };

  // FUNCIÓN MEJORADA - Manejar cambio de checkbox para vincular/desvincular métodos
  const handleMethodCheckboxChange = async (method, isCurrentlyLinked) => {
    try {
      setEditLoading(true);
      
      if (isCurrentlyLinked) {
        // Desvincular método
        console.log(`➖ Desvinculando método ${method.method_id} de la aplicación ${editingApp.id}`);
        
        // Buscar la relación exacta en paymethod_app
        const allRelations = await Methods.getAllRecords('paymethod_app', null);
        const relationToDelete = allRelations.records.find(relation => 
          parseInt(relation.app_id) === parseInt(editingApp.id) && 
          parseInt(relation.method_id) === parseInt(method.method_id)
        );

        if (!relationToDelete) {
          throw new Error('No se encontró la relación en la base de datos');
        }

        // Eliminar la relación de la BD
        await Methods.deleteRecord('paymethod_app', relationToDelete.paymethod_app_id);

        // Actualizar la lista unificada: marcar como no vinculado
        setEditForm(prev => ({
          ...prev,
          allMethodsWithStatus: prev.allMethodsWithStatus.map(m => 
            parseInt(m.method_id) === parseInt(method.method_id) 
              ? { ...m, isLinked: false, linkedData: null }
              : m
          ),
          // También actualizar las listas separadas para compatibilidad
          currentMethods: prev.currentMethods.filter(m => 
            parseInt(m.method_id) !== parseInt(method.method_id)
          ),
          availableMethods: [...prev.availableMethods, method].sort((a, b) => 
            (a.method_name || a.name || '').localeCompare(b.method_name || b.name || '')
          )
        }));

        console.log(`✅ Método ${method.displayName || method.method_name} desvinculado exitosamente`);
        
      } else {
        // Vincular método
        console.log(`➕ Vinculando método ${method.method_id} a la aplicación ${editingApp.id}`);
        
        // Crear la relación en paymethod_app
        const createResult = await Methods.createRecord('paymethod_app', {
          app_id: editingApp.id,
          method_id: method.method_id
        });

        // Obtener el método completo si es necesario
        const fullMethod = method.method_name ? method : await MethodUtils.getMethodById(method.method_id);
        
        // Formatear el método con la nueva relación
        const formattedMethod = formatPaymentMethod(fullMethod, {
          paymethod_app_id: createResult.paymethod_app_id || Date.now(),
          method_id: method.method_id,
          app_id: editingApp.id
        });

        // Actualizar la lista unificada: marcar como vinculado
        setEditForm(prev => ({
          ...prev,
          allMethodsWithStatus: prev.allMethodsWithStatus.map(m => 
            parseInt(m.method_id) === parseInt(method.method_id) 
              ? { ...m, isLinked: true, linkedData: formattedMethod }
              : m
          ),
          // También actualizar las listas separadas para compatibilidad
          currentMethods: [...prev.currentMethods, formattedMethod].sort((a, b) => 
            a.name.localeCompare(b.name)
          ),
          availableMethods: prev.availableMethods.filter(m => 
            parseInt(m.method_id) !== parseInt(method.method_id)
          )
        }));

        console.log(`✅ Método ${fullMethod.method_name} vinculado exitosamente`);
      }

    } catch (error) {
      console.error('❌ Error al cambiar estado del método:', error);
      alert('Error al cambiar el estado del método: ' + error.message);
    } finally {
      setEditLoading(false);
    }
  };

  // FUNCIÓN CORREGIDA - Guardar cambios de la aplicación
  const handleSaveEditApplication = async () => {
    try {
      if (!editForm.name.trim()) {
        alert('El nombre de la aplicación es requerido');
        return;
      }

      setEditLoading(true);

      // Preparar datos de actualización - solo incluir campos que realmente cambiaron
      const updateData = {};

      // Siempre incluir el nombre si cambió
      if (editForm.name.trim() !== editingApp.name) {
        updateData.name_app = editForm.name.trim();
      }

      // Solo incluir API key si cambió y no está vacía
      const currentApiKey = editForm.apiKey.trim();
      const originalApiKey = editForm.originalApiKey || '';
      
      if (currentApiKey !== originalApiKey && currentApiKey.length > 0) {
        updateData.api_key = currentApiKey;
      }

      // Verificar que al menos hay algo que actualizar
      if (Object.keys(updateData).length === 0) {
        console.log('ℹ️ No hay cambios en la información básica para guardar');
        // Solo cerrar el modal ya que los métodos de pago se guardan en tiempo real
        setShowEditModal(false);
        setEditingApp(null);
        alert('Cambios guardados exitosamente');
        return;
      }

      console.log('💾 Actualizando aplicación con datos:', updateData);
      
      await AppCompleteService.patch(editingApp.id, updateData);

      // Recargar las aplicaciones para reflejar todos los cambios
      await loadApplications();
      
      // Cerrar modal
      setShowEditModal(false);
      setEditingApp(null);
      
      alert('Aplicación actualizada exitosamente');
    } catch (error) {
      console.error('❌ Error al guardar cambios:', error);
      alert('Error al guardar los cambios: ' + error.message);
    } finally {
      setEditLoading(false);
    }
  };

  // FUNCIÓN CORREGIDA - Cerrar modal de edición
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingApp(null);
    setEditForm({
      name: '',
      apiKey: '',
      originalApiKey: '', // Incluir el campo que faltaba
      currentMethods: [],
      availableMethods: [],
      allMethodsWithStatus: [] // Nuevo campo para checkboxes
    });
  };

  const handleManagePayments = (appId, appName) => {
    const app = filteredApplications.find(a => a.id === appId);
    const methodCount = app ? app.paymentMethods.length : 0;
    
    if (app && app.paymentMethods.length > 0) {
      const methodsList = app.paymentMethods.map(m => 
        `${m.name} (Method ID: ${m.method_id})`
      ).join('\n');
      
      alert(`Gestión de métodos de pago para "${appName}"\n\nMétodos actuales: ${methodCount}\n\n${methodsList}\n\n(Esta funcionalidad se puede expandir con un modal o página dedicada)`);
    } else {
      alert(`Gestión de métodos de pago para "${appName}"\n\nNo hay métodos de pago configurados actualmente.\n\n(Esta funcionalidad se puede expandir con un modal o página dedicada)`);
    }
  };

  const handleToggleStatus = async (appId) => {
    try {
      // Encontrar la aplicación actual
      const currentApp = filteredApplications.find(app => app.id === appId);
      if (!currentApp) return;

      // Cambiar el estado en la API
      const newStatus = !currentApp.status.includes('Activ');
      await AppCompleteService.toggleStatus(appId, newStatus);

      // Actualizar el estado local
      const updateApps = (apps) => 
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
              actionButton: newActionButton,
              // Mantener los métodos de pago y estadísticas intactos
              paymentMethods: app.paymentMethods,
              users: app.users,
              transactions: app.transactions
            };
          }
          return app;
        });

      setApplications(updateApps);
      setFilteredApplications(updateApps);
    } catch (err) {
      console.error(`Error al cambiar estado de aplicación ${appId}:`, err);
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
            <p className="text-sm text-gray-500 mt-1">Obteniendo métodos de pago, usuarios y transacciones</p>
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
          
          {/* Buscador */}
          <div className="mt-3 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className={`fas ${searching ? 'fa-spinner fa-spin' : 'fa-search'} text-gray-400`}></i>
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i className="fas fa-times text-gray-400 hover:text-gray-600"></i>
                </button>
              )}
            </div>
            
            {/* Información de resultados */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>
                {searchTerm ? (
                  <>
                    {filteredApplications.length} de {applications.length} aplicaciones
                  </>
                ) : (
                  <>
                    {applications.length} aplicaciones registradas
                  </>
                )}
              </span>
              <span className="text-gray-300">•</span>
              <span>
                {applications.reduce((total, app) => total + app.paymentMethods.length, 0)} métodos configurados
              </span>
              <span className="text-gray-300">•</span>
              <span>
                {applications.reduce((total, app) => total + app.users, 0)} usuarios totales
              </span>
              <span className="text-gray-300">•</span>
              <span>
                {applications.reduce((total, app) => total + app.transactions, 0)} transacciones
              </span>
            </div>
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
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          {searchTerm ? (
            <>
              <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron aplicaciones</h3>
              <p className="text-gray-600 mb-4">
                No hay aplicaciones que coincidan con "{searchTerm}"
              </p>
              <button 
                onClick={clearSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Limpiar búsqueda
              </button>
            </>
          ) : (
            <>
              <i className="fas fa-desktop text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay aplicaciones</h3>
              <p className="text-gray-600 mb-4">Agrega tu primera aplicación para comenzar</p>
              <button 
                onClick={handleAddApplication}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Agregar Aplicación
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((app) => (
            <div key={app.id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
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
                          title={`${method.name} (Method ID: ${method.method_id}, Relation ID: ${method.paymethod_app_id})${method.commission ? ` - Comisión: ${method.commission}%` : ''}${method.country_id ? ` - País: ${method.country_id}` : ''}`}
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
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                    disabled={editLoading && editingApp?.id === app.id}
                  >
                    {editLoading && editingApp?.id === app.id ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-1"></i>
                        Cargando...
                      </>
                    ) : (
                      'Editar'
                    )}
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
                    // Implementar lógica para guardar nueva aplicación
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

      {/* MODAL DE EDICIÓN MEJORADO CON FUNCIONALIDAD COMPLETA */}
      {showEditModal && editingApp && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Editar Aplicación: {editingApp.name}
              </h3>
              <button 
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-gray-500"
                disabled={editLoading}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información básica */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2">
                    Información Básica
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Aplicación *
                    </label>
                    <input 
                      type="text" 
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="Nombre de la aplicación"
                      disabled={editLoading}
                    />
                  </div>

                  {/* CAMPO API KEY MEJORADO */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={editForm.apiKey}
                        onChange={(e) => setEditForm(prev => ({ ...prev, apiKey: e.target.value }))}
                        className="w-full px-3 py-2 pr-24 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="API Key actual"
                        disabled={editLoading}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newApiKey = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                          setEditForm(prev => ({ ...prev, apiKey: newApiKey }));
                        }}
                        className="absolute right-2 top-2 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                        disabled={editLoading}
                      >
                        Generar Nueva
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {editForm.apiKey === editForm.originalApiKey 
                        ? 'No se modificará la API Key actual' 
                        : editForm.apiKey 
                          ? 'Se actualizará con la nueva API Key' 
                          : 'Se mantendrá la API Key actual'
                      }
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Información adicional</h5>
                    <p className="text-xs text-gray-600">ID: {editingApp.id}</p>
                    <p className="text-xs text-gray-600">Estado: {editingApp.status}</p>
                    <p className="text-xs text-gray-600">Usuarios: {editingApp.users}</p>
                    <p className="text-xs text-gray-600">Transacciones: {editingApp.transactions}</p>
                    <p className="text-xs text-gray-600">API Key original: {editForm.originalApiKey.substring(0, 20)}...</p>
                  </div>
                </div>

                {/* GESTIÓN DE MÉTODOS DE PAGO CON CHECKBOXES */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2 flex items-center">
                    <i className="fas fa-credit-card mr-2"></i>
                    Métodos de Pago Disponibles
                    {editLoading && <i className="fas fa-spinner fa-spin ml-2 text-blue-500"></i>}
                  </h4>

                  {/* Lista unificada de métodos con checkboxes */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Selecciona los métodos de pago para esta aplicación
                      </label>
                      <div className="text-sm text-gray-500">
                        {editForm.allMethodsWithStatus?.filter(m => m.isLinked).length || 0} de {editForm.allMethodsWithStatus?.length || 0} seleccionados
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto border rounded p-3 bg-gray-50">
                      {editForm.allMethodsWithStatus && editForm.allMethodsWithStatus.length > 0 ? (
                        editForm.allMethodsWithStatus.map((method) => (
                          <div 
                            key={method.method_id} 
                            className={`flex items-center p-3 rounded border transition-all duration-200 ${
                              method.isLinked 
                                ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {/* Checkbox */}
                            <div className="flex items-center mr-3">
                              <input
                                type="checkbox"
                                id={`method-${method.method_id}`}
                                checked={method.isLinked}
                                onChange={() => handleMethodCheckboxChange(method, method.isLinked)}
                                disabled={editLoading}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                              />
                            </div>

                            {/* Icono del método */}
                            <div className="flex items-center mr-3">
                              <i className={`fas fa-credit-card text-lg ${
                                method.isLinked ? 'text-blue-600' : 'text-gray-400'
                              }`}></i>
                            </div>

                            {/* Información del método */}
                            <div className="flex-1">
                              <label 
                                htmlFor={`method-${method.method_id}`}
                                className={`text-sm font-medium cursor-pointer ${
                                  method.isLinked ? 'text-blue-900' : 'text-gray-900'
                                }`}
                              >
                                {method.displayName}
                              </label>
                              <div className={`text-xs ${
                                method.isLinked ? 'text-blue-700' : 'text-gray-500'
                              }`}>
                                ID: {method.method_id}
                                {method.country_id && ` | País: ${method.country_id}`}
                                {method.status && ` | Estado: ${method.status}`}
                                {method.isLinked && method.linkedData?.paymethod_app_id && 
                                  ` | Relación: ${method.linkedData.paymethod_app_id}`
                                }
                              </div>
                            </div>

                            {/* Indicador visual de estado */}
                            <div className="ml-3">
                              {method.isLinked ? (
                                <div className="flex items-center">
                                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                    Vinculado
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                    Disponible
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <i className="fas fa-credit-card text-3xl text-gray-300 mb-2"></i>
                          <p className="text-sm text-gray-500">No hay métodos de pago disponibles</p>
                          <p className="text-xs text-gray-400">Contacta al administrador para agregar métodos</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resumen de vinculaciones */}
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <div className="flex items-start">
                      <i className="fas fa-info-circle text-blue-500 mr-2 mt-0.5"></i>
                      <div className="text-xs text-blue-700">
                        <p className="font-medium mb-1">💡 Información sobre métodos de pago:</p>
                        <ul className="space-y-1">
                          <li>• Los cambios se guardan automáticamente al marcar/desmarcar</li>
                          <li>• Los métodos vinculados aparecerán en las opciones de pago de la aplicación</li>
                          <li>• Puedes cambiar la vinculación en cualquier momento</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <div className="text-sm text-gray-500">
                  <i className="fas fa-info-circle mr-1"></i>
                  Los métodos de pago se actualizan en tiempo real
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={handleCloseEditModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={editLoading}
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveEditApplication}
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    disabled={editLoading}
                  >
                    {editLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;