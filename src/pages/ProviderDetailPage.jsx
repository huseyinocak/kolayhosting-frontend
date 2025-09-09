// src/pages/ProviderDetailPage.jsx

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProviderById, getProviderPlans, getProviderReviews } from '../api/providers';
import { createReview, deleteReview } from '../api/reviews'; // Yorum oluşturma ve silme API fonksiyonlarını içe aktar
import { useAuth } from '../hooks/useAuth'; // Kullanıcının oturum durumunu kontrol etmek için
import { useToastContext } from '../hooks/toast-utils';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query'; // useQuery ve useQueryClient'ı içe aktar
import { Helmet } from 'react-helmet-async'; // Helmet'i içe aktar
import { useTranslation } from 'react-i18next'; // i18n için useTranslation

// Shadcn UI bileşenleri
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../components/ui/dialog'; // Dialog bileşenleri için

// Yorum derecelendirme ikonları ve silme ikonu
import { Star, CheckCircle, Trash2 } from 'lucide-react'; // Trash2 eklendi

const ProviderDetailPage = () => {
    const { id } = useParams(); // URL'den sağlayıcı ID'sini al
    const navigate = useNavigate();
    const { toast } = useToastContext();
    const { user, isAuthenticated } = useAuth(); // Kullanıcının oturum durumunu al
    const { t } = useTranslation();

    const queryClient = useQueryClient(); // QueryClient instance'ını al

    // Silme işlemi için state'ler
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    // Sağlayıcı detaylarını çek
    const { data: provider, isLoading: isLoadingProvider, isError: isErrorProvider, error: providerError } = useQuery({
        queryKey: ['provider', id],
        queryFn: () => getProviderById(id),
        staleTime: 1000 * 60 * 5, // 5 dakika boyunca "stale" olmayacak
        enabled: !!id, // ID varsa sorguyu etkinleştir
        onError: (err) => {
            toast({
                title: "Hata",
                description: err.message || "Sağlayıcı detayları yüklenirken bir sorun oluştu.",
                variant: "destructive",
            });
        },
    });

    // Sağlayıcının planlarını çek
    const { data: plans, isLoading: isLoadingPlans } = useQuery({
        queryKey: ['providerPlans', id],
        queryFn: () => getProviderPlans(id),
        staleTime: 1000 * 60 * 5,
        onError: (err) => {
            toast({
                title: "Hata",
                description: err.message || "Sağlayıcı planları yüklenirken bir sorun oluştu.",
                variant: "destructive",
            });
        },
    });

    // Sağlayıcının yorumlarını çek
    const { data: reviews, isLoading: isLoadingReviews } = useQuery({
        queryKey: ['providerReviews', id], // Yorumlar için ayrı bir query key
        queryFn: () => getProviderReviews(id),
        staleTime: 1000 * 60, // Yorumlar daha sık güncellenebilir
        onError: (err) => {
            toast({
                title: "Hata",
                description: err.message || "Sağlayıcı yorumları yüklenirken bir sorun oluştu.",
                variant: "destructive",
            });
        },
    });

    // Yorum formu doğrulama şeması
    const reviewSchema = z.object({
        title: z.string().min(3, "Başlık en az 3 karakter olmalıdır.").max(100, "Başlık en fazla 100 karakter olmalıdır."),
        content: z.string().min(10, "Yorum içeriği en az 10 karakter olmalıdır.").max(500, "Yorum içeriği en fazla 500 karakter olmalıdır."),
        rating: z.string().refine(val => ['1', '2', '3', '4', '5'].includes(val), {
            message: "Lütfen 1 ile 5 arasında bir derecelendirme seçin."
        }),
    });

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            title: '',
            content: '',
            rating: 5,
        },
    });;

    const onSubmitReview = async (data) => {
        try {
            const reviewPayload = {
                ...data,
                provider_id: provider.id,
                user_id: user.id, // AuthContext'ten gelen user.id
                status: 'pending', // Varsayılan olarak beklemede
            };
            await createReview(reviewPayload); // API çağrısı
            toast({
                title: "Yorum Gönderildi",
                description: "Yorumunuz başarıyla gönderildi ve onay bekliyor.",
                variant: "success",
            });
            reset(); // Formu sıfırla
            // Yorum listesini yeniden çekmek için ilgili query'yi geçersiz kıl
            queryClient.invalidateQueries(['providerReviews', id]);
        } catch (err) {
            toast({
                title: "Yorum Gönderme Hatası",
                description: err.response?.data?.message || err.message || "Yorum gönderilirken bir sorun oluştu.",
                variant: "destructive",
            });
        }
    };

    // Yorum silme işlemini başlatan fonksiyon
    const handleDeleteReview = (reviewId) => {
        setReviewToDelete(reviewId);
        setIsConfirmDialogOpen(true);
    };

    // Yorum silme işlemini onaylayan fonksiyon
    const confirmDeleteReview = async () => {
        if (!reviewToDelete) return;
        try {
            await deleteReview(reviewToDelete);
            toast({
                title: "Yorum Silindi",
                description: "Yorum başarıyla silindi.",
                variant: "success",
            });
            queryClient.invalidateQueries(['providerReviews', id]); // Yorum listesini yeniden çek
            setIsConfirmDialogOpen(false);
            setReviewToDelete(null);
        } catch (err) {
            toast({
                title: "Silme Hatası",
                description: err.response?.data?.message || err.message || "Yorum silinirken bir sorun oluştu.",
                variant: "destructive",
            });
        }
    };


    if (isLoadingProvider || isLoadingPlans || isLoadingReviews) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-10 w-3/4 mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (isErrorProvider) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-500">
                <p>Sağlayıcı yüklenirken bir hata oluştu: {providerError.message}</p>
                <Button onClick={() => navigate('/providers')} className="mt-4">Sağlayıcılara Geri Dön</Button>
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
                <p>Sağlayıcı bulunamadı.</p>
                <Button onClick={() => navigate('/providers')} className="mt-4">Sağlayıcılara Geri Dön</Button>
            </div>
        );
    }

    // Schema.org JSON-LD verisi
    const providerSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": provider.name,
        "url": `${window.location.origin}/providers/${provider.id}`,
        "logo": provider.logo_url || `https://placehold.co/120x120/aabbcc/ffffff?text=${provider.name.charAt(0)}`,
        "description": provider.description || t('no_description_for_provider'),
        "sameAs": [
            provider.website_url // Sağlayıcının kendi web sitesi URL'si
        ],
        "aggregateRating": provider.average_rating > 0 ? {
            "@type": "AggregateRating",
            "ratingValue": provider.average_rating.toFixed(1),
            "reviewCount": provider.review_count,
            "bestRating": "5",
            "worstRating": "1"
        } : undefined,
        "offers": plans?.length > 0 ? plans.map(plan => ({
            "@type": "Offer",
            "name": plan.name,
            "url": `${window.location.origin}/plans/${plan.id}`,
            "priceCurrency": plan.currency,
            "price": plan.price,
            "itemCondition": "https://schema.org/NewCondition",
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": provider.name
            }
        })) : undefined
    };

    return (

        <div className="container mx-auto px-4 py-8">
            <Helmet>
                <script>

                    {console.log(JSON.stringify(providerSchema))}
                </script>
                <title>{provider.name} {t('provider_details_page_title_suffix', { defaultValue: 'Hosting Sağlayıcısı Detayları' })} - KolayHosting</title>
                <meta name="description" content={provider.description || t('provider_detail_page_description', { providerName: provider.name })} />
                <link rel="canonical" href={`${window.location.origin}/providers/${id}`} />
                {provider && (
                    <script type="application/ld+json">

                        {JSON.stringify(providerSchema)}
                    </script>
                )}
            </Helmet>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage
                            src={provider.logo_url}
                            alt={provider.name}
                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/aabbcc/ffffff?text=${provider.name.charAt(0)}`; }}
                        />
                        <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{provider.name}</h1>
                </div>
                {provider.average_rating > 0 && (
                    <Badge variant="secondary" className="text-lg px-3 py-1 flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                        {provider.average_rating.toFixed(1)}
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sağlayıcı Bilgileri */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hakkında</CardTitle>
                            <CardDescription>{provider.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-700 dark:text-gray-300">
                                **Web Sitesi:** <a href={provider.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{provider.website_url}</a>
                            </p>
                            {provider.contact_email && (
                                <p className="text-gray-700 dark:text-gray-300">
                                    **E-posta:** <a href={`mailto:${provider.contact_email}`} className="text-blue-600 hover:underline">{provider.contact_email}</a>
                                </p>
                            )}
                            {provider.phone_number && (
                                <p className="text-gray-700 dark:text-gray-300">
                                    **Telefon:** <a href={`tel:${provider.phone_number}`} className="text-blue-600 hover:underline">{provider.phone_number}</a>
                                </p>
                            )}
                            {provider.address && (
                                <p className="text-gray-700 dark:text-gray-300">
                                    **Adres:** {provider.address}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Planları ({plans?.length || 0})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {plans && plans.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {plans.map(plan => (
                                        <Card key={plan.id} className="p-4 hover:shadow-lg transition-shadow duration-300">
                                            <CardTitle className="text-lg mb-2">
                                                <Link to={`/plans/${plan.id}`} className="hover:underline">{plan.name}</Link>
                                            </CardTitle>
                                            <CardDescription className="mb-2">{plan.category?.name}</CardDescription>
                                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                {plan.price}₺ <span className="text-sm font-normal text-gray-500">/ {plan.billing_cycle}</span>
                                            </p>
                                            {plan.discount_percentage > 0 && (
                                                <Badge variant="secondary" className="mt-1">
                                                    %{plan.discount_percentage} İndirim
                                                </Badge>
                                            )}
                                            <Button asChild className="mt-4 w-full">
                                                <Link to={`/plans/${plan.id}`}>Detayları Görüntüle</Link>
                                            </Button>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400">Bu sağlayıcıya ait henüz plan bulunmamaktadır.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Yorumlar ve Yorum Ekleme Formu */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Kullanıcı Yorumları ({reviews?.length || 0})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {reviews && reviews.length > 0 ? (
                                reviews.map(review => {
                                    // review.user'ın null veya undefined olup olmadığını kontrol et
                                    const userName = review.user?.name || 'Anonim Kullanıcı';
                                    const userAvatar = review.user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${userName}`;

                                    return (
                                        <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    {/* Avatar ve Kullanıcı Adı */}
                                                    <img
                                                        src={userAvatar}
                                                        alt={userName}
                                                        className="w-8 h-8 rounded-full mr-3 object-cover"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/32x32/aabbcc/ffffff?text=${userName.charAt(0)}`; }}
                                                    />
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{userName}</span>
                                                </div>
                                                {/* Silme Butonu - Sadece kendi yorumuysa veya adminse göster */}
                                                {isAuthenticated && user && (user.id === review.user?.id || user.role === 'admin') && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteReview(review.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Yorumu Sil</span>
                                                    </Button>
                                                )}
                                            </div>
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
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{review.title}</h3>
                                            <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{review.content}</p>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-gray-600 dark:text-gray-400">Bu sağlayıcı için henüz yorum bulunmamaktadır.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Yorum Yap</CardTitle>
                            <CardDescription>Bu sağlayıcı hakkındaki düşüncelerinizi paylaşın.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isAuthenticated ? (
                                <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-4">
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="title">Yorum Başlığı</Label>
                                        <Input
                                            id="title"
                                            placeholder="Yorumunuz için kısa bir başlık"
                                            {...register("title")}
                                        />
                                        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="content">Yorumunuz</Label>
                                        <Textarea
                                            id="content"
                                            placeholder="Sağlayıcı hakkındaki detaylı yorumunuzu buraya yazın..."
                                            {...register("content")}
                                            rows={4}
                                        />
                                        {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="rating">Derecelendirme</Label>
                                        <Controller
                                            name="rating"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Derecelendirme Seçin" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[1, 2, 3, 4, 5].map(num => (
                                                            <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.rating && <p className="text-red-500 text-sm">{errors.rating.message}</p>}
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>Yorumu Gönder</Button>
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

export default ProviderDetailPage;
