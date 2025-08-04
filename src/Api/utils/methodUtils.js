import { Methods } from '../services/method';

/**
 * Utilidades específicas para el manejo de métodos de pago
 * Utiliza las conexiones base de la API con API Key configurada automáticamente
 */
export class MethodUtils {
    
    /**
     * Obtiene todos los métodos de pago
     * @returns {Promise<Array>} - Lista de todos los métodos de pago
     */
    static async getAllMethods() {
        try {
            const result = await Methods.getAllRecords('method', null);
            return result.records;
        } catch (error) {
            console.error('Error al obtener métodos de pago:', error);
            throw new Error('No se pudieron obtener los métodos de pago');
        }
    }

    /**
     * Obtiene un método de pago por su ID
     * @param {number} methodId - ID del método de pago
     * @returns {Promise<Object>} - Información del método de pago
     */
    static async getMethodById(methodId) {
        try {
            const result = await Methods.getRecordById('method', methodId);
            return result.record;
        } catch (error) {
            console.error(`Error al obtener método de pago con ID ${methodId}:`, error);
            throw new Error(`No se pudo obtener el método de pago con ID ${methodId}`);
        }
    }

    /**
     * Obtiene métodos de pago por tipo
     * @param {string} type - Tipo de método de pago
     * @returns {Promise<Array>} - Lista de métodos de ese tipo
     */
    static async getMethodsByType(type) {
        try {
            const result = await Methods.getAllRecords('method', { type });
            return result.records;
        } catch (error) {
            console.error(`Error al obtener métodos de tipo ${type}:`, error);
            throw new Error(`No se pudieron obtener los métodos de tipo ${type}`);
        }
    }

    /**
     * Obtiene métodos de pago por estado
     * @param {string} status - Estado del método (activo, inactivo, etc.)
     * @returns {Promise<Array>} - Lista de métodos con ese estado
     */
    static async getMethodsByStatus(status) {
        try {
            const result = await Methods.getAllRecords('method', { status });
            return result.records;
        } catch (error) {
            console.error(`Error al obtener métodos con estado ${status}:`, error);
            throw new Error(`No se pudieron obtener los métodos con estado ${status}`);
        }
    }

    /**
     * Crea un nuevo método de pago
     * @param {Object} methodData - Datos del método de pago
     * @param {string} methodData.name - Nombre del método
     * @param {string} methodData.type - Tipo del método
     * @param {string} methodData.status - Estado del método
     * @param {number} methodData.commission - Comisión del método
     * @returns {Promise<Object>} - Método creado
     */
    static async createMethod(methodData) {
        try {
            const result = await Methods.createRecord('method', methodData);
            return result;
        } catch (error) {
            console.error('Error al crear método de pago:', error);
            throw error;
        }
    }

    /**
     * Actualiza completamente un método de pago
     * @param {number} methodId - ID del método a actualizar
     * @param {Object} methodData - Nuevos datos del método
     * @returns {Promise<Object>} - Resultado de la actualización
     */
    static async updateMethod(methodId, methodData) {
        try {
            // Verificar que el método existe
            await this.getMethodById(methodId);
            
            const result = await Methods.updateRecord('method', methodId, methodData);
            return result;
        } catch (error) {
            console.error(`Error al actualizar método ${methodId}:`, error);
            throw error;
        }
    }

    /**
     * Actualiza parcialmente un método de pago
     * @param {number} methodId - ID del método a actualizar
     * @param {Object} partialData - Datos parciales del método
     * @returns {Promise<Object>} - Resultado de la actualización
     */
    static async patchMethod(methodId, partialData) {
        try {
            // Verificar que el método existe
            await this.getMethodById(methodId);
            
            const result = await Methods.patchRecord('method', methodId, partialData);
            return result;
        } catch (error) {
            console.error(`Error al actualizar parcialmente método ${methodId}:`, error);
            throw error;
        }
    }

