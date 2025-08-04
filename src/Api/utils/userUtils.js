import { Methods } from '../services/method';

/**
 * Utilidades específicas para el manejo de usuarios
 * Versión con debug mejorado
 */
export class UserUtils {
    
    /**
     * Obtiene todos los usuarios de la base de datos
     * @returns {Promise<Array>} - Lista de todos los usuarios
     */
    static async getAllUsers() {
        try {
            console.log('🔄 UserUtils.getAllUsers() - Iniciando...');
            
            const result = await Methods.getAllRecords('user', null);
            
            console.log('📊 Respuesta completa de Methods.getAllRecords:', result);
            console.log('📊 Tipo de result:', typeof result);
            console.log('📊 Keys de result:', Object.keys(result || {}));
            
            let users = [];
            
            if (result && result.records) {
                users = result.records;
                console.log('✅ Usuarios encontrados en result.records:', users);
            } else if (result && Array.isArray(result)) {
                users = result;
                console.log('✅ Usuarios encontrados directamente en result:', users);
            } else if (result && result.data) {
                users = result.data;
                console.log('✅ Usuarios encontrados en result.data:', users);
            } else {
                console.log('⚠️ No se encontraron usuarios en la respuesta');
                console.log('⚠️ Estructura de respuesta:', JSON.stringify(result, null, 2));
            }
            
            if (Array.isArray(users) && users.length > 0) {
                console.log(`✅ ${users.length} usuarios procesados exitosamente`);
                console.log('👤 Primer usuario como ejemplo:', users[0]);
                console.log('👤 Campos del primer usuario:', Object.keys(users[0] || {}));
            } else {
                console.log('❌ No se encontraron usuarios válidos');
            }
            
            return users;
        } catch (error) {
            console.error('❌ Error en UserUtils.getAllUsers():', error);
            console.error('❌ Error completo:', {
                message: error.message,
                stack: error.stack,
                response: error.response
            });
            throw new Error('No se pudieron obtener los usuarios');
        }
    }

    /**
     * Obtiene la información completa de un usuario por su ID
     * @param {number} userId - ID del usuario
     * @returns {Promise<Object>} - Información del usuario
     */
    static async getUserById(userId) {
        try {
            console.log(`🔍 UserUtils.getUserById(${userId}) - Iniciando...`);
            
            const result = await Methods.getRecordById('user', userId);
            
            console.log('📊 Respuesta de getRecordById:', result);
            
            let user = null;
            
            if (result && result.record) {
                user = result.record;
            } else if (result && !result.record) {
                user = result;
            }
            
            console.log('👤 Usuario obtenido:', user);
            
            return user;
        } catch (error) {
            console.error(`❌ Error al obtener usuario con ID ${userId}:`, error);
            throw new Error(`No se pudo obtener el usuario con ID ${userId}`);
        }
    }

    /**
     * Obtiene la información de un usuario por su email
     * @param {string} email - Email del usuario
     * @returns {Promise<Object>} - Información del usuario
     */
    static async getUserByEmail(email) {
        try {
            console.log(`🔍 UserUtils.getUserByEmail(${email}) - Iniciando...`);
            
            const result = await Methods.getRecordByField('user', 'email', email);
            
            console.log('📊 Respuesta de getRecordByField:', result);
            
            let user = null;
            
            if (result && result.record) {
                user = result.record;
            } else if (result && !result.record) {
                user = result;
            }
            
            console.log('👤 Usuario obtenido por email:', user);
            
            return user;
        } catch (error) {
            console.error(`❌ Error al obtener usuario con email ${email}:`, error);
            throw new Error(`No se pudo obtener el usuario con email ${email}`);
        }
    }

