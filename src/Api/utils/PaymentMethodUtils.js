import { PaymentMethodCompleteService } from '../services/PaymentMethodCompleteService';
import { MethodService } from '../services/method';
import { AppService } from '../services/appService';

/**
 * Utilidades completas para métodos de pago con relaciones
 * Utiliza el servicio completo que combina method, app y paymethod_app
 */
export class PaymentMethodCompleteUtils {
    
    /**
     * Obtiene todos los métodos de pago formateados para la tabla principal
     * @returns {Promise<Array>} - Lista de métodos con aplicaciones para la tabla
     */
    static async getMethodsForTable() {
        try {
            console.log('🔄 Obteniendo métodos para tabla...');
            
            const result = await PaymentMethodCompleteService.getMethodsWithApps();
            
            console.log(`✅ ${result.count} métodos obtenidos para tabla`);
            console.log(`📊 Relaciones reales: ${result.hasRealRelations ? 'SÍ' : 'NO'}`);
            
            return result.data;
        } catch (error) {
            console.error('❌ Error al obtener métodos para tabla:', error);
            throw new Error(`No se pudieron obtener los métodos de pago: ${error.message}`);
        }
    }

    /**
     * Obtiene un método específico con sus aplicaciones
     * @param {number} methodId - ID del método
     * @returns {Promise<Object>} - Método con aplicaciones
     */
    static async getMethodWithAppsById(methodId) {
        try {
            console.log(`🔍 Obteniendo método ${methodId} con aplicaciones...`);
            
            const allMethods = await this.getMethodsForTable();
            const method = allMethods.find(m => m.id === methodId);
            
            if (!method) {
                throw new Error(`Método con ID ${methodId} no encontrado`);
            }
            
            console.log(`✅ Método ${methodId} encontrado con ${method.applicationCount} aplicaciones`);
            
            return method;
        } catch (error) {
            console.error(`❌ Error al obtener método ${methodId}:`, error);
            throw error;
        }
    }

    /**
     * Crea un nuevo método de pago
     * @param {Object} methodData - Datos del método
     * @returns {Promise<Object>} - Método creado
     */
    static async createMethod(methodData) {
        try {
            console.log('➕ Creando nuevo método:', methodData.name);
            
            const result = await MethodService.create(methodData);
            
            console.log(`✅ Método "${result.data.name || methodData.name}" creado con ID: ${result.data.id}`);
            
            return result.data;
        } catch (error) {
            console.error('❌ Error al crear método:', error);
            throw error;
        }
    }

    /**
     * Actualiza un método de pago
     * @param {number} methodId - ID del método
     * @param {Object} methodData - Nuevos datos
     * @returns {Promise<Object>} - Método actualizado
     */
    static async updateMethod(methodId, methodData) {
        try {
            console.log(`📝 Actualizando método ${methodId}:`, methodData);
            
            const result = await MethodService.update(methodId, methodData);
            
            console.log(`✅ Método ${methodId} actualizado exitosamente`);
            
            return result.data;
        } catch (error) {
            console.error(`❌ Error al actualizar método ${methodId}:`, error);
            throw error;
        }
    }

    /**
     * Actualiza parcialmente un método de pago
     * @param {number} methodId - ID del método
     * @param {Object} partialData - Datos parciales
     * @returns {Promise<Object>} - Método actualizado
     */
    static async patchMethod(methodId, partialData) {
        try {
            console.log(`🔧 Actualizando parcialmente método ${methodId}:`, partialData);
            
            const result = await MethodService.patch(methodId, partialData);
            
            console.log(`✅ Método ${methodId} actualizado parcialmente`);
            
            return result.data;
        } catch (error) {
            console.error(`❌ Error al actualizar parcialmente método ${methodId}:`, error);
            throw error;
        }
    }

    /**
     * Elimina un método de pago y todas sus relaciones
     * @param {number} methodId - ID del método a eliminar
     * @returns {Promise<Object>} - Resultado de la eliminación
     */
    static async deleteMethod(methodId) {
        try {
            console.log(`🗑️ Eliminando método ${methodId}...`);
            
            // Primero eliminar todas las relaciones
            await PaymentMethodCompleteService.removeAllAppsFromMethod(methodId);
            console.log(`✅ Relaciones del método ${methodId} eliminadas`);
            
            // Luego eliminar el método
            const result = await MethodService.delete(methodId);
            
            console.log(`✅ Método ${methodId} eliminado completamente`);
            
            return result;
        } catch (error) {
            console.error(`❌ Error al eliminar método ${methodId}:`, error);
            throw error;
        }
    }

