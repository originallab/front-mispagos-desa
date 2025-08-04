import { Methods } from '../services/method';

/**
 * Utilidades específicas para el manejo de relaciones método-aplicación
 * Utiliza las conexiones base de la API con API Key configurada automáticamente
 */
export class PayMethodAppUtils {
    
    /**
     * Obtiene todas las relaciones método-aplicación
     * @returns {Promise<Array>} - Lista de todas las relaciones
     */
    static async getAllRelations() {
        try {
            const result = await Methods.getAllRecords('paymethod_app', null);
            return result.records;
        } catch (error) {
            console.error('Error al obtener relaciones método-aplicación:', error);
            throw new Error('No se pudieron obtener las relaciones método-aplicación');
        }
    }

    /**
     * Obtiene una relación por su ID
     * @param {number} relationId - ID de la relación
     * @returns {Promise<Object>} - Información de la relación
     */
    static async getRelationById(relationId) {
        try {
            const result = await Methods.getRecordById('paymethod_app', relationId);
            return result.record;
        } catch (error) {
            console.error(`Error al obtener relación con ID ${relationId}:`, error);
            throw new Error(`No se pudo obtener la relación con ID ${relationId}`);
        }
    }

    /**
     * Obtiene todas las aplicaciones asignadas a un método de pago específico
     * @param {number} methodId - ID del método de pago
     * @returns {Promise<Array>} - Lista de relaciones para ese método
     */
    static async getAppsByMethodId(methodId) {
        try {
            const result = await Methods.getAllRecords('paymethod_app', { method_id: methodId.toString() });
            return result.records;
        } catch (error) {
            console.error(`Error al obtener aplicaciones del método ${methodId}:`, error);
            throw new Error(`No se pudieron obtener las aplicaciones del método ${methodId}`);
        }
    }

    /**
     * Obtiene todos los métodos de pago asignados a una aplicación específica
     * @param {number} appId - ID de la aplicación
     * @returns {Promise<Array>} - Lista de relaciones para esa aplicación
     */
    static async getMethodsByAppId(appId) {
        try {
            const result = await Methods.getAllRecords('paymethod_app', { app_id: appId.toString() });
            return result.records;
        } catch (error) {
            console.error(`Error al obtener métodos de la aplicación ${appId}:`, error);
            throw new Error(`No se pudieron obtener los métodos de la aplicación ${appId}`);
        }
    }

    /**
     * Crea una nueva relación método-aplicación
     * @param {number} methodId - ID del método de pago
     * @param {number} appId - ID de la aplicación
     * @returns {Promise<Object>} - Relación creada
     */
    static async createRelation(methodId, appId) {
        try {
            // Verificar que la relación no exista ya
            const existingRelation = await this.relationExists(methodId, appId);
            if (existingRelation) {
                throw new Error('Ya existe una relación entre este método y aplicación');
            }

            const relationData = {
                method_id: methodId,
                app_id: appId
            };

            const result = await Methods.createRecord('paymethod_app', relationData);
            return result;
        } catch (error) {
            console.error('Error al crear relación método-aplicación:', error);
            throw error;
        }
    }

    /**
     * Elimina una relación método-aplicación
     * @param {number} relationId - ID de la relación a eliminar
     * @returns {Promise<Object>} - Resultado de la eliminación
     */
    static async deleteRelation(relationId) {
        try {
            // Verificar que la relación existe antes de eliminarla
            await this.getRelationById(relationId);
            
            const result = await Methods.deleteRecord('paymethod_app', relationId);
            return result;
        } catch (error) {
            console.error(`Error al eliminar relación ${relationId}:`, error);
            throw error;
        }
    }

    /**
     * Elimina una relación específica por method_id y app_id
     * @param {number} methodId - ID del método de pago
     * @param {number} appId - ID de la aplicación
     * @returns {Promise<Object>} - Resultado de la eliminación
     */
    static async deleteRelationByIds(methodId, appId) {
        try {
            const relations = await this.getAllRelations();
            const relation = relations.find(r => 
                r.method_id === methodId && r.app_id === appId
            );

            if (!relation) {
                throw new Error('No se encontró la relación especificada');
            }

            return await this.deleteRelation(relation.paymethod_app_id);
        } catch (error) {
            console.error(`Error al eliminar relación método ${methodId} - app ${appId}:`, error);
            throw error;
        }
    }

    /**
     * Verifica si existe una relación entre un método y una aplicación
     * @param {number} methodId - ID del método de pago
     * @param {number} appId - ID de la aplicación
     * @returns {Promise<boolean>} - true si existe, false si no
     */
    static async relationExists(methodId, appId) {
        try {
            const relations = await this.getAllRelations();
            return relations.some(relation => 
                relation.method_id === methodId && relation.app_id === appId
            );
        } catch (error) {
            console.error('Error al verificar existencia de relación:', error);
            return false;
        }
    }

    /**
     * Asigna múltiples aplicaciones a un método de pago específico
     * @param {number} methodId - ID del método de pago
     * @param {Array<number>} appIds - Array de IDs de aplicaciones
     * @returns {Promise<Array>} - Lista de relaciones creadas
     */
    static async assignAppsToMethod(methodId, appIds) {
        try {
            // Primero, eliminar todas las relaciones existentes para este método
            await this.removeAllAppsFromMethod(methodId);

            // Crear nuevas relaciones
            const createdRelations = [];
            for (const appId of appIds) {
                try {
                    const relation = await this.createRelation(methodId, appId);
                    createdRelations.push(relation);
                } catch (error) {
                    console.warn(`No se pudo crear relación para app ${appId}:`, error.message);
                }
            }

            return createdRelations;
        } catch (error) {
            console.error(`Error al asignar aplicaciones al método ${methodId}:`, error);
            throw error;
        }
    }

