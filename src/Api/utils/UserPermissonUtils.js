/**
 * Utilidades auxiliares para el componente UserPermission
 * Funciones helper para formateo, validación y transformación de datos
 */
export class UserPermissionUtils {

    /**
     * Formatea los datos de usuario para mostrar en tabla
     * @param {Array} users - Array de usuarios con permisos
     * @returns {Array} - Usuarios formateados para tabla
     */
    static formatUsersForTable(users) {
        return users.map(user => ({
            id: user.user_id,
            email: user.email,
            role: {
                id: user.role_id,
                name: user.role_name,
                badge: this.getRoleBadge(user.role_name, user.is_admin)
            },
            applications: {
                list: user.applications || [],
                count: user.app_count || 0,
                active: user.stats?.active_apps || 0,
                inactive: user.stats?.inactive_apps || 0,
                badge: this.getAppCountBadge(user.app_count || 0)
            },
            status: {
                hasApps: user.has_applications,
                isAdmin: user.is_admin,
                statusClass: user.has_applications ? 'text-green-600' : 'text-gray-500'
            },
            actions: {
                canEdit: true,
                canDelete: !user.is_admin, // No permitir eliminar admin
                canManageApps: true
            },
            displayData: {
                emailShort: this.truncateEmail(user.email),
                appsSummary: this.createAppsSummary(user.applications || []),
                lastActivity: user.processed_at
            }
        }));
    }

    /**
     * Formatea los datos de aplicaciones para un usuario específico
     * @param {Array} applications - Array de aplicaciones del usuario
     * @returns {Array} - Aplicaciones formateadas
     */
    static formatApplicationsForUser(applications) {
        return applications.map(app => ({
            id: app.app_id,
            name: app.name_app,
            userAppId: app.user_app_id,
            status: {
                isActive: app.isActive,
                text: app.isActive ? 'Activa' : 'Inactiva',
                class: app.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            },
            credentials: {
                apiKey: app.api_key,
                apiKeyShort: this.truncateApiKey(app.api_key),
                hasSecretKey: !!app.secret_key
            },
            urls: {
                callback: app.callback_url || '',
                return: app.return_url || '',
                error: app.error_url || '',
                isConfigured: this.isAppConfigured(app)
            },
            dates: {
                registered: app.registration_date,
                registeredFormatted: this.formatDate(app.registration_date)
            },
            icon: this.generateAppIcon(app.name_app, app.isActive)
        }));
    }

    /**
     * Genera un resumen visual de las aplicaciones de un usuario
     * @param {Array} applications - Aplicaciones del usuario
     * @returns {Object} - Resumen visual
     */
    static createAppsSummary(applications) {
        const total = applications.length;
        const active = applications.filter(app => app.isActive).length;
        const configured = applications.filter(app => this.isAppConfigured(app)).length;

        return {
            total,
            active,
            inactive: total - active,
            configured,
            notConfigured: total - configured,
            text: `${total} app${total !== 1 ? 's' : ''} (${active} activa${active !== 1 ? 's' : ''})`,
            shortText: `${total}/${active}`,
            percentageActive: total > 0 ? Math.round((active / total) * 100) : 0,
            percentageConfigured: total > 0 ? Math.round((configured / total) * 100) : 0
        };
    }

    /**
     * Genera un badge para el rol de usuario
     * @param {string} roleName - Nombre del rol
     * @param {boolean} isAdmin - Si es administrador
     * @returns {Object} - Configuración del badge
     */
    static getRoleBadge(roleName, isAdmin = false) {
        const role = (roleName || '').toLowerCase();
        
        if (isAdmin || role.includes('admin')) {
            return {
                text: roleName,
                class: 'bg-red-100 text-red-800 font-semibold',
                icon: '👑'
            };
        } else if (role.includes('supervisor') || role.includes('manager')) {
            return {
                text: roleName,
                class: 'bg-blue-100 text-blue-800 font-medium',
                icon: '👨‍💼'
            };
        } else if (role.includes('cliente') || role.includes('client')) {
            return {
                text: roleName,
                class: 'bg-green-100 text-green-800',
                icon: '👤'
            };
        } else {
            return {
                text: roleName,
                class: 'bg-gray-100 text-gray-800',
                icon: '🔧'
            };
        }
    }

