import React from 'react';

const PrivacyPolicyPage = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Gizlilik Politikası</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                KolayHosting olarak, kişisel verilerinizin gizliliğini ve güvenliğini ciddiye alıyoruz. Bu Gizlilik Politikası, web sitemizi ziyaret ettiğinizde ve hizmetlerimizi kullandığınızda verilerinizi nasıl topladığımızı, kullandığımızı, işlediğimizi ve koruduğumuzu açıklamaktadır.
            </p>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">Topladığımız Bilgiler</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                Hizmetlerimizi kullanırken bize sağladığınız kişisel bilgileri (adınız, e-posta adresiniz vb.) ve web sitemizi kullanımınızla ilgili otomatik olarak toplanan bilgileri (IP adresi, tarayıcı türü, ziyaret edilen sayfalar vb.) toplayabiliriz.
            </p>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">Bilgilerinizi Nasıl Kullanırız?</h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Hizmetlerimizi sağlamak ve sürdürmek için.</li>
                <li>Hesabınızı yönetmek ve size destek sağlamak için.</li>
                <li>Hizmetlerimizi iyileştirmek ve kişiselleştirmek için.</li>
                <li>Pazarlama ve tanıtım faaliyetleri için (onayınız varsa).</li>
                <li>Yasal yükümlülüklerimize uymak için.</li>
            </ul>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">Veri Güvenliği</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                Topladığımız bilgileri yetkisiz erişime, kullanıma veya ifşaya karşı korumak için çeşitli güvenlik önlemleri uyguluyoruz. Ancak, internet üzerinden hiçbir veri iletimi %100 güvenli değildir.
            </p>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">Haklarınız</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                Kişisel verilerinizle ilgili erişim, düzeltme, silme ve işleme itiraz etme haklarına sahipsiniz. Bu haklarınızı kullanmak için bizimle iletişime geçebilirsiniz.
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-8">
                Son Güncelleme: 21 Temmuz 2025
            </p>
        </div>
    );
};

export default PrivacyPolicyPage;