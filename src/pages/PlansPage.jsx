import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllPlans } from '../api/plans'; // Plan API fonksiyonlarını içe aktar
import { getAllCategories } from '../api/categories'; // Kategorileri çekmek için
import { getAllProviders } from '../api/providers'; // Sağlayıcıları çekmek için
import { useToastContext } from '../hooks/toast-utils'; // Toast bildirimleri için
import { useComparison } from '../hooks/useComparison'; // Karşılaştırma bağlamı için

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
import { Checkbox } from '../components/ui/checkbox'; // Karşılaştırma için checkbox
import { Badge } from '../components/ui/badge'; // İndirim ve diğer durumlar için
import { useQuery } from '@tanstack/react-query'; // React Query useQuery hook'unu içe aktar

const PlansPage = () => {
    const { toast } = useToastContext();
    const { addPlanToCompare, removePlanFromCompare, isPlanInComparison, plansToCompare, MAX_COMPARISON_LIMIT } = useComparison();

    // Filtreleme ve Sıralama State'leri
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all'); // Varsayılan değer 'all' olarak değiştirildi
    const [selectedProvider, setSelectedProvider] = useState('all'); // Varsayılan değer 'all' olarak değiştirildi
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('name_asc'); // 'name_asc', 'price_asc', 'price_desc', 'renewal_price_asc', 'renewal_price_desc', 'created_at_desc'

    // Sayfalama State'leri
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(9); // Her sayfada 9 plan göster

    // Debounce'lu arama terimi için state
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    // Debounce'lu fiyat aralıkları için state
    const [debouncedMinPrice, setDebouncedMinPrice] = useState('');
    const [debouncedMaxPrice, setDebouncedMaxPrice] = useState('');


    // Arama terimini debounce etmek için useEffect
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    // Fiyat aralıklarını debounce etmek için useEffect
    useEffect(() => {
        const minPriceHandler = setTimeout(() => {
            setDebouncedMinPrice(minPrice);
        }, 500);
        const maxPriceHandler = setTimeout(() => {
            setDebouncedMaxPrice(maxPrice);
        }, 500);

        return () => {
            clearTimeout(minPriceHandler);
            clearTimeout(maxPriceHandler);
        };
    }, [minPrice, maxPrice]);


    // Sıralama parametrelerini ayır
    const sortParams = useMemo(() => {
        const [sort_by, sort_order] = sortBy.split('_');
        return { sort_by, sort_order };
    }, [sortBy]);

    // Kategorileri çekmek için useQuery
    const { data: categoriesData, isLoading: isLoadingCategories, isError: isErrorCategories, error: errorCategories } = useQuery({
        queryKey: ['categoriesList'],
        queryFn: () => getAllCategories({ per_page: 9999 }), // Tüm kategorileri çek
        staleTime: 10 * 60 * 1000, // 10 dakika boyunca veriyi "stale" olarak işaretleme
    });
    const categories = categoriesData?.data || [];

    // Sağlayıcıları çekmek için useQuery
    const { data: providersData, isLoading: isLoadingProviders, isError: isErrorProviders, error: errorProviders } = useQuery({
        queryKey: ['providersList'],
        queryFn: () => getAllProviders({ per_page: 9999 }), // Tüm sağlayıcıları çek
        staleTime: 10 * 60 * 1000, // 10 dakika boyunca veriyi "stale" olarak işaretleme
    });
    const providers = providersData?.data || [];

    // Planları çekmek için useQuery
    const { data: plansData, isLoading, isError, error } = useQuery({
        queryKey: [
            'plans',
            debouncedSearchTerm,
            selectedCategory,
            selectedProvider,
            debouncedMinPrice,
            debouncedMaxPrice,
            sortParams,
            currentPage,
            itemsPerPage
        ],
        queryFn: () => getAllPlans({
            name: debouncedSearchTerm,
            category_id: selectedCategory === 'all' ? undefined : selectedCategory, // 'all' ise undefined gönder
            provider_id: selectedProvider === 'all' ? undefined : selectedProvider, // 'all' ise undefined gönder
            price_min: debouncedMinPrice ? parseFloat(debouncedMinPrice) : undefined,
            price_max: debouncedMaxPrice ? parseFloat(debouncedMaxPrice) : undefined,
            sort_by: sortParams.sort_by,
            sort_order: sortParams.sort_order,
            page: currentPage,
            per_page: itemsPerPage,
        }),
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000,
    });

    // API'den gelen planlar ve sayfalama meta bilgileri
    const plans = plansData?.data || [];
    const totalPages = plansData?.meta?.last_page || 1;
    const totalPlans = plansData?.meta?.total || 0;

    useEffect(() => {
        if (isError) {
            toast({
                title: "Hata",
                description: error.message || "Planlar yüklenirken bir sorun oluştu.",
                variant: "destructive",
            });
        }
        if (isErrorCategories) {
            toast({
                title: "Hata",
                description: errorCategories.message || "Kategoriler yüklenirken bir sorun oluştu.",
                variant: "destructive",
            });
        }
        if (isErrorProviders) {
            toast({
                title: "Hata",
                description: errorProviders.message || "Sağlayıcılar yüklenirken bir sorun oluştu.",
                variant: "destructive",
            });
        }
    }, [isError, error, isErrorCategories, errorCategories, isErrorProviders, errorProviders, toast]);

    // Filtre ve sıralama değişikliklerinde sayfayı sıfırla
    const resetPageOnFilterChange = useCallback(() => {
        setCurrentPage(1);
    }, []);

    useEffect(() => {
        resetPageOnFilterChange();
    }, [debouncedSearchTerm, selectedCategory, selectedProvider, debouncedMinPrice, debouncedMaxPrice, sortBy, resetPageOnFilterChange]);


    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
    };

    const handleProviderChange = (value) => {
        setSelectedProvider(value);
    };

    const handleMinPriceChange = (e) => {
        setMinPrice(e.target.value);
    };

    const handleMaxPriceChange = (e) => {
        setMaxPrice(e.target.value);
    };

    const handleSortChange = (value) => {
        setSortBy(value);
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handleCompareCheckboxChange = useCallback((plan, checked) => {
        if (checked) {
            addPlanToCompare(plan);
            // Google Analytics olayı gönder
            if (window.gtag) {
                window.gtag('event', 'plan_added_to_comparison', {
                    event_category: 'Comparison',
                    event_label: `Plan Added: ${plan.name} (${plan.provider?.name})`,
                    value: plan.price, // Plan fiyatını değer olarak gönderebilirsiniz
                    plan_id: plan.id,
                    plan_name: plan.name,
                    provider_name: plan.provider?.name,
                    category_name: plan.category?.name,
                });
            }
        } else {
            removePlanFromCompare(plan.id);
            // Google Analytics olayı gönder (çıkarıldığında)
            if (window.gtag) {
                window.gtag('event', 'plan_removed_from_comparison', {
                    event_category: 'Comparison',
                    event_label: `Plan Removed: ${plan.name} (${plan.provider?.name})`,
                    value: plan.price,
                    plan_id: plan.id,
                    plan_name: plan.name,
                    provider_name: plan.provider?.name,
                    category_name: plan.category?.name,
                });
            }
        }
    }, [addPlanToCompare, removePlanFromCompare]);

    // Yükleme durumunda iskelet gösterimi
    if (isLoading || isLoadingCategories || isLoadingProviders) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">Planlar Yükleniyor...</h1>
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
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">Tüm Hosting Planları</h1>

            {/* Filtreleme ve Sıralama Kontrolleri */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-center flex-wrap">
                <Input
                    type="text"
                    placeholder="Plan ara..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="max-w-sm md:max-w-xs"
                />
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Kategori Seç" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tüm Kategoriler</SelectItem> {/* Değer "all" olarak değiştirildi */}
                        {categories.map(category => (
                            <SelectItem key={category.id} value={String(category.id)}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={selectedProvider} onValueChange={handleProviderChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sağlayıcı Seç" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tüm Sağlayıcılar</SelectItem> {/* Değer "all" olarak değiştirildi */}
                        {providers.map(provider => (
                            <SelectItem key={provider.id} value={String(provider.id)}>
                                {provider.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    type="number"
                    placeholder="Min Fiyat"
                    value={minPrice}
                    onChange={handleMinPriceChange}
                    className="max-w-[120px]"
                />
                <Input
                    type="number"
                    placeholder="Max Fiyat"
                    value={maxPrice}
                    onChange={handleMaxPriceChange}
                    className="max-w-[120px]"
                />
                <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sırala" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name_asc">İsme Göre (A-Z)</SelectItem>
                        <SelectItem value="name_desc">İsme Göre (Z-A)</SelectItem>
                        <SelectItem value="price_asc">Fiyata Göre (Artan)</SelectItem>
                        <SelectItem value="price_desc">Fiyata Göre (Azalan)</SelectItem>
                        <SelectItem value="renewal_price_asc">Yenileme Fiyatı (Artan)</SelectItem>
                        <SelectItem value="renewal_price_desc">Yenileme Fiyatı (Azalan)</SelectItem>
                        <SelectItem value="created_at_desc">En Yeni</SelectItem>
                        <SelectItem value="created_at_asc">En Eski</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Plan Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.length > 0 ? (
                    plans.map((plan) => (
                        <Card key={plan.id} className="hover:shadow-xl transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription>
                                    {plan.category?.name && (
                                        <Badge variant="secondary" className="mr-2">
                                            {plan.category.name}
                                        </Badge>
                                    )}
                                    {plan.provider?.name && (
                                        <Badge variant="outline">
                                            {plan.provider.name}
                                        </Badge>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {plan.price} {plan.currency}
                                    {plan.discount_percentage > 0 && (
                                        <span className="ml-2 text-sm text-red-500 line-through">
                                            {(plan.price / (1 - plan.discount_percentage / 100)).toFixed(2)} {plan.currency}
                                        </span>
                                    )}
                                </p>
                                {plan.renewal_price && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Yenileme: {plan.renewal_price} {plan.currency}
                                    </p>
                                )}
                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                    {plan.summary || 'Bu plan için özet bilgi bulunmamaktadır.'}
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                    <Button asChild className="w-full mr-2">
                                        <Link to={`/plans/${plan.id}`}>Detayları Görüntüle</Link>
                                    </Button>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`compare-${plan.id}`}
                                            checked={isPlanInComparison(plan.id)}
                                            onCheckedChange={(checked) => handleCompareCheckboxChange(plan, checked)}
                                            disabled={plansToCompare.length >= MAX_COMPARISON_LIMIT && !isPlanInComparison(plan.id)}
                                        />
                                        <label
                                            htmlFor={`compare-${plan.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Karşılaştır
                                        </label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-600 dark:text-gray-400">
                        Filtreleme kriterlerine uygun plan bulunmamaktadır.
                    </div>
                )}
            </div>

            {/* Sayfalama Kontrolleri */}
            {totalPlans > 0 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                    <Button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1 || isLoading}
                        variant="outline"
                    >
                        Önceki
                    </Button>
                    <span className="text-lg font-semibold">
                        Sayfa {currentPage} / {totalPages}
                    </span>
                    <Button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages || isLoading}
                        variant="outline"
                    >
                        Sonraki
                    </Button>
                </div>
            )}
        </div>
    );
};

export default PlansPage;
