import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const categoriesApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Axios interceptor: Her istekten önce Authorization başlığını ekler
categoriesApi.interceptors.request.use(
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
 * Tüm kategorileri getirir.
 * @returns {Promise<object[]>} Kategori listesi
 */
export const getAllCategories = async () => {
    try {
        const response = await categoriesApi.get('/categories');
        return response.data.data; // API yanıtının yapısına göre ayarlandı
    } catch (error) {
        console.error('Tüm kategorileri getirirken hata:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Belirli bir kategoriye ait planları getirir.
 * @param {string|number} categoryId - Kategori ID'si veya slug'ı
 * @returns {Promise<object[]>} Kategoriye ait plan listesi
 */
export const getPlansByCategory = async (categoryId) => {
    try {
        const response = await categoriesApi.get(`/categories/${categoryId}/plans`);
        return response.data.data; // API yanıtının yapısına göre ayarlandı
    } catch (error) {
        console.error(`Kategori ID ${categoryId} için planları getirirken hata:`, error.response?.data || error.message);
        throw error;
    }
};

// Admin işlemleri için (ileride kullanılacak)
/**
 * Yeni bir kategori oluşturur (Admin yetkisi gereklidir).
 * @param {object} categoryData - Yeni kategori bilgileri (name, description)
 * @returns {Promise<object>} Oluşturulan kategori
 */
export const createCategory = async (categoryData) => {
    try {
        const response = await categoriesApi.post('/categories', categoryData);
        return response.data.data;
    } catch (error) {
        console.error('Kategori oluştururken hata:', error.response?.data || error.message);
        throw error;
    }
};


/**
 * Bir kategoriyi günceller (Admin yetkisi gereklidir).
 * @param {string|number} categoryId - Güncellenecek kategori ID'si
 * @param {object} updatedData - Güncellenecek kategori bilgileri
 * @returns {Promise<object>} Güncellenen kategori
 */
export const updateCategory = async (categoryId, updatedData) => {
    try {
        const response = await categoriesApi.put(`/categories/${categoryId}`, updatedData);
        return response.data.data;
    } catch (error) {
        console.error(`Kategori ID ${categoryId} güncellenirken hata:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Bir kategoriyi siler (Admin yetkisi gereklidir).
 * @param {string|number} categoryId - Silinecek kategori ID'si
 * @returns {Promise<void>}
 */
export const deleteCategory = async (categoryId) => {
    try {
        await categoriesApi.delete(`/categories/${categoryId}`);
    } catch (error) {
        console.error(`Kategori ID ${categoryId} silinirken hata:`, error.response?.data || error.message);
        throw error;
    }
};