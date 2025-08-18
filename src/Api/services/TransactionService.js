import api from '../axios.js';
import { handleError } from '../utils/errorHandler';

/**
 * Servicio completo para la tabla transaction
 * Maneja todas las operaciones CRUD y funcionalidades específicas para transacciones
 * Versión corregida para manejar el campo transaction_date
 */
export const TransactionService = {

    /**
     * Obtiene todas las transacciones formateadas para tabla
     * @param {Object} filters - Filtros opcionales
     * @returns {Promise<Object>} - Transacciones formateadas
     */
    async getTransactionsForTable(filters = null) {
        try {
            console.log('🔄 Obteniendo transacciones para tabla...');

            const params = filters ? { filters } : {};
            const response = await api.get('/transaction/all', { params });
            
            if (!response.data || !response.data.records) {
                throw new Error('Estructura de respuesta inválida');
            }

            const transactions = response.data.records;
            const formattedTransactions = transactions.map(transaction => this.formatTransactionForTable(transaction));

            console.log(`✅ ${formattedTransactions.length} transacciones obtenidas para tabla`);
            
            return {
                success: true,
                data: formattedTransactions,
                count: formattedTransactions.length,
                message: `${formattedTransactions.length} transacciones obtenidas exitosamente`
            };
        } catch (error) {
            console.error('❌ Error en TransactionService.getTransactionsForTable:', error);
            handleError(error);
            throw new Error(`Error al obtener transacciones: ${error.message}`);
        }
    },

    /**
     * Obtiene una transacción por ID
     * @param {number} transactionId - ID de la transacción
     * @returns {Promise<Object>} - Transacción encontrada
     */
    async getById(transactionId) {
        try {
            if (!transactionId || transactionId <= 0) {
                throw new Error('ID de transacción inválido');
            }

            console.log(`🔍 Obteniendo transacción con ID: ${transactionId}`);

            const response = await api.get(`/transaction/${transactionId}`);
            
            if (!response.data || !response.data.record) {
                throw new Error('Transacción no encontrada');
            }

            const formattedTransaction = this.formatTransactionForTable(response.data.record);

            console.log(`✅ Transacción ${transactionId} obtenida: ${formattedTransaction.reference}`);

            return {
                success: true,
                data: formattedTransaction,
                message: 'Transacción obtenida exitosamente'
            };
        } catch (error) {
            console.error(`❌ Error al obtener transacción ${transactionId}:`, error);
            handleError(error);
            throw new Error(`Error al obtener transacción con ID ${transactionId}: ${error.message}`);
        }
    },

    /**
     * Crea una nueva transacción
     * @param {Object} transactionData - Datos de la transacción
     * @returns {Promise<Object>} - Transacción creada
     */
    async create(transactionData) {
        try {
            console.log('➕ Creando nueva transacción:', transactionData.description || 'Sin descripción');

            if (!transactionData || !transactionData.app_id || !transactionData.amount) {
                throw new Error('app_id y amount son requeridos');
            }

            // Generar referencia si no se proporciona
            if (!transactionData.reference) {
                transactionData.reference = this.generateTransactionReference();
                console.log(`🔑 Referencia generada automáticamente: ${transactionData.reference}`);
            }

            // Establecer estado inicial si no se proporciona
            if (!transactionData.status) {
                transactionData.status = 'pending';
                console.log(`📝 Estado inicial establecido: ${transactionData.status}`);
            }

            const cleanData = this.validateAndCleanTransactionData(transactionData);
            
            const response = await api.post('/transaction', { data: cleanData });
            
            const formattedTransaction = this.formatTransactionForTable(response.data);

            console.log(`✅ Transacción creada con ID: ${formattedTransaction.id} - Referencia: ${cleanData.reference}`);
            
            return {
                success: true,
                data: formattedTransaction,
                message: `Transacción creada exitosamente`,
                reference: cleanData.reference
            };
        } catch (error) {
            console.error('❌ Error al crear transacción:', error);
            handleError(error);
            throw new Error(`Error al crear transacción: ${error.message}`);
        }
    },

    /**
     * Actualiza completamente una transacción
     * @param {number} transactionId - ID de la transacción
     * @param {Object} transactionData - Nuevos datos
     * @returns {Promise<Object>} - Resultado de la actualización
     */
    async update(transactionId, transactionData) {
        try {
            console.log(`📝 Actualizando transacción ${transactionId}`);

            if (!transactionId || transactionId <= 0) {
                throw new Error('ID de transacción inválido');
            }

            if (!transactionData) {
                throw new Error('Datos de transacción inválidos');
            }

            // Verificar que existe
            await this.getById(transactionId);

            const cleanData = this.validateAndCleanTransactionData(transactionData);
            
            const response = await api.put(`/transaction/${transactionId}`, { data: cleanData });
            
            const formattedTransaction = this.formatTransactionForTable(response.data);

            console.log(`✅ Transacción ${transactionId} actualizada exitosamente`);
            
            return {
                success: true,
                data: formattedTransaction,
                message: `Transacción actualizada exitosamente`
            };
        } catch (error) {
            console.error(`❌ Error al actualizar transacción ${transactionId}:`, error);
            handleError(error);
            throw new Error(`Error al actualizar transacción: ${error.message}`);
        }
    },

    /**
     * Actualiza parcialmente una transacción (principalmente para cambios de estado)
     * @param {number} transactionId - ID de la transacción
     * @param {Object} partialData - Datos parciales
     * @returns {Promise<Object>} - Resultado de la actualización
     */
    async patch(transactionId, partialData) {
        try {
            console.log(`🔧 Actualizando parcialmente transacción ${transactionId}:`, Object.keys(partialData));

            if (!transactionId || transactionId <= 0) {
                throw new Error('ID de transacción inválido');
            }

            if (!partialData || Object.keys(partialData).length === 0) {
                throw new Error('No hay datos para actualizar');
            }

            // Verificar que existe
            await this.getById(transactionId);

            const cleanData = this.validateAndCleanPartialData(partialData);
            
            const response = await api.patch(`/transaction/${transactionId}`, { data: cleanData });
            
            const formattedTransaction = this.formatTransactionForTable(response.data);

            console.log(`✅ Transacción ${transactionId} actualizada parcialmente`);
            
            return {
                success: true,
                data: formattedTransaction,
                message: `Transacción actualizada exitosamente`
            };
        } catch (error) {
            console.error(`❌ Error al actualizar parcialmente transacción ${transactionId}:`, error);
            handleError(error);
            throw new Error(`Error al actualizar transacción: ${error.message}`);
        }
    },

    /**
     * Elimina una transacción
     * @param {number} transactionId - ID de la transacción a eliminar
     * @returns {Promise<Object>} - Resultado de la eliminación
     */
    async delete(transactionId) {
        try {
            console.log(`🗑️ Eliminando transacción ${transactionId}...`);

            if (!transactionId || transactionId <= 0) {
                throw new Error('ID de transacción inválido');
            }

            // Verificar que existe antes de eliminar
            const transaction = await this.getById(transactionId);
            
            const response = await api.delete(`/transaction/${transactionId}`);
            
            console.log(`✅ Transacción "${transaction.data.reference}" eliminada exitosamente`);
            
            return {
                success: true,
                data: response.data,
                message: `Transacción "${transaction.data.reference}" eliminada exitosamente`
            };
        } catch (error) {
            console.error(`❌ Error al eliminar transacción ${transactionId}:`, error);
            handleError(error);
            throw new Error(`Error al eliminar transacción: ${error.message}`);
        }
    },

    /**
     * Obtiene transacciones por ID de aplicación
     * @param {number} appId - ID de la aplicación
     * @returns {Promise<Object>} - Transacciones de la aplicación
     */
    async getByAppId(appId) {
        try {
            console.log(`🔍 Obteniendo transacciones de la aplicación ${appId}...`);

            if (!appId || appId <= 0) {
                throw new Error('ID de aplicación inválido');
            }

            const allTransactions = await this.getTransactionsForTable();
            const appTransactions = allTransactions.data.filter(transaction => 
                transaction.app_id === appId
            );

            console.log(`✅ ${appTransactions.length} transacciones encontradas para aplicación ${appId}`);

            return {
                success: true,
                data: appTransactions,
                count: appTransactions.length,
                message: `${appTransactions.length} transacciones encontradas`
            };
        } catch (error) {
            console.error(`❌ Error al obtener transacciones de la aplicación ${appId}:`, error);
            throw error;
        }
    },

    /**
     * Obtiene transacciones por estado
     * @param {string} status - Estado de las transacciones
     * @returns {Promise<Object>} - Transacciones filtradas por estado
     */
    async getByStatus(status) {
        try {
            console.log(`📊 Obteniendo transacciones con estado: ${status}`);

            if (!status || status.trim().length === 0) {
                throw new Error('Estado inválido');
            }

            const allTransactions = await this.getTransactionsForTable();
            const statusTransactions = allTransactions.data.filter(transaction => 
                transaction.status.toLowerCase() === status.toLowerCase()
            );

            console.log(`✅ ${statusTransactions.length} transacciones encontradas con estado ${status}`);

            return {
                success: true,
                data: statusTransactions,
                count: statusTransactions.length,
                message: `${statusTransactions.length} transacciones encontradas`
            };
        } catch (error) {
            console.error(`❌ Error al obtener transacciones por estado ${status}:`, error);
            throw error;
        }
    },

    /**
     * Cambia el estado de una transacción
     * @param {number} transactionId - ID de la transacción
     * @param {string} newStatus - Nuevo estado
     * @param {string} reason - Razón del cambio (opcional)
     * @returns {Promise<Object>} - Resultado del cambio
     */
    async changeStatus(transactionId, newStatus, reason = null) {
        try {
            console.log(`🔄 Cambiando estado de transacción ${transactionId} a: ${newStatus}`);
            
            const updateData = { 
                status: newStatus
            };

            if (reason) {
                updateData.status_reason = reason;
            }

            const result = await this.patch(transactionId, updateData);
            
            console.log(`✅ Estado de transacción ${transactionId} cambiado a: ${newStatus}`);
            
            return result;
        } catch (error) {
            console.error(`❌ Error al cambiar estado de transacción ${transactionId}:`, error);
            throw error;
        }
    },

    // ==========================================
    // MÉTODOS PRIVADOS DE FORMATEO Y VALIDACIÓN
    // ==========================================

    /**
     * Formatea una transacción para mostrar en tabla
     * @param {Object} transaction - Datos raw de la transacción
     * @returns {Object} - Transacción formateada
     */
    formatTransactionForTable(transaction) {
        const transactionId = transaction.transaction_id || transaction.id;
        const amount = parseFloat(transaction.amount || 0);
        const currency = transaction.currency || 'USD';
        const status = transaction.status || 'unknown';
        
        // Determinar el estado visual
        const statusInfo = this.getStatusInfo(status);
        
        // Buscar el campo de fecha correcto - CORREGIDO para transaction_date
        const transactionDate = transaction.transaction_date || transaction.created_at || transaction.createdAt;
        const updatedDate = transaction.updated_at || transaction.updatedAt;
        
        return {
            // Datos básicos
            id: transactionId,
            reference: transaction.reference || `TXN-${transactionId}`,
            externalReference: transaction.external_reference || null,
            
            // Monto y moneda
            amount: amount,
            currency: currency,
            formattedAmount: this.formatCurrency(amount, currency),
            
            // IDs relacionados
            app_id: transaction.app_id,
            user_id: transaction.user_id,
            method_id: transaction.method_id,
            
            // Estado
            status: status,
            statusText: statusInfo.text,
            statusClass: statusInfo.class,
            statusIcon: statusInfo.icon,
            
            // Descripción
            description: transaction.description || 'Sin descripción',
            
            // Fechas - usar los campos correctos de la BD
            createdAt: transactionDate,
            updatedAt: updatedDate,
            transaction_date: transactionDate, // Campo original de la BD
            processedAt: transaction.processed_at,
            
            // Datos adicionales
            metadata: transaction.metadata ? 
                (typeof transaction.metadata === 'string' ? JSON.parse(transaction.metadata) : transaction.metadata) : null,
            notes: transaction.notes,
            status_reason: transaction.status_reason,
            
            // Datos originales
            originalData: transaction
        };
    },

    /**
     * Obtiene información de estado para visualización
     * @param {string} status - Estado de la transacción
     * @returns {Object} - Información del estado
     */
    getStatusInfo(status) {
        const statusLower = status.toLowerCase();
        
        const statusMap = {
            'pending': {
                text: 'Pendiente',
                class: 'bg-yellow-100 text-yellow-800',
                icon: '⏳'
            },
            'processing': {
                text: 'Procesando',
                class: 'bg-blue-100 text-blue-800',
                icon: '⚡'
            },
            'completed': {
                text: 'Completada',
                class: 'bg-green-100 text-green-800',
                icon: '✅'
            },
            'success': {
                text: 'Exitosa',
                class: 'bg-green-100 text-green-800',
                icon: '✅'
            },
            'approved': {
                text: 'Aprobada',
                class: 'bg-green-100 text-green-800',
                icon: '✅'
            },
            'failed': {
                text: 'Fallida',
                class: 'bg-red-100 text-red-800',
                icon: '❌'
            },
            'error': {
                text: 'Error',
                class: 'bg-red-100 text-red-800',
                icon: '❌'
            },
            'rejected': {
                text: 'Rechazada',
                class: 'bg-red-100 text-red-800',
                icon: '❌'
            },
            'cancelled': {
                text: 'Cancelada',
                class: 'bg-gray-100 text-gray-800',
                icon: '🚫'
            },
            'refunded': {
                text: 'Reembolsada',
                class: 'bg-purple-100 text-purple-800',
                icon: '↩️'
            },
            'expired': {
                text: 'Expirada',
                class: 'bg-orange-100 text-orange-800',
                icon: '⏰'
            }
        };

        return statusMap[statusLower] || {
            text: 'Desconocido',
            class: 'bg-gray-100 text-gray-800',
            icon: '❓'
        };
    },

    /**
     * Formatea un monto con su moneda
     * @param {number} amount - Monto
     * @param {string} currency - Moneda
     * @returns {string} - Monto formateado
     */
    formatCurrency(amount, currency = 'USD') {
        const currencyMap = {
            'USD': { symbol: '$', locale: 'en-US' },
            'EUR': { symbol: '€', locale: 'de-DE' },
            'MXN': { symbol: '$', locale: 'es-MX' },
            'ARS': { symbol: '$', locale: 'es-AR' },
            'BRL': { symbol: 'R$', locale: 'pt-BR' }
        };

        const currencyInfo = currencyMap[currency] || currencyMap['USD'];
        
        return new Intl.NumberFormat(currencyInfo.locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },

    /**
     * Valida y limpia los datos de la transacción
     * @param {Object} transactionData - Datos a validar
     * @returns {Object} - Datos limpios
     * @private
     */
    validateAndCleanTransactionData(transactionData) {
        const cleanData = {};

        // ID de aplicación (requerido)
        if (!transactionData.app_id) {
            throw new Error('app_id es requerido');
        }
        cleanData.app_id = parseInt(transactionData.app_id);

        // Monto (requerido)
        if (!transactionData.amount || parseFloat(transactionData.amount) <= 0) {
            throw new Error('amount debe ser mayor a 0');
        }
        cleanData.amount = parseFloat(transactionData.amount).toFixed(2);

        // Moneda (opcional, default USD)
        cleanData.currency = transactionData.currency || 'USD';

        // Estado (opcional, default pending)
        cleanData.status = transactionData.status || 'pending';

        // Referencia (opcional, se genera automáticamente si no existe)
        if (transactionData.reference) {
            cleanData.reference = transactionData.reference.trim();
        }

        // Referencia externa (opcional)
        if (transactionData.external_reference) {
            cleanData.external_reference = transactionData.external_reference.trim();
        }

        // IDs opcionales
        if (transactionData.user_id) {
            cleanData.user_id = parseInt(transactionData.user_id);
        }

        if (transactionData.method_id) {
            cleanData.method_id = parseInt(transactionData.method_id);
        }

        // Descripción (opcional)
        if (transactionData.description) {
            cleanData.description = transactionData.description.trim();
        }

        // Metadatos (opcional)
        if (transactionData.metadata) {
            cleanData.metadata = typeof transactionData.metadata === 'string' ? 
                transactionData.metadata : JSON.stringify(transactionData.metadata);
        }

        // Notas (opcional)
        if (transactionData.notes) {
            cleanData.notes = transactionData.notes.trim();
        }

        // Fecha de procesamiento
        if (transactionData.processed_at) {
            cleanData.processed_at = transactionData.processed_at;
        }

        // Fecha de transacción - usar transaction_date si se proporciona
        if (transactionData.transaction_date) {
            cleanData.transaction_date = transactionData.transaction_date;
        } else if (!transactionData.created_at) {
            cleanData.transaction_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
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

        if (partialData.amount !== undefined) {
            if (parseFloat(partialData.amount) <= 0) {
                throw new Error('amount debe ser mayor a 0');
            }
            cleanData.amount = parseFloat(partialData.amount).toFixed(2);
        }

        if (partialData.currency !== undefined) {
            cleanData.currency = partialData.currency;
        }

        if (partialData.status !== undefined) {
            cleanData.status = partialData.status;
        }

        if (partialData.description !== undefined) {
            cleanData.description = partialData.description ? partialData.description.trim() : null;
        }

        if (partialData.notes !== undefined) {
            cleanData.notes = partialData.notes ? partialData.notes.trim() : null;
        }

        if (partialData.status_reason !== undefined) {
            cleanData.status_reason = partialData.status_reason ? partialData.status_reason.trim() : null;
        }

        if (partialData.processed_at !== undefined) {
            cleanData.processed_at = partialData.processed_at;
        }

        if (partialData.metadata !== undefined) {
            cleanData.metadata = partialData.metadata ? 
                (typeof partialData.metadata === 'string' ? 
                    partialData.metadata : JSON.stringify(partialData.metadata)) : null;
        }

        return cleanData;
    },

    /**
     * Genera una referencia única para la transacción
     * @returns {string} - Nueva referencia
     * @private
     */
    generateTransactionReference() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 6).toUpperCase();
        return `TXN-${timestamp}-${random}`;
    }
};