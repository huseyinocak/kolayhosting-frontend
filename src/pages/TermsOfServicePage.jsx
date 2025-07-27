import React from 'react';
import { Link } from 'react-router-dom'; // Link bileşenini import et

/**
 * Kullanım Koşulları Sayfası Bileşeni.
 * KolayHosting web sitesinin kullanım koşullarını içerir.
 */
const TermsOfServicePage = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-lg my-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 text-center">Kullanım Koşulları</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                KolayHosting web sitesini ("Site") kullanarak, bu Kullanım Koşulları'na uymayı kabul etmiş olursunuz. Bu Koşulları kabul etmiyorsanız, Siteyi kullanmamalısınız.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">1. Hizmetlerimiz</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                KolayHosting, çeşitli hosting sağlayıcılarının planlarını karşılaştırmanıza olanak tanıyan bir platformdur. Sağlayıcılar ve planlar hakkında sağlanan tüm bilgiler, ilgili sağlayıcıların web sitelerinden veya kamuya açık kaynaklardan toplanmıştır. Bilgilerin doğruluğu ve güncelliği için çaba gösterilse de, KolayHosting bu bilgilerin mutlak doğruluğunu garanti etmez. Herhangi bir satın alma işlemi yapmadan önce bilgileri ilgili sağlayıcının web sitesinde doğrulamanız önerilir.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">2. Kullanıcı Sorumlulukları</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Siteyi kullanırken aşağıdaki kurallara uymayı kabul edersiniz:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Yasa dışı veya yetkisiz herhangi bir amaçla Siteyi kullanmamak.</li>
                <li>Siteye virüs veya kötü amaçlı kod yüklememek.</li>
                <li>Diğer kullanıcıların Siteyi kullanımını engellememek veya bozmamak.</li>
                <li>Site üzerindeki telif hakkı veya diğer mülkiyet bildirimlerini kaldırmamak veya değiştirmemek.</li>
                <li>Yanlış veya yanıltıcı bilgi sağlamamak.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">3. Fikri Mülkiyet Hakları</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Sitedeki tüm içerik (metin, grafikler, logolar, resimler, yazılım, veri derlemeleri vb.) KolayHosting'e veya lisans verenlerine aittir ve telif hakkı, ticari marka ve diğer fikri mülkiyet yasalarıyla korunmaktadır. İçeriğin izinsiz kullanılması, çoğaltılması veya dağıtılması yasaktır.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">4. Sorumluluk Reddi</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                KolayHosting, Sitede sunulan bilgilerin doğruluğu, eksiksizliği veya güncelliği konusunda herhangi bir garanti vermez. Site "olduğu gibi" sağlanmaktadır ve kullanımınız kendi sorumluluğunuzdadır. KolayHosting, Siteyi kullanımınızdan kaynaklanan hiçbir doğrudan, dolaylı, arızi, özel veya sonuç olarak ortaya çıkan zararlardan sorumlu değildir.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">5. Üçüncü Taraf Bağlantıları</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Sitemiz, üçüncü taraf web sitelerine veya hizmetlerine bağlantılar içerebilir. Bu bağlantılar sadece kolaylık sağlamak amacıyla verilmiştir ve KolayHosting'in bu sitelerin içeriği veya gizlilik uygulamaları üzerinde hiçbir kontrolü yoktur. Üçüncü taraf siteleri ziyaret ettiğinizde kendi kullanım koşullarını ve gizlilik politikalarını incelemenizi tavsiye ederiz.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">6. Fesih</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                KolayHosting, bu Kullanım Koşulları'nı ihlal etmeniz durumunda, önceden bildirimde bulunmaksızın Siteye erişiminizi derhal sonlandırma veya askıya alma hakkını saklı tutar.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">7. Geçerli Yasa</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Bu Kullanım Koşulları, Türkiye Cumhuriyeti yasalarına göre yorumlanacak ve uygulanacaktır. Bu Koşullardan doğan herhangi bir anlaşmazlıkta İstanbul Mahkemeleri yetkili olacaktır.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">8. Değişiklikler</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                KolayHosting, bu Kullanım Koşulları'nı herhangi bir zamanda bildirimde bulunmaksızın değiştirme hakkını saklı tutar. Değişiklikler yayınlandığı anda yürürlüğe girer. Siteyi kullanmaya devam etmeniz, değiştirilmiş Koşulları kabul ettiğiniz anlamına gelir.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">9. Bize Ulaşın</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Bu Kullanım Koşulları hakkında herhangi bir sorunuz varsa, lütfen bizimle iletişime geçmekten çekinmeyin:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>E-posta: destek@kolayhosting.com.tr</li>
                <li>Adres: [Şirket Adresi Buraya Eklenecek]</li>
            </ul>

            <p className="text-gray-700 dark:text-gray-300 text-sm mt-8 text-right">
                Son Güncelleme: 25 Temmuz 2025
            </p>
        </div>
    );
};

export default TermsOfServicePage;