    /**
     * Genera un badge para el conteo de aplicaciones
     * @param {number} appCount - Número de aplicaciones
     * @returns {Object} - Configuración del badge
     */
    static getAppCountBadge(appCount) {
        if (appCount === 0) {
            return {
                text: 'Sin apps',
                class: 'bg-gray-100 text-gray-600',
                color: 'gray'
            };
        } else if (appCount === 1) {
            return {
                text: '1 app',
                class: 'bg-blue-100 text-blue-600',
                color: 'blue'
            };
        } else if (appCount <= 3) {
            return {
                text: `${appCount} apps`,
                class: 'bg-green-100 text-green-600',
                color: 'green'
            };
        } else {
            return {
                text: `${appCount} apps`,
                class: 'bg-purple-100 text-purple-600',
                color: 'purple'
            };
        }
    }

    /**
     * Genera un icono para una aplicación
     * @param {string} appName - Nombre de la aplicación
     * @param {boolean} isActive - Si está activa
     * @returns {Object} - Configuración del icono
     */
    static generateAppIcon(appName, isActive) {
        const name = (appName || '').toLowerCase();
        const activeColor = isActive ? 'text-white' : 'text-gray-400';
        const activeBg = isActive ? '' : 'opacity-50';
        
        if (name.includes('comercio') || name.includes('ecommerce') || name.includes('tienda')) {
            return {
                emoji: '🛒',
                bg: `bg-blue-500 ${activeBg}`,
                text: 'EC',
                color: activeColor
            };
        } else if (name.includes('pago') || name.includes('payment')) {
            return {
                emoji: '💳',
                bg: `bg-green-500 ${activeBg}`,
                text: 'PAY',
                color: activeColor
            };
        } else if (name.includes('servicio') || name.includes('service')) {
            return {
                emoji: '⚙️',
                bg: `bg-purple-500 ${activeBg}`,
                text: 'SRV',
                color: activeColor
            };
        } else if (name.includes('admin') || name.includes('dashboard')) {
            return {
                emoji: '📊',
                bg: `bg-orange-500 ${activeBg}`,
                text: 'ADMIN',
                color: activeColor
            };
        } else {
            const initials = name.split(' ')
                .map(word => word.charAt(0))
                .join('')
                .toUpperCase()
                .substring(0, 2) || 'AP';
                
            return {
                emoji: '📱',
                bg: `bg-gray-500 ${activeBg}`,
                text: initials,
                color: activeColor
            };
        }
    }

    /**
     * Verifica si una aplicación está completamente configurada
     * @param {Object} app - Datos de la aplicación
     * @returns {boolean} - Si está configurada
     */
    static isAppConfigured(app) {
        return !!(app.callback_url && app.return_url && app.error_url);
    }

    /**
     * Trunca un email para mostrar en espacios pequeños
     * @param {string} email - Email completo
     * @param {number} maxLength - Longitud máxima
     * @returns {string} - Email truncado
     */
    static truncateEmail(email, maxLength = 25) {
        if (!email || email.length <= maxLength) return email;
        
        const [user, domain] = email.split('@');
        if (user.length > 15) {
            return `${user.substring(0, 12)}...@${domain}`;
        }
        return email;
    }

    /**
     * Trunca una API key para mostrar solo los primeros caracteres
     * @param {string} apiKey - API key completa
     * @returns {string} - API key truncada
     */
    static truncateApiKey(apiKey) {
        if (!apiKey) return 'N/A';
        return `${apiKey.substring(0, 8)}***`;
    }

