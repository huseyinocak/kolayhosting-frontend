// src/pages/CategoryPlansPage.jsx

import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getPlansByCategory, getCategoryById } from '../api/categories'; // Kategoriye göre planları getiren fonksiyon ve kategori detayını getiren fonksiyon
import { useToastContext } from '../hooks/toast-utils'; // Toast bildirimleri için
import { useComparison } from '../hooks/useComparison'; // Karşılaştırma bağlamı için
import { Helmet } from 'react-helmet-async'; // Helmet'i içe aktar
import { useTranslation } from 'react-i18next'; // i18n için useTranslation
import { useQuery } from '@tanstack/react-query'; // React Query useQuery hook'unu içe aktar

// Shadcn UI bileşenleri
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Checkbox } from '../components/ui/checkbox';
import { Frown } from 'lucide-react'; // Frown ikonu eklendi
import { Badge } from '../components/ui/badge'; // İndirim ve diğer durumlar için

const CategoryPlansPage = () => {
    const { slugOrId } = useParams(); // URL'den kategori slug'ını veya ID'sini al
    const { toast } = useToastContext();
    const { addPlanToCompare, removePlanFromCompare, isPlanInComparison, plansToCompare, MAX_COMPARISON_LIMIT } = useComparison();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Kategori detaylarını çekmek için useQuery
    const { data: category, isLoading: isLoadingCategory, isError: isErrorCategory, error: errorCategory } = useQuery({
        queryKey: ['category', slugOrId],
        queryFn: () => getCategoryById(slugOrId),
        enabled: !!slugOrId,
        staleTime: 5 * 60 * 1000,
    });

    // Kategoriye ait planları çekmek için useQuery
    const { data: plansData, isLoading: isLoadingPlans, isError: isErrorPlans, error: errorPlans } = useQuery({
        queryKey: ['categoryPlans', slugOrId],
        queryFn: () => getPlansByCategory(slugOrId),
        enabled: !!slugOrId,
        staleTime: 5 * 60 * 1000,
    });

    const plans = plansData || [];

    useEffect(() => {
        if (isErrorCategory) {
            toast({
                title: "Hata",
                description: errorCategory.message || "Kategori bilgileri yüklenirken bir sorun oluştu.",
                variant: "destructive",
            });
            navigate('/404', { replace: true }); // Kategori bulunamazsa 404 sayfasına yönlendir
        }
        if (isErrorPlans) {
            toast({
                title: "Hata",
                description: errorPlans.message || "Kategoriye ait planlar yüklenirken bir sorun oluştu.",
                variant: "destructive",
            });
        }
    }, [isErrorCategory, errorCategory, isErrorPlans, errorPlans, toast, navigate]);


    const handleCompareCheckboxChange = (plan, checked) => {
        if (checked) {
            addPlanToCompare(plan);
            // Google Analytics olayı gönder
            if (window.gtag) {
                window.gtag('event', 'plan_added_to_comparison', {
                    event_category: 'Comparison',
                    event_label: `Plan Added: ${plan.name} (${plan.provider?.name})`,
                    value: plan.price,
                    plan_id: plan.id,
                    plan_name: plan.name,
                    provider_name: plan.provider?.name,
                    category_name: category?.name,
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
                    category_name: category?.name,
                });
            }
        }
    };

    // Yükleme durumunda iskelet gösterimi
    if (isLoadingCategory || isLoadingPlans) {
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

    if (!category) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <Frown className="h-16 w-16 mb-4 text-gray-400 dark:text-gray-500" />
                <p className="text-xl font-semibold mb-2">{t('category_not_found')}</p>
                <Button onClick={() => navigate('/categories')}>{t('go_to_categories')}</Button>
            </div>
        );
    }

    // Dinamik sayfa başlığı ve meta açıklaması
    const pageTitle = `${category.name} ${t('category_plans_page_title_suffix', { defaultValue: 'Hosting Planları' })} - KolayHosting`;
    const pageDescription = category.description || t('category_plans_page_description', { categoryName: category.name });

    // Schema.org JSON-LD verisi
    const categorySchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage", // Kategori sayfası için CollectionPage
        "name": pageTitle,
        "description": pageDescription,
        "url": `${window.location.origin}/categories/${slugOrId}`,
        "mainEntity": {
            "@type": "ItemList", // Kategoriye ait planlar bir liste
            "numberOfItems": plans.length,
            "itemListElement": plans.map((plan, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "Product",
                    "name": plan.name,
                    "url": `${window.location.origin}/plans/${plan.id}`,
                    "description": plan.summary || t('no_description_for_plan'),
                    // Plan için bir görsel URL'si varsa buraya ekleyin, yoksa genel bir placeholder kullanın.
                    // "image": plan.image_url || "https://placehold.co/600x400/cccccc/ffffff?text=Hosting+Plan",
                    "brand": {
                        "@type": "Organization",
                        "name": plan.provider?.name || "KolayHosting"
                    },
                    "offers": {
                        "@type": "Offer",
                        "priceCurrency": plan.currency,
                        "price": plan.price,
                        "itemCondition": "https://schema.org/NewCondition",
                        "availability": "https://schema.org/InStock", // Planın durumuna göre değişebilir
                        "seller": {
                            "@type": "Organization",
                            "name": plan.provider?.name || "KolayHosting"
                        }
                    },
                    "aggregateRating": plan.average_rating > 0 ? {
                        "@type": "AggregateRating",
                        "ratingValue": plan.average_rating.toFixed(1),
                        "reviewCount": plan.review_count,
                        "bestRating": "5",
                        "worstRating": "1"
                    } : undefined
                }
            }))
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={`${window.location.origin}/categories/${slugOrId}`} />
                {category && (
                    <script type="application/ld+json">
                        {JSON.stringify(categorySchema)}
                    </script>
                )}
            </Helmet>

            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
                {category.name} {t('category_plans_title_heading', { defaultValue: 'Hosting Planları' })}
            </h1>

            <p className="text-center text-lg text-gray-700 dark:text-gray-300 mb-8">
                {category.description || t('no_description_for_category')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.length > 0 ? (
                    plans.map((plan) => (
                        <Card key={plan.id} className="h-full flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription>
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
                                        {t('renewal_price')}: {plan.renewal_price} {plan.currency}
                                    </p>
                                )}
                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                    {plan.summary || t('no_description_for_plan')}
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                    <Button asChild className="w-full mr-2">
                                        <Link to={`/plans/${plan.id}`}>{t('view_details_button')}</Link>
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
                                            {t('add_to_compare')}
                                        </label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    // Kategoriye ait plan bulunamadığında gösterilecek yeni boş durum bileşeni
                    <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-600 dark:text-gray-400">
                        <Frown className="h-16 w-16 mb-4 text-gray-400 dark:text-gray-500" />
                        <p className="text-xl font-semibold mb-2">{t('no_plans_for_category')}</p>
                        <p className="text-center">{t('no_plans_for_category_message')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPlansPage;
