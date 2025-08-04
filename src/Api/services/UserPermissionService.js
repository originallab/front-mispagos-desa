import { UserUtils } from '../utils/userUtils';
import { AppUtils } from '../utils/appUtils';
import { UserAppService } from '../services/UserAppService';
import { Methods } from './method';
import { handleError } from '../utils/errorHandler';

/**
 * Servicio especializado para manejar permisos y vinculaciones de usuarios
 * Combina datos de las tablas: user, role, user_app, app
 */
export class UserPermissionService {

    /**
     * Obtiene todos los usuarios con su información completa incluyendo rol y aplicaciones vinculadas
     * @returns {Promise<Object>} - Usuarios completos con sus permisos y aplicaciones
     */
    static async getAllUsersWithPermissions() {
        try {
            console.log('🔄 UserPermissionService.getAllUsersWithPermissions() - Iniciando...');

            // 1. Obtener todos los usuarios
            const users = await UserUtils.getAllUsers();
            console.log(`👥 ${users.length} usuarios obtenidos`);

            // 2. Obtener todos los roles para hacer un mapeo
            const roles = await this.getAllRoles();
            const roleMap = new Map(roles.map(role => [role.role_id, role]));
            console.log(`🏷️ ${roles.length} roles obtenidos para mapeo`);

            // 3. Obtener todas las aplicaciones para hacer un mapeo
            const apps = await AppUtils.getAllApps();
            const appMap = new Map(apps.map(app => [app.app_id, app]));
            console.log(`📱 ${apps.length} aplicaciones obtenidas para mapeo`);

            // 4. Obtener todas las relaciones user_app
            const userAppRelations = await UserAppService.getAll();
            console.log(`🔗 ${userAppRelations.data.length} relaciones user-app obtenidas`);

            // 5. Procesar cada usuario
            const usersWithPermissions = await Promise.all(
                users.map(async (user) => {
                    try {
                        return await this.enrichUserWithPermissions(user, roleMap, appMap, userAppRelations.data);
                    } catch (error) {
                        console.error(`❌ Error procesando usuario ${user.user_id}:`, error);
                        return this.createErrorUser(user, error);
                    }
                })
            );

            const validUsers = usersWithPermissions.filter(user => user.status !== 'error');
            const errorUsers = usersWithPermissions.filter(user => user.status === 'error');

            console.log(`✅ ${validUsers.length} usuarios procesados exitosamente`);
            if (errorUsers.length > 0) {
                console.warn(`⚠️ ${errorUsers.length} usuarios con errores de procesamiento`);
            }

            return {
                success: true,
                data: usersWithPermissions,
                summary: {
                    total: usersWithPermissions.length,
                    valid: validUsers.length,
                    errors: errorUsers.length,
                    totalApps: apps.length,
                    totalRoles: roles.length,
                    totalRelations: userAppRelations.data.length
                },
                message: `${usersWithPermissions.length} usuarios obtenidos con información completa`
            };

        } catch (error) {
            console.error('❌ Error en UserPermissionService.getAllUsersWithPermissions():', error);
            handleError(error);
            throw new Error(`Error al obtener usuarios con permisos: ${error.message}`);
        }
    }

