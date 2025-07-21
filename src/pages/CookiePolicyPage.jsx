import React from 'react';

/**
 * Çerez Politikası Sayfası Bileşeni.
 * KolayHosting web sitesinin çerez kullanımını açıklar.
 */
const CookiePolicyPage = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Çerez Politikası</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                Bu Çerez Politikası, KolayHosting web sitesinde ("Site") çerezleri ve benzeri teknolojileri nasıl kullandığımızı açıklamaktadır.
            </p>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">Çerez Nedir?</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız tarafından bilgisayarınızda veya mobil cihazınızda depolanan küçük metin dosyalarıdır. Çerezler, web sitesinin sizi hatırlamasını, tercihlerinizi kaydetmesini (örn. dil seçimi), oturumunuzu açık tutmasını ve Siteyi kullanımınızı analiz etmesini sağlar.
            </p>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">Çerezleri Nasıl Kullanıyoruz?</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                Sitemizde aşağıdaki türde çerezleri kullanıyoruz:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>
                    <strong>Kesinlikle Gerekli Çerezler:</strong> Sitenin temel işlevselliği için zorunlu olan çerezlerdir. Örneğin, oturum açma bilgilerinizi hatırlamak veya güvenlik amaçlı kullanılırlar. Bu çerezler olmadan Site düzgün çalışmayabilir.
                </li>
                <li>
                    <strong>Performans Çerezleri:</strong> Sitenin nasıl kullanıldığı hakkında bilgi toplarız (örn. hangi sayfaların en çok ziyaret edildiği, hata mesajları). Bu çerezler, Sitenin performansını ve kullanıcı deneyimini iyileştirmemize yardımcı olur.
                </li>
                <li>
                    <strong>İşlevsellik Çerezleri:</strong> Sitenin tercihlerinizi hatırlamasını sağlar (örn. dil seçimi, filtreleme tercihleri) ve size daha kişiselleştirilmiş özellikler sunar.
                </li>
                <li>
                    <strong>Hedefleme/Reklam Çerezleri:</strong> Size ilgi alanlarınıza uygun reklamlar sunmak için kullanılır. Bu çerezler, üçüncü taraf reklam ağları tarafından yerleştirilebilir.
                </li>
            </ul>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">Çerezleri Nasıl Yönetebilirsiniz?</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                Çoğu web tarayıcısı çerezleri otomatik olarak kabul eder, ancak isterseniz tarayıcı ayarlarınızı değiştirerek çerezleri reddedebilir veya çerez gönderildiğinde sizi uyaracak şekilde ayarlayabilirsiniz. Çerezleri devre dışı bırakmak, Sitenin bazı özelliklerinin düzgün çalışmamasına neden olabilir.
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-8">
                Son Güncelleme: 21 Temmuz 2025
            </p>
        </div>
    );
};

export default CookiePolicyPage;
