import { Methods } from '../services/method';

/**
 * Utilidades específicas para el manejo de aplicaciones
 * Utiliza las conexiones base de la API con API Key configurada automáticamente
 */
export class AppUtils {
    
    /**
     * Obtiene todas las aplicaciones
     * @returns {Promise<Array>} - Lista de todas las aplicaciones
     */
    static async getAllApps() {
        try {
            const result = await Methods.getAllRecords('app', null);
            return result.records;
        } catch (error) {
            console.error('Error al obtener aplicaciones:', error);
            throw new Error('No se pudieron obtener las aplicaciones');
        }
    }

    /**
     * Obtiene una aplicación por su ID
     * @param {number} appId - ID de la aplicación
     * @returns {Promise<Object>} - Información de la aplicación
     */
    static async getAppById(appId) {
        try {
            const result = await Methods.getRecordById('app', appId);
            return result.record;
        } catch (error) {
            console.error(`Error al obtener aplicación con ID ${appId}:`, error);
            throw new Error(`No se pudo obtener la aplicación con ID ${appId}`);
        }
    }

    /**
     * Obtiene una aplicación por su API key
     * @param {string} apiKey - API key de la aplicación
     * @returns {Promise<Object>} - Información de la aplicación
     */
    static async getAppByApiKey(apiKey) {
        try {
            const result = await Methods.getRecordByField('app', 'api_key', apiKey);
            return result.record;
        } catch (error) {
            console.error(`Error al obtener aplicación con API key ${apiKey}:`, error);
            throw new Error(`No se pudo obtener la aplicación con API key ${apiKey}`);
        }
    }

    /**
     * Obtiene aplicaciones por nombre
     * @param {string} name - Nombre de la aplicación
     * @returns {Promise<Array>} - Lista de aplicaciones que coinciden
     */
    static async getAppByName(name) {
        try {
            const result = await Methods.getAllRecords('app', { name_app: name });
            return result.records;
        } catch (error) {
            console.error(`Error al obtener aplicaciones con nombre ${name}:`, error);
            throw new Error(`No se pudieron obtener aplicaciones con nombre ${name}`);
        }
    }

    /**
     * Obtiene aplicaciones activas
     * @returns {Promise<Array>} - Lista de aplicaciones activas
     */
    static async getActiveApps() {
        try {
            const result = await Methods.getAllRecords('app', { active: '1' });
            return result.records;
        } catch (error) {
            console.error('Error al obtener aplicaciones activas:', error);
            throw new Error('No se pudieron obtener las aplicaciones activas');
        }
    }

    /**
     * Obtiene aplicaciones inactivas
     * @returns {Promise<Array>} - Lista de aplicaciones inactivas
     */
    static async getInactiveApps() {
        try {
            const result = await Methods.getAllRecords('app', { active: '0' });
            return result.records;
        } catch (error) {
            console.error('Error al obtener aplicaciones inactivas:', error);
            throw new Error('No se pudieron obtener las aplicaciones inactivas');
        }
    }

    /**
     * Crea una nueva aplicación
     * @param {Object} appData - Datos de la aplicación
     * @param {string} appData.api_key - API key de la aplicación
     * @param {string} appData.secret_key - Secret key de la aplicación
     * @param {string} appData.name_app - Nombre de la aplicación
     * @param {boolean|string} appData.active - Estado activo (1 o 0)
     * @param {string} appData.callback_url - URL de callback
     * @param {string} appData.return_url - URL de retorno
     * @param {string} appData.error_url - URL de error
     * @returns {Promise<Object>} - Aplicación creada
     */
    static async createApp(appData) {
        try {
            // Validar que no exista una app con la misma API key
            try {
                await this.getAppByApiKey(appData.api_key);
                throw new Error('Ya existe una aplicación con esta API key');
            } catch (err) {
                // Si no encuentra la API key, está bien (puede crear la app)
                if (!err.message.includes('No se pudo obtener')) {
                    throw err;
                }
            }

            // Agregar fecha de registro si no se proporciona
            const appDataWithDate = {
                ...appData,
                registration_date: appData.registration_date || new Date().toISOString()
            };

            const result = await Methods.createRecord('app', appDataWithDate);
            return result;
        } catch (error) {
            console.error('Error al crear aplicación:', error);
            throw error;
        }
    }

    /**
     * Actualiza completamente una aplicación
     * @param {number} appId - ID de la aplicación a actualizar
     * @param {Object} appData - Nuevos datos de la aplicación
     * @returns {Promise<Object>} - Resultado de la actualización
     */
    static async updateApp(appId, appData) {
        try {
            // Verificar que la aplicación existe
            await this.getAppById(appId);
            
            // Si se está actualizando la API key, verificar que no exista otra app con esa key
            if (appData.api_key) {
                try {
                    const existingApp = await this.getAppByApiKey(appData.api_key);
                    if (existingApp.app_id !== appId) {
                        throw new Error('Ya existe otra aplicación con esta API key');
                    }
                } catch (err) {
                    // Si no encuentra la API key, está bien
                    if (!err.message.includes('No se pudo obtener')) {
                        throw err;
                    }
                }
            }

            const result = await Methods.updateRecord('app', appId, appData);
            return result;
        } catch (error) {
            console.error(`Error al actualizar aplicación ${appId}:`, error);
            throw error;
        }
    }

