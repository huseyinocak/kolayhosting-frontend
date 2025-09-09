import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPlanById, getPlanFeatures, getPlanReviews } from '../api/plans'; // Plan API fonksiyonlarını içe aktar
import { createReview, deleteReview } from '../api/reviews'; // Yorum oluşturma ve silme API fonksiyonlarını içe aktar
import { useAuth } from '../hooks/useAuth'; // Kullanıcının oturum durumunu kontrol etmek için
import { useToastContext } from '../hooks/toast-utils'; // Toast bildirimleri için
import { useForm, Controller } from 'react-hook-form'; // Form yönetimi için
import { zodResolver } from '@hookform/resolvers/zod'; // Zod resolver için
import * as z from 'zod'; // Zod şemaları için
import { useQuery, useQueryClient } from '@tanstack/react-query'; // useQuery ve useQueryClient'ı içe aktar
import { Helmet } from 'react-helmet-async'; // Helmet'i içe aktar
import { useTranslation } from 'react-i18next'; // i18n için useTranslation

// Shadcn UI bileşenleri
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { Star, Frown, CheckCircle2 } from 'lucide-react'; // Star ve Frown ikonları
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';


const reviewSchema = z.object({
    title: z.string().min(3, { message: "Yorum başlığı en az 3 karakter olmalıdır." }).max(100, { message: "Yorum başlığı en fazla 100 karakter olmalıdır." }),
    content: z.string().min(10, { message: "Yorum içeriği en az 10 karakter olmalıdır." }).max(500, { message: "Yorum içeriği en fazla 500 karakter olmalıdır." }),
    rating: z.number().min(1, { message: "Derecelendirme en az 1 olmalıdır." }).max(5, { message: "Derecelendirme en fazla 5 olmalıdır." }),
});

