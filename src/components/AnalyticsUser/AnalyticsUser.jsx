import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { UserAppService } from '../../Api/services/UserAppService';
import { AppCompleteService } from '../../Api/services/appService';
import { Methods } from '../../Api/services/method';

const AnalyticsUser = () => {
  // Estados para datos y loading
  const [monthlyUsersData, setMonthlyUsersData] = useState([]);
  const [roleDistributionData, setRoleDistributionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Colores para los gráficos
  const COLORS = {
    'Administrador': '#dc3545',
    'Admin Principal': '#0d6efd', 
    'Cliente': '#198754',
    'Supervisor': '#fd7e14',
    'Default': '#6c757d'
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  // Función principal para cargar todos los datos
  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Cargando datos de analytics...');

      // Obtener datos en paralelo
      const [userAppData, applicationsData, usersData, rolesData] = await Promise.all([
        getUserAppData(),
        getApplicationsData(),
        getUsersData(),
        getRolesData()
      ]);

      console.log('📊 Datos obtenidos:', {
        userAppRelations: userAppData.length,
        applications: applicationsData.length,
        users: usersData.length,
        roles: rolesData.length
      });

      // Procesar datos para gráficos
      const monthlyData = processMonthlyUsersData(userAppData, applicationsData, usersData);
      const roleData = processRoleDistributionData(usersData, rolesData);

      setMonthlyUsersData(monthlyData);
      setRoleDistributionData(roleData);

      console.log('✅ Analytics cargados exitosamente');

    } catch (error) {
      console.error('❌ Error al cargar analytics:', error);
      setError('Error al cargar los datos de analytics');
    } finally {
      setLoading(false);
    }
  };

  // Obtener relaciones user_app
  const getUserAppData = async () => {
    try {
      const result = await UserAppService.getAll();
      return result.data || [];
    } catch (error) {
      console.warn('No se pudieron obtener relaciones user_app:', error.message);
      return [];
    }
  };

  // Obtener datos de aplicaciones
  const getApplicationsData = async () => {
    try {
      const result = await AppCompleteService.getAppsForTable();
      return result.data || [];
    } catch (error) {
      console.warn('No se pudieron obtener aplicaciones:', error.message);
      return [];
    }
  };

  // Obtener datos de usuarios
  const getUsersData = async () => {
    try {
      const result = await Methods.getAllRecords('user', null);
      return result.records || [];
    } catch (error) {
      console.warn('No se pudieron obtener usuarios:', error.message);
      return [];
    }
  };

  // Obtener datos de roles
  const getRolesData = async () => {
    try {
      const result = await Methods.getAllRecords('role', null);
      return result.records || [];
    } catch (error) {
      console.warn('No se pudieron obtener roles:', error.message);
      return [];
    }
  };

  // Procesar datos para gráfico de usuarios por mes y apps
  const processMonthlyUsersData = (userAppData, applicationsData, usersData) => {
    try {
      console.log('📈 Procesando datos mensuales...');
      
      if (!userAppData.length || !applicationsData.length) {
        console.log('⚠️ Datos insuficientes para gráfico mensual');
        return generateDefaultMonthlyData();
      }

      // Crear mapa de aplicaciones por ID
      const appsMap = {};
      applicationsData.forEach(app => {
        appsMap[app.id] = app.name || `App ${app.id}`;
      });

      // Crear mapa de usuarios por ID
      const usersMap = {};
      usersData.forEach(user => {
        usersMap[user.user_id] = user;
      });

      // Agrupar relaciones por mes y aplicación
      const monthlyData = {};
      
      userAppData.forEach(relation => {
        // Usar fecha actual si no hay fecha de creación
        const createdDate = relation.created_at || relation.registration_date || new Date().toISOString();
        const date = new Date(createdDate);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long' 
        });

        const appName = appsMap[relation.app_id] || `App ${relation.app_id}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthName,
            monthKey: monthKey
          };
        }

        if (!monthlyData[monthKey][appName]) {
          monthlyData[monthKey][appName] = 0;
        }

        monthlyData[monthKey][appName]++;
      });

      // Convertir a array y ordenar por fecha
      const sortedData = Object.values(monthlyData)
        .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
        .slice(-6); // Últimos 6 meses

      console.log('📊 Datos mensuales procesados:', sortedData);
      return sortedData.length > 0 ? sortedData : generateDefaultMonthlyData();

    } catch (error) {
      console.error('Error procesando datos mensuales:', error);
      return generateDefaultMonthlyData();
    }
  };

  // Procesar datos para gráfico de distribución por roles
  const processRoleDistributionData = (usersData, rolesData) => {
    try {
      console.log('🥧 Procesando distribución por roles...');
      
      if (!usersData.length || !rolesData.length) {
        console.log('⚠️ Datos insuficientes para gráfico de roles');
        return generateDefaultRoleData();
      }

      // Crear mapa de roles
      const rolesMap = {};
      rolesData.forEach(role => {
        rolesMap[role.role_id] = role.role_name || `Rol ${role.role_id}`;
      });

      // Contar usuarios por rol
      const roleCounts = {};
      let totalUsers = 0;

      usersData.forEach(user => {
        const roleName = rolesMap[user.role_id] || 'Sin rol';
        roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
        totalUsers++;
      });

      // Convertir a formato para el gráfico con porcentajes
      const roleData = Object.entries(roleCounts).map(([roleName, count], index) => {
        const percentage = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
        return {
          name: roleName,
          value: percentage,
          count: count,
          color: COLORS[roleName] || COLORS.Default
        };
      });

      console.log('📊 Distribución por roles procesada:', roleData);
      return roleData.length > 0 ? roleData : generateDefaultRoleData();

    } catch (error) {
      console.error('Error procesando distribución por roles:', error);
      return generateDefaultRoleData();
    }
  };

  // Generar datos por defecto para gráfico mensual
  const generateDefaultMonthlyData = () => {
    const currentDate = new Date();
    const defaultData = [];
    
    for (let i = 2; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      defaultData.push({
        month: monthName,
        'Sin datos': 0
      });
    }
    
    return defaultData;
  };

  // Generar datos por defecto para gráfico de roles
  const generateDefaultRoleData = () => {
    return [
      { name: 'Sin datos', value: 100, color: COLORS.Default, count: 0 }
    ];
  };

  // Componentes de tooltip personalizados
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value} usuario${entry.value !== 1 ? 's' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data.name}</p>
          <p className="text-sm" style={{ color: data.color }}>
            {`Porcentaje: ${data.value}%`}
          </p>
          <p className="text-sm text-gray-600">
            {`Usuarios: ${data.count}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Obtener todas las aplicaciones únicas para las barras del gráfico
  const getAllAppNames = () => {
    const appNames = new Set();
    monthlyUsersData.forEach(month => {
      Object.keys(month).forEach(key => {
        if (key !== 'month' && key !== 'monthKey') {
          appNames.add(key);
        }
      });
    });
    return Array.from(appNames);
  };

  // Función para refrescar datos
  const handleRefresh = () => {
    loadAnalyticsData();
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="p-6 bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600 font-medium">Cargando analytics...</p>
            <p className="text-sm text-gray-500 mt-1">Procesando datos de usuarios y aplicaciones</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="p-6 bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <i className="fas fa-exclamation-triangle text-red-400 mr-2 mt-1"></i>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error en Analytics</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button 
                onClick={handleRefresh}
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
    <div className="p-6 bg-gray-50">
      {/* Header con botón de refresh */}
      <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800">Analytics de Usuarios</h2>
        <button 
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition duration-200"
          disabled={loading}
        >
          <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
          <span>Actualizar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        
        {/* Gráfico de Usuarios por Mes y Apps */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <h3 className="text-lg font-medium text-gray-800">Usuarios por Mes y Apps</h3>
            </div>
            <div className="text-sm text-gray-500">
              {monthlyUsersData.length} meses mostrados
            </div>
          </div>
          
          {monthlyUsersData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyUsersData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {getAllAppNames().map((appName, index) => (
                  <Bar 
                    key={appName}
                    dataKey={appName} 
                    fill={Object.values(COLORS)[index % Object.values(COLORS).length]} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <i className="fas fa-chart-bar text-4xl mb-2"></i>
                <p>No hay datos disponibles</p>
                <p className="text-sm">Registra usuarios en aplicaciones para ver estadísticas</p>
              </div>
            </div>
          )}
        </div>

        {/* Gráfico de Distribución por Roles */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
              <h3 className="text-lg font-medium text-gray-800">Distribución por Roles</h3>
            </div>
            <div className="text-sm text-gray-500">
              {roleDistributionData.reduce((sum, role) => sum + role.count, 0)} usuarios totales
            </div>
          </div>
          
          {roleDistributionData.length > 0 && roleDistributionData[0].name !== 'Sin datos' ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roleDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {roleDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '14px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <i className="fas fa-chart-pie text-4xl mb-2"></i>
                <p>No hay datos de roles disponibles</p>
                <p className="text-sm">Registra usuarios con roles para ver la distribución</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AnalyticsUser;