import React, { useState, useEffect } from 'react';
import { UserPermissionService } from '../../Api/services/UserPermissionService';
import { UserPermissionUtils } from '../../Api/utils/UserPermissonUtils.js';

const UserPermissionComponent = () => {
    // Estados del componente
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [statistics, setStatistics] = useState(null);
    const [sortBy, setSortBy] = useState('email');
    const [sortOrder, setSortOrder] = useState('asc');

    // Cargar datos iniciales
    useEffect(() => {
        loadUsersWithPermissions();
        loadStatistics();
    }, []);

    /**
     * Carga todos los usuarios con sus permisos y aplicaciones
     */
    const loadUsersWithPermissions = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔄 Cargando usuarios con permisos...');
            const result = await UserPermissionService.getAllUsersWithPermissions();
            
            if (result.success) {
                setUsers(result.data);
                console.log(`✅ ${result.data.length} usuarios cargados exitosamente`);
            } else {
                throw new Error('Error al cargar usuarios');
            }
        } catch (err) {
            console.error('❌ Error cargando usuarios:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Carga las estadísticas del sistema
     */
    const loadStatistics = async () => {
        try {
            const result = await UserPermissionService.getPermissionStatistics();
            if (result.success) {
                setStatistics(result.data);
            }
        } catch (err) {
            console.error('❌ Error cargando estadísticas:', err);
        }
    };

    /**
     * Maneja la búsqueda de usuarios
     */
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    /**
     * Maneja la selección de un usuario para ver detalles
     */
    const handleUserSelect = async (userId) => {
        try {
            setLoading(true);
            const result = await UserPermissionService.getUserWithPermissions(userId);
            if (result.success) {
                setSelectedUser(result.data);
                setShowUserModal(true);
            }
        } catch (err) {
            console.error('❌ Error obteniendo detalles del usuario:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Vincula un usuario a una aplicación
     */
    const handleLinkUserToApp = async (userId, appId) => {
        try {
            await UserPermissionService.linkUserToApp(userId, appId);
            await loadUsersWithPermissions(); // Recargar datos
            alert('Usuario vinculado exitosamente a la aplicación');
        } catch (err) {
            console.error('❌ Error vinculando usuario:', err);
            alert(`Error: ${err.message}`);
        }
    };

    /**
     * Desvincula un usuario de una aplicación
     */
    const handleUnlinkUserFromApp = async (userId, appId) => {
        try {
            await UserPermissionService.unlinkUserFromApp(userId, appId);
            await loadUsersWithPermissions(); // Recargar datos
            alert('Usuario desvinculado exitosamente de la aplicación');
        } catch (err) {
            console.error('❌ Error desvinculando usuario:', err);
            alert(`Error: ${err.message}`);
        }
    };

    /**
     * Maneja el cambio de orden
     */
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    // Procesar datos para mostrar
    const filteredUsers = UserPermissionUtils.filterUsersBySearch(users, searchTerm);
    const sortedUsers = UserPermissionUtils.sortUsers(filteredUsers, sortBy, sortOrder);
    const formattedUsers = UserPermissionUtils.formatUsersForTable(sortedUsers);
    const formattedStats = statistics ? UserPermissionUtils.formatStatistics(statistics) : null;

    // Renderizado condicional para estados de carga y error
    if (loading && users.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                <span className="ml-4 text-lg">Cargando usuarios con permisos...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            Error al cargar los datos
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={() => loadUsersWithPermissions()}
                                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white">
            {/* Header con estadísticas */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Permisos de Usuario
                </h1>
                
                {formattedStats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {formattedStats.users.total}
                            </div>
                            <div className="text-sm text-gray-600">Total Usuarios</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {formattedStats.users.withApps}
                            </div>
                            <div className="text-sm text-gray-600">Con Aplicaciones</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {formattedStats.apps.total}
                            </div>
                            <div className="text-sm text-gray-600">Total Apps</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                                {formattedStats.relations.total}
                            </div>
                            <div className="text-sm text-gray-600">Vinculaciones</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Controles de búsqueda y filtros */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Buscar por email, rol o aplicación..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={loadUsersWithPermissions}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
            </div>

            {/* Tabla de usuarios */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('user_id')}
                            >
                                ID {sortBy === 'user_id' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('email')}
                            >
                                Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('role')}
                            >
                                Rol {sortBy === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('app_count')}
                            >
                                Aplicaciones {sortBy === 'app_count' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {formattedUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {user.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div>
                                        <div className="font-medium">{user.displayData.emailShort}</div>
                                        <div className="text-xs text-gray-500" title={user.email}>
                                            {user.email !== user.displayData.emailShort && 'Hover para ver completo'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role.badge.class}`}>
                                        <span className="mr-1">{user.role.badge.icon}</span>
                                        {user.role.name}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="flex items-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.applications.badge.class}`}>
                                            {user.applications.badge.text}
                                        </span>
                                        {user.applications.count > 0 && (
                                            <div className="ml-2 text-xs text-gray-500">
                                                ({user.applications.active} activas)
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleUserSelect(user.id)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Ver Detalles
                                        </button>
                                        {user.actions.canManageApps && (
                                            <button
                                                onClick={() => {/* Abrir modal de gestión de apps */}}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Gestionar Apps
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {formattedUsers.length === 0 && (
                <div className="text-center py-8">
                    <div className="text-gray-500">
                        {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios para mostrar'}
                    </div>
                </div>
            )}

            {/* Modal de detalles del usuario */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Detalles del Usuario: {selectedUser.email}
                                </h3>
                                <button
                                    onClick={() => setShowUserModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <span className="sr-only">Cerrar</span>
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Información básica */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Información Básica</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">ID:</span>
                                            <span className="ml-2 font-medium">{selectedUser.user_id}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Email:</span>
                                            <span className="ml-2 font-medium">{selectedUser.email}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Rol:</span>
                                            <span className="ml-2 font-medium">{selectedUser.role_name}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Es Admin:</span>
                                            <span className="ml-2 font-medium">{selectedUser.is_admin ? 'Sí' : 'No'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Aplicaciones */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                        Aplicaciones ({selectedUser.app_count})
                                    </h4>
                                    {selectedUser.applications.length > 0 ? (
                                        <div className="space-y-2">
                                            {UserPermissionUtils.formatApplicationsForUser(selectedUser.applications).map((app) => (
                                                <div key={app.id} className="flex items-center justify-between bg-white p-3 rounded border">
                                                    <div className="flex items-center">
                                                        <div className={`w-8 h-8 rounded-full ${app.icon.bg} flex items-center justify-center text-xs font-bold ${app.icon.color} mr-3`}>
                                                            {app.icon.text}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{app.name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                API: {app.credentials.apiKeyShort}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${app.status.class}`}>
                                                            {app.status.text}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUnlinkUserFromApp(selectedUser.user_id, app.id)}
                                                            className="text-red-600 hover:text-red-800 text-xs"
                                                        >
                                                            Desvincular
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 py-4">
                                            Este usuario no tiene aplicaciones asignadas
                                        </div>
                                    )}
                                </div>

                                {/* Estadísticas */}
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Estadísticas</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Apps Activas:</span>
                                            <span className="ml-2 font-medium text-green-600">{selectedUser.stats.active_apps}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Apps Inactivas:</span>
                                            <span className="ml-2 font-medium text-red-600">{selectedUser.stats.inactive_apps}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Apps Configuradas:</span>
                                            <span className="ml-2 font-medium text-blue-600">{selectedUser.stats.configured_apps}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Procesado:</span>
                                            <span className="ml-2 font-medium text-gray-600">
                                                {UserPermissionUtils.formatDate(selectedUser.processed_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowUserModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={() => {/* Abrir modal para vincular apps */}}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Gestionar Aplicaciones
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPermissionComponent;