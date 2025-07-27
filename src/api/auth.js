import axios from 'axios';
import { setupAuthInterceptor } from '../utils/axiosInterceptors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const authApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

setupAuthInterceptor(authApi); // Interceptor'ları uygula

/**
 * Token'ı yenilemek için API çağrısı yapar.
 * @returns {Promise<object>} Yeni access ve refresh token'lar
 */
export const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            throw new Error('Yenileme tokenı bulunamadı.');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', newRefreshToken);

        return { access_token, refresh_token: newRefreshToken };
    } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw new Error('Token yenileme hatası:', error.response?.data || error.message);
    }
};

/**
 * Kullanıcı girişi yapar.
 * @param {object} credentials - Kullanıcı kimlik bilgileri (email, password)
 * @returns {Promise<object>} Laravel API'sinden dönen tüm yanıt verisi (access_token, refresh_token, user)
 */
export const loginUser = async (credentials) => {
    try {
        const response = await authApi.post('/login', credentials); // Endpoint '/login' olarak bırakıldı
        const { access_token, user, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        return { user, access_token, refresh_token };
    } catch (error) {
        console.error('Giriş hatası:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Yeni kullanıcı kaydı yapar.
 * @param {object} userData - Kullanıcı kayıt bilgileri (name, email, password, password_confirmation)
 * @returns {Promise<object>} Laravel API'sinden dönen tüm yanıt verisi (access_token, refresh_token, user)
 */
export const registerUser = async (userData) => {
    try {
        const { name, email, password, password_confirmation } = userData;
        const response = await authApi.post('/register', { name, email, password, password_confirmation }); // Endpoint '/register' olarak güncellendi
        
        // Kayıt sonrası dönen yanıta göre tokenları kaydet
        const { access_token, refresh_token, user } = response.data; // Eğer backend bu alanları döndürüyorsa
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        return { user, access_token, refresh_token };
    } catch (error) {
        console.error('Kayıt hatası:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Kullanıcının oturumunu kapatır.
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
    try {
        await authApi.post('/logout');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    } catch (error) {
        throw new Error('Çıkış yapılırken hata:', error.response?.data || error.message);
    }
};

/**
 * Mevcut kullanıcının bilgilerini getirir.
 * @returns {Promise<object>} Kullanıcı bilgileri (Laravel API'sinden doğrudan dönen user objesi)
 */
export const getUser = async () => {
    try {
        const response = await authApi.get('/user');
        // Laravel'in '/user' endpoint'i doğrudan user objesini döndürüyorsa:
        return response.data;
        // Eğer 'data' anahtarı altında dönüyorsa:
        // return response.data.data;
    } catch (error) {
        throw new Error('Kullanıcı bilgileri getirilirken hata:', error.response?.data || error.message);
    }
};

/**
 * Şifre sıfırlama talebi gönderir.
 * @param {string} email - Şifresi sıfırlanacak kullanıcının e-posta adresi
 * @returns {Promise<object>} Yanıt mesajı
 */
export const forgotPassword = async (email) => {
    try {
        const response = await authApi.post('/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw new Error('Şifre sıfırlama talebi hatası:', error.response?.data || error.message);
    }
};

/**
 * Yeni şifreyi ayarlar.
 * @param {object} data - Şifre sıfırlama bilgileri (token, email, password, password_confirmation)
 * @returns {Promise<object>} Yanıt mesajı
 */
export const resetPassword = async (data) => {
    try {
        const response = await authApi.post('/auth/reset-password', data);
        return response.data;
    } catch (error) {
        throw new Error('Şifre sıfırlama hatası:', error.response?.data || error.message);
    }
};

/**
 * E-posta doğrulama bağlantısını yeniden gönderir.
 * @returns {Promise<object>} Yanıt mesajı
 */
export const resendVerificationLink = async () => {
    try {
        const response = await authApi.post('/email/verify/resend');
        return response.data;
    } catch (error) {
        throw new Error('Doğrulama bağlantısı gönderilirken hata:', error.response?.data?.message || error.message);
    }
};

export default authApi;
