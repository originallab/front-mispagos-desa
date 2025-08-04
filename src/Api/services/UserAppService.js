import api from '../axios.js';
import { handleError } from '../utils/errorHandler';

/**
 * Servicio mejorado para la tabla user_app
 * Maneja las relaciones entre usuarios y aplicaciones con validación y logs detallados
 */
export const UserAppService = {

  /**
   * Obtener todos los registros de user_app
   * @returns {Promise<Object>} - Respuesta con datos formateados
   */
  async getAll() {
    try {
      console.log('🔄 Obteniendo todas las relaciones user-app...');
      
      let response;
      let records = [];
      
      // Intentar diferentes endpoints hasta encontrar uno que funcione
      const endpoints = ['/user_app/all', '/user_app'];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`📡 Probando endpoint: ${endpoint}`);
          response = await api.get(endpoint);
          
          if (response.data) {
            records = response.data.records || response.data || [];
            console.log(`✅ Endpoint ${endpoint} funcionó, ${records.length} registros obtenidos`);
            break;
          }
        } catch (endpointError) {
          console.log(`⚠️ Endpoint ${endpoint} falló:`, endpointError.response?.status);
          continue;
        }
      }
      
      // Si ningún endpoint funcionó, devolver array vacío en lugar de fallar
      if (!response || !response.data) {
        console.log('⚠️ Ningún endpoint de user_app disponible, devolviendo array vacío');
        return {
          success: true,
          data: [],
          count: 0,
          message: 'No hay relaciones user-app disponibles (tabla posiblemente vacía)'
        };
      }

      console.log(`✅ ${records.length} relaciones user-app obtenidas`);
      
      return {
        success: true,
        data: records,
        count: records.length,
        message: `${records.length} relaciones obtenidas exitosamente`
      };
    } catch (error) {
      console.error('❌ Error al obtener relaciones user-app:', error);
      
      // En lugar de fallar completamente, devolver array vacío
      console.log('🔄 Devolviendo array vacío debido a error en user_app');
      return {
        success: true,
        data: [],
        count: 0,
        message: 'No se pudieron cargar las relaciones user-app'
      };
    }
  },

  /**
   * Obtener un registro por ID
   * @param {number} userAppId - ID de la relación user_app
   * @returns {Promise<Object>} - Datos de la relación
   */
  async getById(userAppId) {
    try {
      if (!userAppId || userAppId <= 0) {
        throw new Error('ID de relación user-app inválido');
      }

      console.log(`🔍 Obteniendo relación user-app con ID: ${userAppId}`);

      const response = await api.get(`/user_app/${userAppId}`);
      
      if (!response.data || !response.data.record) {
        throw new Error('Relación user-app no encontrada');
      }

      console.log(`✅ Relación user-app ${userAppId} obtenida`);

      return {
        success: true,
        data: response.data.record,
        message: 'Relación obtenida exitosamente'
      };
    } catch (error) {
      console.error(`❌ Error al obtener relación user-app ${userAppId}:`, error);
      handleError(error);
      throw new Error(`Error al obtener relación con ID ${userAppId}: ${error.message}`);
    }
  },

  /**
   * Crear un nuevo registro
   * @param {Object} data - Datos de la relación
   * @param {number} data.user_id - ID del usuario
   * @param {number} data.app_id - ID de la aplicación
   * @returns {Promise<Object>} - Relación creada
   */
  async create(data) {
    try {
      console.log('➕ Creando nueva relación user-app:', data);

      if (!data || !data.user_id || !data.app_id) {
        throw new Error('user_id y app_id son requeridos');
      }

      // Validar tipos de datos
      const cleanData = {
        user_id: parseInt(data.user_id),
        app_id: parseInt(data.app_id)
      };

      if (isNaN(cleanData.user_id) || isNaN(cleanData.app_id)) {
        throw new Error('user_id y app_id deben ser números válidos');
      }

      // Verificar que no existe ya esta relación
      const existingRelations = await this.getAll();
      const duplicate = existingRelations.data.find(relation => 
        relation.user_id === cleanData.user_id && relation.app_id === cleanData.app_id
      );

      if (duplicate) {
        throw new Error('Ya existe una relación entre este usuario y aplicación');
      }

      const response = await api.post('/user_app', { data: cleanData });
      
      console.log(`✅ Relación user-app creada: Usuario ${cleanData.user_id} - App ${cleanData.app_id}`);

      return {
        success: true,
        data: response.data,
        message: 'Relación user-app creada exitosamente'
      };
    } catch (error) {
      console.error('❌ Error al crear relación user-app:', error);
      handleError(error);
      throw new Error(`Error al crear relación: ${error.message}`);
    }
  },

  /**
   * Actualizar un registro existente
   * @param {number} userAppId - ID de la relación
   * @param {Object} data - Nuevos datos
   * @returns {Promise<Object>} - Resultado de la actualización
   */
  async update(userAppId, data) {
    try {
      console.log(`📝 Actualizando relación user-app ${userAppId}:`, data);

      if (!userAppId || userAppId <= 0) {
        throw new Error('ID de relación user-app inválido');
      }

      if (!data || (!data.user_id && !data.app_id)) {
        throw new Error('Datos de actualización inválidos');
      }

      // Verificar que existe
      await this.getById(userAppId);

      // Limpiar datos
      const cleanData = {};
      if (data.user_id) cleanData.user_id = parseInt(data.user_id);
      if (data.app_id) cleanData.app_id = parseInt(data.app_id);

      const response = await api.put(`/user_app/${userAppId}`, { data: cleanData });
      
      console.log(`✅ Relación user-app ${userAppId} actualizada`);

      return {
        success: true,
        data: response.data,
        message: 'Relación actualizada exitosamente'
      };
    } catch (error) {
      console.error(`❌ Error al actualizar relación user-app ${userAppId}:`, error);
      handleError(error);
      throw new Error(`Error al actualizar relación: ${error.message}`);
    }
  },

  /**
   * Eliminar un registro por ID
   * @param {number} userAppId - ID de la relación a eliminar
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async remove(userAppId) {
    try {
      console.log(`🗑️ Eliminando relación user-app ${userAppId}...`);

      if (!userAppId || userAppId <= 0) {
        throw new Error('ID de relación user-app inválido');
      }

      // Verificar que existe antes de eliminar
      const relation = await this.getById(userAppId);
      
      const response = await api.delete(`/user_app/${userAppId}`);
      
      console.log(`✅ Relación user-app ${userAppId} eliminada`);

      return {
        success: true,
        data: response.data,
        message: 'Relación eliminada exitosamente'
      };
    } catch (error) {
      console.error(`❌ Error al eliminar relación user-app ${userAppId}:`, error);
      handleError(error);
      throw new Error(`Error al eliminar relación: ${error.message}`);
    }
  },

  /**
   * Contar cuántos registros hay
   * @returns {Promise<Object>} - Conteo total
   */
  async count() {
    try {
      console.log('🔢 Contando relaciones user-app...');

      // Primero intentar endpoint específico de conteo
      try {
        const response = await api.get('/user_app/count');
        const count = response.data.count || response.data.total || 0;
        
        console.log(`✅ Total de relaciones user-app: ${count}`);
        
        return {
          success: true,
          count: count,
          message: `${count} relaciones encontradas`
        };
      } catch (countError) {
        // Si no existe endpoint de conteo, usar getAll y contar
        console.log('⚠️ Endpoint de conteo no disponible, usando getAll...');
        const allData = await this.getAll();
        const count = allData.data.length;
        
        console.log(`✅ Total de relaciones user-app (via getAll): ${count}`);
        
        return {
          success: true,
          count: count,
          message: `${count} relaciones encontradas`
        };
      }
    } catch (error) {
      console.error('❌ Error al contar relaciones user-app:', error);
      handleError(error);
      throw new Error(`Error al contar relaciones: ${error.message}`);
    }
  },

  /**
   * Obtener relaciones por ID de usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} - Aplicaciones del usuario
   */
  async getByUserId(userId) {
    try {
      console.log(`🔍 Obteniendo aplicaciones del usuario ${userId}...`);

      if (!userId || userId <= 0) {
        throw new Error('ID de usuario inválido');
      }

      const allRelations = await this.getAll();
      const userRelations = allRelations.data.filter(relation => relation.user_id === userId);

      console.log(`✅ ${userRelations.length} aplicaciones encontradas para usuario ${userId}`);

      return {
        success: true,
        data: userRelations,
        count: userRelations.length,
        message: `${userRelations.length} aplicaciones encontradas`
      };
    } catch (error) {
      console.error(`❌ Error al obtener aplicaciones del usuario ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener relaciones por ID de aplicación
   * @param {number} appId - ID de la aplicación
   * @returns {Promise<Object>} - Usuarios de la aplicación
   */
  async getByAppId(appId) {
    try {
      console.log(`🔍 Obteniendo usuarios de la aplicación ${appId}...`);

      if (!appId || appId <= 0) {
        throw new Error('ID de aplicación inválido');
      }

      const allRelations = await this.getAll();
      const appRelations = allRelations.data.filter(relation => relation.app_id === appId);

      console.log(`✅ ${appRelations.length} usuarios encontrados para aplicación ${appId}`);

      return {
        success: true,
        data: appRelations,
        count: appRelations.length,
        message: `${appRelations.length} usuarios encontrados`
      };
    } catch (error) {
      console.error(`❌ Error al obtener usuarios de la aplicación ${appId}:`, error);
      throw error;
    }
  },

  /**
   * Contar relaciones por ID de aplicación
   * @param {number} appId - ID de la aplicación
   * @returns {Promise<Object>} - Conteo de usuarios
   */
  async countByAppId(appId) {
    try {
      const result = await this.getByAppId(appId);
      return {
        success: true,
        data: {
          total: result.count,
          app_id: appId
        },
        message: `${result.count} usuarios en aplicación ${appId}`
      };
    } catch (error) {
      console.error(`❌ Error al contar usuarios de la aplicación ${appId}:`, error);
      throw error;
    }
  },

  /**
   * Verificar si existe una relación específica
   * @param {number} userId - ID del usuario
   * @param {number} appId - ID de la aplicación
   * @returns {Promise<boolean>} - true si existe, false si no
   */
  async relationExists(userId, appId) {
    try {
      const allRelations = await this.getAll();
      const exists = allRelations.data.some(relation => 
        relation.user_id === userId && relation.app_id === appId
      );
      
      console.log(`🔍 Relación usuario ${userId} - app ${appId}: ${exists ? 'Existe' : 'No existe'}`);
      
      return exists;
    } catch (error) {
      console.error('Error al verificar relación:', error);
      return false;
    }
  },

  /**
   * Eliminar todas las relaciones de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async removeUserRelations(userId) {
    try {
      console.log(`🗑️ Eliminando todas las relaciones del usuario ${userId}...`);

      const userRelations = await this.getByUserId(userId);
      const deletePromises = userRelations.data.map(relation => 
        this.remove(relation.user_app_id)
      );

      await Promise.all(deletePromises);

      console.log(`✅ ${userRelations.count} relaciones del usuario ${userId} eliminadas`);

      return {
        success: true,
        deletedCount: userRelations.count,
        message: `${userRelations.count} relaciones eliminadas`
      };
    } catch (error) {
      console.error(`❌ Error al eliminar relaciones del usuario ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar todas las relaciones de una aplicación
   * @param {number} appId - ID de la aplicación
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async removeAppRelations(appId) {
    try {
      console.log(`🗑️ Eliminando todas las relaciones de la aplicación ${appId}...`);

      const appRelations = await this.getByAppId(appId);
      const deletePromises = appRelations.data.map(relation => 
        this.remove(relation.user_app_id)
      );

      await Promise.all(deletePromises);

      console.log(`✅ ${appRelations.count} relaciones de la aplicación ${appId} eliminadas`);

      return {
        success: true,
        deletedCount: appRelations.count,
        message: `${appRelations.count} relaciones eliminadas`
      };
    } catch (error) {
      console.error(`❌ Error al eliminar relaciones de la aplicación ${appId}:`, error);
      throw error;
    }
  }
};