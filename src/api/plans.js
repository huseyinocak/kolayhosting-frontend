import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const plansApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});
// Axios interceptor: Her istekten önce Authorization başlığını ekler
plansApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization= `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Tüm hosting planlarını getirir.
 * @returns {Promise<object[]>} Plan listesi
 */
export const getAllPlans = async () => {
    try {
        const response = await plansApi.get('/plans');
        return response.data.data; // API yanıtının yapısına göre ayarlandı
    } catch (error) {
        console.error('Tüm planları getirirken hata:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Belirli bir plana ait detayları getirir.
 * @param {string|number} planId - Plan ID'si
 * @returns {Promise<object>} Plan detayları
 */
export const getPlanById = async (planId) => {
    try {
        const response = await plansApi.get(`/plans/${planId}`);
        return response.data.data;
    } catch (error) {
        console.error(`Plan ID ${planId} getirilirken hata:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Belirli bir plana ait özellikleri getirir.
 * @param {string|number} planId - Plan ID'si
 * @returns {Promise<object[]>} Plan özellikleri listesi
 */
export const getPlanFeatures = async (planId) => {
    try {
        const response = await plansApi.get(`/plans/${planId}/features`);
        return response.data.data;
    } catch (error) {
        console.error(`Plan ID ${planId} özellikleri getirilirken hata:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Belirli bir plana ait yorumları getirir.
 * @param {string|number} planId - Plan ID'si
 * @returns {Promise<object[]>} Plan yorumları listesi
 */
export const getPlanReviews = async (planId) => {
    try {
        const response = await plansApi.get(`/plans/${planId}/reviews`);
        return response.data.data;
    } catch (error) {
        console.error(`Plan ID ${planId} yorumları getirilirken hata:`, error.response?.data || error.message);
        throw error;
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
        console.error('Plan oluşturulurken hata:', error.response?.data || error.message);
        throw error;
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
        console.error(`Plan ID ${planId} güncellenirken hata:`, error.response?.data || error.message);
        throw error;
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
        console.error(`Plan ID ${planId} silinirken hata:`, error.response?.data || error.message);
        throw error;
    }
};
// NOT: Özellik yönetimi fonksiyonları (getAllFeatures, createFeature, updateFeature, deleteFeature)
// artık bu dosyadan kaldırılmıştır ve src/api/features.js dosyasından import edilmelidir.
// Bu, kod tekrarını önler ve modül sorumluluklarını daha net hale getirir.