    /**
     * Actualiza parcialmente una aplicación
     * @param {number} appId - ID de la aplicación a actualizar
     * @param {Object} partialData - Datos parciales de la aplicación
     * @returns {Promise<Object>} - Resultado de la actualización
     */
    static async patchApp(appId, partialData) {
        try {
            // Verificar que la aplicación existe
            await this.getAppById(appId);
            
            // Si se está actualizando la API key, verificar que no exista otra app con esa key
            if (partialData.api_key) {
                try {
                    const existingApp = await this.getAppByApiKey(partialData.api_key);
                    if (existingApp.app_id !== appId) {
                        throw new Error('Ya existe otra aplicación con esta API key');
                    }
                } catch (err) {
                    // Si no encuentra la API key, está bien
                    if (!err.message.includes('No se pudo obtener')) {
                        throw err;
                    }
                }
            }

            const result = await Methods.patchRecord('app', appId, partialData);
            return result;
        } catch (error) {
            console.error(`Error al actualizar parcialmente aplicación ${appId}:`, error);
            throw error;
        }
    }

    /**
     * Elimina una aplicación
     * @param {number} appId - ID de la aplicación a eliminar
     * @returns {Promise<Object>} - Resultado de la eliminación
     */
    static async deleteApp(appId) {
        try {
            // Verificar que la aplicación existe antes de eliminarla
            await this.getAppById(appId);
            
            const result = await Methods.deleteRecord('app', appId);
            return result;
        } catch (error) {
            console.error(`Error al eliminar aplicación ${appId}:`, error);
            throw error;
        }
    }

    /**
     * Cambia el estado de una aplicación (activa/inactiva)
     * @param {number} appId - ID de la aplicación
     * @param {boolean|string} newStatus - Nuevo estado (1 para activo, 0 para inactivo)
     * @returns {Promise<Object>} - Resultado de la actualización
     */
    static async toggleAppStatus(appId, newStatus) {
        try {
            const status = newStatus ? '1' : '0';
            const result = await this.patchApp(appId, { active: status });
            return result;
        } catch (error) {
            console.error(`Error al cambiar estado de aplicación ${appId}:`, error);
            throw error;
        }
    }

    /**
     * Genera una nueva API key para una aplicación
     * @param {number} appId - ID de la aplicación
     * @returns {Promise<Object>} - Resultado con nueva API key
     */
    static async regenerateApiKey(appId) {
        try {
            // Generar nueva API key (puedes personalizar esta lógica)
            const newApiKey = 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            const result = await this.patchApp(appId, { api_key: newApiKey });
            return { ...result, new_api_key: newApiKey };
        } catch (error) {
            console.error(`Error al regenerar API key para aplicación ${appId}:`, error);
            throw error;
        }
    }

    /**
     * Genera una nueva secret key para una aplicación
     * @param {number} appId - ID de la aplicación
     * @returns {Promise<Object>} - Resultado con nueva secret key
     */
    static async regenerateSecretKey(appId) {
        try {
            // Generar nueva secret key (puedes personalizar esta lógica)
            const newSecretKey = 'sk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
            
            const result = await this.patchApp(appId, { secret_key: newSecretKey });
            return { ...result, new_secret_key: newSecretKey };
        } catch (error) {
            console.error(`Error al regenerar secret key para aplicación ${appId}:`, error);
            throw error;
        }
    }

    /**
     * Verifica si una aplicación existe por API key
     * @param {string} apiKey - API key a verificar
     * @returns {Promise<boolean>} - true si existe, false si no
     */
    static async appExistsByApiKey(apiKey) {
        try {
            await this.getAppByApiKey(apiKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Obtiene estadísticas básicas de aplicaciones
     * @returns {Promise<Object>} - Estadísticas de aplicaciones
     */
    static async getAppStatistics() {
        try {
            const allApps = await this.getAllApps();
            
            const stats = {
                total: allApps.length,
                active: allApps.filter(app => app.active === '1' || app.active === 1).length,
                inactive: allApps.filter(app => app.active === '0' || app.active === 0).length,
                registeredThisMonth: 0,
                registeredThisYear: 0
            };

            // Calcular registros del mes y año actual
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            allApps.forEach(app => {
                if (app.registration_date) {
                    const regDate = new Date(app.registration_date);
                    if (regDate.getFullYear() === currentYear) {
                        stats.registeredThisYear++;
                        if (regDate.getMonth() === currentMonth) {
                            stats.registeredThisMonth++;
                        }
                    }
                }
            });

            return stats;
        } catch (error) {
            console.error('Error al obtener estadísticas de aplicaciones:', error);
            throw new Error('No se pudieron obtener las estadísticas');
        }
    }

    /**
     * Busca aplicaciones por múltiples criterios
     * @param {Object} criteria - Criterios de búsqueda
     * @returns {Promise<Array>} - Lista de aplicaciones que cumplen los criterios
     */
    static async searchApps(criteria) {
        try {
            const result = await Methods.getAllRecords('app', criteria);
            return result.records;
        } catch (error) {
            console.error('Error al buscar aplicaciones:', error);
            throw new Error('No se pudieron buscar las aplicaciones');
        }
    }

    /**
     * Obtiene aplicaciones registradas en un rango de fechas
     * @param {string} startDate - Fecha de inicio (formato: YYYY-MM-DD)
     * @param {string} endDate - Fecha de fin (formato: YYYY-MM-DD)
     * @returns {Promise<Array>} - Lista de aplicaciones registradas en el rango
     */
    static async getAppsByDateRange(startDate, endDate) {
        try {
            const allApps = await this.getAllApps();
            
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            return allApps.filter(app => {
                if (!app.registration_date) return false;
                const regDate = new Date(app.registration_date);
                return regDate >= start && regDate <= end;
            });
        } catch (error) {
            console.error(`Error al obtener aplicaciones por rango de fechas:`, error);
            throw new Error('No se pudieron obtener aplicaciones por rango de fechas');
        }
    }
}