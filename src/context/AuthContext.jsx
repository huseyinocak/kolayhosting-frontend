import React, { useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, logoutUser, getUser } from '../api/auth';
import { AuthContext } from '../hooks/useAuth';
import { useToastContext } from '../hooks/toast-utils';
import OnboardingModal from '@/components/OnboardingModal';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showOnboardingModal, setShowOnboardingModal] = useState(false);

    const toastContext = useToastContext();
    const toast = toastContext?.toast;

    useEffect(() => {
        if (!toast) {
            throw new Error("HATA: useToastContext'ten toast fonksiyonu alınamadı. ToastProvider'ın AuthProvider'ı sardığından emin olun.");
        }
    }, [toast]);

    // Kullanıcı bilgilerini kontrol eden ve ayarlayan fonksiyon
    const checkUser = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                const userData = await getUser(); // Backend'den kullanıcı verisini çek

                // Backend'den dönen user objesinin yapısını kontrol edin.
                // Eğer user objesi bir 'data' anahtarı altında dönüyorsa onu kullan, aksi halde doğrudan objeyi kullan.
                setUser(userData.data || userData);
                setIsAuthenticated(true);
                
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }

            // Onboarding modalını gösterme kontrolü
                const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
                if (!hasSeenOnboarding) {
                    setShowOnboardingModal(true);
                }

        } catch (err) {
            setError(err.message || 'Kullanıcı bilgileri yüklenirken bir hata oluştu.');
            setUser(null);
            setIsAuthenticated(false);
            // Token süresi dolduysa veya geçersizse otomatik çıkış yap
            if (err.response?.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                toast({
                    title: "Oturum Süresi Doldu",
                    description: "Lütfen tekrar giriş yapın.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Hata",
                    description: err.message || "Kullanıcı bilgileri yüklenirken bir sorun oluştu.",
                    variant: "destructive",
                });
            }
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        checkUser();
    }, [checkUser]);

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const responseData = await loginUser(credentials); // loginUser artık tüm yanıtı döndürüyor (user, access_token, refresh_token)

            // Backend'den dönen 'user' objesini doğrudan kullan
            setUser(responseData.user); // responseData.user olarak güncellendi
            setIsAuthenticated(true);
            if (toast) {
                toast({
                    title: "Giriş Başarılı",
                    description: "Başarıyla giriş yaptınız.",
                    variant: "success", // Başarılı bir giriş bildirimi
                });
            }

            // Başarılı giriş sonrası onboarding kontrolü
            const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
            if (!hasSeenOnboarding) {
                setShowOnboardingModal(true);
            }

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Giriş başarısız oldu.';
            setError(errorMessage);
            if (toast) {
                toast({
                    title: "Giriş Hatası",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
            throw new Error("AuthContext - login: Yakalanan hata objesi:", err);
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const responseData = await registerUser(userData); // registerUser artık tüm yanıtı döndürüyor

            setUser(responseData.user); // responseData.user olarak güncellendi
            setIsAuthenticated(true);
            if (toast) {
                toast({
                    title: "Kayıt Başarılı",
                    description: "Hesabınız başarıyla oluşturuldu ve giriş yapıldı.",
                    variant: "success", // Başarılı bir kayıt bildirimi
                });
            }
            // Başarılı kayıt sonrası onboarding modalını göster
            setShowOnboardingModal(true);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Kayıt başarısız oldu.';
            setError(errorMessage);
            if (toast) {
                toast({
                    title: "Kayıt Hatası",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
            throw new Error("AuthContext - register: Yakalanan hata objesi:", err);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        setError(null);
        try {
            await logoutUser();
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            if (toast) {
                toast({
                    title: "Çıkış Yapıldı",
                    description: "Başarıyla oturumunuz kapatıldı.",
                    variant: "success", // Başarılı bir çıkış bildirimi
                });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Çıkış yapılırken bir hata oluştu.';
            setError(errorMessage);
            if (toast) {
                toast({
                    title: "Çıkış Hatası",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
            throw new Error("AuthContext - logout: Yakalanan hata objesi:", err);
        } finally {
            setLoading(false);
        }
    };
     // Onboarding modalını kapatma ve işaretleme fonksiyonu
    const handleOnboardingClose = useCallback(() => {
        setShowOnboardingModal(false);
        localStorage.setItem('hasSeenOnboarding', 'true'); // Kullanıcının modalı gördüğünü işaretle
    }, []);

    const value = {
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        showOnboardingModal, // Yeni eklenen değer
        handleOnboardingClose, // Yeni eklenen fonksiyon
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