const PlanDetailPage = () => {
    const { id } = useParams(); // URL'den plan ID'sini al
    const { user, isAuthenticated } = useAuth(); // Kullanıcı bilgisi ve oturum durumu
    const { toast } = useToastContext();
    const queryClient = useQueryClient(); // QueryClient'ı al
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            title: '',
            content: '',
            rating: 5,
        },
    });

    // Plan detaylarını çekmek için useQuery
    const { data: plan, isLoading: isLoadingPlan, isError: isErrorPlan, error: errorPlan } = useQuery({
        queryKey: ['plan', id],
        queryFn: () => getPlanById(id),
        enabled: !!id, // ID varsa sorguyu etkinleştir
        staleTime: 5 * 60 * 1000, // 5 dakika boyunca veriyi "stale" olarak işaretleme
    });

    // Planın özelliklerini çekmek için useQuery
    const { data: features, isLoading: isLoadingFeatures, isError: isErrorFeatures, error: errorFeatures } = useQuery({
        queryKey: ['planFeatures', id],
        queryFn: () => getPlanFeatures(id),
        enabled: !!id, // ID varsa sorguyu etkinleştir
        staleTime: 5 * 60 * 1000,
    });

    // Planın yorumlarını çekmek için useQuery
    const { data: reviews, isLoading: isLoadingReviews, isError: isErrorReviews, error: errorReviews } = useQuery({
        queryKey: ['planReviews', id],
        queryFn: () => getPlanReviews(id),
        enabled: !!id, // ID varsa sorguyu etkinleştir
        staleTime: 1 * 60 * 1000, // Yorumlar daha sık güncellenebilir
    });

    useEffect(() => {
        if (isErrorPlan) {
            toast({
                title: "Hata",
                description: errorPlan.message || "Plan bilgileri yüklenirken bir sorun oluştu.",
                variant: "destructive",
            });
            navigate('/404', { replace: true }); // Plan bulunamazsa 404 sayfasına yönlendir
        }
        if (isErrorFeatures) {
            toast({
                title: "Hata",
                description: errorFeatures.message || "Planın özellikleri yüklenirken bir sorun oluştu.",
                variant: "destructive",
            });
        }
        if (isErrorReviews) {
            toast({
                title: "Hata",
                description: errorReviews.message || "Planın yorumları yüklenirken bir sorun oluştu.",
                variant: "destructive",
            });
        }
    }, [isErrorPlan, errorPlan, isErrorFeatures, errorFeatures, isErrorReviews, errorReviews, toast, navigate]);


    const onSubmitReview = async (data) => {
        try {
            await createReview({
                ...data,
                reviewable_id: id,
                reviewable_type: 'plan',
            });
            toast({
                title: "Başarılı",
                description: "Yorumunuz başarıyla eklendi.",
                variant: "success",
            });
            reset(); // Formu temizle
            queryClient.invalidateQueries(['planReviews', id]); // Yorumları yeniden çek
            queryClient.invalidateQueries(['plan', id]); // Plan derecelendirmesini güncellemek için
        } catch (err) {
            toast({
                title: "Hata",
                description: err.message || "Yorum gönderilirken bir hata oluştu.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteReviewClick = (reviewId) => {
        setReviewToDelete(reviewId);
        setIsConfirmDialogOpen(true);
    };

    const confirmDeleteReview = async () => {
        if (!reviewToDelete) return;
        try {
            await deleteReview(reviewToDelete);
            toast({
                title: "Başarılı",
                description: "Yorum başarıyla silindi.",
                variant: "success",
            });
            queryClient.invalidateQueries(['planReviews', id]); // Yorumları yeniden çek
            queryClient.invalidateQueries(['plan', id]); // Plan derecelendirmesini güncellemek için
        } catch (err) {
            toast({
                title: "Hata",
                description: err.message || "Yorum silinirken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setIsConfirmDialogOpen(false);
            setReviewToDelete(null);
        }
    };

    // Yükleme durumunda iskelet gösterimi
    if (isLoadingPlan) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-64 w-full mb-8" />
                <Skeleton className="h-48 w-full mb-8" />
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <Frown className="h-16 w-16 mb-4 text-gray-400 dark:text-gray-500" />
                <p className="text-xl font-semibold mb-2">{t('plan_not_found')}</p>
                <Button onClick={() => navigate('/plans')}>{t('go_back_to_plans')}</Button>
            </div>
        );
    }

    // Schema.org JSON-LD verisi
    const planSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": plan.name,
        "description": plan.summary || t('no_description_for_plan'),
        // Plan için bir görsel URL'si varsa buraya ekleyin, yoksa genel bir placeholder kullanın.
        // Örneğin: "image": plan.image_url || "https://placehold.co/600x400/cccccc/ffffff?text=Hosting+Plan",
        "url": `${window.location.origin}/plans/${plan.id}`,
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
        } : undefined,
        "reviews": reviews?.data?.length > 0 ? reviews.data.map(review => ({
            "@type": "Review",
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": review.rating,
                "bestRating": "5",
                "worstRating": "1"
            },
            "author": {
                "@type": "Person",
                "name": review.user?.name || t('unknown_user')
            },
            "datePublished": review.created_at,
            "reviewBody": review.content,
            "name": review.title || t('no_title')
        })) : undefined
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <Helmet>
                <title>{plan.name} {t('plan_details_page_title_suffix', { defaultValue: 'Hosting Planı Detayları' })} - KolayHosting</title>
                <meta name="description" content={plan.summary || t('plan_detail_page_description', { planName: plan.name, providerName: plan.provider?.name || 'bir sağlayıcı', categoryName: plan.category?.name || 'bir kategori' })} />
                <link rel="canonical" href={`${window.location.origin}/plans/${id}`} />
                {plan && (
                    <script type="application/ld+json">
                        {JSON.stringify(planSchema)}
                    </script>
                )}
            </Helmet>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Plan Bilgileri */}
                <div className="lg:col-span-2">
                    <Card className="mb-8 p-6 shadow-lg">
                        <CardHeader className="p-0 pb-4">
                            <CardTitle className="text-4xl font-bold mb-2">{plan.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                {plan.category?.name && (
                                    <Badge variant="secondary" className="text-base">
                                        {plan.category.name}
                                    </Badge>
                                )}
                                {plan.provider?.name && (
                                    <Link to={`/providers/${plan.provider.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                        <Badge variant="outline" className="text-base">
                                            {plan.provider.name}
                                        </Badge>
                                    </Link>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <p className="text-5xl font-extrabold text-blue-700 dark:text-blue-300 mb-4">
                                {plan.price} {plan.currency}
                                {plan.discount_percentage > 0 && (
                                    <span className="ml-4 text-2xl text-red-500 line-through">
                                        {(plan.price / (1 - plan.discount_percentage / 100)).toFixed(2)} {plan.currency}
                                    </span>
                                )}
                            </p>
                            {plan.renewal_price && (
                                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                                    {t('renewal_price')}: {plan.renewal_price} {plan.currency}
                                </p>
                            )}
                            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                {plan.summary || t('no_description_for_plan')}
                            </p>
                            <div className="flex flex-wrap gap-4 mt-4">
                                {plan.website_url && (
                                    <Button asChild variant="outline" className="flex items-center gap-2">
                                        <Link to={plan.website_url} target="_blank" rel="noopener noreferrer">
                                            {t('visit_site_button')}
                                        </Link>
                                    </Button>
                                )}
                                {plan.affiliate_url && (
                                    <Button asChild className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
                                        <Link to={plan.affiliate_url} target="_blank" rel="noopener noreferrer">
                                            {t('buy_now_button')}
                                        </Link>
                                    </Button>
                                )}
                            </div>
                            {plan.affiliate_url && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {t('affiliate_disclosure')}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Plan Özellikleri */}
                    <Card className="mb-8 p-6 shadow-lg">
                        <CardHeader className="p-0 pb-4">
                            <CardTitle className="text-2xl font-semibold">{t('detailed_features')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoadingFeatures ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[...Array(4)].map((_, index) => (
                                        <Skeleton key={index} className="h-10 w-full" />
                                    ))}
                                </div>
                            ) : features?.length > 0 ? (
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-gray-700 dark:text-gray-300">
                                    {features.map(feature => (
                                        <li key={feature.id} className="flex items-center">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                            <span>
                                                <span className="font-medium">{feature.name}:</span>{' '}
                                                {feature.value} {feature.unit}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-600 dark:text-gray-400">
                                    <Frown className="h-16 w-16 mb-4 text-gray-400 dark:text-gray-500" />
                                    <p className="text-xl font-semibold mb-2">{t('no_features_for_plan')}</p>
                                    <p className="text-center">{t('no_features_for_plan_message')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Kullanıcı Yorumları */}
                <div className="lg:col-span-1">
                    <Card className="p-6 shadow-lg">
                        <CardHeader className="p-0 pb-4">
                            <CardTitle className="text-2xl font-semibold">{t('user_reviews')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoadingReviews ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, index) => (
                                        <Skeleton key={index} className="h-24 w-full" />
                                    ))}
                                </div>
                            ) : reviews?.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map(review => (
                                        <div key={review.id} className="border-b pb-4 last:border-b-0 dark:border-gray-700">
                                            <div className="flex items-center mb-2">
                                                {/* Derecelendirme Yıldızları */}
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                                                        fill={i < review.rating ? 'currentColor' : 'none'}
                                                    />
                                                ))}
                                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(review.published_at).toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold text-lg mb-1">{review.title || t('no_title')}</h4>
                                            <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{review.content}</p>
                                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                                <span>{new Date(review.created_at).toLocaleDateString('tr-TR')}</span>
                                                {isAuthenticated && user?.id === review.user_id && (
                                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteReviewClick(review.id)}>
                                                        {t('delete')}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-600 dark:text-gray-400">
                                    <Frown className="h-16 w-16 mb-4 text-gray-400 dark:text-gray-500" />
                                    <p className="text-xl font-semibold mb-2">{t('no_reviews_yet', { type: 'plan' })}</p>
                                    <p className="text-center">{t('no_reviews_yet_message')}</p>
                                </div>
                            )}

                            <Separator className="my-6" />

                            {isAuthenticated ? (
                                <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-4">
                                    <h3 className="text-xl font-semibold">{t('write_a_review')}</h3>
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="reviewTitle">{t('review_title')}</Label>
                                        <Input
                                            id="reviewTitle"
                                            placeholder={t('review_title_placeholder')}
                                            {...register("title")}
                                        />
                                        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="reviewContent">{t('review_content')}</Label>
                                        <Textarea
                                            id="reviewContent"
                                            placeholder={t('review_content_placeholder')}
                                            {...register("content")}
                                        />
                                        {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="rating">{t('rating')}</Label>
                                        <Controller
                                            name="rating"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={String(field.value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('select_rating')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[1, 2, 3, 4, 5].map(num => (
                                                            <SelectItem key={num} value={String(num)}>
                                                                {num} {t('stars')}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.rating && <p className="text-red-500 text-sm">{errors.rating.message}</p>}
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? t('submitting_review') : t('submit_review')}
                                    </Button>
                                </form>
                            ) : (
                                <p className="text-center text-gray-600 dark:text-gray-400">
                                    Yorum yapmak için lütfen <Link to="/login" className="text-blue-600 hover:underline">giriş yapın</Link>.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Silme Onay Diyaloğu */}
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Yorumu Silme Onayı</DialogTitle>
                        <DialogDescription>
                            Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                            İptal
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteReview}>
                            Sil
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PlanDetailPage;
