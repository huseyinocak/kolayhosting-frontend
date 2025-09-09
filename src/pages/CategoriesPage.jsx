import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom'; // useSearchParams eklendi
import { getAllCategories } from '../api/categories'; // Kategorileri çekmek için
import { useToastContext } from '../hooks/toast-utils'; // Toast bildirimleri için
import { useQuery } from '@tanstack/react-query'; // React Query useQuery hook'unu içe aktar

// Shadcn UI bileşenleri
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Input } from '../components/ui/input'; // Arama çubuğu için
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select'; // Dropdown seçimleri için
import AnimatedListItem from '@/components/AnimatedListItem';
import { Frown } from 'lucide-react'; // Frown ikonu eklendi
import { Helmet } from 'react-helmet-async'; // Helmet'i içe aktar
import { useTranslation } from 'react-i18next'; // i18n için useTranslation

const CategoriesPage = () => {
    const { toast } = useToastContext();
    const { t } = useTranslation();

    // URL arama parametrelerini yönetmek için useSearchParams
    const [searchParams, setSearchParams] = useSearchParams();

    // Filtreleme ve Sıralama State'leri - URL'den okunuyor
    const searchTerm = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'name_asc';

    // Sayfalama State'leri - URL'den okunuyor
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const [itemsPerPage] = useState(9); // Her sayfada 9 kategori göster

    // Debounce'lu arama terimi için state (Input'tan anlık değer, URL'ye yansıyan debounce'lu değer)
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

    // Arama terimini debounce etmek için useEffect
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                if (localSearchTerm) newParams.set('search', localSearchTerm);
                else newParams.delete('search');
                newParams.set('page', '1'); // Arama değiştiğinde sayfayı sıfırla
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

    // Kategorileri çekmek için useQuery
    const { data: categoriesData, isLoading, isError, error } = useQuery({
        queryKey: [
            'categories',
            searchTerm, // Debounce'lu terim doğrudan kullanılıyor
            sortParams,
            currentPage,
            itemsPerPage
        ],
        queryFn: () => getAllCategories({
            name: searchTerm,
            sort_by: sortParams.sort_by,
            sort_order: sortParams.sort_order,
            page: currentPage,
            per_page: itemsPerPage,
        }),
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000,
    });

    // API'den gelen kategoriler ve sayfalama meta bilgileri
    const categories = categoriesData?.data || [];
    const totalPages = categoriesData?.meta?.last_page || 1;
    const totalCategories = categoriesData?.meta?.total || 0;

    useEffect(() => {
        if (isError) {
            toast({
                title: "Hata",
                description: error.message || "Kategoriler yüklenirken bir sorun oluştu.",
                variant: "destructive",
            });
        }
    }, [isError, error, toast]);

    const handleSortChange = (value) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('sortBy', value);
            newParams.set('page', '1');
            return newParams;
        }, { replace: true });
    };

    const handlePrevPage = () => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            const prevPage = Math.max(parseInt(newParams.get('page') || '1', 10) - 1, 1);
            newParams.set('page', String(prevPage));
            return newParams;
        }, { replace: true });
    };

    const handleNextPage = () => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            const nextPage = Math.min(parseInt(newParams.get('page') || '1', 10) + 1, totalPages);
            newParams.set('page', String(nextPage));
            return newParams;
        }, { replace: true });
    };

    // Dinamik sayfa başlığı ve meta açıklaması
    const pageTitle = useMemo(() => {
        let title = t('categories_page_title', { defaultValue: 'Tüm Hosting Kategorileri' });
        if (searchTerm) {
            title = `${searchTerm} ${t('categories_search_results', { defaultValue: 'Kategori Arama Sonuçları' })}`;
        }
        return `${title} - KolayHosting`;
    }, [searchTerm, t]);

    const pageDescription = useMemo(() => {
        let description = t('categories_page_description', { defaultValue: 'KolayHosting\'de tüm hosting kategorilerini keşfedin. Web hosting, VPS, dedicated sunucu, bulut hosting ve daha fazlasını karşılaştırın.' });
        if (searchTerm) {
            description = `${t('categories_search_description_prefix', { defaultValue: 'Arama sonuçları:' })} ${searchTerm}. ${description}`;
        }
        return description;
    }, [searchTerm, t]);

    // Canonical URL
    const canonicalUrl = useMemo(() => {
        const baseUrl = `${window.location.origin}/categories`;
        const currentParams = new URLSearchParams(searchParams);

        // Sayfalama parametresini kaldır (ilk sayfa için)
        if (currentParams.get('page') === '1') {
            currentParams.delete('page');
        }

        const queryString = currentParams.toString();
        return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    }, [searchParams]);

    // Yükleme durumunda iskelet gösterimi
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-10 w-3/4 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(itemsPerPage)].map((_, index) => (
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

    return (
        <div className="container mx-auto px-4 py-8">
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={canonicalUrl} />
            </Helmet>

            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">{t('view_all_categories')}</h1>

            {/* Filtreleme ve Sıralama Kontrolleri */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-center flex-wrap">
                <Input
                    type="text"
                    placeholder={t('search_category')}
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

            {/* Kategori Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.length > 0 ? (
                    categories.map((category, index) => (
                        <AnimatedListItem key={category.id} delay={index * 100}>
                            <Card className="h-full flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-semibold">{category.name}</CardTitle>
                                    <CardDescription className="text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {category.description || t('no_description_for_category')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t('plan_count', { count: category.plans_count || 0 })}
                                    </p>
                                    <Button asChild className="w-full mt-auto">
                                        <Link to={`/categories/${category.id}/plans/`}>{t('view_plans_button')}</Link>                                        
                                    </Button>
                                </CardContent>
                            </Card>
                        </AnimatedListItem>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-600 dark:text-gray-400">
                        <Frown className="h-16 w-16 mb-4 text-gray-400 dark:text-gray-500" />
                        <p className="text-xl font-semibold mb-2">{t('no_categories_found')}</p>
                        <p className="text-center">{t('no_categories_found_message')}</p>
                    </div>
                )}
            </div>

            {/* Sayfalama Kontrolleri */}
            {totalCategories > 0 && ( // Sadece kategori varsa sayfalama göster
                <div className="flex justify-center items-center space-x-4 mt-8">
                    <Button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1 || isLoading}
                        variant="outline"
                    >
                        {t('previous')}
                    </Button>
                    <span className="text-lg font-semibold">
                        {t('page')} {currentPage} / {totalPages}
                    </span>
                    <Button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages || isLoading}
                        variant="outline"
                    >
                        {t('next')}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;
