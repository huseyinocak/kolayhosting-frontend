import React from 'react';
import Logo from '../assets/logo.webp'; // Logoyu import edin

/**
 * Uygulama yüklenirken gösterilecek gelişmiş bir yükleme göstergesi.
 * Tailwind CSS ile stilize edilmiş basit bir spinner ve uygulama logosunu içerir.
 */
const LoadingSpinner = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
            <div className="relative flex items-center justify-center">
                {/* Dış çember (arka plan) */}
                <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-700 rounded-full animate-spin-slow"></div>
                {/* İç çember (ilerleme) */}
                <div className="absolute w-20 h-20 border-t-4 border-b-4 border-blue-600 dark:border-blue-400 rounded-full animate-spin"></div>
                {/* Uygulama Logosu */}
                <img
                    src={Logo}
                    alt="KolayHosting Logo"
                    className="absolute w-12 h-12 object-contain" // Resmin boyutunu ve ortalamasını ayarlayın
                />
            </div>
            <p className="mt-6 text-lg font-medium">Yükleniyor...</p>
        </div>
    );
};

export default LoadingSpinner;
