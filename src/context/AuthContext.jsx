// src/context/AuthContext.jsx

import React, { useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, getAuthenticatedUser } from '../api/auth';
import { AuthContext } from '../hooks/useAuth'; // AuthContext'i yeni konumundan içe aktar

/**
 * AuthProvider bileşeni, uygulamanın kimlik doğrulama durumunu yönetir.
 * Çocuk bileşenlere kimlik doğrulama durumunu ve fonksiyonlarını sağlar.
 */
export const AuthProvider = ({ children }) => {
    // Kullanıcı bilgisi, başlangıçta null
    const [user, setUser] = useState(null);
    // Yükleme durumu, API çağrıları sırasında true olur
    const [loading, setLoading] = useState(true);
    // Kimlik doğrulama hatası mesajı
    const [error, setError] = useState(null);

    // Uygulama yüklendiğinde veya token değiştiğinde kullanıcıyı yükle
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    // Token varsa, kimliği doğrulanmış kullanıcıyı getir
                    const userData = await getAuthenticatedUser();
                    setUser(userData);
                } catch (err) {
                    console.error('Token ile kullanıcı yüklenirken hata:', err);
                    localStorage.removeItem('access_token'); // Geçersiz token'ı kaldır
                    setUser(null);
                }
            }
            setLoading(false); // Kullanıcı yükleme işlemi tamamlandı
        };

        loadUser();
    }, []); // Sadece bir kez, bileşen mount edildiğinde çalışır

    /**
     * Kullanıcı girişini yönetir.
     * @param {object} credentials - E-posta ve şifre
     * @returns {Promise<object>} Kullanıcı verisi
     */
    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const data = await loginUser(credentials);
            setUser(data.user); // API'den dönen kullanıcı bilgisini kaydet
            setLoading(false);
            return data.user;
        } catch (err) {
            setError(err.response?.data?.message || 'Giriş başarısız.');
            setLoading(false);
            throw err; // Hatayı yukarıya fırlat
        }
    };

    /**
     * Kullanıcı kaydını yönetir.
     * @param {object} userData - Kayıt bilgileri
     * @returns {Promise<object>} Kullanıcı verisi
     */
    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await registerUser(userData);
            // Kayıttan sonra otomatik giriş yapılıyorsa token'ı kaydet ve kullanıcıyı ayarla
            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token);
                setUser(data.user);
            }
            setLoading(false);
            return data.user;
        } catch (err) {
            setError(err.response?.data?.message || 'Kayıt başarısız.');
            setLoading(false);
            throw err;
        }
    };

    /**
     * Kullanıcı çıkışını yönetir.
     */
    const logout = async () => {
        setLoading(true);
        setError(null);
        try {
            await logoutUser();
            setUser(null); // Kullanıcıyı sıfırla
            localStorage.removeItem('access_token'); // Token'ı kaldır
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Çıkış başarısız.');
            setLoading(false);
            throw err;
        }
    };

    // Bağlam değerlerini sağlıyoruz
    const value = {
        user,
        isAuthenticated: !!user, // Kullanıcının oturum açıp açmadığını kontrol eder
        loading,
        error,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
