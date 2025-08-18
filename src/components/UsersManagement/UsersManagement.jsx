import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Settings, Database, TrendingUp, Globe, HelpCircle, Loader2, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';

// Importar servicios
import { UserPermissionService } from '../../Api/services/UserPermissionService';
import { UserPermissionUtils } from '../../Api/utils/UserPermissonUtils';

const UsersManagement = () => {
  // Estados del componente
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAppsDetails, setShowAppsDetails] = useState({});
  const [statistics, setStatistics] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadUsersData();
  }, []);

  /**
   * Carga los datos de usuarios con sus permisos y aplicaciones
   */
  const loadUsersData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Cargando datos de usuarios...');

      // Cargar usuarios con permisos y estadísticas en paralelo
      const [usersResult, statsResult] = await Promise.all([
        UserPermissionService.getAllUsersWithPermissions(),
        UserPermissionService.getPermissionStatistics().catch(err => {
          console.warn('⚠️ No se pudieron cargar estadísticas:', err);
          return null;
        })
      ]);

      if (usersResult.success) {
        const formattedUsers = UserPermissionUtils.formatUsersForTable(usersResult.data);
        setUsers(formattedUsers);
        console.log(`✅ ${formattedUsers.length} usuarios cargados exitosamente`);
      } else {
        throw new Error('Error al cargar usuarios');
      }

      if (statsResult && statsResult.success) {
        setStatistics(UserPermissionUtils.formatStatistics(statsResult.data));
        console.log('✅ Estadísticas cargadas exitosamente');
      }

    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      setError(err.message || 'Error al cargar los datos de usuarios');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresca los datos
   */
  const handleRefresh = () => {
    loadUsersData();
  };

  /**
   * Togglea la visibilidad de detalles de aplicaciones
   */
  const toggleAppDetails = (userId) => {
    setShowAppsDetails(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Filtros disponibles basados en los datos reales
  const getAvailableFilters = () => {
    const roleTypes = new Set(users.map(user => user.role.name));
    const filters = [{ label: 'Todos', value: 'Todos' }];
    
    roleTypes.forEach(roleType => {
      filters.push({ label: roleType, value: roleType });
    });
    
    return filters;
  };

  /**
   * Filtra usuarios según criterios seleccionados
   */
  const getFilteredUsers = () => {
    let filtered = users;

    // Filtrar por rol
    if (selectedFilter !== 'Todos') {
      filtered = filtered.filter(user => user.role.name === selectedFilter);
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      filtered = UserPermissionUtils.filterUsersBySearch(filtered, searchTerm);
    }

    return filtered;
  };

  /**
   * Obtiene el icono apropiado para una aplicación
   */
  const getAppIcon = (appName) => {
    const name = (appName || '').toLowerCase();
    
    if (name.includes('comercio') || name.includes('ecommerce')) return '🛒';
    if (name.includes('pago') || name.includes('payment')) return '💳';
    if (name.includes('servicio') || name.includes('service')) return '⚙️';
    if (name.includes('admin') || name.includes('dashboard')) return '📊';
    return '📱';
  };

  /**
   * Renderiza el estado de una aplicación
   */
  const renderAppStatus = (app) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${app.status.class}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${app.status.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
        {app.status.text}
      </span>
    );
  };

  /**
   * Renderiza las aplicaciones de un usuario
   */
  const renderUserApplications = (user) => {
    const applications = UserPermissionUtils.formatApplicationsForUser(user.applications.list);
    const showDetails = showAppsDetails[user.id];

    if (applications.length === 0) {
      return (
        <div className="text-sm text-gray-500 italic">
          Sin aplicaciones vinculadas
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {/* Resumen */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {applications.length} aplicación{applications.length !== 1 ? 'es' : ''}
            </span>
            <span className="text-xs text-gray-500">
              ({user.applications.active} activa{user.applications.active !== 1 ? 's' : ''})
            </span>
          </div>
          <button
            onClick={() => toggleAppDetails(user.id)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            {showDetails ? <EyeOff size={12} /> : <Eye size={12} />}
            {showDetails ? 'Ocultar' : 'Ver detalles'}
          </button>
        </div>

        {/* Lista de aplicaciones (siempre visible) */}
        <div className="flex flex-wrap gap-1">
          {applications.slice(0, 3).map((app) => (
            <div
              key={app.id}
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
              title={app.name}
            >
              <span>{getAppIcon(app.name)}</span>
              <span className="max-w-20 truncate">{app.name}</span>
            </div>
          ))}
          {applications.length > 3 && (
            <div className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-600">
              +{applications.length - 3} más
            </div>
          )}
        </div>

        {/* Detalles expandidos */}
        {showDetails && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
            {applications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getAppIcon(app.name)}</span>
                  <div>
                    <div className="font-medium text-sm">{app.name}</div>
                    <div className="text-xs text-gray-500">
                      API: {app.credentials.apiKeyShort}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {renderAppStatus(app)}
                  {app.urls.isConfigured && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-600">
                      ✓ Config
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Mostrar loader mientras carga
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={24} />
              <span className="text-gray-600">Cargando usuarios...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si algo falló
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw size={16} />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = getFilteredUsers();
  const availableFilters = getAvailableFilters();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header con estadísticas */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-gray-900">{statistics.users.total}</div>
              <div className="text-sm text-gray-600">Total Usuarios</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-green-600">{statistics.users.withApps}</div>
              <div className="text-sm text-gray-600">Con Aplicaciones</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-blue-600">{statistics.apps.total}</div>
              <div className="text-sm text-gray-600">Total Apps</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-purple-600">{statistics.relations.total}</div>
              <div className="text-sm text-gray-600">Vinculaciones</div>
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Buscador */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por email, rol o aplicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filtrar por rol:</span>
            <div className="flex gap-2">
              {availableFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedFilter === filter.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Botón de refresh */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
        </div>

        {/* Resultados */}
        <div className="mb-4">
          <span className="text-sm text-gray-600">
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </span>
        </div>

        {/* Grid de usuarios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              
              {/* Header con avatar y info */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 ${user.role.badge.class.includes('red') ? 'bg-red-500' : 
                                              user.role.badge.class.includes('blue') ? 'bg-blue-500' : 
                                              'bg-green-500'} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                  {user.displayData.emailShort.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate text-sm" title={user.email}>
                    {user.displayData.emailShort}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.role.badge.class}`}>
                      {user.role.badge.icon} {user.role.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información del usuario */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID Usuario:</span>
                  <span className="font-medium text-gray-900">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email completo:</span>
                  <span className="font-medium text-gray-900 truncate max-w-32" title={user.email}>
                    {user.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Apps Vinculadas:</span>
                  <span className={`font-medium ${user.applications.count > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                    {user.applications.count}
                  </span>
                </div>
              </div>

              {/* Aplicaciones vinculadas */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Aplicaciones:</h4>
                {renderUserApplications(user)}
              </div>

              {/* Badge de estado */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  user.status.hasApps ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {user.status.hasApps ? '✓ Con Apps' : '○ Sin Apps'}
                </span>
                
                {user.status.isAdmin && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    👑 Admin
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje si no hay resultados */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Prueba con otros términos de búsqueda' : 'No hay usuarios que coincidan con el filtro seleccionado'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;