    /**
     * Elimina un método de pago
     * @param {number} methodId - ID del método a eliminar
     * @returns {Promise<Object>} - Resultado de la eliminación
     */
    static async deleteMethod(methodId) {
        try {
            // Verificar que el método existe antes de eliminarlo
            await this.getMethodById(methodId);
            
            const result = await Methods.deleteRecord('method', methodId);
            return result;
        } catch (error) {
            console.error(`Error al eliminar método ${methodId}:`, error);
            throw error;
        }
    }

    /**
     * Cambia el estado de un método de pago
     * @param {number} methodId - ID del método
     * @param {string} newStatus - Nuevo estado
     * @returns {Promise<Object>} - Resultado de la actualización
     */
    static async changeMethodStatus(methodId, newStatus) {
        try {
            const result = await this.patchMethod(methodId, { status: newStatus });
            return result;
        } catch (error) {
            console.error(`Error al cambiar estado del método ${methodId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene métodos activos solamente
     * @returns {Promise<Array>} - Lista de métodos activos
     */
    static async getActiveMethods() {
        try {
            const result = await this.getMethodsByStatus('activo');
            return result;
        } catch (error) {
            console.error('Error al obtener métodos activos:', error);
            throw new Error('No se pudieron obtener los métodos activos');
        }
    }

    /**
     * Busca métodos por nombre
     * @param {string} name - Nombre a buscar
     * @returns {Promise<Array>} - Lista de métodos que coinciden
     */
    static async searchMethodsByName(name) {
        try {
            const result = await Methods.getAllRecords('method', { name });
            return result.records;
        } catch (error) {
            console.error(`Error al buscar métodos por nombre ${name}:`, error);
            throw new Error(`No se pudieron buscar métodos con nombre ${name}`);
        }
    }

    /**
     * Obtiene estadísticas básicas de métodos
     * @returns {Promise<Object>} - Estadísticas de métodos
     */
    static async getMethodStatistics() {
        try {
            const allMethods = await this.getAllMethods();
            
            const stats = {
                total: allMethods.length,
                active: allMethods.filter(m => m.status === 'activo').length,
                inactive: allMethods.filter(m => m.status === 'inactivo').length,
                pending: allMethods.filter(m => m.status === 'en revision' || m.status === 'pendiente').length,
                byType: {}
            };

            // Agrupar por tipo
            allMethods.forEach(method => {
                const type = method.type || 'Sin tipo';
                stats.byType[type] = (stats.byType[type] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('Error al obtener estadísticas de métodos:', error);
            throw new Error('No se pudieron obtener las estadísticas');
        }
    }

    /**
     * Obtiene métodos con comisión menor a un valor específico
     * @param {number} maxCommission - Comisión máxima
     * @returns {Promise<Array>} - Lista de métodos con comisión menor
     */
    static async getMethodsByMaxCommission(maxCommission) {
        try {
            const allMethods = await this.getAllMethods();
            return allMethods.filter(method => 
                parseFloat(method.commission || 0) <= maxCommission
            );
        } catch (error) {
            console.error(`Error al filtrar métodos por comisión máxima ${maxCommission}:`, error);
            throw new Error('No se pudieron filtrar los métodos por comisión');
        }
    }

    /**
     * Verifica si un método existe por nombre
     * @param {string} name - Nombre del método
     * @returns {Promise<boolean>} - true si existe, false si no
     */
    static async methodExists(name) {
        try {
            const methods = await this.searchMethodsByName(name);
            return methods.length > 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * Busca métodos por múltiples criterios
     * @param {Object} criteria - Criterios de búsqueda
     * @returns {Promise<Array>} - Lista de métodos que cumplen los criterios
     */
    static async searchMethods(criteria) {
        try {
            const result = await Methods.getAllRecords('method', criteria);
            return result.records;
        } catch (error) {
            console.error('Error al buscar métodos:', error);
            throw new Error('No se pudieron buscar los métodos');
        }
    }
}