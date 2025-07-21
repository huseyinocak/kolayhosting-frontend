import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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
        const token = localStorage.getItem('access_token');
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

        // Backend'den dönen yanıta göre destructuring yapısını düzelt
        // Eğer refresh_token da doğrudan response.data içindeyse:
        const { access_token, refresh_token: newRefreshToken } = response.data; // response.data.data yerine response.data
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', newRefreshToken); // Yeni refresh token'ı kaydet

        return { access_token, refresh_token: newRefreshToken };
    } catch (error) {
        console.error('Token yenileme hatası:', error.response?.data || error.message);
        // Yenileme tokenı geçersizse veya başka bir hata olursa oturumu kapat
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Kullanıcıyı login sayfasına yönlendirme veya global logout tetikleme
        window.location.href = '/login'; // Örnek olarak doğrudan yönlendirme
        throw error;
    }
};

// Axios interceptor: Yanıtlarda token yenileme mantığını yönetir
authApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Eğer hata 401 (Unauthorized) ise ve daha önce denenmediyse
        // ve istek refresh token endpoint'ine yapılmıyorsa
        if (error.response.status === 401 && !originalRequest._retry && originalRequest.url !== `${API_BASE_URL}/auth/refresh-token`) { // Tam URL kontrolü
            originalRequest._retry = true; // Tekrar denendiğini işaretle

            try {
                const { access_token: newAccessToken } = await refreshToken(); // Token'ı yenile
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`; // Yeni token ile orijinal isteği tekrar dene
                return authApi(originalRequest); // Orijinal isteği tekrar gönder
            } catch (refreshError) {
                // Token yenileme başarısız olursa, hata zaten refreshToken fonksiyonu içinde ele alınıyor
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

/**
 * Kullanıcı girişi yapar.
 * @param {object} credentials - Kullanıcı kimlik bilgileri (email, password)
 * @returns {Promise<object>} Kullanıcı verileri ve token'lar
 */
export const loginUser = async (credentials) => {
    try {
        const response = await authApi.post('/login', credentials); // Endpoint '/login' olarak bırakıldı
        // Postman çıktısına göre destructuring yapısını düzelt
        const { access_token, user } = response.data; // refresh_token Postman çıktısında yok, bu yüzden kaldırıldı
        localStorage.setItem('access_token', access_token);
        // localStorage.setItem('refresh_token', refresh_token); // refresh_token olmadığı için yorum satırı yapıldı veya kaldırıldı
        return user; // Sadece kullanıcı objesini döndür
    } catch (error) {
        console.error('Giriş hatası:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Yeni kullanıcı kaydı yapar.
 * @param {object} userData - Kullanıcı kayıt bilgileri (name, email, password, password_confirmation)
 * @returns {Promise<object>} Kaydedilen kullanıcı bilgileri
 */
export const registerUser = async (userData) => {
    try {
        const response = await authApi.post('/register', userData); // Endpoint '/register' olarak güncellendi
        // Kayıt sonrası dönen yanıta göre tokenları kaydet
        const { access_token, refresh_token, user } = response.data; // Eğer backend bu alanları döndürüyorsa
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        return user; // Kullanıcı objesini döndür
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
        await authApi.post('/logout'); // Endpoint '/logout' olarak güncellendi
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    } catch (error) {
        console.error('Çıkış hatası:', error.response?.data || error.message);
        // Hata olsa bile token'ları temizle
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        throw error;
    }
};

/**
 * Mevcut kullanıcının bilgilerini getirir.
 * @returns {Promise<object>} Kullanıcı bilgileri
 */
export const getUser = async () => {
    try {
        const response = await authApi.get('/user'); // Endpoint '/user' olarak güncellendi
        return response.data; // Eğer backend user bilgisini data altında döndürüyorsa bu doğru
    } catch (error) {
        console.error('Kullanıcı bilgileri getirilirken hata:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Şifre sıfırlama talebi gönderir.
 * @param {string} email - Şifresi sıfırlanacak kullanıcının e-posta adresi
 * @returns {Promise<object>} Yanıt mesajı
 */
export const forgotPassword = async (email) => {
    try {
        const response = await authApi.post('/forgot-password', { email }); // Endpoint '/forgot-password' olarak güncellendi
        return response.data;
    } catch (error) {
        console.error('Şifre sıfırlama talebi hatası:', error.response?.data || error.message);
        throw error;
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
        console.error('Şifre sıfırlama hatası:', error.response?.data || error.message);
        throw error;
    }
};

export default authApi; // authApi instance'ını da dışa aktar
