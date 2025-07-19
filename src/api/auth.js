// src/api/auth.js

import axios from 'axios';

// API'nizin temel URL'sini buraya ekleyin.
// Geliştirme ortamında genellikle .env dosyasından alınır.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'; // Varsayılan olarak Laravel'in varsayılan portu

const authApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Axios interceptor: Her istekten önce Authorization başlığını ekler
authApi.interceptors.request.use(
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
 * Kullanıcı kaydı yapar.
 * @param {object} userData - Kullanıcı bilgileri (name, email, password, password_confirmation)
 * @returns {Promise<object>} Kayıt yanıtı
 */
export const registerUser = async (userData) => {
    try {
        const response = await authApi.post('/register', userData);
        return response.data;
    } catch (error) {
        console.error('Kayıt hatası:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Kullanıcı girişi yapar.
 * @param {object} credentials - Kullanıcı kimlik bilgileri (email, password)
 * @returns {Promise<object>} Giriş yanıtı (token içerir)
 */
export const loginUser = async (credentials) => {
    try {
        const response = await authApi.post('/login', credentials);
        // Başarılı girişten sonra token'ı localStorage'a kaydet
        if (response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
        }
        return response.data;
    } catch (error) {
        console.error('Giriş hatası:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Kullanıcının oturumunu kapatır.
 * @returns {Promise<object>} Çıkış yanıtı
 */
export const logoutUser = async () => {
    try {
        const response = await authApi.post('/logout');
        // Başarılı çıkıştan sonra token'ı localStorage'dan kaldır
        localStorage.removeItem('access_token');
        return response.data;
    } catch (error) {
        console.error('Çıkış hatası:', error.response?.data || error.message);
        // Hata olsa bile token'ı kaldırmaya çalış
        localStorage.removeItem('access_token');
        throw error;
    }
};

/**
 * Kimliği doğrulanmış kullanıcının bilgilerini getirir.
 * @returns {Promise<object>} Kullanıcı bilgileri
 */
export const getAuthenticatedUser = async () => {
    try {
        const response = await authApi.get('/user');
        return response.data;
    } catch (error) {
        console.error('Kullanıcı bilgisi getirme hatası:', error.response?.data || error.message);
        throw error;
    }
};

// İleriye dönük olarak şifre sıfırlama veya diğer kimlik doğrulama işlemleri buraya eklenebilir.
