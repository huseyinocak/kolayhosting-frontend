// src/pages/FeaturesPage.jsx

import React, { useEffect, useState, useMemo } from 'react';
import { getAllFeatures } from '../api/features'; // Özellik API fonksiyonunu içe aktar
import { useToastContext } from '../hooks/toast-utils'; // Toast bildirimleri için
import { Helmet } from 'react-helmet-async'; // Helmet'i içe aktar
import { useTranslation } from 'react-i18next'; // i18n için useTranslation
import { useSearchParams } from 'react-router-dom'; // useSearchParams eklendi
import { useQuery } from '@tanstack/react-query'; // React Query useQuery hook'unu içe aktar

// Shadcn UI bileşenleri
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Frown } from 'lucide-react'; // Frown ikonu eklendi
import { Input } from '../components/ui/input'; // Arama çubuğu için
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select'; // Dropdown seçimleri için


const FeaturesPage = () => {
    const { toast } = useToastContext();
    const { t } = useTranslation();

    // URL arama parametrelerini yönetmek için useSearchParams
    const [searchParams, setSearchParams] = useSearchParams();

    // Filtreleme ve Sıralama State'leri - URL'den okunuyor
    const searchTerm = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'name_asc';

    // Debounce'lu arama terimi için state (Input'tan anlık değer, URL'ye yansıyan debounce'lu değer)
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

    // Arama terimini debounce etmek için useEffect
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                if (localSearchTerm) newParams.set('search', localSearchTerm);
                else newParams.delete('search');
                return newParams;
            }, { replace: true }); // URL'yi geçmişe eklemeden değiştir
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [localSearchTerm, setSearchParams]);

    // Sıralama parametrelerini ayır
    const sortParams = useMemo(() => {
        const [sort_by, sort_order] = sortBy.split('_');
        return { sort_by, sort_order };
    }, [sortBy]);

    // Özellikleri çekmek için useQuery
    const { data: featuresData, isLoading, isError, error } = useQuery({
        queryKey: [
            'features',
            searchTerm, // Debounce'lu terim doğrudan kullanılıyor
            sortParams
        ],
        queryFn: () => getAllFeatures({
            name: searchTerm,
            sort_by: sortParams.sort_by,
            sort_order: sortParams.sort_order,
        }),
        staleTime: 5 * 60 * 1000,
    });

    const features = featuresData?.data || [];

    useEffect(() => {
        if (isError) {
            toast({
                title: "Hata",
                description: error.message || "Özellikler yüklenirken bir sorun oluştu.",
                variant: "destructive",
            });
        }
    }, [isError, error, toast]);

    const handleSortChange = (value) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('sortBy', value);
            return newParams;
        }, { replace: true });
    };

    // Dinamik sayfa başlığı ve meta açıklaması
    const pageTitle = useMemo(() => {
        let title = t('features_page_title', { defaultValue: 'Tüm Hosting Özellikleri' });
        if (searchTerm) {
            title = `${searchTerm} ${t('features_search_results', { defaultValue: 'Özellik Arama Sonuçları' })}`;
        }
        return `${title} - KolayHosting`;
    }, [searchTerm, t]);

    const pageDescription = useMemo(() => {
        let description = t('features_page_description', { defaultValue: 'KolayHosting\'de tüm hosting özelliklerini keşfedin. Depolama, bant genişliği, SSL, e-posta hesapları ve daha fazlası hakkında detaylı bilgi alın.' });
        if (searchTerm) {
            description = `${t('features_search_description_prefix', { defaultValue: 'Arama sonuçları:' })} ${searchTerm}. ${description}`;
        }
        return description;
    }, [searchTerm, t]);

    // Canonical URL
    const canonicalUrl = useMemo(() => {
        const baseUrl = `${window.location.origin}/features`;
        const currentParams = new URLSearchParams(searchParams);
        const queryString = currentParams.toString();
        return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    }, [searchParams]);


    // Yükleme durumunda iskelet gösterimi
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-10 w-3/4 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, index) => (
                        <Card key={index} className="w-full">
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // Schema.org JSON-LD verisi
    const featuresSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage", // Özellikler sayfası için CollectionPage
        "name": pageTitle,
        "description": pageDescription,
        "url": `${window.location.origin}/features`,
        "mainEntity": {
            "@type": "ItemList", // Özellikler bir liste
            "numberOfItems": features.length,
            "itemListElement": features.map((feature, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "Thing", // Özellikler Product değil, genel bir "şey"
                    "name": feature.name,
                    "url": `${window.location.origin}/features`, // Özelliğin kendi detay sayfası yoksa ana özellikler sayfası
                    "description": feature.description || t('no_description_available', { type: 'özellik' }),
                    // İsteğe bağlı olarak, özelliğin tipi veya birimi gibi ek özellikler eklenebilir
                    "additionalProperty": [
                        { "@type": "PropertyValue", "name": "Type", "value": feature.type || t('other') },
                        { "@type": "PropertyValue", "name": "Unit", "value": feature.unit || t('n_a') }
                    ].filter(prop => prop.value !== t('n_a')) // Değeri "N/A" olanları filtrele
                }
            }))
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={canonicalUrl} />
                {features && (
                    <script type="application/ld+json">
                        {JSON.stringify(featuresSchema)}
                    </script>
                )}
            </Helmet>

            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">{t('view_all_features')}</h1>

            {/* Filtreleme ve Sıralama Kontrolleri */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-center flex-wrap">
                <Input
                    type="text"
                    placeholder={t('search_feature')}
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                    className="max-w-sm md:max-w-xs"
                />
                <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t('sort_by')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name_asc">{t('name_asc')}</SelectItem>
                        <SelectItem value="name_desc">{t('name_desc')}</SelectItem>
                        <SelectItem value="created_at_desc">{t('newest')}</SelectItem>
                        <SelectItem value="created_at_asc">{t('oldest')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Özellik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.length > 0 ? (
                    features.map((feature) => (
                        <Card key={feature.id} className="h-full flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle>{feature.name}</CardTitle>
                                <CardDescription>
                                    <Badge variant="secondary">{feature.type || t('other')}</Badge>
                                    {feature.unit && <span className="ml-2 text-gray-500">Birim: {feature.unit}</span>}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {feature.description || t('no_description_available', { type: 'özellik' })}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    // Özellik bulunamadığında gösterilecek yeni boş durum bileşeni
                    <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-600 dark:text-gray-400">
                        <Frown className="h-16 w-16 mb-4 text-gray-400 dark:text-gray-500" />
                        <p className="text-xl font-semibold mb-2">{t('no_features_found')}</p>
                        <p className="text-center">{t('no_features_found_message')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeaturesPage;