    /**
     * Cambia el estado de un método
     * @param {number} methodId - ID del método
     * @param {string} newStatus - Nuevo estado
     * @returns {Promise<Object>} - Resultado del cambio
     */
    static async changeMethodStatus(methodId, newStatus) {
        try {
            console.log(`🔄 Cambiando estado del método ${methodId} a: ${newStatus}`);
            
            const result = await MethodService.changeStatus(methodId, newStatus);
            
            console.log(`✅ Estado del método ${methodId} cambiado a: ${newStatus}`);
            
            return result;
        } catch (error) {
            console.error(`❌ Error al cambiar estado del método ${methodId}:`, error);
            throw error;
        }
    }

    /**
     * Asigna aplicaciones a un método de pago
     * @param {number} methodId - ID del método
     * @param {Array<number>} appIds - Array de IDs de aplicaciones
     * @returns {Promise<Object>} - Resultado de la asignación
     */
    static async assignAppsToMethod(methodId, appIds) {
        try {
            console.log(`🔗 Asignando ${appIds.length} aplicaciones al método ${methodId}`);
            
            const result = await PaymentMethodCompleteService.assignAppsToMethod(methodId, appIds);
            
            console.log(`✅ ${result.data.assignedApps} aplicaciones asignadas al método ${methodId}`);
            
            return result;
        } catch (error) {
            console.error(`❌ Error al asignar aplicaciones al método ${methodId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene aplicaciones disponibles para asignar
     * @returns {Promise<Array>} - Lista de aplicaciones activas
     */
    static async getAvailableApps() {
        try {
            console.log('📱 Obteniendo aplicaciones disponibles...');
            
            const result = await PaymentMethodCompleteService.getAvailableApps();
            
            console.log(`✅ ${result.count} aplicaciones disponibles obtenidas`);
            
            return result.data;
        } catch (error) {
            console.error('❌ Error al obtener aplicaciones disponibles:', error);
            throw error;
        }
    }

    /**
     * Obtiene métodos activos para mostrar en selectores
     * @returns {Promise<Array>} - Lista de métodos activos
     */
    static async getActiveMethodsForSelect() {
        try {
            console.log('🔍 Obteniendo métodos activos para selector...');
            
            const result = await MethodService.getActive();
            
            const selectOptions = result.data.map(method => ({
                value: method.id || method.method_id,
                label: method.name || method.method_name,
                status: method.status,
                commission: method.commission
            }));
            
            console.log(`✅ ${selectOptions.length} métodos activos para selector`);
            
            return selectOptions;
        } catch (error) {
            console.error('❌ Error al obtener métodos activos:', error);
            throw error;
        }
    }

    /**
     * Busca métodos por nombre
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Promise<Array>} - Métodos encontrados
     */
    static async searchMethods(searchTerm) {
        try {
            console.log(`🔍 Buscando métodos con término: "${searchTerm}"`);
            
            if (!searchTerm || searchTerm.trim().length === 0) {
                return await this.getMethodsForTable();
            }
            
            const allMethods = await this.getMethodsForTable();
            const searchTermLower = searchTerm.toLowerCase();
            
            const filteredMethods = allMethods.filter(method => 
                method.name.toLowerCase().includes(searchTermLower) ||
                method.scope.toLowerCase().includes(searchTermLower) ||
                method.applicationNames.some(appName => 
                    appName.toLowerCase().includes(searchTermLower)
                )
            );
            
            console.log(`✅ ${filteredMethods.length} métodos encontrados`);
            
            return filteredMethods;
        } catch (error) {
            console.error(`❌ Error al buscar métodos:`, error);
            throw error;
        }
    }

    /**
     * Obtiene métodos filtrados por estado
     * @param {string} status - Estado a filtrar
     * @returns {Promise<Array>} - Métodos filtrados
     */
    static async getMethodsByStatus(status) {
        try {
            console.log(`🔍 Obteniendo métodos con estado: ${status}`);
            
            const allMethods = await this.getMethodsForTable();
            const filteredMethods = allMethods.filter(method => 
                method.status.toLowerCase() === status.toLowerCase()
            );
            
            console.log(`✅ ${filteredMethods.length} métodos con estado ${status}`);
            
            return filteredMethods;
        } catch (error) {
            console.error(`❌ Error al obtener métodos por estado ${status}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene métodos filtrados por alcance
     * @param {string} scope - Alcance a filtrar
     * @returns {Promise<Array>} - Métodos filtrados
     */
    static async getMethodsByScope(scope) {
        try {
            console.log(`🔍 Obteniendo métodos con alcance: ${scope}`);
            
            const allMethods = await this.getMethodsForTable();
            const filteredMethods = allMethods.filter(method => 
                method.scope.toLowerCase() === scope.toLowerCase()
            );
            
            console.log(`✅ ${filteredMethods.length} métodos con alcance ${scope}`);
            
            return filteredMethods;
        } catch (error) {
            console.error(`❌ Error al obtener métodos por alcance ${scope}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas completas del sistema
     * @returns {Promise<Object>} - Estadísticas completas
     */
    static async getCompleteStatistics() {
        try {
            console.log('📊 Obteniendo estadísticas completas...');
            
            const result = await PaymentMethodCompleteService.getCompleteStatistics();
            
            console.log('✅ Estadísticas completas obtenidas');
            
            return result.data;
        } catch (error) {
            console.error('❌ Error al obtener estadísticas completas:', error);
            throw error;
        }
    }

    /**
     * Obtiene resumen rápido para dashboard
     * @returns {Promise<Object>} - Resumen del sistema
     */
    static async getDashboardSummary() {
        try {
            console.log('📈 Obteniendo resumen para dashboard...');
            
            const [methods, stats] = await Promise.all([
                this.getMethodsForTable(),
                this.getCompleteStatistics()
            ]);
            
            const summary = {
                totalMethods: methods.length,
                activeMethods: methods.filter(m => m.status === 'activo').length,
                inactiveMethods: methods.filter(m => m.status === 'inactivo').length,
                globalMethods: methods.filter(m => m.scope === 'Global').length,
                methodsWithApps: methods.filter(m => m.applicationCount > 0).length,
                methodsWithoutApps: methods.filter(m => m.applicationCount === 0).length,
                totalApplicationAssignments: methods.reduce((sum, m) => sum + m.applicationCount, 0),
                averageAppsPerMethod: methods.length > 0 ? 
                    (methods.reduce((sum, m) => sum + m.applicationCount, 0) / methods.length).toFixed(2) : 0,
                hasRealRelations: stats.system?.hasRealRelations || false,
                lastUpdated: new Date().toISOString()
            };
            
            console.log('✅ Resumen para dashboard obtenido:', {
                totalMethods: summary.totalMethods,
                activeMethods: summary.activeMethods,
                hasRealRelations: summary.hasRealRelations
            });
            
            return summary;
        } catch (error) {
            console.error('❌ Error al obtener resumen para dashboard:', error);
            throw error;
        }
    }

    /**
     * Refresca todos los datos del sistema
     * @returns {Promise<Array>} - Datos actualizados
     */
    static async refreshAllData() {
        try {
            console.log('🔄 Refrescando todos los datos del sistema...');
            
            const result = await PaymentMethodCompleteService.refreshData();
            
            console.log(`✅ Datos refrescados: ${result.count} métodos`);
            
            return result.data;
        } catch (error) {
            console.error('❌ Error al refrescar datos:', error);
            throw error;
        }
    }

    /**
     * Valida si el sistema tiene relaciones reales configuradas
     * @returns {Promise<boolean>} - Si tiene relaciones reales
     */
    static async hasRealRelations() {
        try {
            const result = await PaymentMethodCompleteService.getRelations();
            return result.success;
        } catch (error) {
            console.warn('⚠️ No se pudo verificar relaciones reales:', error.message);
            return false;
        }
    }

    /**
     * Obtiene información del estado del sistema
     * @returns {Promise<Object>} - Estado del sistema
     */
    static async getSystemStatus() {
        try {
            console.log('🔍 Verificando estado del sistema...');
            
            const [hasRelations, methods, apps] = await Promise.allSettled([
                this.hasRealRelations(),
                MethodService.getAll(),
                AppService.getAll()
            ]);
            
            const status = {
                relationsWorking: hasRelations.status === 'fulfilled' && hasRelations.value,
                methodsWorking: methods.status === 'fulfilled',
                appsWorking: apps.status === 'fulfilled',
                methodCount: methods.status === 'fulfilled' ? methods.value.count : 0,
                appCount: apps.status === 'fulfilled' ? apps.value.count : 0,
                systemHealthy: methods.status === 'fulfilled' && apps.status === 'fulfilled',
                lastChecked: new Date().toISOString()
            };
            
            console.log('✅ Estado del sistema verificado:', {
                systemHealthy: status.systemHealthy,
                relationsWorking: status.relationsWorking,
                methodCount: status.methodCount,
                appCount: status.appCount
            });
            
            return status;
        } catch (error) {
            console.error('❌ Error al verificar estado del sistema:', error);
            
            return {
                relationsWorking: false,
                methodsWorking: false,
                appsWorking: false,
                methodCount: 0,
                appCount: 0,
                systemHealthy: false,
                error: error.message,
                lastChecked: new Date().toISOString()
            };
        }
    }
}