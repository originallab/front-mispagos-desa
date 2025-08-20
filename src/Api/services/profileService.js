import { UserPermissionService } from './UserPermissionService';
import { UserUtils } from '../utils/userUtils';
import { Methods } from './method';
import { handleError } from '../utils/errorHandler';

/**
 * Servicio para manejar datos del perfil de usuario
 * Obtiene información completa del usuario incluyendo rol y permisos
 */
export class ProfileService {

    /**
     * Obtiene los datos completos del perfil de un usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<Object>} - Datos completos del perfil
     */
    static async getUserProfile(userId) {
        try {
            console.log(`🔄 ProfileService.getUserProfile(${userId}) - Iniciando...`);

            if (!userId || userId <= 0) {
                throw new Error('ID de usuario inválido');
            }

            // Obtener usuario con permisos usando el servicio existente
            const userWithPermissions = await UserPermissionService.getUserWithPermissions(userId);
            
            if (!userWithPermissions.success) {
                throw new Error('No se pudo obtener información del usuario');
            }

            const userData = userWithPermissions.data;

            console.log(`✅ Perfil de usuario ${userId} obtenido exitosamente`);

            return {
                success: true,
                data: {
                    user: {
                        user_id: userData.user_id,
                        email: userData.email,
                        role_id: userData.role_id
                    },
                    role: {
                        role_id: userData.role_id,
                        role_name: userData.role_name,
                        role_details: userData.role_details
                    },
                    profile: {
                        displayName: this.extractNameFromEmail(userData.email),
                        avatar: this.getAvatarForRole(userData.role_name),
                        isAdmin: userData.is_admin,
                        hasApplications: userData.has_applications,
                        applicationCount: userData.app_count || 0
                    },
                    metadata: {
                        processed_at: userData.processed_at,
                        status: userData.status
                    }
                },
                message: `Perfil de ${userData.email} obtenido exitosamente`
            };

        } catch (error) {
            console.error(`❌ Error al obtener perfil del usuario ${userId}:`, error);
            handleError(error);
            throw new Error(`Error al obtener perfil: ${error.message}`);
        }
    }

    /**
     * Obtiene datos básicos del usuario actual (para header/navbar)
     * @param {number} userId - ID del usuario
     * @returns {Promise<Object>} - Datos básicos del perfil
     */
    static async getUserBasicProfile(userId) {
        try {
            console.log(`🔄 ProfileService.getUserBasicProfile(${userId}) - Iniciando...`);

            // Para datos básicos, usar directamente UserUtils por performance
            const [user, roleData] = await Promise.all([
                UserUtils.getUserById(userId),
                this.getUserRole(userId)
            ]);

            return {
                success: true,
                data: {
                    user: {
                        user_id: user.user_id,
                        email: user.email,
                        role_id: user.role_id
                    },
                    role: roleData,
                    profile: {
                        displayName: this.extractNameFromEmail(user.email),
                        avatar: this.getAvatarForRole(roleData.role_name)
                    }
                },
                message: 'Datos básicos obtenidos exitosamente'
            };

        } catch (error) {
            console.error(`❌ Error al obtener datos básicos del usuario ${userId}:`, error);
            throw new Error(`Error al obtener datos básicos: ${error.message}`);
        }
    }

    /**
     * Obtiene el rol de un usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<Object>} - Datos del rol
     * @private
     */
    static async getUserRole(userId) {
        try {
            const user = await UserUtils.getUserById(userId);
            const role = await Methods.getRecordById('role', user.role_id);
            
            return {
                role_id: role.role_id,
                role_name: role.role_name
            };
        } catch (error) {
            console.error(`Error obteniendo rol del usuario ${userId}:`, error);
            return {
                role_id: null,
                role_name: 'Rol no encontrado'
            };
        }
    }

    /**
     * Actualiza información básica del perfil
     * @param {number} userId - ID del usuario
     * @param {Object} profileData - Nuevos datos del perfil
     * @returns {Promise<Object>} - Resultado de la actualización
     */
    static async updateUserProfile(userId, profileData) {
        try {
            console.log(`📝 ProfileService.updateUserProfile(${userId}) - Iniciando...`, profileData);

            const updateData = {};
            
            // Solo actualizar email si se proporciona
            if (profileData.email && profileData.email.trim() !== '') {
                updateData.email = profileData.email.trim();
            }

            // Solo actualizar rol si se proporciona
            if (profileData.role_id && profileData.role_id > 0) {
                updateData.role_id = parseInt(profileData.role_id);
            }

            if (Object.keys(updateData).length === 0) {
                throw new Error('No hay datos para actualizar');
            }

            const result = await UserUtils.patchUser(userId, updateData);

            console.log(`✅ Perfil del usuario ${userId} actualizado exitosamente`);

            return {
                success: true,
                data: result,
                message: 'Perfil actualizado exitosamente'
            };

        } catch (error) {
            console.error(`❌ Error al actualizar perfil del usuario ${userId}:`, error);
            throw new Error(`Error al actualizar perfil: ${error.message}`);
        }
    }

    /**
     * Verifica si un usuario puede editar su perfil
     * @param {number} userId - ID del usuario
     * @param {number} targetUserId - ID del usuario objetivo (para admin)
     * @returns {Promise<boolean>} - Si puede editar o no
     */
    static async canEditProfile(userId, targetUserId = null) {
        try {
            const userProfile = await this.getUserBasicProfile(userId);
            const isAdmin = userProfile.data.role.role_name.toLowerCase().includes('admin');
            
            // Admin puede editar cualquier perfil
            if (isAdmin) return true;
            
            // Usuario puede editar solo su propio perfil
            return targetUserId ? userId === targetUserId : true;
            
        } catch (error) {
            console.error(`Error verificando permisos de edición:`, error);
            return false;
        }
    }

    /**
     * Obtiene todos los roles disponibles para selección
     * @returns {Promise<Array>} - Lista de roles
     */
    static async getAvailableRoles() {
        try {
            console.log('🔄 ProfileService.getAvailableRoles() - Iniciando...');
            
            const result = await Methods.getAllRecords('role', null);
            const roles = result.records || result || [];
            
            console.log(`✅ ${roles.length} roles obtenidos`);
            
            return {
                success: true,
                data: roles,
                message: `${roles.length} roles disponibles`
            };
            
        } catch (error) {
            console.error('❌ Error al obtener roles disponibles:', error);
            throw new Error('Error al obtener roles disponibles');
        }
    }

    // ==========================================
    // MÉTODOS PRIVADOS DE UTILIDAD
    // ==========================================

    /**
     * Extrae el nombre del email para mostrar
     * @param {string} email - Email del usuario
     * @returns {string} - Nombre formateado
     * @private
     */
    static extractNameFromEmail(email) {
        if (!email) return 'Usuario';
        
        const emailPart = email.split('@')[0];
        return emailPart
            .replace(/[._-]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Obtiene el avatar apropiado según el rol
     * @param {string} roleName - Nombre del rol
     * @returns {string} - Emoji del avatar
     * @private
     */
    static getAvatarForRole(roleName) {
        const roleNameLower = (roleName || '').toLowerCase();
        
        if (roleNameLower.includes('admin')) return '👨‍💼';
        if (roleNameLower.includes('supervisor')) return '👨‍🔧';
        if (roleNameLower.includes('cliente')) return '👤';
        
        return '👨‍💻';
    }
}