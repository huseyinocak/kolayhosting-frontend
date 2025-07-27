import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-lg my-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 text-center">Gizlilik Politikası</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                KolayHosting olarak, kişisel verilerinizin gizliliğini ve güvenliğini ciddiye alıyoruz. Bu Gizlilik Politikası, web sitemizi ziyaret ettiğinizde ve hizmetlerimizi kullandığınızda verilerinizi nasıl topladığımızı, kullandığımızı, işlediğimizi ve koruduğumuzu açıklamaktadır.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">1. Topladığımız Bilgiler</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Hizmetlerimizi kullanırken bize doğrudan sağladığınız kişisel bilgileri (adınız, e-posta adresiniz, iletişim bilgileriniz vb.) ve web sitemizi kullanımınızla ilgili otomatik olarak toplanan bilgileri (IP adresi, tarayıcı türü, ziyaret edilen sayfalar, erişim süreleri vb.) toplayabiliriz.
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Doğrudan Sağladığınız Bilgiler: Kayıt olurken, plan satın alırken, yorum yaparken veya destek talebinde bulunurken sağladığınız bilgiler.</li>
                <li>Otomatik Olarak Toplanan Bilgiler: Web sitesi etkileşimleriniz, cihaz bilgileriniz ve çerezler aracılığıyla toplanan veriler.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">2. Bilgilerinizi Nasıl Kullanırız?</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Topladığımız bilgileri çeşitli amaçlarla kullanırız:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Hizmetlerimizi sağlamak, sürdürmek ve iyileştirmek için.</li>
                <li>Hesabınızı yönetmek, size özel içerik sunmak ve kişiselleştirilmiş bir deneyim sağlamak için.</li>
                <li>Müşteri desteği sağlamak ve sorularınıza yanıt vermek için.</li>
                <li>Pazarlama ve tanıtım faaliyetleri için (onayınız varsa).</li>
                <li>Yasal yükümlülüklerimize uymak ve yasal süreçleri yürütmek için.</li>
                <li>Hizmetlerimizin güvenliğini sağlamak ve dolandırıcılığı önlemek için.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">3. Bilgilerinizi Kimlerle Paylaşırız?</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Kişisel verilerinizi yalnızca aşağıdaki durumlarda üçüncü taraflarla paylaşabiliriz:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Hizmet sağlayıcıları ve iş ortakları ile (örneğin, ödeme işlemcileri, hosting sağlayıcıları, analitik hizmetleri).</li>
                <li>Yasal yükümlülüklerimizi yerine getirmek amacıyla (mahkeme kararı, yasal süreçler vb.).</li>
                <li>Şirket birleşmesi, satın alma veya varlık satışı gibi durumlarda.</li>
                <li>Açık rızanız olması durumunda.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">4. Veri Güvenliği</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Topladığımız bilgileri yetkisiz erişime, kullanıma veya ifşaya karşı korumak için çeşitli fiziksel, elektronik ve yönetimsel güvenlik önlemleri uyguluyoruz. Ancak, internet üzerinden hiçbir veri iletiminin veya elektronik depolamanın %100 güvenli olmadığını unutmayınız.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">5. Haklarınız</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Kişisel verilerinizle ilgili olarak aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Kişisel verilerinize erişim ve kopyasını alma hakkı.</li>
                <li>Yanlış veya eksik verilerin düzeltilmesini talep etme hakkı.</li>
                <li>Verilerinizin silinmesini talep etme hakkı ("unutulma hakkı").</li>
                <li>Verilerinizin işlenmesine itiraz etme veya işlemeyi kısıtlama hakkı.</li>
                <li>Veri taşınabilirliği hakkı.</li>
                <li>Veri işleme izninizi geri çekme hakkı.</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Bu haklarınızı kullanmak için lütfen bizimle iletişime geçiniz.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">6. Çerezler</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Web sitemiz, Siteyi kullanımınızı analiz etmek ve deneyiminizi kişiselleştirmek için çerezleri kullanır. Çerez politikamız hakkında daha fazla bilgi için lütfen <Link to="/cookie-policy" className="text-blue-600 hover:underline">Çerez Politikası</Link> sayfamızı ziyaret edin.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">7. Bu Politikadaki Değişiklikler</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Bu Gizlilik Politikası'nı zaman zaman güncelleyebiliriz. Herhangi bir değişiklik yaptığımızda, güncellenmiş politikayı bu sayfada yayınlayacağız ve yürürlük tarihini güncelleyeceğiz. Önemli değişiklikler için size bildirimde bulunabiliriz.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">8. Bize Ulaşın</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Bu Gizlilik Politikası hakkında herhangi bir sorunuz veya endişeniz varsa, lütfen bizimle iletişime geçmekten çekinmeyin:
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

export default PrivacyPolicyPage;