import axios from 'axios';
import { setupAuthInterceptor } from '../utils/axiosInterceptors'; // Yeni import

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const reviewsApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor'ları setupAuthInterceptor utility'si ile ekle
setupAuthInterceptor(reviewsApi);

/**
 * Tüm yorumları getirir (Admin yetkisi gereklidir).
 * @returns {Promise<Array>} Yorum listesi
 */
export const getAllReviews = async () => {
    try {
        const response = await reviewsApi.get('/reviews');
        return response.data.data;
    } catch (error) {
        console.error('Yorumlar getirilirken hata:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Yeni bir yorum oluşturur.
 * @param {object} reviewData - Yeni yorum bilgileri (title, content, rating, plan_id veya provider_id, user_id)
 * @returns {Promise<object>} Oluşturulan yorum
 */
export const createReview = async (reviewData) => {
    try {
        const response = await reviewsApi.post('/reviews', reviewData);
        return response.data.data;
    } catch (error) {
        console.error('Yorum oluşturulurken hata:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Bir yorumu günceller (Admin yetkisi gereklidir).
 * @param {string|number} reviewId - Güncellenecek yorum ID'si
 * @param {object} updatedData - Güncellenecek yorum bilgileri
 * @returns {Promise<object>} Güncellenen yorum
 */
export const updateReview = async (reviewId, updatedData) => {
    try {
        const response = await reviewsApi.put(`/reviews/${reviewId}`, updatedData);
        return response.data.data;
    } catch (error) {
        console.error(`Yorum ID ${reviewId} güncellenirken hata:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Bir yorumu siler (Admin yetkisi gereklidir).
 * @param {string|number} reviewId - Silinecek yorum ID'si
 * @returns {Promise<void>}
 */
export const deleteReview = async (reviewId) => {
    try {
        await reviewsApi.delete(`/reviews/${reviewId}`);
    } catch (error) {
        console.error(`Yorum ID ${reviewId} silinirken hata:`, error.response?.data || error.message);
        throw error;
    }
};