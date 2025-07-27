import axios from 'axios';
import { setupAuthInterceptor } from '../utils/axiosInterceptors'; // Yeni import

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const plansApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor'ları setupAuthInterceptor utility'si ile ekle
setupAuthInterceptor(plansApi);

/**
 * Tüm hosting planlarını getirir (Pagination, Filtering, Sorting destekli).
 * @param {object} params - Filtreleme, sıralama ve sayfalama parametreleri.
 * @param {string} [params.name] - Plan adına göre arama terimi.
 * @param {number} [params.price_min] - Minimum fiyat.
 * @param {number} [params.price_max] - Maksimum fiyat.
 * @param {string} [params.status] - Plan durumu.
 * @param {number} [params.provider_id] - Sağlayıcı ID'si.
 * @param {number} [params.category_id] - Kategori ID'si.
 * @param {string} [params.sort_by='name'] - Sıralanacak sütun (örn: 'name', 'price', 'renewal_price', 'created_at', 'updated_at').
 * @param {string} [params.sort_order='asc'] - Sıralama düzeni ('asc' veya 'desc').
 * @param {number} [params.page=1] - Geçerli sayfa numarası.
 * @param {number} [params.per_page=10] - Sayfa başına kayıt sayısı.
 * @returns {Promise<object>} Plan listesi ve sayfalama bilgileri.
 */
export const getAllPlans = async (params = {}) => {
    try {
        const response = await plansApi.get('/plans', { params });
        // Laravel paginate() kullandığı için response.data doğrudan pagination objesi olabilir
        return response.data; // data, meta, links objelerini içerecek
    } catch (error) {
        throw new Error('Planlar getirilirken hata:', error.response?.data || error.message);
    }
};

/**
 * Belirli bir hosting planını ID'ye göre getirir.
 * @param {string|number} planId - Plan ID'si
 * @returns {Promise<object>} Plan bilgileri
 */
export const getPlanById = async (planId) => {
    try {
        const response = await plansApi.get(`/plans/${planId}`);
        console.log(response.data);
        return response.data.data;
    } catch (error) {
        throw new Error(`Plan ID ${planId} getirilirken hata:`, error.response?.data || error.message);
    }
};

/**
 * Bir plana ait özellikleri getirir.
 * @param {string|number} planId - Plan ID'si
 * @returns {Promise<Array>} Plan özellikleri listesi
 */
export const getPlanFeatures = async (planId) => {
    try {
        const response = await plansApi.get(`/plans/${planId}/features`);
        return response.data;
    } catch (error) {
        throw new Error(`Plan ID ${planId} için özellikler getirilirken hata:`, error.response?.data || error.message);
    }
};

/**
 * Bir plana ait yorumları getirir.
 * @param {string|number} planId - Plan ID'si
 * @returns {Promise<Array>} Plan yorumları listesi
 */
export const getPlanReviews = async (planId) => {
    try {
        const response = await plansApi.get(`/plans/${planId}/reviews`);
        console.log(response.data);
        return response.data;
    } catch (error) {
        throw new Error(`Plan ID ${planId} için yorumlar getirilirken hata:`, error.response?.data || error.message);
    }
};

/**
 * Yeni bir hosting planı oluşturur (Admin yetkisi gereklidir).
 * @param {object} planData - Yeni plan bilgileri
 * @returns {Promise<object>} Oluşturulan plan
 */
export const createPlan = async (planData) => {
    try {
        const response = await plansApi.post('/plans', planData);
        return response.data.data;
    } catch (error) {
        throw new Error('Plan oluşturulurken hata:', error.response?.data || error.message);
    }
};

/**
 * Bir hosting planını günceller (Admin yetkisi gereklidir).
 * @param {string|number} planId - Güncellenecek plan ID'si
 * @param {object} updatedData - Güncellenecek plan bilgileri
 * @returns {Promise<object>} Güncellenen plan
 */
export const updatePlan = async (planId, updatedData) => {
    try {
        const response = await plansApi.put(`/plans/${planId}`, updatedData);
        return response.data.data;
    } catch (error) {
        throw new Error(`Plan ID ${planId} güncellenirken hata:`, error.response?.data || error.message);
    }
};

/**
 * Bir hosting planını siler (Admin yetkisi gereklidir).
 * @param {string|number} planId - Silinecek plan ID'si
 * @returns {Promise<void>}
 */
export const deletePlan = async (planId) => {
    try {
        await plansApi.delete(`/plans/${planId}`);
    } catch (error) {
        throw new Error(`Plan ID ${planId} silinirken hata:`, error.response?.data || error.message);
    }
};

/**
 * Bir planın özelliklerini senkronize eder (ekler/günceller/kaldırır).
 * @param {number} planId - Özellikleri senkronize edilecek planın ID'si
 * @param {Array<object>} features - Senkronize edilecek özelliklerin dizisi (örn: [{ feature_id: 1, value: '10 GB' }])
 * @returns {Promise<object>} Senkronizasyon yanıtı
 */
export const syncFeatures = async (planId, features) => {
    try {
        const response = await plansApi.put(`/plans/${planId}/features/sync`, { features });
        return response.data;
    } catch (error) {
        console.error(`Plan (ID: ${planId}) özellikleri senkronize edilirken hata oluştu:`, error.response?.data || error.message);
        throw error;
    }
};
