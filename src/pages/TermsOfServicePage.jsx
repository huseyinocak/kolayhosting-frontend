import React from 'react';

/**
 * Kullanım Koşulları Sayfası Bileşeni.
 * KolayHosting web sitesinin kullanım koşullarını içerir.
 */
const TermsOfServicePage = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Kullanım Koşulları</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                KolayHosting web sitesini ("Site") kullanarak, bu Kullanım Koşulları'na uymayı kabul etmiş olursunuz. Bu Koşulları kabul etmiyorsanız, Siteyi kullanmamalısınız.
            </p>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">Hizmetlerimiz</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                KolayHosting, çeşitli hosting sağlayıcılarının planlarını karşılaştırmanıza olanak tanıyan bir platformdur. Sağlayıcılar ve planlar hakkında sağlanan tüm bilgiler, ilgili sağlayıcıların web sitelerinden veya kamuya açık kaynaklardan toplanmıştır. Bilgilerin doğruluğu ve güncelliği için çaba gösterilse de, KolayHosting bu bilgilerin mutlak doğruluğunu garanti etmez. Herhangi bir satın alma işlemi yapmadan önce bilgileri ilgili sağlayıcının web sitesinde doğrulamanız önerilir.
            </p>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">Kullanıcı Sorumlulukları</h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Siteyi yasalara ve bu Kullanım Koşulları'na uygun olarak kullanmak.</li>
                <li>Yanlış veya yanıltıcı bilgi sağlamamak.</li>
                <li>Siteye kötü amaçlı yazılım veya virüs bulaştırmamak.</li>
                <li>Sitenin işleyişini bozmaya çalışmamak.</li>
            </ul>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">Fikri Mülkiyet</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                Sitedeki tüm içerik (metin, grafikler, logolar, resimler, yazılım vb.) KolayHosting'e veya lisans verenlerine aittir ve telif hakkı yasalarıyla korunmaktadır. İçeriğin izinsiz kullanılması yasaktır.
            </p>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">Sorumluluk Reddi</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                KolayHosting, Sitede sunulan bilgilerin doğruluğu, eksiksizliği veya güncelliği konusunda herhangi bir garanti vermez. Site "olduğu gibi" sağlanmaktadır ve kullanımınız kendi sorumluluğunuzdadır. KolayHosting, Siteyi kullanımınızdan kaynaklanan hiçbir doğrudan, dolaylı, arızi veya sonuç olarak ortaya çıkan zararlardan sorumlu değildir.
            </p>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">Değişiklikler</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                KolayHosting, bu Kullanım Koşulları'nı herhangi bir zamanda bildirimde bulunmaksızın değiştirme hakkını saklı tutar. Değişiklikler yayınlandığı anda yürürlüğe girer. Siteyi kullanmaya devam etmeniz, değiştirilmiş Koşulları kabul ettiğiniz anlamına gelir.
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-8">
                Son Güncelleme: 21 Temmuz 2025
            </p>
        </div>
    );
};

export default TermsOfServicePage;
