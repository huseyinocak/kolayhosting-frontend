import { refreshToken } from "../api/auth"; // auth.js'den refreshToken fonksiyonunu import ediyoruz

/**
 * Verilen axios instance'ına kimlik doğrulama ve token yenileme interceptor'larını ekler.
 * @param {object} axiosInstance - Interceptor'ların ekleneceği axios instance'ı.
 */
export const setupAuthInterceptor = (axiosInstance) => {
  // Request interceptor: Her istekten önce Authorization başlığını ekler
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor: Yanıtlarda token yenileme mantığını yönetir
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Eğer hata 401 (Unauthorized) ise ve daha önce denenmediyse
      // ve istek refresh token endpoint'ine yapılmıyorsa (sonsuz döngüyü önlemek için)
      if (
        error.response.status === 401 &&
        !originalRequest._retry &&
        originalRequest.url !==
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"
          }/auth/refresh-token`
      ) {
        originalRequest._retry = true; // Tekrar denendiğini işaretle

        try {
          const { access_token: newAccessToken } = await refreshToken(); // Token'ı yenile
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`; // Yeni token ile orijinal isteği tekrar dene
          return axiosInstance(originalRequest); // Orijinal isteği tekrar gönder
        } catch (refreshError) {
          // Token yenileme başarısız olursa, refreshToken fonksiyonu zaten oturumu kapatmış ve yönlendirmiş olmalı
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};