    /**
     * Obtiene todos los usuarios de un rol específico
     * @param {number} roleId - ID del rol
     * @returns {Promise<Array>} - Lista de usuarios con ese rol
     */
    static async getUsersByRole(roleId) {
        try {
            console.log(`🔍 UserUtils.getUsersByRole(${roleId}) - Iniciando...`);
            
            const result = await Methods.getAllRecords('user', { role_id: roleId.toString() });
            
            console.log('📊 Respuesta de getUsersByRole:', result);
            
            let users = [];
            
            if (result && result.records) {
                users = result.records;
            } else if (result && Array.isArray(result)) {
                users = result;
            }
            
            console.log(`✅ ${users.length} usuarios con role_id ${roleId} encontrados`);
            
            return users;
        } catch (error) {
            console.error(`❌ Error al obtener usuarios con role_id ${roleId}:`, error);
            throw new Error(`No se pudieron obtener los usuarios con role_id ${roleId}`);
        }
    }

    /**
     * Verifica si existe un usuario con el email proporcionado
     * @param {string} email - Email a verificar
     * @returns {Promise<boolean>} - true si existe, false si no existe
     */
    static async userExists(email) {
        try {
            await this.getUserByEmail(email);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Crea un nuevo usuario
     * @param {Object} userData - Datos del usuario
     * @param {number} userData.role_id - ID del rol del usuario
     * @param {string} userData.email - Email del usuario
     * @returns {Promise<Object>} - Usuario creado
     */
    static async createUser(userData) {
        try {
            console.log('➕ UserUtils.createUser() - Iniciando...', userData);
            
            // Validar que el email no exista
            const exists = await this.userExists(userData.email);
            if (exists) {
                throw new Error('Ya existe un usuario con este email');
            }

            const result = await Methods.createRecord('user', userData);
            
            console.log('✅ Usuario creado:', result);
            
            return result;
        } catch (error) {
            console.error('❌ Error al crear usuario:', error);
            throw error;
        }
    }

    /**
     * Actualiza la información de un usuario
     * @param {number} userId - ID del usuario a actualizar
     * @param {Object} userData - Nuevos datos del usuario
     * @returns {Promise<Object>} - Resultado de la actualización
     */
    static async updateUser(userId, userData) {
        try {
            console.log(`📝 UserUtils.updateUser(${userId}) - Iniciando...`, userData);
            
            // Verificar que el usuario existe
            await this.getUserById(userId);
            
            // Si se está actualizando el email, verificar que no exista otro usuario con ese email
            if (userData.email) {
                const existingUser = await this.getUserByEmail(userData.email).catch(() => null);
                if (existingUser && existingUser.user_id !== userId) {
                    throw new Error('Ya existe otro usuario con este email');
                }
            }

            const result = await Methods.updateRecord('user', userId, userData);
            
            console.log('✅ Usuario actualizado:', result);
            
            return result;
        } catch (error) {
            console.error(`❌ Error al actualizar usuario ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Actualiza parcialmente la información de un usuario
     * @param {number} userId - ID del usuario a actualizar
     * @param {Object} partialData - Datos parciales del usuario
     * @returns {Promise<Object>} - Resultado de la actualización
     */
    static async patchUser(userId, partialData) {
        try {
            console.log(`🔧 UserUtils.patchUser(${userId}) - Iniciando...`, partialData);
            
            // Verificar que el usuario existe
            await this.getUserById(userId);
            
            // Si se está actualizando el email, verificar que no exista otro usuario con ese email
            if (partialData.email) {
                const existingUser = await this.getUserByEmail(partialData.email).catch(() => null);
                if (existingUser && existingUser.user_id !== userId) {
                    throw new Error('Ya existe otro usuario con este email');
                }
            }

            const result = await Methods.patchRecord('user', userId, partialData);
            
            console.log('✅ Usuario actualizado parcialmente:', result);
            
            return result;
        } catch (error) {
            console.error(`❌ Error al actualizar parcialmente usuario ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Elimina un usuario
     * @param {number} userId - ID del usuario a eliminar
     * @returns {Promise<Object>} - Resultado de la eliminación
     */
    static async deleteUser(userId) {
        try {
            console.log(`🗑️ UserUtils.deleteUser(${userId}) - Iniciando...`);
            
            // Verificar que el usuario existe antes de eliminarlo
            await this.getUserById(userId);
            
            const result = await Methods.deleteRecord('user', userId);
            
            console.log('✅ Usuario eliminado:', result);
            
            return result;
        } catch (error) {
            console.error(`❌ Error al eliminar usuario ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Cambia el rol de un usuario
     * @param {number} userId - ID del usuario
     * @param {number} newRoleId - Nuevo ID de rol
     * @returns {Promise<Object>} - Resultado de la actualización
     */
    static async changeUserRole(userId, newRoleId) {
        try {
            console.log(`🔄 UserUtils.changeUserRole(${userId}, ${newRoleId}) - Iniciando...`);
            
            const result = await this.patchUser(userId, { role_id: newRoleId });
            
            console.log('✅ Rol de usuario cambiado:', result);
            
            return result;
        } catch (error) {
            console.error(`❌ Error al cambiar rol del usuario ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene la información básica de un usuario (sin datos sensibles)
     * @param {number} userId - ID del usuario
     * @returns {Promise<Object>} - Información básica del usuario
     */
    static async getUserBasicInfo(userId) {
        try {
            const user = await this.getUserById(userId);
            return {
                user_id: user.user_id,
                email: user.email,
                role_id: user.role_id
            };
        } catch (error) {
            console.error(`❌ Error al obtener información básica del usuario ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Valida si un usuario tiene un rol específico
     * @param {number} userId - ID del usuario
     * @param {number} requiredRoleId - ID del rol requerido
     * @returns {Promise<boolean>} - true si el usuario tiene el rol, false si no
     */
    static async userHasRole(userId, requiredRoleId) {
        try {
            const user = await this.getUserById(userId);
            return user.role_id === requiredRoleId;
        } catch (error) {
            console.error(`❌ Error al validar rol del usuario ${userId}:`, error);
            return false;
        }
    }

    /**
     * Busca usuarios por criterios múltiples
     * @param {Object} criteria - Criterios de búsqueda
     * @returns {Promise<Array>} - Lista de usuarios que cumplen los criterios
     */
    static async searchUsers(criteria) {
        try {
            console.log('🔍 UserUtils.searchUsers() - Iniciando...', criteria);
            
            const result = await Methods.getAllRecords('user', criteria);
            
            console.log('📊 Respuesta de searchUsers:', result);
            
            let users = [];
            
            if (result && result.records) {
                users = result.records;
            } else if (result && Array.isArray(result)) {
                users = result;
            }
            
            console.log(`✅ ${users.length} usuarios encontrados con criterios`);
            
            return users;
        } catch (error) {
            console.error('❌ Error al buscar usuarios:', error);
            throw new Error('No se pudieron buscar los usuarios');
        }
    }

    /**
     * Función de debug para probar la conexión con la API
     * @returns {Promise<Object>} - Información de debug
     */
    static async debugConnection() {
        try {
            console.log('🔧 UserUtils.debugConnection() - Probando conexión...');
            
            // Probar diferentes endpoints
            const tests = [];
            
            try {
                const health = await Methods.healthCheck();
                tests.push({ endpoint: 'health', success: true, data: health });
            } catch (error) {
                tests.push({ endpoint: 'health', success: false, error: error.message });
            }
            
            try {
                const userResult = await Methods.getAllRecords('user', null);
                tests.push({ endpoint: 'user/all', success: true, data: userResult });
            } catch (error) {
                tests.push({ endpoint: 'user/all', success: false, error: error.message });
            }
            
            console.log('🔧 Resultados de debug:', tests);
            
            return tests;
        } catch (error) {
            console.error('❌ Error en debugConnection:', error);
            throw error;
        }
    }
}