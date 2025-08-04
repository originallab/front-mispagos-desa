import api from '../axios.js';
import { handleError } from '../utils/errorHandler';

/**
 * Servicio completo para la tabla app
 * Maneja todas las operaciones CRUD y funcionalidades específicas para aplicaciones
 */
export const AppCompleteService = {

    /**
     * Obtiene todas las aplicaciones formateadas para tabla
     * @param {Object} filters - Filtros opcionales
     * @returns {Promise<Object>} - Applications formateadas
     */
    async getAppsForTable(filters = null) {
        try {
            console.log('🔄 Obteniendo aplicaciones para tabla...');

            const params = filters ? { filters } : {};
            const response = await api.get('/app/all', { params });
            
            if (!response.data || !response.data.records) {
                throw new Error('Estructura de respuesta inválida');
            }

            const apps = response.data.records;
            const formattedApps = apps.map(app => this.formatAppForTable(app));

            console.log(`✅ ${formattedApps.length} aplicaciones obtenidas para tabla`);
            
            return {
                success: true,
                data: formattedApps,
                count: formattedApps.length,
                message: `${formattedApps.length} aplicaciones obtenidas exitosamente`
            };
        } catch (error) {
            console.error('❌ Error en AppCompleteService.getAppsForTable:', error);
            handleError(error);
            throw new Error(`Error al obtener aplicaciones: ${error.message}`);
        }
    },

    /**
     * Obtiene una aplicación por ID
     * @param {number} appId - ID de la aplicación
     * @returns {Promise<Object>} - Aplicación encontrada
     */
    async getById(appId) {
        try {
            if (!appId || appId <= 0) {
                throw new Error('ID de aplicación inválido');
            }

            console.log(`🔍 Obteniendo aplicación con ID: ${appId}`);

            const response = await api.get(`/app/${appId}`);
            
            if (!response.data || !response.data.record) {
                throw new Error('Aplicación no encontrada');
            }

            const formattedApp = this.formatAppForTable(response.data.record);

            console.log(`✅ Aplicación ${appId} obtenida: ${formattedApp.name}`);

            return {
                success: true,
                data: formattedApp,
                message: 'Aplicación obtenida exitosamente'
            };
        } catch (error) {
            console.error(`❌ Error al obtener aplicación ${appId}:`, error);
            handleError(error);
            throw new Error(`Error al obtener aplicación con ID ${appId}: ${error.message}`);
        }
    },

    /**
     * Obtiene una aplicación por API Key
     * @param {string} apiKey - API Key de la aplicación
     * @returns {Promise<Object>} - Aplicación encontrada
     */
    async getByApiKey(apiKey) {
        try {
            if (!apiKey || apiKey.trim().length === 0) {
                throw new Error('API Key inválida');
            }

            console.log(`🔍 Obteniendo aplicación por API Key: ${apiKey.substring(0, 8)}...`);

            const response = await api.get(`/app/field/api_key/${apiKey.trim()}`);
            
            if (!response.data || !response.data.record) {
                throw new Error('Aplicación no encontrada con esa API Key');
            }

            const formattedApp = this.formatAppForTable(response.data.record);

            console.log(`✅ Aplicación encontrada por API Key: ${formattedApp.name}`);

            return {
                success: true,
                data: formattedApp,
                message: 'Aplicación obtenida exitosamente'
            };
        } catch (error) {
            console.error(`❌ Error al obtener aplicación por API Key:`, error);
            handleError(error);
            throw new Error(`Error al obtener aplicación por API Key: ${error.message}`);
        }
    },

    /**
     * Crea una nueva aplicación
     * @param {Object} appData - Datos de la aplicación
     * @returns {Promise<Object>} - Aplicación creada
     */
    async create(appData) {
        try {
            console.log('➕ Creando nueva aplicación:', appData.name_app);

            if (!appData || !appData.name_app) {
                throw new Error('Nombre de aplicación es requerido');
            }

            // Generar API Key si no se proporciona
            if (!appData.api_key) {
                appData.api_key = this.generateApiKey();
                console.log(`🔑 API Key generada automáticamente: ${appData.api_key}`);
            }

            // Generar Secret Key si no se proporciona
            if (!appData.secret_key) {
                appData.secret_key = this.generateSecretKey();
                console.log(`🔐 Secret Key generada automáticamente`);
            }

            // Verificar que la API Key no exista
            try {
                await this.getByApiKey(appData.api_key);
                throw new Error('Ya existe una aplicación con esta API Key');
            } catch (err) {
                // Si no encuentra la API Key, está bien (puede crear la app)
                if (!err.message.includes('Error al obtener aplicación por API Key')) {
                    throw err;
                }
            }

            const cleanData = this.validateAndCleanAppData(appData);
            
            const response = await api.post('/app', { data: cleanData });
            
            const formattedApp = this.formatAppForTable(response.data);

            console.log(`✅ Aplicación "${cleanData.name_app}" creada con ID: ${formattedApp.id}`);
            
            return {
                success: true,
                data: formattedApp,
                message: `Aplicación "${cleanData.name_app}" creada exitosamente`,
                credentials: {
                    api_key: cleanData.api_key,
                    secret_key: cleanData.secret_key
                }
            };
        } catch (error) {
            console.error('❌ Error al crear aplicación:', error);
            handleError(error);
            throw new Error(`Error al crear aplicación: ${error.message}`);
        }
    },

    /**
     * Actualiza completamente una aplicación
     * @param {number} appId - ID de la aplicación
     * @param {Object} appData - Nuevos datos
     * @returns {Promise<Object>} - Resultado de la actualización
     */
    async update(appId, appData) {
        try {
            console.log(`📝 Actualizando aplicación ${appId}:`, appData.name_app);

            if (!appId || appId <= 0) {
                throw new Error('ID de aplicación inválido');
            }

            if (!appData || !appData.name_app) {
                throw new Error('Datos de aplicación inválidos');
            }

            // Verificar que existe
            await this.getById(appId);

            // Si se está actualizando la API key, verificar que no exista en otra app
            if (appData.api_key) {
                try {
                    const existingApp = await this.getByApiKey(appData.api_key);
                    if (existingApp.data.id !== appId) {
                        throw new Error('Ya existe otra aplicación con esta API Key');
                    }
                } catch (err) {
                    if (!err.message.includes('Error al obtener aplicación por API Key')) {
                        throw err;
                    }
                }
            }

            const cleanData = this.validateAndCleanAppData(appData);
            
            const response = await api.put(`/app/${appId}`, { data: cleanData });
            
            const formattedApp = this.formatAppForTable(response.data);

            console.log(`✅ Aplicación ${appId} actualizada exitosamente`);
            
            return {
                success: true,
                data: formattedApp,
                message: `Aplicación actualizada exitosamente`
            };
        } catch (error) {
            console.error(`❌ Error al actualizar aplicación ${appId}:`, error);
            handleError(error);
            throw new Error(`Error al actualizar aplicación: ${error.message}`);
        }
    },

    /**
     * Actualiza parcialmente una aplicación
     * @param {number} appId - ID de la aplicación
     * @param {Object} partialData - Datos parciales
     * @returns {Promise<Object>} - Resultado de la actualización
     */
    async patch(appId, partialData) {
        try {
            console.log(`🔧 Actualizando parcialmente aplicación ${appId}:`, Object.keys(partialData));

            if (!appId || appId <= 0) {
                throw new Error('ID de aplicación inválido');
            }

            if (!partialData || Object.keys(partialData).length === 0) {
                throw new Error('No hay datos para actualizar');
            }

            // Verificar que existe
            await this.getById(appId);

            // Si se está actualizando la API key, verificar que no exista en otra app
            if (partialData.api_key) {
                try {
                    const existingApp = await this.getByApiKey(partialData.api_key);
                    if (existingApp.data.id !== appId) {
                        throw new Error('Ya existe otra aplicación con esta API Key');
                    }
                } catch (err) {
                    if (!err.message.includes('Error al obtener aplicación por API Key')) {
                        throw err;
                    }
                }
            }

            const cleanData = this.validateAndCleanPartialData(partialData);
            
            const response = await api.patch(`/app/${appId}`, { data: cleanData });
            
            const formattedApp = this.formatAppForTable(response.data);

            console.log(`✅ Aplicación ${appId} actualizada parcialmente`);
            
            return {
                success: true,
                data: formattedApp,
                message: `Aplicación actualizada exitosamente`
            };
        } catch (error) {
            console.error(`❌ Error al actualizar parcialmente aplicación ${appId}:`, error);
            handleError(error);
            throw new Error(`Error al actualizar aplicación: ${error.message}`);
        }
    },

    /**
     * Elimina una aplicación
     * @param {number} appId - ID de la aplicación a eliminar
     * @returns {Promise<Object>} - Resultado de la eliminación
     */
    async delete(appId) {
        try {
            console.log(`🗑️ Eliminando aplicación ${appId}...`);

            if (!appId || appId <= 0) {
                throw new Error('ID de aplicación inválido');
            }

            // Verificar que existe antes de eliminar
            const app = await this.getById(appId);
            
            const response = await api.delete(`/app/${appId}`);
            
            console.log(`✅ Aplicación "${app.data.name}" eliminada exitosamente`);
            
            return {
                success: true,
                data: response.data,
                message: `Aplicación "${app.data.name}" eliminada exitosamente`
            };
        } catch (error) {
            console.error(`❌ Error al eliminar aplicación ${appId}:`, error);
            handleError(error);
            throw new Error(`Error al eliminar aplicación: ${error.message}`);
        }
    },

    /**
     * Obtiene aplicaciones activas
     * @returns {Promise<Object>} - Aplicaciones activas
     */
    async getActiveApps() {
        try {
            console.log('🟢 Obteniendo aplicaciones activas...');
            
            const result = await this.getAppsForTable({ active: '1' });
            
            console.log(`✅ ${result.count} aplicaciones activas obtenidas`);
            
            return result;
        } catch (error) {
            console.error('❌ Error al obtener aplicaciones activas:', error);
            throw new Error('Error al obtener aplicaciones activas');
        }
    },

    /**
     * Obtiene aplicaciones inactivas
     * @returns {Promise<Object>} - Aplicaciones inactivas
     */
    async getInactiveApps() {
        try {
            console.log('🔴 Obteniendo aplicaciones inactivas...');
            
            const result = await this.getAppsForTable({ active: '0' });
            
            console.log(`✅ ${result.count} aplicaciones inactivas obtenidas`);
            
            return result;
        } catch (error) {
            console.error('❌ Error al obtener aplicaciones inactivas:', error);
            throw new Error('Error al obtener aplicaciones inactivas');
        }
    },

    /**
     * Cambia el estado de una aplicación
     * @param {number} appId - ID de la aplicación
     * @param {boolean} isActive - Si debe estar activa o no
     * @returns {Promise<Object>} - Resultado del cambio
     */
    async toggleStatus(appId, isActive) {
        try {
            const statusText = isActive ? 'activa' : 'inactiva';
            console.log(`🔄 Cambiando estado de aplicación ${appId} a: ${statusText}`);
            
            const status = isActive ? '1' : '0';
            const result = await this.patch(appId, { active: status });
            
            console.log(`✅ Estado de aplicación ${appId} cambiado a: ${statusText}`);
            
            return result;
        } catch (error) {
            console.error(`❌ Error al cambiar estado de aplicación ${appId}:`, error);
            throw error;
        }
    },

    /**
     * Busca aplicaciones por nombre
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Promise<Object>} - Aplicaciones encontradas
     */
    async searchByName(searchTerm) {
        try {
            console.log(`🔍 Buscando aplicaciones con término: "${searchTerm}"`);

            if (!searchTerm || searchTerm.trim().length === 0) {
                return await this.getAppsForTable();
            }

            const allApps = await this.getAppsForTable();
            const searchTermLower = searchTerm.toLowerCase();

            const filteredApps = allApps.data.filter(app => 
                app.name.toLowerCase().includes(searchTermLower) ||
                app.api_key.toLowerCase().includes(searchTermLower) ||
                app.statusText.toLowerCase().includes(searchTermLower)
            );

            console.log(`✅ ${filteredApps.length} aplicaciones encontradas`);

            return {
                success: true,
                data: filteredApps,
                count: filteredApps.length,
                message: `${filteredApps.length} aplicaciones encontradas`
            };
        } catch (error) {
            console.error(`❌ Error al buscar aplicaciones:`, error);
            throw error;
        }
    },

    /**
     * Regenera la API Key de una aplicación
     * @param {number} appId - ID de la aplicación
     * @returns {Promise<Object>} - Resultado con nueva API Key
     */
    async regenerateApiKey(appId) {
        try {
            console.log(`🔄 Regenerando API Key para aplicación ${appId}...`);
            
            // Generar nueva API key única
            const newApiKey = this.generateApiKey();
            
            const result = await this.patch(appId, { api_key: newApiKey });
            
            console.log(`✅ API Key regenerada para aplicación ${appId}: ${newApiKey.substring(0, 8)}...`);
            
            return {
                ...result,
                credentials: {
                    new_api_key: newApiKey,
                    api_key: newApiKey
                },
                message: 'API Key regenerada exitosamente'
            };
        } catch (error) {
            console.error(`❌ Error al regenerar API Key para aplicación ${appId}:`, error);
            throw error;
        }
    },

    /**
     * Regenera la Secret Key de una aplicación
     * @param {number} appId - ID de la aplicación
     * @returns {Promise<Object>} - Resultado con nueva Secret Key
     */
    async regenerateSecretKey(appId) {
        try {
            console.log(`🔄 Regenerando Secret Key para aplicación ${appId}...`);
            
            // Generar nueva secret key única
            const newSecretKey = this.generateSecretKey();
            
            const result = await this.patch(appId, { secret_key: newSecretKey });
            
            console.log(`✅ Secret Key regenerada para aplicación ${appId}`);
            
            return {
                ...result,
                credentials: {
                    new_secret_key: newSecretKey,
                    secret_key: newSecretKey
                },
                message: 'Secret Key regenerada exitosamente'
            };
        } catch (error) {
            console.error(`❌ Error al regenerar Secret Key para aplicación ${appId}:`, error);
            throw error;
        }
    },

    /**
     * Obtiene aplicaciones registradas en un rango de fechas
     * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
     * @param {string} endDate - Fecha fin (YYYY-MM-DD)
     * @returns {Promise<Object>} - Aplicaciones filtradas
     */
    async getByDateRange(startDate, endDate) {
        try {
            console.log(`📅 Obteniendo aplicaciones entre ${startDate} y ${endDate}...`);
            
            const allApps = await this.getAppsForTable();
            const apps = allApps.data;
            
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            const filteredApps = apps.filter(app => {
                if (!app.registrationDate) return false;
                const regDate = new Date(app.registrationDate);
                return regDate >= start && regDate <= end;
            });

            console.log(`✅ ${filteredApps.length} aplicaciones encontradas en el rango de fechas`);

            return {
                success: true,
                data: filteredApps,
                count: filteredApps.length,
                message: `${filteredApps.length} aplicaciones encontradas en el rango de fechas`
            };
        } catch (error) {
            console.error(`❌ Error al obtener aplicaciones por rango de fechas:`, error);
            throw new Error('Error al obtener aplicaciones por rango de fechas');
        }
    },

    /**
     * Obtiene estadísticas completas de aplicaciones
     * @returns {Promise<Object>} - Estadísticas detalladas
     */
    async getCompleteStatistics() {
        try {
            console.log('📊 Obteniendo estadísticas completas de aplicaciones...');
            
            const allApps = await this.getAppsForTable();
            const apps = allApps.data;

            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const stats = {
                total: apps.length,
                active: apps.filter(app => app.isActive).length,
                inactive: apps.filter(app => !app.isActive).length,
                registeredThisMonth: 0,
                registeredThisYear: 0,
                withCallbackUrl: apps.filter(app => app.callbackUrl && app.callbackUrl.length > 0).length,
                withReturnUrl: apps.filter(app => app.returnUrl && app.returnUrl.length > 0).length,
                withErrorUrl: apps.filter(app => app.errorUrl && app.errorUrl.length > 0).length,
                byRegistrationMonth: {},
                urlsConfigured: {
                    complete: 0, // Todas las URLs configuradas
                    partial: 0,  // Algunas URLs configuradas
                    none: 0      // Ninguna URL configurada
                }
            };

            // Calcular registros del mes y año actual
            apps.forEach(app => {
                if (app.registrationDate) {
                    const regDate = new Date(app.registrationDate);
                    if (regDate.getFullYear() === currentYear) {
                        stats.registeredThisYear++;
                        if (regDate.getMonth() === currentMonth) {
                            stats.registeredThisMonth++;
                        }
                    }

                    // Agrupar por mes de registro
                    const monthKey = `${regDate.getFullYear()}-${(regDate.getMonth() + 1).toString().padStart(2, '0')}`;
                    stats.byRegistrationMonth[monthKey] = (stats.byRegistrationMonth[monthKey] || 0) + 1;
                }

                // Contar configuración de URLs
                const urlCount = [app.callbackUrl, app.returnUrl, app.errorUrl].filter(url => url && url.length > 0).length;
                if (urlCount === 3) {
                    stats.urlsConfigured.complete++;
                } else if (urlCount > 0) {
                    stats.urlsConfigured.partial++;
                } else {
                    stats.urlsConfigured.none++;
                }
            });

            console.log('✅ Estadísticas completas obtenidas:', {
                total: stats.total,
                active: stats.active,
                registeredThisYear: stats.registeredThisYear
            });

            return {
                success: true,
                data: stats,
                message: 'Estadísticas completas obtenidas exitosamente'
            };
        } catch (error) {
            console.error('❌ Error al obtener estadísticas completas:', error);
            throw new Error('Error al obtener estadísticas');
        }
    },

    /**
     * Obtiene resumen rápido para dashboard
     * @returns {Promise<Object>} - Resumen del sistema de aplicaciones
     */
    async getDashboardSummary() {
        try {
            console.log('📈 Obteniendo resumen de aplicaciones para dashboard...');
            
            const [appsResult, statsResult] = await Promise.all([
                this.getAppsForTable(),
                this.getCompleteStatistics()
            ]);

            const apps = appsResult.data;
            const stats = statsResult.data;

            const summary = {
                totalApps: apps.length,
                activeApps: stats.active,
                inactiveApps: stats.inactive,
                recentlyCreated: stats.registeredThisMonth,
                fullyConfigured: stats.urlsConfigured.complete,
                partiallyConfigured: stats.urlsConfigured.partial,
                notConfigured: stats.urlsConfigured.none,
                configurationRate: apps.length > 0 ? 
                    ((stats.urlsConfigured.complete / apps.length) * 100).toFixed(1) : 0,
                activationRate: apps.length > 0 ? 
                    ((stats.active / apps.length) * 100).toFixed(1) : 0,
                lastUpdated: new Date().toISOString()
            };

            console.log('✅ Resumen de aplicaciones obtenido:', {
                totalApps: summary.totalApps,
                activeApps: summary.activeApps,
                configurationRate: summary.configurationRate
            });

            return summary;
        } catch (error) {
            console.error('❌ Error al obtener resumen de aplicaciones:', error);
            throw error;
        }
    },

    /**
     * Formatea una aplicación para mostrar en tabla
     * @param {Object} app - Datos raw de la aplicación
     * @returns {Object} - Aplicación formateada
     */
    formatAppForTable(app) {
        const appId = app.app_id || app.id;
        const appName = app.name_app || app.name || 'Sin nombre';
        const isActive = app.active === '1' || app.active === 1 || app.active === true;
        
        // Generar icono de la aplicación
        const icon = this.generateAppIcon(appName, isActive);

        // Formatear URLs
        const urls = {
            callback: app.callback_url || '',
            return: app.return_url || '',
            error: app.error_url || ''
        };

        const configuredUrls = Object.values(urls).filter(url => url && url.length > 0).length;

        return {
            // Datos básicos
            id: appId,
            name: appName,
            displayName: appName,
            
            // Credenciales
            api_key: app.api_key || '',
            secret_key: app.secret_key || '',
            api_key_short: app.api_key ? `${app.api_key.substring(0, 8)}...` : 'N/A',
            
            // Estado
            isActive: isActive,
            active: app.active,
            status: isActive ? 'Activa' : 'Inactiva',
            statusText: isActive ? 'Activa' : 'Inactiva',
            statusClass: isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
            
            // URLs de configuración
            callbackUrl: urls.callback,
            returnUrl: urls.return,
            errorUrl: urls.error,
            configuredUrls: configuredUrls,
            configurationStatus: this.getConfigurationStatus(configuredUrls),
            
            // Fechas
            registrationDate: app.registration_date,
            createdAt: app.created_at,
            updatedAt: app.updated_at,
            
            // Información visual
            icon: icon,
            
            // Datos originales
            originalData: app
        };
    },

    /**
     * Genera el icono apropiado para una aplicación
     * @param {string} appName - Nombre de la aplicación
     * @param {boolean} isActive - Si está activa
     * @returns {Object} - Configuración del icono
     */
    generateAppIcon(appName, isActive) {
        const name = (appName || '').toLowerCase();
        
        // Iconos específicos por tipo de aplicación
        if (name.includes('ecommerce') || name.includes('tienda') || name.includes('comercio')) {
            return {
                bg: isActive ? 'bg-blue-100' : 'bg-gray-100',
                color: isActive ? 'bg-blue-600' : 'bg-gray-600',
                text: 'EC',
                textColor: 'text-white'
            };
        } else if (name.includes('mobile') || name.includes('movil') || name.includes('app')) {
            return {
                bg: isActive ? 'bg-green-100' : 'bg-gray-100',
                color: isActive ? 'bg-green-600' : 'bg-gray-600',
                text: 'MB',
                textColor: 'text-white'
            };
        } else if (name.includes('web') || name.includes('portal') || name.includes('site')) {
            return {
                bg: isActive ? 'bg-purple-100' : 'bg-gray-100',
                color: isActive ? 'bg-purple-600' : 'bg-gray-600',
                text: 'WB',
                textColor: 'text-white'
            };
        } else if (name.includes('admin') || name.includes('dashboard') || name.includes('panel')) {
            return {
                bg: isActive ? 'bg-orange-100' : 'bg-gray-100',
                color: isActive ? 'bg-orange-600' : 'bg-gray-600',
                text: 'AD',
                textColor: 'text-white'
            };
        } else if (name.includes('api') || name.includes('service') || name.includes('servicio')) {
            return {
                bg: isActive ? 'bg-indigo-100' : 'bg-gray-100',
                color: isActive ? 'bg-indigo-600' : 'bg-gray-600',
                text: 'API',
                textColor: 'text-white'
            };
        }
        
        // Fallback: usar primeras letras del nombre
        const fallbackText = name.length >= 2 ? 
            name.substring(0, 2).toUpperCase() : 
            (name.charAt(0)?.toUpperCase() || 'AP');
            
        return {
            bg: isActive ? 'bg-cyan-100' : 'bg-gray-100',
            color: isActive ? 'bg-cyan-600' : 'bg-gray-600',
            text: fallbackText,
            textColor: 'text-white'
        };
    },

    /**
     * Obtiene el estado de configuración basado en URLs configuradas
     * @param {number} configuredUrls - Número de URLs configuradas
     * @returns {Object} - Estado de configuración
     */
    getConfigurationStatus(configuredUrls) {
        if (configuredUrls === 3) {
            return {
                status: 'Completa',
                class: 'bg-green-100 text-green-800',
                percentage: 100
            };
        } else if (configuredUrls > 0) {
            return {
                status: 'Parcial',
                class: 'bg-yellow-100 text-yellow-800',
                percentage: Math.round((configuredUrls / 3) * 100)
            };
        } else {
            return {
                status: 'Sin configurar',
                class: 'bg-red-100 text-red-800',
                percentage: 0
            };
        }
    },

    /**
     * Valida y limpia los datos de la aplicación
     * @param {Object} appData - Datos a validar
     * @returns {Object} - Datos limpios
     * @private
     */
    validateAndCleanAppData(appData) {
        const cleanData = {};

        // Nombre de aplicación (requerido)
        if (!appData.name_app || appData.name_app.trim().length === 0) {
            throw new Error('El nombre de la aplicación es requerido');
        }
        cleanData.name_app = appData.name_app.trim();

        // API Key (requerido)
        if (!appData.api_key || appData.api_key.trim().length === 0) {
            throw new Error('La API Key es requerida');
        }
        cleanData.api_key = appData.api_key.trim();

        // Secret Key
        if (appData.secret_key && appData.secret_key.trim().length > 0) {
            cleanData.secret_key = appData.secret_key.trim();
        }

        // Estado activo
        cleanData.active = [1, '1', true].includes(appData.active) ? '1' : '0';

        // URLs con validación
        ['callback_url', 'return_url', 'error_url'].forEach(urlField => {
            if (appData[urlField] && appData[urlField].trim().length > 0) {
                const url = appData[urlField].trim();
                if (!this.isValidUrl(url)) {
                    throw new Error(`${urlField.replace('_', ' ')} inválida: ${url}`);
                }
                cleanData[urlField] = url;
            }
        });

        // Fecha de registro
        if (appData.registration_date) {
            cleanData.registration_date = appData.registration_date;
        } else {
            cleanData.registration_date = new Date().toISOString();
        }

        return cleanData;
    },

    /**
     * Valida y limpia datos parciales
     * @param {Object} partialData - Datos parciales
     * @returns {Object} - Datos limpios
     * @private
     */
    validateAndCleanPartialData(partialData) {
        const cleanData = {};

        if (partialData.name_app !== undefined) {
            if (!partialData.name_app || partialData.name_app.trim().length === 0) {
                throw new Error('El nombre de la aplicación no puede estar vacío');
            }
            cleanData.name_app = partialData.name_app.trim();
        }

        if (partialData.api_key !== undefined) {
            if (!partialData.api_key || partialData.api_key.trim().length === 0) {
                throw new Error('La API Key no puede estar vacía');
            }
            cleanData.api_key = partialData.api_key.trim();
        }

        if (partialData.secret_key !== undefined) {
            cleanData.secret_key = partialData.secret_key ? partialData.secret_key.trim() : null;
        }

        if (partialData.active !== undefined) {
            cleanData.active = [1, '1', true].includes(partialData.active) ? '1' : '0';
        }

        // URLs con validación
        ['callback_url', 'return_url', 'error_url'].forEach(urlField => {
            if (partialData[urlField] !== undefined) {
                if (partialData[urlField] && partialData[urlField].trim().length > 0) {
                    const url = partialData[urlField].trim();
                    if (!this.isValidUrl(url)) {
                        throw new Error(`${urlField.replace('_', ' ')} inválida: ${url}`);
                    }
                    cleanData[urlField] = url;
                } else {
                    cleanData[urlField] = null;
                }
            }
        });

        return cleanData;
    },

    /**
     * Valida si una URL es válida
     * @param {string} url - URL a validar
     * @returns {boolean} - Si es válida o no
     * @private
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Genera una nueva API Key única
     * @returns {string} - Nueva API Key
     * @private
     */
    generateApiKey() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `app_${timestamp}_${random}`;
    },

    /**
     * Genera una nueva Secret Key única
     * @returns {string} - Nueva Secret Key
     * @private
     */
    generateSecretKey() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 16);
        return `sk_${timestamp}_${random}`;
    }
};