    /**
     * Obtiene un usuario específico con toda su información de permisos
     * @param {number} userId - ID del usuario
     * @returns {Promise<Object>} - Usuario completo con permisos
     */
    static async getUserWithPermissions(userId) {
        try {
            console.log(`🔍 UserPermissionService.getUserWithPermissions(${userId}) - Iniciando...`);

            if (!userId || userId <= 0) {
                throw new Error('ID de usuario inválido');
            }

            // 1. Obtener el usuario
            const user = await UserUtils.getUserById(userId);
            console.log(`👤 Usuario ${userId} obtenido: ${user.email}`);

            // 2. Obtener el rol del usuario
            const role = await this.getRoleById(user.role_id);
            console.log(`🏷️ Rol obtenido: ${role.role_name}`);

            // 3. Obtener aplicaciones del usuario
            const userApps = await UserAppService.getByUserId(userId);
            console.log(`📱 ${userApps.count} aplicaciones vinculadas al usuario`);

            // 4. Obtener detalles de cada aplicación
            const appsDetails = await this.getAppsDetails(userApps.data);

            // 5. Enriquecer el usuario
            const enrichedUser = {
                // Información básica del usuario
                user_id: user.user_id,
                email: user.email,
                
                // Información del rol
                role_id: user.role_id,
                role_name: role.role_name,
                role_details: role,
                
                // Aplicaciones vinculadas
                applications: appsDetails,
                app_count: appsDetails.length,
                
                // Estadísticas
                stats: {
                    active_apps: appsDetails.filter(app => app.isActive).length,
                    inactive_apps: appsDetails.filter(app => !app.isActive).length,
                    configured_apps: appsDetails.filter(app => 
                        app.callback_url && app.return_url && app.error_url
                    ).length
                },
                
                // Estado general
                status: 'success',
                has_applications: appsDetails.length > 0,
                is_admin: role.role_name?.toLowerCase().includes('admin'),
                
                // Metadata
                processed_at: new Date().toISOString(),
                data_sources: ['user', 'role', 'user_app', 'app']
            };

            console.log(`✅ Usuario ${userId} procesado exitosamente con ${appsDetails.length} aplicaciones`);

            return {
                success: true,
                data: enrichedUser,
                message: `Usuario ${userId} obtenido con información completa`
            };

        } catch (error) {
            console.error(`❌ Error al obtener usuario ${userId} con permisos:`, error);
            handleError(error);
            throw new Error(`Error al obtener usuario con permisos: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas generales de usuarios y permisos
     * @returns {Promise<Object>} - Estadísticas completas
     */
    static async getPermissionStatistics() {
        try {
            console.log('📊 UserPermissionService.getPermissionStatistics() - Iniciando...');

            const [usersResult, roles, apps, userAppRelations] = await Promise.all([
                this.getAllUsersWithPermissions(),
                this.getAllRoles(),
                AppUtils.getAllApps(),
                UserAppService.getAll()
            ]);

            const users = usersResult.data;

            const stats = {
                // Estadísticas generales
                total_users: users.length,
                total_roles: roles.length,
                total_apps: apps.length,
                total_relations: userAppRelations.data.length,

                // Estadísticas por rol
                users_by_role: this.calculateUsersByRole(users),
                
                // Estadísticas de aplicaciones
                apps_stats: {
                    active: apps.filter(app => app.active === '1' || app.active === 1).length,
                    inactive: apps.filter(app => app.active === '0' || app.active === 0).length,
                    with_users: this.calculateAppsWithUsers(apps, userAppRelations.data),
                    without_users: this.calculateAppsWithoutUsers(apps, userAppRelations.data)
                },

                // Estadísticas de vinculaciones
                user_app_stats: {
                    users_with_apps: users.filter(user => user.app_count > 0).length,
                    users_without_apps: users.filter(user => user.app_count === 0).length,
                    avg_apps_per_user: users.length > 0 ? 
                        (userAppRelations.data.length / users.length).toFixed(2) : 0,
                    max_apps_per_user: Math.max(...users.map(user => user.app_count || 0))
                },

                // Top usuarios por aplicaciones
                top_users_by_apps: users
                    .sort((a, b) => (b.app_count || 0) - (a.app_count || 0))
                    .slice(0, 5)
                    .map(user => ({
                        user_id: user.user_id,
                        email: user.email,
                        role_name: user.role_name,
                        app_count: user.app_count || 0
                    })),

                // Distribución de permisos
                permission_distribution: this.calculatePermissionDistribution(users, roles),
                
                // Aplicaciones más usadas
                most_used_apps: this.calculateMostUsedApps(apps, userAppRelations.data),

                // Metadata
                generated_at: new Date().toISOString(),
                data_freshness: 'real-time'
            };

            console.log('✅ Estadísticas de permisos generadas:', {
                total_users: stats.total_users,
                total_relations: stats.total_relations,
                users_with_apps: stats.user_app_stats.users_with_apps
            });

            return {
                success: true,
                data: stats,
                message: 'Estadísticas de permisos generadas exitosamente'
            };

        } catch (error) {
            console.error('❌ Error al generar estadísticas de permisos:', error);
            throw new Error(`Error al generar estadísticas: ${error.message}`);
        }
    }

    /**
     * Busca usuarios por criterios múltiples incluyendo aplicaciones y roles
     * @param {Object} searchCriteria - Criterios de búsqueda
     * @returns {Promise<Object>} - Usuarios encontrados
     */
    static async searchUsersWithPermissions(searchCriteria) {
        try {
            console.log('🔍 UserPermissionService.searchUsersWithPermissions() - Iniciando...', searchCriteria);

            // Obtener todos los usuarios con permisos
            const allUsersResult = await this.getAllUsersWithPermissions();
            let users = allUsersResult.data;

            // Aplicar filtros
            if (searchCriteria.email) {
                const emailFilter = searchCriteria.email.toLowerCase();
                users = users.filter(user => 
                    user.email.toLowerCase().includes(emailFilter)
                );
            }

            if (searchCriteria.role_id) {
                users = users.filter(user => 
                    user.role_id === parseInt(searchCriteria.role_id)
                );
            }

            if (searchCriteria.role_name) {
                const roleFilter = searchCriteria.role_name.toLowerCase();
                users = users.filter(user => 
                    user.role_name.toLowerCase().includes(roleFilter)
                );
            }

            if (searchCriteria.has_apps !== undefined) {
                const hasApps = searchCriteria.has_apps === true || searchCriteria.has_apps === 'true';
                users = users.filter(user => 
                    hasApps ? user.app_count > 0 : user.app_count === 0
                );
            }

            if (searchCriteria.app_id) {
                const appId = parseInt(searchCriteria.app_id);
                users = users.filter(user => 
                    user.applications.some(app => app.app_id === appId)
                );
            }

            if (searchCriteria.app_name) {
                const appNameFilter = searchCriteria.app_name.toLowerCase();
                users = users.filter(user => 
                    user.applications.some(app => 
                        app.name_app.toLowerCase().includes(appNameFilter)
                    )
                );
            }

            if (searchCriteria.min_apps) {
                const minApps = parseInt(searchCriteria.min_apps);
                users = users.filter(user => user.app_count >= minApps);
            }

            if (searchCriteria.max_apps) {
                const maxApps = parseInt(searchCriteria.max_apps);
                users = users.filter(user => user.app_count <= maxApps);
            }

            console.log(`✅ ${users.length} usuarios encontrados con criterios de búsqueda`);

            return {
                success: true,
                data: users,
                count: users.length,
                search_criteria: searchCriteria,
                message: `${users.length} usuarios encontrados`
            };

        } catch (error) {
            console.error('❌ Error en búsqueda de usuarios con permisos:', error);
            throw new Error(`Error en búsqueda: ${error.message}`);
        }
    }

    /**
     * Vincula un usuario a una aplicación
     * @param {number} userId - ID del usuario
     * @param {number} appId - ID de la aplicación
     * @returns {Promise<Object>} - Resultado de la vinculación
     */
    static async linkUserToApp(userId, appId) {
        try {
            console.log(`🔗 Vinculando usuario ${userId} a aplicación ${appId}...`);

            // Validar que el usuario existe
            await UserUtils.getUserById(userId);
            
            // Validar que la aplicación existe
            await AppUtils.getAppById(appId);

            // Crear la vinculación
            const result = await UserAppService.create({
                user_id: userId,
                app_id: appId
            });

            console.log(`✅ Usuario ${userId} vinculado exitosamente a aplicación ${appId}`);

            return {
                success: true,
                data: result.data,
                message: `Usuario vinculado exitosamente a la aplicación`
            };

        } catch (error) {
            console.error(`❌ Error al vincular usuario ${userId} a app ${appId}:`, error);
            throw new Error(`Error al vincular usuario: ${error.message}`);
        }
    }

    /**
     * Desvincula un usuario de una aplicación
     * @param {number} userId - ID del usuario
     * @param {number} appId - ID de la aplicación
     * @returns {Promise<Object>} - Resultado de la desvinculación
     */
    static async unlinkUserFromApp(userId, appId) {
        try {
            console.log(`🔗❌ Desvinculando usuario ${userId} de aplicación ${appId}...`);

            // Obtener la relación
            const relations = await UserAppService.getAll();
            const relation = relations.data.find(rel => 
                rel.user_id === userId && rel.app_id === appId
            );

            if (!relation) {
                throw new Error('No existe vinculación entre este usuario y aplicación');
            }

            // Eliminar la relación
            const result = await UserAppService.remove(relation.user_app_id);

            console.log(`✅ Usuario ${userId} desvinculado exitosamente de aplicación ${appId}`);

            return {
                success: true,
                data: result.data,
                message: `Usuario desvinculado exitosamente de la aplicación`
            };

        } catch (error) {
            console.error(`❌ Error al desvincular usuario ${userId} de app ${appId}:`, error);
            throw new Error(`Error al desvincular usuario: ${error.message}`);
        }
    }

    // ==========================================
    // MÉTODOS PRIVADOS DE APOYO
    // ==========================================

    /**
     * Enriquece un usuario con información de rol y aplicaciones
     * @private
     */
    static async enrichUserWithPermissions(user, roleMap, appMap, userAppRelations) {
        try {
            // Obtener rol del usuario
            const role = roleMap.get(user.role_id) || null;

            // Obtener aplicaciones del usuario
            const userRelations = userAppRelations.filter(rel => rel.user_id === user.user_id);
            const userApps = userRelations.map(rel => {
                const app = appMap.get(rel.app_id);
                return app ? {
                    ...app,
                    user_app_id: rel.user_app_id,
                    isActive: app.active === '1' || app.active === 1
                } : null;
            }).filter(app => app !== null);

            return {
                // Información básica del usuario
                user_id: user.user_id,
                email: user.email,
                
                // Información del rol
                role_id: user.role_id,
                role_name: role?.role_name || 'Rol no encontrado',
                role_details: role,
                
                // Aplicaciones vinculadas
                applications: userApps,
                app_count: userApps.length,
                
                // Estadísticas rápidas
                stats: {
                    active_apps: userApps.filter(app => app.isActive).length,
                    inactive_apps: userApps.filter(app => !app.isActive).length
                },
                
                // Estado
                status: 'success',
                has_applications: userApps.length > 0,
                is_admin: role?.role_name?.toLowerCase().includes('admin') || false,
                
                // Metadata
                processed_at: new Date().toISOString()
            };

        } catch (error) {
            console.error(`Error enriqueciendo usuario ${user.user_id}:`, error);
            throw error;
        }
    }

    /**
     * Crea un objeto de usuario con error
     * @private
     */
    static createErrorUser(user, error) {
        return {
            user_id: user.user_id,
            email: user.email,
            role_id: user.role_id,
            role_name: 'Error al cargar',
            applications: [],
            app_count: 0,
            status: 'error',
            error_message: error.message,
            has_applications: false,
            processed_at: new Date().toISOString()
        };
    }

    /**
     * Obtiene todos los roles
     * @private
     */
    static async getAllRoles() {
        try {
            const result = await Methods.getAllRecords('role', null);
            return result.records || result || [];
        } catch (error) {
            console.error('Error obteniendo roles:', error);
            return [];
        }
    }

    /**
     * Obtiene un rol por ID
     * @private
     */
    static async getRoleById(roleId) {
        try {
            const result = await Methods.getRecordById('role', roleId);
            return result.record || result;
        } catch (error) {
            console.error(`Error obteniendo rol ${roleId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene detalles de múltiples aplicaciones
     * @private
     */
    static async getAppsDetails(userAppRelations) {
        try {
            const appPromises = userAppRelations.map(async (relation) => {
                try {
                    const app = await AppUtils.getAppById(relation.app_id);
                    return {
                        ...app,
                        user_app_id: relation.user_app_id,
                        isActive: app.active === '1' || app.active === 1
                    };
                } catch (error) {
                    console.error(`Error obteniendo app ${relation.app_id}:`, error);
                    return null;
                }
            });

            const apps = await Promise.all(appPromises);
            return apps.filter(app => app !== null);
        } catch (error) {
            console.error('Error obteniendo detalles de aplicaciones:', error);
            return [];
        }
    }

    /**
     * Calcula usuarios por rol
     * @private
     */
    static calculateUsersByRole(users) {
        const roleCount = {};
        users.forEach(user => {
            const roleName = user.role_name || 'Sin rol';
            roleCount[roleName] = (roleCount[roleName] || 0) + 1;
        });
        return roleCount;
    }

    /**
     * Calcula aplicaciones con usuarios
     * @private
     */
    static calculateAppsWithUsers(apps, relations) {
        const appsWithUsers = new Set(relations.map(rel => rel.app_id));
        return appsWithUsers.size;
    }

    /**
     * Calcula aplicaciones sin usuarios
     * @private
     */
    static calculateAppsWithoutUsers(apps, relations) {
        const appsWithUsers = new Set(relations.map(rel => rel.app_id));
        return apps.filter(app => !appsWithUsers.has(app.app_id)).length;
    }

    /**
     * Calcula distribución de permisos
     * @private
     */
    static calculatePermissionDistribution(users, roles) {
        const distribution = {};
        
        roles.forEach(role => {
            const usersInRole = users.filter(user => user.role_id === role.role_id);
            distribution[role.role_name] = {
                user_count: usersInRole.length,
                total_apps: usersInRole.reduce((sum, user) => sum + (user.app_count || 0), 0),
                avg_apps: usersInRole.length > 0 ? 
                    (usersInRole.reduce((sum, user) => sum + (user.app_count || 0), 0) / usersInRole.length).toFixed(2) : 0
            };
        });

        return distribution;
    }

    /**
     * Calcula aplicaciones más usadas
     * @private
     */
    static calculateMostUsedApps(apps, relations) {
        const appUsage = {};
        
        relations.forEach(relation => {
            appUsage[relation.app_id] = (appUsage[relation.app_id] || 0) + 1;
        });

        return apps
            .map(app => ({
                app_id: app.app_id,
                name_app: app.name_app,
                user_count: appUsage[app.app_id] || 0
            }))
            .sort((a, b) => b.user_count - a.user_count)
            .slice(0, 5);
    }
}