import React, { useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, getUser } from '../api/auth';
import { AuthContext } from '../hooks/useAuth';
import { useToastContext } from '../hooks/toast-utils';
import axios from 'axios'; // Axios'u import et

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showOnboarding, setShowOnboarding] = useState(false); // Onboarding modalını göstermek için state

    const toastContext = useToastContext();
    const toast = toastContext?.toast;

    useEffect(() => {
        if (!toast) {
            console.error("HATA: useToastContext'ten toast fonksiyonu alınamadı. ToastProvider'ın AuthProvider'ı sardığından emin olun.");
        }
    }, [toast]);


    // Uygulama yüklendiğinde veya her yenilendiğinde kullanıcı durumunu kontrol et
    useEffect(() => {
        const checkUser = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('access_token');
                if (token) {
                    const userData = await getUser(); // Fetch user data using the token
                    setUser(userData);
                    setIsAuthenticated(true);
                    // Eğer kullanıcı giriş yapmışsa ve henüz onboarding yapılmamışsa modalı göster
                    if (userData && !userData.is_onboarded) {
                        setShowOnboarding(true);
                    }
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch {
                setUser(null);
                setIsAuthenticated(false);
                // Hata durumunda (örn. token geçersizse) onboarding'i gösterme
                setShowOnboarding(false);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const loggedInUser = await loginUser(credentials); // loginUser artık kullanıcı objesini döndürüyor
            console.log("AuthContext - login: loginUser'dan dönen kullanıcı:", loggedInUser); // Debug log
            setUser(loggedInUser);
            setIsAuthenticated(true);
            if (toast) {
                toast({
                    title: "Giriş Başarılı",
                    description: "Başarıyla giriş yaptınız.",
                });
            }
            // Giriş yapan kullanıcı için onboarding kontrolü
            if (loggedInUser && !loggedInUser.is_onboarded) {
                setShowOnboarding(true);
            }
        } catch (err) {
            console.error("AuthContext - login: Yakalanan hata objesi:", err); // Debug log: Hata objesinin tamamını logla
            console.error("AuthContext - login: Hata mesajı:", err.message); // Debug log: Hata mesajını logla
            console.error("AuthContext - login: Hata yanıt verisi:", err.response?.data); // Debug log: Axios hata yanıtını logla

            const errorMessage = err.response?.data?.message || err.message || 'Giriş başarısız oldu.';
            setError(errorMessage); // Hata state'ini ayarla
            if (toast) {
                toast({
                    title: "Giriş Hatası",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
            throw err; // Hata LoginPage'e tekrar fırlatılır
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const registeredUser = await registerUser(userData);
            console.log("AuthContext - register: registerUser'dan dönen kullanıcı:", registeredUser); // Debug log
            setUser(registeredUser);
            setIsAuthenticated(true);
            if (toast) {
                toast({
                    title: "Kayıt Başarılı",
                    description: "Hesabınız başarıyla oluşturuldu ve giriş yapıldı.",
                });
            }
            // Yeni kayıt olan kullanıcı için onboarding modalını göster
            if (registeredUser) { // Yeni kayıt olan kullanıcı varsayılan olarak onboarded değildir
                setShowOnboarding(true);
            }
        } catch (err) {
            console.error("AuthContext - register: Yakalanan hata objesi:", err); // Debug log
            const errorMessage = err.response?.data?.message || err.message || 'Kayıt başarısız oldu.';
            setError(errorMessage);
            if (toast) {
                toast({
                    title: "Kayıt Hatası",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
            throw err;
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
                });
            }
        } catch (err) {
            console.error("AuthContext - logout: Yakalanan hata objesi:", err); // Debug log
            const errorMessage = err.response?.data?.message || 'Çıkış yapılırken bir hata oluştu.';
            setError(errorMessage);
            if (toast) {
                toast({
                    title: "Çıkış Hatası",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    /**
        * Kullanıcının onboarding durumunu günceller.
        * Backend'e is_onboarded alanını true olarak gönderecek bir API çağrısı yapar.
        */
    const markUserOnboarded = async () => {
        if (!user || user.is_onboarded) return; // Zaten onboarded ise veya kullanıcı yoksa işlem yapma

        try {
            // Backend'de kullanıcı profilini güncelleyen bir API endpoint'i olduğunu varsayıyoruz
            // Örnek: PUT /api/v1/user/profile veya POST /api/v1/user/onboarded
            await axios.put(`${API_BASE_URL}/user/isonboarded`, { is_onboarded: true }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            // Kullanıcı objesini frontend'de de güncelle
            setUser(prevUser => ({ ...prevUser, is_onboarded: true }));
            setShowOnboarding(false); // Modalı kapat
            if (toast) {
                toast({
                    title: "Hoş Geldiniz!",
                    description: "KolayHosting'e tam olarak hazırsınız.",
                });
            }
        } catch (err) {
            console.error("AuthContext - markUserOnboarded: Onboarding durumu güncellenirken hata:", err.response?.data || err.message);
            if (toast) {
                toast({
                    title: "Hata",
                    description: "Onboarding durumu güncellenemedi.",
                    variant: "destructive",
                });
            }
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        showOnboarding, // Modalı gösterme durumunu dışa aktar
        markUserOnboarded, // Onboarding durumunu güncelleme fonksiyonunu dışa aktar
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
