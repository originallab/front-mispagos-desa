/**
 * Utilidades para el manejo de perfiles de usuario
 * Funciones helper para formateo y procesamiento de datos de perfil
 */
export class ProfileUtils {

    /**
     * Formatea los datos del usuario para mostrar en el ProfileHeader
     * @param {Object} profileData - Datos del perfil del servicio
     * @returns {Object} - Datos formateados para el componente
     */
    static formatProfileForHeader(profileData) {
        if (!profileData || !profileData.user) {
            return this.getDefaultProfileData();
        }

        return {
            user: {
                user_id: profileData.user.user_id,
                email: profileData.user.email,
                role_id: profileData.user.role_id
            },
            role: {
                role_id: profileData.role.role_id,
                role_name: profileData.role.role_name
            },
            profile: {
                displayName: profileData.profile?.displayName || this.extractNameFromEmail(profileData.user.email),
                avatar: profileData.profile?.avatar || this.getAvatarForRole(profileData.role.role_name),
                isAdmin: profileData.profile?.isAdmin || false,
                applicationCount: profileData.profile?.applicationCount || 0
            }
        };
    }

    /**
     * Formatea los datos del usuario para mostrar en el PersonalInfoSection
     * @param {Object} profileData - Datos del perfil del servicio
     * @returns {Object} - Datos formateados para información personal
     */
    static formatProfileForPersonalInfo(profileData) {
        if (!profileData || !profileData.user) {
            return this.getDefaultPersonalInfo();
        }

        return {
            fullName: profileData.profile?.displayName || this.extractNameFromEmail(profileData.user.email),
            email: profileData.user.email,
            phone: profileData.profile?.phone || 'No especificado',
            department: profileData.role?.role_name || 'Sin asignar'
        };
    }

    /**
     * Formatea los datos para la sección de roles y permisos
     * @param {Object} profileData - Datos del perfil del servicio
     * @returns {Object} - Datos formateados para roles y permisos
     */
    static formatProfileForRolePermissions(profileData) {
        if (!profileData || !profileData.role) {
            return this.getDefaultRolePermissions();
        }

        const roleName = profileData.role.role_name;
        const isAdmin = profileData.profile?.isAdmin || false;

        return {
            accessLevel: {
                title: roleName,
                badgeColor: this.getRoleBadgeColor(roleName, isAdmin)
            },
            permissions: this.getPermissionsForRole(roleName, isAdmin)
        };
    }

