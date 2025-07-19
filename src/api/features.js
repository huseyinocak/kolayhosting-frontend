import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const featuresApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Axios interceptor: Her istekten önce Authorization başlığını ekler
featuresApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token'); // Token'ı localStorage'dan al
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Tüm özellikleri getirir.
 * @returns {Promise<object[]>} Özellik listesi
 */
export const getAllFeatures = async () => {
    try {
        const response = await featuresApi.get('/features');
        return response.data.data; // API yanıtının yapısına göre ayarlandı
    } catch (error) {
        console.error('Tüm özellikleri getirirken hata:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Belirli bir özelliği ID'sine göre getirir.
 * @param {string|number} featureId - Özellik ID'si
 * @returns {Promise<object>} Özellik detayları
 */
export const getFeatureById = async (featureId) => {
    try {
        const response = await featuresApi.get(`/features/${featureId}`);
        return response.data.data;
    } catch (error) {
        console.error(`Özellik ID ${featureId} detayları getirilirken hata:`, error.response?.data || error.message);
        throw error;
    }
};

// Admin işlemleri için (ileride kullanılacak)
/**
 * Yeni bir özellik oluşturur (Admin yetkisi gereklidir).
 * @param {object} featureData - Yeni özellik bilgileri (name, unit, type)
 * @returns {Promise<object>} Oluşturulan özellik
 */
export const createFeature = async (featureData) => {
    try {
        const response = await featuresApi.post('/features', featureData);
        return response.data.data;
    } catch (error) {
        console.error('Özellik oluşturulurken hata:', error.response?.data || error.message);
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
        const response = await featuresApi.put(`/features/${featureId}`, updatedData);
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
        await featuresApi.delete(`/features/${featureId}`);
    } catch (error) {
        console.error(`Özellik ID ${featureId} silinirken hata:`, error.response?.data || error.message);
        throw error;
    }
};
