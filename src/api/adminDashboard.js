import axios from 'axios';
import { setupAuthInterceptor } from '../utils/axiosInterceptors'; // Interceptor'ı import et

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const adminDashboardApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Admin API çağrıları için kimlik doğrulama interceptor'larını ekle
setupAuthInterceptor(adminDashboardApi);

/**
 * Yönetici paneli için özet istatistikleri getirir.
 * (Toplam kullanıcı, toplam sağlayıcı, toplam plan, onay bekleyen yorum sayısı vb.)
 * @returns {Promise<object>} İstatistik verileri
 */
export const getDashboardStats = async () => {
    try {
        const response = await adminDashboardApi.get('/admin/dashboard/stats');
        return response.data;
    } catch (error) {
        throw new Error('Dashboard istatistikleri getirilirken hata:', error.response?.data || error.message);
    }
};