    /**
     * Asigna múltiples métodos de pago a una aplicación específica
     * @param {number} appId - ID de la aplicación
     * @param {Array<number>} methodIds - Array de IDs de métodos de pago
     * @returns {Promise<Array>} - Lista de relaciones creadas
     */
    static async assignMethodsToApp(appId, methodIds) {
        try {
            // Primero, eliminar todas las relaciones existentes para esta aplicación
            await this.removeAllMethodsFromApp(appId);

            // Crear nuevas relaciones
            const createdRelations = [];
            for (const methodId of methodIds) {
                try {
                    const relation = await this.createRelation(methodId, appId);
                    createdRelations.push(relation);
                } catch (error) {
                    console.warn(`No se pudo crear relación para método ${methodId}:`, error.message);
                }
            }

            return createdRelations;
        } catch (error) {
            console.error(`Error al asignar métodos a la aplicación ${appId}:`, error);
            throw error;
        }
    }

    /**
     * Remueve todas las aplicaciones de un método de pago específico
     * @param {number} methodId - ID del método de pago
     * @returns {Promise<void>}
     */
    static async removeAllAppsFromMethod(methodId) {
        try {
            const relations = await this.getAppsByMethodId(methodId);
            
            const deletePromises = relations.map(relation => 
                this.deleteRelation(relation.paymethod_app_id)
            );
            
            await Promise.all(deletePromises);
        } catch (error) {
            console.error(`Error al remover aplicaciones del método ${methodId}:`, error);
            throw error;
        }
    }

    /**
     * Remueve todos los métodos de pago de una aplicación específica
     * @param {number} appId - ID de la aplicación
     * @returns {Promise<void>}
     */
    static async removeAllMethodsFromApp(appId) {
        try {
            const relations = await this.getMethodsByAppId(appId);
            
            const deletePromises = relations.map(relation => 
                this.deleteRelation(relation.paymethod_app_id)
            );
            
            await Promise.all(deletePromises);
        } catch (error) {
            console.error(`Error al remover métodos de la aplicación ${appId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene información detallada de aplicaciones asignadas a un método
     * Incluye información completa de las aplicaciones, no solo las relaciones
     * @param {number} methodId - ID del método de pago
     * @returns {Promise<Array>} - Lista de aplicaciones con información completa
     */
    static async getDetailedAppsByMethodId(methodId) {
        try {
            const relations = await this.getAppsByMethodId(methodId);
            
            // Importar AppUtils dinámicamente para evitar dependencias circulares
            const { AppUtils } = await import('./appUtils');
            
            const appsPromises = relations.map(relation => 
                AppUtils.getAppById(relation.app_id)
            );
            
            const apps = await Promise.all(appsPromises);
            
            // Combinar información de la relación con la información de la aplicación
            return apps.map((app, index) => ({
                ...app,
                relation_id: relations[index].paymethod_app_id,
                assigned_date: relations[index].created_at || null
            }));
        } catch (error) {
            console.error(`Error al obtener aplicaciones detalladas del método ${methodId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene información detallada de métodos asignados a una aplicación
     * Incluye información completa de los métodos, no solo las relaciones
     * @param {number} appId - ID de la aplicación
     * @returns {Promise<Array>} - Lista de métodos con información completa
     */
    static async getDetailedMethodsByAppId(appId) {
        try {
            const relations = await this.getMethodsByAppId(appId);
            
            // Importar MethodUtils dinámicamente para evitar dependencias circulares
            const { MethodUtils } = await import('./methodUtils');
            
            const methodsPromises = relations.map(relation => 
                MethodUtils.getMethodById(relation.method_id)
            );
            
            const methods = await Promise.all(methodsPromises);
            
            // Combinar información de la relación con la información del método
            return methods.map((method, index) => ({
                ...method,
                relation_id: relations[index].paymethod_app_id,
                assigned_date: relations[index].created_at || null
            }));
        } catch (error) {
            console.error(`Error al obtener métodos detallados de la aplicación ${appId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas de las relaciones método-aplicación
     * @returns {Promise<Object>} - Estadísticas de las relaciones
     */
    static async getRelationStatistics() {
        try {
            const relations = await this.getAllRelations();
            
            const stats = {
                totalRelations: relations.length,
                uniqueMethods: new Set(relations.map(r => r.method_id)).size,
                uniqueApps: new Set(relations.map(r => r.app_id)).size,
                methodsWithApps: {},
                appsWithMethods: {}
            };

            // Contar aplicaciones por método
            relations.forEach(relation => {
                stats.methodsWithApps[relation.method_id] = 
                    (stats.methodsWithApps[relation.method_id] || 0) + 1;
            });

            // Contar métodos por aplicación
            relations.forEach(relation => {
                stats.appsWithMethods[relation.app_id] = 
                    (stats.appsWithMethods[relation.app_id] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('Error al obtener estadísticas de relaciones:', error);
            throw new Error('No se pudieron obtener las estadísticas');
        }
    }

    /**
     * Busca relaciones por múltiples criterios
     * @param {Object} criteria - Criterios de búsqueda
     * @returns {Promise<Array>} - Lista de relaciones que cumplen los criterios
     */
    static async searchRelations(criteria) {
        try {
            const result = await Methods.getAllRecords('paymethod_app', criteria);
            return result.records;
        } catch (error) {
            console.error('Error al buscar relaciones:', error);
            throw new Error('No se pudieron buscar las relaciones');
        }
    }
}