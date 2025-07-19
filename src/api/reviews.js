// src/api/reviews.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const reviewsApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Axios interceptor: Her istekten önce Authorization başlığını ekler
reviewsApi.interceptors.request.use(
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
 * Tüm yorumları getirir (Admin yetkisi gereklidir).
 * @returns {Promise<object[]>} Yorum listesi
 */
export const getAllReviews = async () => {
    try {
        const response = await reviewsApi.get('/reviews/all');
        return response.data.data;
    } catch (error) {
        console.error('Tüm yorumları getirirken hata:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Public kullanıcıların görebileceği onaylanmış yorumları getirir.
 * Bu metod, genel kullanıcı sayfaları için kullanılır.
 * @returns {Promise<object[]>} Onaylanmış yorum listesi
 */
export const getApprovedReviews = async () => {
    try {
        // Public kullanıcıların görebileceği onaylanmış yorumları getiren uç nokta
        const response = await reviewsApi.get('/reviews'); // Bu, public kullanıcılar için
        return response.data.data;
    } catch (error) {
        console.error('Onaylanmış yorumları getirirken hata:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Yeni bir yorum oluşturur (Kullanıcı yetkisi gereklidir).
 * @param {object} reviewData - Yeni yorum bilgileri (plan_id, user_id, title, content, rating)
 * @returns {Promise<object>} Oluşturulan yorum
 */
export const createReview = async (reviewData) => {
    try {
        const response = await reviewsApi.post('/reviews', reviewData);
        return response.data.data;
    } catch (error) {
        console.error('Yorum oluştururken hata:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Bir yorumu günceller (Admin yetkisi gereklidir).
 * @param {string|number} reviewId - Güncellenecek yorum ID'si
 * @param {object} updatedData - Güncellenecek yorum bilgileri (title, content, rating, status)
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
