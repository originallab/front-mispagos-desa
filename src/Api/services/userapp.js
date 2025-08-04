import axios from 'axios';

const baseUrl = '/user_app'; // Ajusta si tu backend tiene prefijo (ej. /api/user_app)

export const UserAppService = {
  getAll,
  getById,
  create,
  update,
  remove,
  count
};

/**
 * Obtener todos los registros de user_app
 */
function getAll() {
  return axios.get(baseUrl);
}

/**
 * Obtener un registro por ID
 */
function getById(user_app_id) {
  return axios.get(`${baseUrl}/${user_app_id}`);
}

/**
 * Crear un nuevo registro
 */
function create(data) {
  return axios.post(baseUrl, data);
}

/**
 * Actualizar un registro existente
 */
function update(user_app_id, data) {
  return axios.put(`${baseUrl}/${user_app_id}`, data);
}

/**
 * Eliminar un registro por ID
 */
function remove(user_app_id) {
  return axios.delete(`${baseUrl}/${user_app_id}`);
}

/**
 * Contar cuántos registros hay
 * (Dependerá de que tu backend tenga una ruta como /user_app/count)
 */
function count() {
  return axios.get(`${baseUrl}/count`);
}
