import axios from 'axios';
import { setupAuthInterceptor } from '../utils/axiosInterceptors'; // Interceptor utility'mizi import ediyoruz

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const adminUsersApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Admin API çağrıları için kimlik doğrulama interceptor'larını ekle
setupAuthInterceptor(adminUsersApi);

/**
 * Tüm kullanıcıları getirir (Admin yetkisi gereklidir).
 * @param {object} params - Filtreleme, sıralama ve sayfalama parametreleri.
 * @param {string} [params.search] - Kullanıcı adına veya e-postasına göre arama terimi.
 * @param {string} [params.sort_by='created_at'] - Sıralanacak sütun (örn: 'name', 'email', 'created_at').
 * @param {string} [params.sort_order='desc'] - Sıralama düzeni ('asc' veya 'desc').
 * @param {number} [params.page=1] - Geçerli sayfa numarası.
 * @param {number} [params.per_page=10] - Sayfa başına kayıt sayısı.
 * @returns {Promise<object>} Kullanıcı listesi ve sayfalama bilgileri.
 */
export const getAllUsers = async (params = {}) => {
    try {
        const response = await adminUsersApi.get('/admin/users', { params });
        // Laravel'in paginate() metodu genellikle 'data', 'meta', 'links' içeren bir obje döndürür.
        return response.data;
    } catch (error) {
        throw new Error('Kullanıcılar getirilirken hata:', error.response?.data || error.message);
    }
};

/**
 * Belirli bir kullanıcıyı ID'ye göre getirir (Admin yetkisi gereklidir).
 * @param {string|number} userId - Kullanıcı ID'si
 * @returns {Promise<object>} Kullanıcı bilgileri
 */
export const getUserById = async (userId) => {
    try {
        const response = await adminUsersApi.get(`/admin/users/${userId}`);
        return response.data.user; // Backend'den dönen yapıya göre ayarla
    } catch (error) {
        throw new Error(`Kullanıcı ID ${userId} getirilirken hata:`, error.response?.data || error.message);
    }
};

/**
 * Bir kullanıcıyı günceller (Admin yetkisi gereklidir).
 * @param {string|number} userId - Güncellenecek kullanıcı ID'si
 * @param {object} updatedData - Güncellenecek kullanıcı bilgileri (name, email, role, password, password_confirmation, avatar_url)
 * @returns {Promise<object>} Güncellenen kullanıcı bilgileri
 */
export const updateUser = async (userId, updatedData) => {
    try {
        const response = await adminUsersApi.put(`/admin/users/${userId}`, updatedData);
        return response.data.user; // Backend'den dönen yapıya göre ayarla
    } catch (error) {
        throw new Error(`Kullanıcı ID ${userId} getirilirken hata:`, error.response?.data || error.message);
    }
};

/**
 * Bir kullanıcıyı siler (Admin yetkisi gereklidir).
 * @param {string|number} userId - Silinecek kullanıcı ID'si
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
    try {
        await adminUsersApi.delete(`/admin/users/${userId}`);
    } catch (error) {
        throw new Error(`Kullanıcı ID ${userId} getirilirken hata:`, error.response?.data || error.message);
    }
};

/**
 * Yeni bir kullanıcı oluşturur (Admin yetkisi gereklidir).
 * @param {object} userData - Yeni kullanıcı bilgileri (name, email, password, password_confirmation, role, avatar_url)
 * @returns {Promise<object>} Oluşturulan kullanıcı bilgileri
 */
export const createUser = async (userData) => {
    try {
        const response = await adminUsersApi.post('/admin/users', userData);
        return response.data.user; // Backend'den dönen yapıya göre ayarla
    } catch (error) {
        throw new Error('Kullanıcı oluşturulurken hata:', error.response?.data || error.message);
    }
};