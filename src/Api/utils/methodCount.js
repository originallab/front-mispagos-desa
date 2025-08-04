import { Methods } from '../services/method';
import { UserAppService } from '../services/userapp';

/**
 * Utilidades para contar métodos de pago y otras entidades
 */
export class MethodCounter {
    
    /**
     * Cuenta cuántos métodos de pago existen
     * @returns {Promise<number>} - Total de métodos de pago
     */
    static async countAllMethods() {
        try {
            const result = await Methods.getAllRecords('method', null);
            return result.records.length;
        } catch (error) {
            console.error('Error al contar métodos de pago:', error);
            throw new Error('No se pudo obtener el conteo de métodos de pago');
        }
    }

    /**
     * Cuenta cuántas aplicaciones activas hay
     * @returns {Promise<number>} - Total de aplicaciones activas
     */
    static async countActiveApps() {
        try {
            const result = await Methods.getAllRecords('app', { activo: true });
            return result.records.length;
        } catch (error) {
            console.error('Error al contar aplicaciones activas:', error);
            throw new Error('No se pudo obtener el conteo de aplicaciones activas');
        }
    }
   /**
     * Cuenta cuántos usuarios registrados existen
     * @returns {Promise<number>}
     */
   static async countRegisteredUsers() {
    try {
        const result = await Methods.getAllRecords('user', null);
        return result.records.length;
    } catch (error) {
        console.error('Error al contar usuarios registrados:', error);
        throw new Error('No se pudo obtener el conteo de usuarios registrados');
    }
}



/**
     * Cuenta cuántos métodos de pago tiene una app específica
     * @param {number} appId - ID de la aplicación
     * @returns {Promise<number>}
     */
static async countMethodsByApp(appId) {
    try {
        const response = await UserAppService.countByAppId(appId); // Llama al servicio que consulta el backend
        return response.data.total;
    } catch (error) {
        console.error(`Error al contar métodos de la app ${appId}:`, error);
        throw new Error('No se pudo contar los métodos de pago por app');
    }
}
}

