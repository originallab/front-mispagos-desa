import { TransactionService } from '../services/TransactionService';

/**
 * Utilidades para procesar y manipular datos de transacciones
 * Funciones de apoyo para componentes y análisis de datos
 */
export const TransactionUtils = {

    // ==========================================
    // FUNCIONES DE OBTENCIÓN DE DATOS
    // ==========================================

    /**
     * Obtiene todas las transacciones con manejo de errores
     * @returns {Array} - Array de transacciones o array vacío si hay error
     */
    async getAllTransactions() {
        try {
            const result = await TransactionService.getTransactionsForTable();
            return result.success ? result.data : [];
        } catch (error) {
            console.error('Error en TransactionUtils.getAllTransactions:', error);
            return [];
        }
    },

    /**
     * Obtiene una transacción por ID con manejo de errores
     * @param {number} transactionId - ID de la transacción
     * @returns {Object|null} - Transacción o null si no existe
     */
    async getTransactionById(transactionId) {
        try {
            const result = await TransactionService.getById(transactionId);
            return result.success ? result.data : null;
        } catch (error) {
            console.error(`Error en TransactionUtils.getTransactionById(${transactionId}):`, error);
            return null;
        }
    },

    /**
     * Obtiene transacciones de una aplicación específica
     * @param {number} appId - ID de la aplicación
     * @returns {Array} - Array de transacciones de la aplicación
     */
    async getTransactionsByApp(appId) {
        try {
            const result = await TransactionService.getByAppId(appId);
            return result.success ? result.data : [];
        } catch (error) {
            console.error(`Error en TransactionUtils.getTransactionsByApp(${appId}):`, error);
            return [];
        }
    },

    /**
     * Obtiene transacciones por estado
     * @param {string} status - Estado de las transacciones
     * @returns {Array} - Array de transacciones con el estado especificado
     */
    async getTransactionsByStatus(status) {
        try {
            const result = await TransactionService.getByStatus(status);
            return result.success ? result.data : [];
        } catch (error) {
            console.error(`Error en TransactionUtils.getTransactionsByStatus(${status}):`, error);
            return [];
        }
    },

    // ==========================================
    // FUNCIONES DE UTILIDAD PARA FECHAS
    // ==========================================

    /**
     * Obtiene la fecha de una transacción usando el campo correcto
     * @param {Object} transaction - Transacción
     * @returns {Date|null} - Fecha de la transacción o null si no existe
     */
    getTransactionDate(transaction) {
        if (!transaction) return null;
        
        const dateField = transaction.transaction_date || transaction.created_at || transaction.createdAt;
        if (!dateField) return null;
        
        const date = new Date(dateField);
        return isNaN(date.getTime()) ? null : date;
    },

    /**
     * Verifica si una transacción es válida
     * @param {Object} transaction - Transacción a validar
     * @returns {boolean} - true si es válida
     */
    isValidTransaction(transaction) {
        if (!transaction) return false;
        
        // Debe tener ID
        if (!transaction.id && !transaction.transaction_id) return false;
        
        // Debe tener fecha válida
        const transactionDate = this.getTransactionDate(transaction);
        if (!transactionDate) return false;
        
        // Debe tener monto válido
        const amount = parseFloat(transaction.amount);
        if (isNaN(amount) || amount < 0) return false;
        
        return true;
    },

    // ==========================================
    // FUNCIONES DE FILTRADO Y BÚSQUEDA
    // ==========================================

    /**
     * Filtra transacciones por múltiples criterios
     * @param {Array} transactions - Array de transacciones
     * @param {Object} filters - Filtros a aplicar
     * @returns {Array} - Transacciones filtradas
     */
    filterTransactions(transactions, filters) {
        if (!Array.isArray(transactions)) {
            console.warn('TransactionUtils.filterTransactions: transactions debe ser un array');
            return [];
        }

        let filtered = [...transactions];

        // Filtro por estado
        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(transaction => 
                transaction.status.toLowerCase() === filters.status.toLowerCase()
            );
        }

        // Filtro por aplicación
        if (filters.app_id && filters.app_id !== 'all') {
            filtered = filtered.filter(transaction => 
                transaction.app_id === parseInt(filters.app_id)
            );
        }

        // Filtro por usuario
        if (filters.user_id && filters.user_id !== 'all') {
            filtered = filtered.filter(transaction => 
                transaction.user_id === parseInt(filters.user_id)
            );
        }

        // Filtro por método de pago
        if (filters.method_id && filters.method_id !== 'all') {
            filtered = filtered.filter(transaction => 
                transaction.method_id === parseInt(filters.method_id)
            );
        }

        // Filtro por rango de fechas
        if (filters.start_date && filters.end_date) {
            const startDate = new Date(filters.start_date);
            const endDate = new Date(filters.end_date);
            
            filtered = filtered.filter(transaction => {
                const transactionDate = this.getTransactionDate(transaction);
                if (!transactionDate) return false;
                return transactionDate >= startDate && transactionDate <= endDate;
            });
        }

        // Filtro por rango de montos
        if (filters.min_amount !== undefined && filters.min_amount !== '') {
            filtered = filtered.filter(transaction => 
                parseFloat(transaction.amount) >= parseFloat(filters.min_amount)
            );
        }

        if (filters.max_amount !== undefined && filters.max_amount !== '') {
            filtered = filtered.filter(transaction => 
                parseFloat(transaction.amount) <= parseFloat(filters.max_amount)
            );
        }

        // Filtro por moneda
        if (filters.currency && filters.currency !== 'all') {
            filtered = filtered.filter(transaction => 
                transaction.currency === filters.currency
            );
        }

        // Filtro por texto de búsqueda
        if (filters.search && filters.search.trim().length > 0) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(transaction => 
                transaction.reference.toLowerCase().includes(searchTerm) ||
                (transaction.externalReference && 
                 transaction.externalReference.toLowerCase().includes(searchTerm)) ||
                (transaction.description && 
                 transaction.description.toLowerCase().includes(searchTerm))
            );
        }

        return filtered;
    },

    /**
     * Busca transacciones por referencia (interna o externa)
     * @param {Array} transactions - Array de transacciones
     * @param {string} reference - Referencia a buscar
     * @returns {Array} - Transacciones que coinciden con la referencia
     */
    searchByReference(transactions, reference) {
        if (!Array.isArray(transactions) || !reference) {
            return [];
        }

        const searchTerm = reference.toLowerCase();
        return transactions.filter(transaction => 
            transaction.reference.toLowerCase().includes(searchTerm) ||
            (transaction.externalReference && 
             transaction.externalReference.toLowerCase().includes(searchTerm))
        );
    },

    // ==========================================
    // FUNCIONES DE ORDENAMIENTO
    // ==========================================

    /**
     * Ordena transacciones por diferentes criterios
     * @param {Array} transactions - Array de transacciones
     * @param {string} sortBy - Campo por el que ordenar
     * @param {string} order - 'asc' o 'desc'
     * @returns {Array} - Transacciones ordenadas
     */
    sortTransactions(transactions, sortBy = 'transaction_date', order = 'desc') {
        if (!Array.isArray(transactions)) {
            return [];
        }

        const sorted = [...transactions];

        sorted.sort((a, b) => {
            let valueA, valueB;

            switch (sortBy) {
                case 'amount':
                    valueA = parseFloat(a.amount);
                    valueB = parseFloat(b.amount);
                    break;
                case 'createdAt':
                case 'created_at':
                case 'transaction_date':
                    valueA = this.getTransactionDate(a);
                    valueB = this.getTransactionDate(b);
                    
                    // Si alguna fecha es null, ponerla al final
                    if (!valueA && !valueB) return 0;
                    if (!valueA) return 1;
                    if (!valueB) return -1;
                    break;
                case 'status':
                    valueA = a.status.toLowerCase();
                    valueB = b.status.toLowerCase();
                    break;
                case 'reference':
                    valueA = a.reference.toLowerCase();
                    valueB = b.reference.toLowerCase();
                    break;
                case 'app_id':
                    valueA = a.app_id;
                    valueB = b.app_id;
                    break;
                default:
                    valueA = a[sortBy];
                    valueB = b[sortBy];
            }

            if (order === 'asc') {
                return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            } else {
                return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
            }
        });

        return sorted;
    },

    /**
     * Ordena transacciones por fecha (más recientes primero)
     * @param {Array} transactions - Array de transacciones
     * @returns {Array} - Transacciones ordenadas por fecha
     */
    sortByDateDesc(transactions) {
        return this.sortTransactions(transactions, 'transaction_date', 'desc');
    },

    // ==========================================
    // FUNCIONES DE AGRUPACIÓN
    // ==========================================

    /**
     * Agrupa transacciones por estado
     * @param {Array} transactions - Array de transacciones
     * @returns {Object} - Transacciones agrupadas por estado
     */
    groupByStatus(transactions) {
        if (!Array.isArray(transactions)) {
            return {};
        }

        return transactions.reduce((groups, transaction) => {
            const status = transaction.status;
            if (!groups[status]) {
                groups[status] = [];
            }
            groups[status].push(transaction);
            return groups;
        }, {});
    },

    /**
     * Agrupa transacciones por aplicación
     * @param {Array} transactions - Array de transacciones
     * @returns {Object} - Transacciones agrupadas por app_id
     */
    groupByApp(transactions) {
        if (!Array.isArray(transactions)) {
            return {};
        }

        return transactions.reduce((groups, transaction) => {
            const appId = transaction.app_id || 'sin_app';
            if (!groups[appId]) {
                groups[appId] = [];
            }
            groups[appId].push(transaction);
            return groups;
        }, {});
    },

    /**
     * Agrupa transacciones por fecha (día)
     * @param {Array} transactions - Array de transacciones
     * @returns {Object} - Transacciones agrupadas por fecha
     */
    groupByDate(transactions) {
        if (!Array.isArray(transactions)) {
            return {};
        }

        return transactions.reduce((groups, transaction) => {
            const transactionDate = this.getTransactionDate(transaction);
            
            if (!transactionDate) {
                console.warn('Transacción sin campo de fecha válido:', transaction);
                return groups;
            }
            
            const dateKey = transactionDate.toISOString().split('T')[0]; // YYYY-MM-DD
            
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(transaction);
            return groups;
        }, {});
    },

    /**
     * Agrupa transacciones por método de pago
     * @param {Array} transactions - Array de transacciones
     * @returns {Object} - Transacciones agrupadas por method_id
     */
    groupByMethod(transactions) {
        if (!Array.isArray(transactions)) {
            return {};
        }

        return transactions.reduce((groups, transaction) => {
            const methodId = transaction.method_id || 'sin_metodo';
            if (!groups[methodId]) {
                groups[methodId] = [];
            }
            groups[methodId].push(transaction);
            return groups;
        }, {});
    },

    // ==========================================
    // FUNCIONES DE CÁLCULOS Y ESTADÍSTICAS
    // ==========================================

    /**
     * Calcula estadísticas básicas de un array de transacciones
     * @param {Array} transactions - Array de transacciones
     * @returns {Object} - Estadísticas calculadas
     */
    calculateBasicStats(transactions) {
        if (!Array.isArray(transactions) || transactions.length === 0) {
            return {
                count: 0,
                totalAmount: 0,
                averageAmount: 0,
                minAmount: 0,
                maxAmount: 0,
                uniqueApps: 0,
                uniqueUsers: 0,
                successfulCount: 0,
                pendingCount: 0,
                failedCount: 0,
                successRate: 0
            };
        }

        const amounts = transactions.map(t => parseFloat(t.amount || 0));
        const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
        const averageAmount = totalAmount / transactions.length;

        const statuses = transactions.map(t => t.status.toLowerCase());
        const successfulStatuses = ['completed', 'success', 'approved'];
        const failedStatuses = ['failed', 'error', 'rejected', 'cancelled'];

        const successfulCount = statuses.filter(status => 
            successfulStatuses.includes(status)
        ).length;

        const pendingCount = statuses.filter(status => 
            status === 'pending'
        ).length;

        const failedCount = statuses.filter(status => 
            failedStatuses.includes(status)
        ).length;

        const uniqueApps = new Set(transactions.map(t => t.app_id)).size;
        const uniqueUsers = new Set(
            transactions.filter(t => t.user_id).map(t => t.user_id)
        ).size;

        return {
            count: transactions.length,
            totalAmount: parseFloat(totalAmount.toFixed(2)),
            averageAmount: parseFloat(averageAmount.toFixed(2)),
            minAmount: Math.min(...amounts),
            maxAmount: Math.max(...amounts),
            uniqueApps: uniqueApps,
            uniqueUsers: uniqueUsers,
            successfulCount: successfulCount,
            pendingCount: pendingCount,
            failedCount: failedCount,
            successRate: transactions.length > 0 ? 
                parseFloat(((successfulCount / transactions.length) * 100).toFixed(2)) : 0
        };
    },

    // ==========================================
    // FUNCIONES DE FORMATEO
    // ==========================================

    /**
     * Formatea el monto de una transacción
     * @param {number|string} amount - Monto a formatear
     * @param {string} currency - Moneda
     * @returns {string} - Monto formateado
     */
    formatAmount(amount, currency = 'USD') {
        const numAmount = parseFloat(amount || 0);
        
        const currencyFormats = {
            'USD': { locale: 'en-US', symbol: '$' },
            'EUR': { locale: 'de-DE', symbol: '€' },
            'MXN': { locale: 'es-MX', symbol: '$' },
            'ARS': { locale: 'es-AR', symbol: '$' },
            'BRL': { locale: 'pt-BR', symbol: 'R$' }
        };

        const format = currencyFormats[currency] || currencyFormats['USD'];

        try {
            return new Intl.NumberFormat(format.locale, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(numAmount);
        } catch (error) {
            // Fallback si hay error con la localización
            return `${format.symbol}${numAmount.toFixed(2)}`;
        }
    },

    /**
     * Formatea una fecha de transacción
     * @param {string|Date} date - Fecha a formatear
     * @param {string} format - Formato deseado ('short', 'long', 'relative')
     * @returns {string} - Fecha formateada
     */
    formatDate(date, format = 'short') {
        if (!date) return 'N/A';

        const transactionDate = new Date(date);
        if (isNaN(transactionDate.getTime())) return 'Fecha inválida';

        switch (format) {
            case 'short':
                return transactionDate.toLocaleDateString();
            case 'long':
                return transactionDate.toLocaleString();
            case 'relative':
                return this.getRelativeTime(transactionDate);
            case 'iso':
                return transactionDate.toISOString();
            default:
                return transactionDate.toLocaleDateString();
        }
    },

    /**
     * Obtiene el tiempo relativo de una fecha
     * @param {Date} date - Fecha
     * @returns {string} - Tiempo relativo
     */
    getRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) {
            return 'Hace un momento';
        } else if (diffMinutes < 60) {
            return `Hace ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
        } else if (diffHours < 24) {
            return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
        } else if (diffDays < 7) {
            return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
        } else {
            return date.toLocaleDateString();
        }
    },

    /**
     * Obtiene el estado visual de una transacción
     * @param {string} status - Estado de la transacción
     * @returns {Object} - Información visual del estado
     */
    getStatusDisplay(status) {
        const statusLower = (status || '').toLowerCase();
        
        const statusMap = {
            'pending': {
                text: 'Pendiente',
                color: 'yellow',
                bgClass: 'bg-yellow-100',
                textClass: 'text-yellow-800',
                badgeClass: 'bg-yellow-100 text-yellow-800',
                icon: '⏳',
                priority: 1
            },
            'processing': {
                text: 'Procesando',
                color: 'blue',
                bgClass: 'bg-blue-100',
                textClass: 'text-blue-800',
                badgeClass: 'bg-blue-100 text-blue-800',
                icon: '⚡',
                priority: 2
            },
            'completed': {
                text: 'Completada',
                color: 'green',
                bgClass: 'bg-green-100',
                textClass: 'text-green-800',
                badgeClass: 'bg-green-100 text-green-800',
                icon: '✅',
                priority: 3
            },
            'success': {
                text: 'Exitosa',
                color: 'green',
                bgClass: 'bg-green-100',
                textClass: 'text-green-800',
                badgeClass: 'bg-green-100 text-green-800',
                icon: '✅',
                priority: 3
            },
            'approved': {
                text: 'Aprobada',
                color: 'green',
                bgClass: 'bg-green-100',
                textClass: 'text-green-800',
                badgeClass: 'bg-green-100 text-green-800',
                icon: '✅',
                priority: 3
            },
            'failed': {
                text: 'Fallida',
                color: 'red',
                bgClass: 'bg-red-100',
                textClass: 'text-red-800',
                badgeClass: 'bg-red-100 text-red-800',
                icon: '❌',
                priority: 4
            },
            'error': {
                text: 'Error',
                color: 'red',
                bgClass: 'bg-red-100',
                textClass: 'text-red-800',
                badgeClass: 'bg-red-100 text-red-800',
                icon: '❌',
                priority: 4
            },
            'rejected': {
                text: 'Rechazada',
                color: 'red',
                bgClass: 'bg-red-100',
                textClass: 'text-red-800',
                badgeClass: 'bg-red-100 text-red-800',
                icon: '❌',
                priority: 4
            },
            'cancelled': {
                text: 'Cancelada',
                color: 'gray',
                bgClass: 'bg-gray-100',
                textClass: 'text-gray-800',
                badgeClass: 'bg-gray-100 text-gray-800',
                icon: '🚫',
                priority: 5
            }
        };

        return statusMap[statusLower] || {
            text: 'Desconocido',
            color: 'gray',
            bgClass: 'bg-gray-100',
            textClass: 'text-gray-800',
            badgeClass: 'bg-gray-100 text-gray-800',
            icon: '❓',
            priority: 999
        };
    }
};