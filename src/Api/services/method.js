import api from '../axios.js';
import { handleError } from '../utils/errorHandler';

export const Methods = {
    
    // Obtener todos los registros de una tabla con filtros opcionales
    async getAllRecords(tableName, filters = null) {
        try {
            const params = filters ? { filters } : {};
            const response = await api.get(`/${tableName}/all`, {
                params
            });
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    // Obtener un registro por campo personalizado
    async getRecordByField(tableName, fieldName, fieldValue) {
        try {
            const response = await api.get(`/${tableName}/field/${fieldName}/${fieldValue}`);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    // Obtener un registro por su ID (clave primaria)
    async getRecordById(tableName, recordId) {
        try {
            const response = await api.get(`/${tableName}/${recordId}`);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    // Crear un nuevo registro
    async createRecord(tableName, data) {
        try {
            const response = await api.post(`/${tableName}`, 
                { data } // Envolver los datos en el formato esperado por DynamicSchema
            );
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    // Actualizar completamente un registro (PUT)
    async updateRecord(tableName, recordId, data) {
        try {
            const response = await api.put(`/${tableName}/${recordId}`, 
                { data } // Envolver los datos en el formato esperado por DynamicSchema
            );
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    // Actualizar parcialmente un registro (PATCH)
    async patchRecord(tableName, recordId, data) {
        try {
            const response = await api.patch(`/${tableName}/${recordId}`, 
                { data } // Envolver los datos en el formato esperado por DynamicSchema
            );
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    // Eliminar un registro
    async deleteRecord(tableName, recordId) {
        try {
            const response = await api.delete(`/${tableName}/${recordId}`);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },

    // Función auxiliar para verificar el estado de salud de la API
    async healthCheck() {
        try {
            const response = await api.get('/health');
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }
};