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
        console.error(`Plan ID ${planId} detayları getirilirken hata:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Belirli bir plana ait özellikleri listeler.
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
 * Belirli bir plana ait incelemeleri listeler.
 * @param {string|number} planId - Plan ID'si
 * @returns {Promise<object[]>} Plan incelemeleri listesi
 */
export const getPlanReviews = async (planId) => {
    try {
        const response = await plansApi.get(`/plans/${planId}/reviews`);
        return response.data.data;
    } catch (error) {
        console.error(`Plan ID ${planId} incelemeleri getirilirken hata:`, error.response?.data || error.message);
        throw error;
    }
};

// Admin işlemleri için (ileride kullanılacak)
/**
 * Yeni bir plan oluşturur (Admin yetkisi gereklidir).
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
 * Bir planı günceller (Admin yetkisi gereklidir).
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
 * Bir planı siler (Admin yetkisi gereklidir).
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

 // Admin işlemleri için (Özellikler) - Yeni eklendi
    /**
     * Tüm özellikleri getirir (Admin yetkisi gereklidir).
     * @returns {Promise<object[]>} Özellik listesi
     */
    export const getAllFeatures = async () => {
        try {
            const response = await plansApi.get('/features'); // API endpoint'i /features olarak varsayılmıştır
            return response.data.data;
        } catch (error) {
            console.error('Tüm özellikleri getirirken hata:', error.response?.data || error.message);
            throw error;
        }
    };

    /**
     * Yeni bir özellik oluşturur (Admin yetkisi gereklidir).
     * @param {object} featureData - Yeni özellik bilgileri (name, unit, type, description)
     * @returns {Promise<object>} Oluşturulan özellik
     */
    export const createFeature = async (featureData) => {
        try {
            const response = await plansApi.post('/features', featureData); // API endpoint'i /features olarak varsayılmıştır
            return response.data.data;
        } catch (error) {
            console.error('Özellik oluştururken hata:', error.response?.data || error.message);
            throw error;
        }
    };

    /**
     * Bir özelliği günceller (Admin yetkisi gereklidir).
     * @param {string|number} featureId - Güncellenecek özellik ID'si
     * @param {object} updatedData - Güncellenecek özellik bilgileri
     * @returns {Promise<object>} Güncellenen özellik
     */
    export const updateFeature = async (featureId, updatedData) => {
        try {
            const response = await plansApi.put(`/features/${featureId}`, updatedData); // API endpoint'i /features/{id} olarak varsayılmıştır
            return response.data.data;
        } catch (error) {
            console.error(`Özellik ID ${featureId} güncellenirken hata:`, error.response?.data || error.message);
            throw error;
        }
    };

    /**
     * Bir özelliği siler (Admin yetkisi gereklidir).
     * @param {string|number} featureId - Silinecek özellik ID'si
     * @returns {Promise<void>}
     */
    export const deleteFeature = async (featureId) => {
        try {
            await plansApi.delete(`/features/${featureId}`); // API endpoint'i /features/{id} olarak varsayılmıştır
        } catch (error) {
            console.error(`Özellik ID ${featureId} silinirken hata:`, error.response?.data || error.message);
            throw error;
        }
    };