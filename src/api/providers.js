import axios from 'axios';
import { setupAuthInterceptor } from '../utils/axiosInterceptors'; // Yeni import

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const providersApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor'ları setupAuthInterceptor utility'si ile ekle
setupAuthInterceptor(providersApi);

/**
 * Tüm hosting sağlayıcılarını getirir (Pagination, Filtering, Sorting destekli).
 * @param {object} params - Filtreleme, sıralama ve sayfalama parametreleri.
 * @param {string} [params.name] - Sağlayıcı adına göre arama terimi.
 * @param {string} [params.sort_by='name'] - Sıralanacak sütun (örn: 'name', 'average_rating', 'created_at', 'updated_at').
 * @param {string} [params.sort_order='asc'] - Sıralama düzeni ('asc' veya 'desc').
 * @param {number} [params.page=1] - Geçerli sayfa numarası.
 * @param {number} [params.per_page=10] - Sayfa başına kayıt sayısı.
 * @returns {Promise<object>} Sağlayıcı listesi ve sayfalama bilgileri.
 */
export const getAllProviders = async (params = {}) => {
    try {
        const response = await providersApi.get('/providers', { params });
        // Laravel paginate() kullandığı için response.data doğrudan pagination objesi olabilir
        return response.data; // data, meta, links objelerini içerecek
    } catch (error) {
        console.error('Sağlayıcılar getirilirken hata:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Belirli bir hosting sağlayıcısını ID'ye göre getirir.
 * @param {string|number} providerId - Sağlayıcı ID'si
 * @returns {Promise<object>} Sağlayıcı bilgileri
 */
export const getProviderById = async (providerId) => {
    try {
        const response = await providersApi.get(`/providers/${providerId}`);
        return response.data.data;
    } catch (error) {
        console.error(`Sağlayıcı ID ${providerId} getirilirken hata:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Bir sağlayıcıya ait planları getirir.
 * @param {string|number} providerId - Sağlayıcı ID'si
 * @returns {Promise<Array>} Sağlayıcıya ait plan listesi
 */
export const getProviderPlans = async (providerId) => {
    try {
        const response = await providersApi.get(`/providers/${providerId}/plans`);
        return response.data.data;
    } catch (error) {
        console.error(`Sağlayıcı ID ${providerId} için planlar getirilirken hata:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Bir sağlayıcıya ait yorumları getirir.
 * @param {string|number} providerId - Sağlayıcı ID'si
 * @returns {Promise<Array>} Sağlayıcı yorumları listesi
 */
export const getProviderReviews = async (providerId) => {
    try {
        const response = await providersApi.get(`/providers/${providerId}/reviews`);
        return response.data.data;
    } catch (error) {
        console.error(`Sağlayıcı ID ${providerId} için yorumlar getirilirken hata:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Yeni bir hosting sağlayıcısı oluşturur (Admin yetkisi gereklidir).
 * @param {object} providerData - Yeni sağlayıcı bilgileri
 * @returns {Promise<object>} Oluşturulan sağlayıcı
 */
export const createProvider = async (providerData) => {
    try {
        const response = await providersApi.post('/providers', providerData);
        return response.data.data;
    } catch (error) {
        console.error('Sağlayıcı oluşturulurken hata:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Bir hosting sağlayıcısını günceller (Admin yetkisi gereklidir).
 * @param {string|number} providerId - Güncellenecek sağlayıcı ID'si
 * @param {object} updatedData - Güncellenecek sağlayıcı bilgileri
 * @returns {Promise<object>} Güncellenen sağlayıcı
 */
export const updateProvider = async (providerId, updatedData) => {
    try {
        const response = await providersApi.put(`/providers/${providerId}`, updatedData);
        return response.data.data;
    } catch (error) {
        console.error(`Sağlayıcı ID ${providerId} güncellenirken hata:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Bir hosting sağlayıcısını siler (Admin yetkisi gereklidir).
 * @param {string|number} providerId - Silinecek sağlayıcı ID'si
 * @returns {Promise<void>}
 */
export const deleteProvider = async (providerId) => {
    try {
        await providersApi.delete(`/providers/${providerId}`);
    } catch (error) {
        console.error(`Sağlayıcı ID ${providerId} silinirken hata:`, error.response?.data || error.message);
        throw error;
    }
};