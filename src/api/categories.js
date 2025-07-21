import axios from 'axios';
import { setupAuthInterceptor } from '../utils/axiosInterceptors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const categoriesApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor'ları setupAuthInterceptor utility'si ile ekle
setupAuthInterceptor(categoriesApi);

/**
 * Tüm hosting kategorilerini getirir (Pagination, Filtering, Sorting destekli).
 * @param {object} params - Filtreleme, sıralama ve sayfalama parametreleri.
 * @param {string} [params.name] - Kategori adına göre arama terimi.
 * @param {string} [params.sort_by='name'] - Sıralanacak sütun (örn: 'name', 'created_at', 'updated_at').
 * @param {string} [params.sort_order='asc'] - Sıralama düzeni ('asc' veya 'desc').
 * @param {number} [params.page=1] - Geçerli sayfa numarası.
 * @param {number} [params.per_page=10] - Sayfa başına kayıt sayısı.
 * @returns {Promise<object>} Kategori listesi ve sayfalama bilgileri.
 */
export const getAllCategories = async (params = {}) => {
    try {
        const response = await categoriesApi.get('/categories', { params });
        // API'den gelen verinin yapısına göre dönüşü ayarla
        // Laravel paginate() kullandığı için response.data doğrudan pagination objesi olabilir
        return response.data; // data, meta, links objelerini içerecek
    } catch (error) {
        console.error('Kategoriler getirilirken hata:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Belirli bir kategoriye ait planları getirir.
 * @param {string|number} categoryId - Kategori ID'si veya slug'ı
 * @returns {Promise<Array>} Kategoriye ait plan listesi
 */
export const getPlansByCategory = async (categoryId) => {
    try {
        const response = await categoriesApi.get(`/categories/${categoryId}/plans`);
        return response.data.data;
    } catch (error) {
        console.error(`Kategori ID ${categoryId} için planlar getirilirken hata:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Yeni bir hosting kategorisi oluşturur (Admin yetkisi gereklidir).
 * @param {object} categoryData - Yeni kategori bilgileri
 * @returns {Promise<object>} Oluşturulan kategori
 */
export const createCategory = async (categoryData) => {
    try {
        const response = await categoriesApi.post('/categories', categoryData);
        return response.data.data;
    } catch (error) {
        console.error('Kategori oluşturulurken hata:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Bir hosting kategorisini günceller (Admin yetkisi gereklidir).
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
 * Bir hosting kategorisini siler (Admin yetkisi gereklidir).
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
