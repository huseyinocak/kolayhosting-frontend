import React from 'react';
import { Helmet } from 'react-helmet-async'; // Helmet'i içe aktar
import { useTranslation } from 'react-i18next'; // i18n için useTranslation

/**
 * Çerez Politikası Sayfası Bileşeni.
 * KolayHosting web sitesinin çerez kullanımını açıklar.
 */
const CookiePolicyPage = () => {
    const { t } = useTranslation();

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Helmet>
                <title>{t('cookie_policy_page_title', { defaultValue: 'Çerez Politikası' })} - KolayHosting</title>
                <meta name="description" content={t('cookie_policy_page_description', { defaultValue: 'KolayHosting web sitesinin çerez kullanımını ve çerezleri nasıl yönetebileceğinizi öğrenin.' })} />
                <link rel="canonical" href={`${window.location.origin}/cookie-policy`} />
            </Helmet>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">{t('cookie_policy')}</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t('cookie_policy_intro')}
            </p>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">{t('what_are_cookies')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t('what_are_cookies_description')}
            </p>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">{t('how_we_use_cookies')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t('how_we_use_cookies_description_main')}
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>
                    <strong>{t('essential_cookies_title')}:</strong> {t('essential_cookies_description')}
                </li>
                <li>
                    <strong>{t('performance_cookies_title')}:</strong> {t('performance_cookies_description')}
                </li>
                <li>
                    <strong>{t('functionality_cookies_title')}:</strong> {t('functionality_cookies_description')}
                </li>
                <li>
                    <strong>{t('targeting_advertising_cookies_title')}:</strong> {t('targeting_advertising_cookies_description')}
                </li>
            </ul>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">{t('how_to_manage_cookies')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t('how_to_manage_cookies_description')}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-8">
                {t('last_updated')}: 21 Temmuz 2025
            </p>
        </div>
    );
};

export default CookiePolicyPage;