    /**
     * Extrae el nombre de usuario del email
     * @param {string} email - Email del usuario
     * @returns {string} - Nombre formateado
     */
    static extractNameFromEmail(email) {
        if (!email || typeof email !== 'string') return 'Usuario';
        
        try {
            const emailPart = email.split('@')[0];
            return emailPart
                .replace(/[._-]/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        } catch (error) {
            console.error('Error extrayendo nombre del email:', error);
            return 'Usuario';
        }
    }

    /**
     * Obtiene el avatar apropiado según el rol
     * @param {string} roleName - Nombre del rol
     * @returns {string} - Emoji del avatar
     */
    static getAvatarForRole(roleName) {
        if (!roleName) return '👨‍💻';
        
        const roleNameLower = roleName.toLowerCase();
        
        if (roleNameLower.includes('admin')) return '👨‍💼';
        if (roleNameLower.includes('supervisor')) return '👨‍🔧';
        if (roleNameLower.includes('cliente') || roleNameLower.includes('client')) return '👤';
        
        return '👨‍💻';
    }

    /**
     * Obtiene el color del badge según el rol
     * @param {string} roleName - Nombre del rol
     * @param {boolean} isAdmin - Si es administrador
     * @returns {string} - Clases CSS para el color
     */
    static getRoleBadgeColor(roleName, isAdmin = false) {
        if (!roleName) return 'bg-gray-100 text-gray-800';
        
        const roleNameLower = roleName.toLowerCase();
        
        if (isAdmin || roleNameLower.includes('admin')) {
            return 'bg-red-100 text-red-800';
        } else if (roleNameLower.includes('supervisor')) {
            return 'bg-blue-100 text-blue-800';
        } else if (roleNameLower.includes('cliente')) {
            return 'bg-green-100 text-green-800';
        }
        
        return 'bg-gray-100 text-gray-800';
    }

    /**
     * Obtiene los permisos según el rol
     * @param {string} roleName - Nombre del rol
     * @param {boolean} isAdmin - Si es administrador
     * @returns {Array} - Array de permisos
     */
    static getPermissionsForRole(roleName, isAdmin = false) {
        if (!roleName) return [];
        
        const roleNameLower = roleName.toLowerCase();
        
        if (isAdmin || roleNameLower.includes('admin')) {
            return [
                {
                    id: 'payment-methods',
                    icon: '💳',
                    title: 'Gestión de Métodos de Pago',
                    iconBgColor: 'bg-blue-100'
                },
                {
                    id: 'app-admin',
                    icon: '📱',
                    title: 'Administración de Aplicaciones',
                    iconBgColor: 'bg-green-100'
                },
                {
                    id: 'user-permissions',
                    icon: '👥',
                    title: 'Asignación de Permisos de Usuario',
                    iconBgColor: 'bg-purple-100'
                },
                {
                    id: 'system-config',
                    icon: '⚙️',
                    title: 'Configuración del Sistema',
                    iconBgColor: 'bg-orange-100'
                }
            ];
        } else if (roleNameLower.includes('supervisor')) {
            return [
                {
                    id: 'view-reports',
                    icon: '📊',
                    title: 'Ver Reportes y Estadísticas',
                    iconBgColor: 'bg-blue-100'
                },
                {
                    id: 'manage-transactions',
                    icon: '💰',
                    title: 'Gestionar Transacciones',
                    iconBgColor: 'bg-green-100'
                },
                {
                    id: 'user-support',
                    icon: '🛠️',
                    title: 'Soporte a Usuarios',
                    iconBgColor: 'bg-yellow-100'
                }
            ];
        } else if (roleNameLower.includes('cliente')) {
            return [
                {
                    id: 'view-transactions',
                    icon: '👀',
                    title: 'Ver Mis Transacciones',
                    iconBgColor: 'bg-blue-100'
                },
                {
                    id: 'payment-methods',
                    icon: '💳',
                    title: 'Gestionar Mis Métodos de Pago',
                    iconBgColor: 'bg-green-100'
                }
            ];
        }
        
        return [
            {
                id: 'basic-access',
                icon: '🔑',
                title: 'Acceso Básico al Sistema',
                iconBgColor: 'bg-gray-100'
            }
        ];
    }

    /**
     * Valida si un email es válido
     * @param {string} email - Email a validar
     * @returns {boolean} - Si es válido
     */
    static isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    /**
     * Valida los datos de perfil antes de actualizar
     * @param {Object} profileData - Datos a validar
     * @returns {Object} - Resultado de la validación
     */
    static validateProfileData(profileData) {
        const errors = [];
        
        if (profileData.email && !this.isValidEmail(profileData.email)) {
            errors.push('El formato del email es inválido');
        }
        
        if (profileData.role_id && (isNaN(profileData.role_id) || profileData.role_id <= 0)) {
            errors.push('El ID del rol debe ser un número válido');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            cleanData: {
                email: profileData.email?.trim(),
                role_id: profileData.role_id ? parseInt(profileData.role_id) : undefined
            }
        };
    }

    /**
     * Genera colores de tema según el rol
     * @param {string} roleName - Nombre del rol
     * @returns {Object} - Colores del tema
     */
    static getThemeColorsForRole(roleName) {
        if (!roleName) return this.getDefaultThemeColors();
        
        const roleNameLower = roleName.toLowerCase();
        
        if (roleNameLower.includes('admin')) {
            return {
                bgColor: 'bg-red-600',
                avatarBgColor: 'bg-red-500',
                primary: 'red'
            };
        } else if (roleNameLower.includes('supervisor')) {
            return {
                bgColor: 'bg-blue-600',
                avatarBgColor: 'bg-blue-500',
                primary: 'blue'
            };
        } else if (roleNameLower.includes('cliente')) {
            return {
                bgColor: 'bg-green-600',
                avatarBgColor: 'bg-green-500',
                primary: 'green'
            };
        }
        
        return this.getDefaultThemeColors();
    }

    /**
     * Obtiene configuración de seguridad según el rol
     * @param {string} roleName - Nombre del rol
     * @returns {Array} - Configuraciones de seguridad disponibles
     */
    static getSecuritySettingsForRole(roleName) {
        const baseSettings = [
            {
                id: 'password',
                title: 'Contraseña',
                description: 'Cambiar contraseña de acceso',
                buttonText: 'Cambiar',
                available: true
            }
        ];
        
        if (!roleName) return baseSettings;
        
        const roleNameLower = roleName.toLowerCase();
        
        if (roleNameLower.includes('admin') || roleNameLower.includes('supervisor')) {
            baseSettings.push({
                id: 'recovery',
                title: 'Recuperación de Contraseña',
                description: 'Configurar métodos de recuperación',
                buttonText: 'Configurar',
                available: true
            });
            
            baseSettings.push({
                id: 'two-factor',
                title: 'Autenticación de Dos Factores',
                description: 'Protección adicional para acceso',
                buttonText: 'Activar',
                available: true
            });
        }
        
        return baseSettings;
    }

    // ==========================================
    // MÉTODOS PRIVADOS DE DATOS POR DEFECTO
    // ==========================================

    /**
     * Obtiene datos de perfil por defecto
     * @returns {Object} - Datos por defecto
     * @private
     */
    static getDefaultProfileData() {
        return {
            user: {
                user_id: 0,
                email: 'usuario@sistema.com',
                role_id: 0
            },
            role: {
                role_id: 0,
                role_name: 'Usuario'
            },
            profile: {
                displayName: 'Usuario',
                avatar: '👨‍💻',
                isAdmin: false,
                applicationCount: 0
            }
        };
    }

    /**
     * Obtiene información personal por defecto
     * @returns {Object} - Información personal por defecto
     * @private
     */
    static getDefaultPersonalInfo() {
        return {
            fullName: 'Usuario del Sistema',
            email: 'usuario@sistema.com',
            phone: 'No especificado',
            department: 'Sin asignar'
        };
    }

    /**
     * Obtiene roles y permisos por defecto
     * @returns {Object} - Roles y permisos por defecto
     * @private
     */
    static getDefaultRolePermissions() {
        return {
            accessLevel: {
                title: 'Usuario',
                badgeColor: 'bg-gray-100 text-gray-800'
            },
            permissions: [
                {
                    id: 'basic-access',
                    icon: '🔑',
                    title: 'Acceso Básico al Sistema',
                    iconBgColor: 'bg-gray-100'
                }
            ]
        };
    }

    /**
     * Obtiene colores de tema por defecto
     * @returns {Object} - Colores por defecto
     * @private
     */
    static getDefaultThemeColors() {
        return {
            bgColor: 'bg-gray-600',
            avatarBgColor: 'bg-gray-500',
            primary: 'gray'
        };
    }
}