    /**
     * Formatea una fecha para mostrar
     * @param {string} dateString - Fecha en string
     * @returns {string} - Fecha formateada
     */
    static formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Fecha inválida';
        }
    }

    /**
     * Formatea estadísticas para mostrar en resumen
     * @param {Object} stats - Estadísticas raw
     * @returns {Object} - Estadísticas formateadas
     */
    static formatStatistics(stats) {
        return {
            users: {
                total: stats.total_users || 0,
                withApps: stats.user_app_stats?.users_with_apps || 0,
                withoutApps: stats.user_app_stats?.users_without_apps || 0,
                averageApps: stats.user_app_stats?.avg_apps_per_user || '0.00'
            },
            apps: {
                total: stats.total_apps || 0,
                active: stats.apps_stats?.active || 0,
                inactive: stats.apps_stats?.inactive || 0,
                withUsers: stats.apps_stats?.with_users || 0,
                withoutUsers: stats.apps_stats?.without_users || 0
            },
            relations: {
                total: stats.total_relations || 0,
                distribution: stats.permission_distribution || {}
            },
            topUsers: stats.top_users_by_apps || [],
            mostUsedApps: stats.most_used_apps || []
        };
    }

    /**
     * Filtra usuarios basado en texto de búsqueda
     * @param {Array} users - Array de usuarios
     * @param {string} searchText - Texto de búsqueda
     * @returns {Array} - Usuarios filtrados
     */
    static filterUsersBySearch(users, searchText) {
        if (!searchText || searchText.trim() === '') return users;
        
        const search = searchText.toLowerCase().trim();
        
        return users.filter(user => {
            return (
                user.email.toLowerCase().includes(search) ||
                user.role_name.toLowerCase().includes(search) ||
                user.applications.some(app => 
                    app.name_app.toLowerCase().includes(search)
                ) ||
                user.user_id.toString().includes(search)
            );
        });
    }

    /**
     * Ordena usuarios por diferentes criterios
     * @param {Array} users - Array de usuarios
     * @param {string} sortBy - Campo por el que ordenar
     * @param {string} sortOrder - Orden (asc/desc)
     * @returns {Array} - Usuarios ordenados
     */
    static sortUsers(users, sortBy = 'email', sortOrder = 'asc') {
        const sorted = [...users].sort((a, b) => {
            let valueA, valueB;
            
            switch (sortBy) {
                case 'email':
                    valueA = a.email.toLowerCase();
                    valueB = b.email.toLowerCase();
                    break;
                case 'role':
                    valueA = a.role_name.toLowerCase();
                    valueB = b.role_name.toLowerCase();
                    break;
                case 'app_count':
                    valueA = a.app_count || 0;
                    valueB = b.app_count || 0;
                    break;
                case 'user_id':
                    valueA = a.user_id;
                    valueB = b.user_id;
                    break;
                default:
                    valueA = a.email.toLowerCase();
                    valueB = b.email.toLowerCase();
            }
            
            if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        
        return sorted;
    }

    /**
     * Valida los datos de un nuevo usuario antes de crear
     * @param {Object} userData - Datos del usuario
     * @returns {Object} - Resultado de validación
     */
    static validateUserData(userData) {
        const errors = [];
        
        if (!userData.email || userData.email.trim() === '') {
            errors.push('El email es requerido');
        } else if (!this.isValidEmail(userData.email)) {
            errors.push('El formato del email es inválido');
        }
        
        if (!userData.role_id || userData.role_id <= 0) {
            errors.push('Debe seleccionar un rol válido');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            data: {
                email: userData.email?.trim(),
                role_id: parseInt(userData.role_id)
            }
        };
    }

    /**
     * Valida si un email tiene formato correcto
     * @param {string} email - Email a validar
     * @returns {boolean} - Si es válido
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Genera colores para gráficos basado en rol
     * @param {string} roleName - Nombre del rol
     * @returns {Object} - Colores para el rol
     */
    static getRoleColors(roleName) {
        const role = (roleName || '').toLowerCase();
        
        if (role.includes('admin')) {
            return { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B' };
        } else if (role.includes('supervisor')) {
            return { bg: '#DBEAFE', border: '#2563EB', text: '#1D4ED8' };
        } else if (role.includes('cliente')) {
            return { bg: '#D1FAE5', border: '#059669', text: '#047857' };
        } else {
            return { bg: '#F3F4F6', border: '#6B7280', text: '#374151' };
        }
    }

    /**
     * Crea datos para gráfico de distribución de roles
     * @param {Object} usersByRole - Usuarios agrupados por rol
     * @returns {Object} - Datos para gráfico
     */
    static createRoleChartData(usersByRole) {
        const labels = Object.keys(usersByRole);
        const data = Object.values(usersByRole);
        const colors = labels.map(role => this.getRoleColors(role));
        
        return {
            labels,
            datasets: [{
                data,
                backgroundColor: colors.map(c => c.bg),
                borderColor: colors.map(c => c.border),
                borderWidth: 2
            }]
        };
    }

    /**
     * Obtiene sugerencias de usuarios para autocompletado
     * @param {Array} users - Array de usuarios
     * @param {string} query - Query de búsqueda
     * @param {number} limit - Límite de resultados
     * @returns {Array} - Sugerencias de usuarios
     */
    static getUserSuggestions(users, query, limit = 5) {
        if (!query || query.trim() === '') return [];
        
        const searchQuery = query.toLowerCase().trim();
        
        return users
            .filter(user => 
                user.email.toLowerCase().includes(searchQuery) ||
                user.role_name.toLowerCase().includes(searchQuery)
            )
            .slice(0, limit)
            .map(user => ({
                id: user.user_id,
                label: `${user.email} (${user.role_name})`,
                email: user.email,
                role: user.role_name,
                appCount: user.app_count || 0
            }));
    }

    /**
     * Formatea datos para exportar a CSV
     * @param {Array} users - Array de usuarios
     * @returns {string} - Datos en formato CSV
     */
    static formatForCSVExport(users) {
        const headers = ['ID', 'Email', 'Rol', 'Aplicaciones', 'Apps Activas', 'Apps Inactivas'];
        
        const rows = users.map(user => [
            user.user_id,
            user.email,
            user.role_name,
            user.app_count || 0,
            user.stats?.active_apps || 0,
            user.stats?.inactive_apps || 0
        ]);
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
            
        return csvContent;
    }

    /**
     * Calcula métricas de rendimiento del sistema de permisos
     * @param {Object} stats - Estadísticas del sistema
     * @returns {Object} - Métricas de rendimiento
     */
    static calculatePerformanceMetrics(stats) {
        const totalUsers = stats.total_users || 0;
        const totalApps = stats.total_apps || 0;
        const totalRelations = stats.total_relations || 0;
        
        return {
            userUtilization: totalUsers > 0 ? 
                ((stats.user_app_stats?.users_with_apps || 0) / totalUsers * 100).toFixed(1) : '0.0',
            appUtilization: totalApps > 0 ? 
                ((stats.apps_stats?.with_users || 0) / totalApps * 100).toFixed(1) : '0.0',
            averageAppsPerUser: stats.user_app_stats?.avg_apps_per_user || '0.00',
            systemHealth: this.calculateSystemHealth(stats),
            recommendations: this.generateRecommendations(stats)
        };
    }

    /**
     * Calcula la salud general del sistema
     * @param {Object} stats - Estadísticas del sistema
     * @returns {Object} - Estado de salud del sistema
     * @private
     */
    static calculateSystemHealth(stats) {
        const userUtilization = stats.total_users > 0 ? 
            (stats.user_app_stats?.users_with_apps || 0) / stats.total_users : 0;
        const appUtilization = stats.total_apps > 0 ? 
            (stats.apps_stats?.with_users || 0) / stats.total_apps : 0;
            
        const healthScore = (userUtilization + appUtilization) / 2 * 100;
        
        let status, color, message;
        
        if (healthScore >= 80) {
            status = 'Excelente';
            color = 'green';
            message = 'El sistema está siendo utilizado eficientemente';
        } else if (healthScore >= 60) {
            status = 'Bueno';
            color = 'blue';
            message = 'Hay oportunidades para mejorar la utilización';
        } else if (healthScore >= 40) {
            status = 'Regular';
            color = 'yellow';
            message = 'Se recomienda revisar las asignaciones de permisos';
        } else {
            status = 'Necesita atención';
            color = 'red';
            message = 'Muchos recursos no están siendo utilizados';
        }
        
        return { score: healthScore.toFixed(1), status, color, message };
    }

    /**
     * Genera recomendaciones basadas en estadísticas
     * @param {Object} stats - Estadísticas del sistema
     * @returns {Array} - Array de recomendaciones
     * @private
     */
    static generateRecommendations(stats) {
        const recommendations = [];
        
        if (stats.user_app_stats?.users_without_apps > 0) {
            recommendations.push({
                type: 'warning',
                title: 'Usuarios sin aplicaciones',
                message: `${stats.user_app_stats.users_without_apps} usuarios no tienen aplicaciones asignadas`,
                action: 'Revisar y asignar aplicaciones necesarias'
            });
        }
        
        if (stats.apps_stats?.without_users > 0) {
            recommendations.push({
                type: 'info',
                title: 'Aplicaciones sin usuarios',
                message: `${stats.apps_stats.without_users} aplicaciones no tienen usuarios asignados`,
                action: 'Evaluar si estas aplicaciones son necesarias'
            });
        }
        
        if (stats.apps_stats?.inactive > 0) {
            recommendations.push({
                type: 'warning',
                title: 'Aplicaciones inactivas',
                message: `${stats.apps_stats.inactive} aplicaciones están marcadas como inactivas`,
                action: 'Revisar el estado de estas aplicaciones'
            });
        }
        
        return recommendations;
    }
}