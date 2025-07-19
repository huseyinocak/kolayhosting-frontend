import React from 'react';
import { useAuth } from "@/hooks/useAuth"; // AuthContext'ten useAuth hook'unu içe aktar
import { Navigate, Outlet } from "react-router-dom";

/**
 * ProtectedRoute bileşeni, belirli rotaları kimlik doğrulama durumuna göre korur.
 * Eğer kullanıcı kimliği doğrulanmamışsa, belirtilen yönlendirme yoluna yönlendirir.
 * Eğer kullanıcı kimliği doğrulanmışsa, çocuk rotayı render eder.
 *
 * @param {object} props
 * @param {string} [props.redirectPath='/login'] - Kullanıcı kimliği doğrulanmamışsa yönlendirilecek yol.
 * @param {string[]} [props.allowedRoles=[]] - Bu rotaya erişebilecek roller. Boşsa, herhangi bir kimliği doğrulanmış kullanıcı erişebilir.
 */
export default function ProtectedRoute({ redirectPath = '/login', allowedRoles = [] }) {
    // AuthContext'ten kullanıcı, kimlik doğrulama durumu ve yükleme durumu
    const { user, isAuthenticated, loading } = useAuth();

    // Kimlik doğrulama işlemi devam ediyorsa, hiçbir şey render etme
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-lg text-gray-700 dark:text-gray-300">Yükleniyor...</div>
            </div>
        );
    }

    // Kullanıcı kimliği doğrulanmamışsa, giriş sayfasına yönlendir
    if (!isAuthenticated) {
        return <Navigate to={redirectPath} replace />;
    }

    // Kullanıcı oturum açmışsa, korunan bileşeni render ediyoruz
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        // İzin verilmeyen bir role sahipse ana sayfaya veya başka bir yere yönlendir
        return <Navigate to="/" replace />; // Ya da yetkisiz erişim sayfası
    }

    // Kullanıcı kimliği doğrulanmış ve rolü uygunsa, çocuk rotayı render et
    return <Outlet />;
}