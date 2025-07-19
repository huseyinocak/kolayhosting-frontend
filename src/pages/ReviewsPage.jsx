import React from 'react';

const ReviewsPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 font-inter">
            <div className="max-w-4xl mx-auto text-center py-12">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
                    İncelemeler Sayfası
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Kullanıcılarımızın hosting sağlayıcıları ve planları hakkındaki gerçek yorumlarını okuyun.
                </p>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Yakında Daha Fazlası!</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        Bu sayfa şu anda geliştirilme aşamasındadır. Yakında daha fazla inceleme ve filtreleme seçeneği eklenecektir.
                    </p>
                    <div className="mt-6 text-left">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">Örnek İnceleme:</p>
                        <blockquote className="mt-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg italic border-l-4 border-blue-500 dark:border-blue-400">
                            "Harika bir hizmet! Performans beklentilerimin çok üzerinde ve destek ekibi inanılmaz hızlı."
                            <footer className="mt-2 text-sm text-gray-500 dark:text-gray-400">— Memnun Müşteri</footer>
                        </blockquote>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewsPage;