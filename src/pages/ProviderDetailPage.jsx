// src/pages/ProviderDetailPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProviderById, getProviderPlans, getProviderReviews } from '../api/providers';
import { createReview } from '../api/reviews'; // Yorum oluşturma API fonksiyonunu içe aktar
import { useAuth } from '../hooks/useAuth'; // Kullanıcının oturum durumunu kontrol etmek için
import { useToastContext } from '../hooks/toast-utils';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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

// Yorum formu şeması
const reviewSchema = z.object({
    title: z.string().min(3, { message: "Başlık en az 3 karakter olmalıdır." }).max(100, { message: "Başlık en fazla 100 karakter olmalıdır." }),
    content: z.string().min(10, { message: "Yorum içeriği en az 10 karakter olmalıdır." }).max(500, { message: "Yorum içeriği en fazla 500 karakter olmalıdır." }),
    rating: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 1 && parseFloat(val) <= 5, {
        message: "Derecelendirme 1 ile 5 arasında bir sayı olmalıdır.",
    }),
});

const ProviderDetailPage = () => {
    const { id } = useParams(); // URL'den sağlayıcı ID'sini al
    const [provider, setProvider] = useState(null);
    const [plans, setPlans] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, isAuthenticated } = useAuth(); // Kullanıcı bilgisi ve oturum durumu
    const { toast } = useToastContext();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(reviewSchema),
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const providerData = await getProviderById(id);
                setProvider(providerData);

                const providerPlans = await getProviderPlans(id);
                setPlans(providerPlans);

                const providerReviews = await getProviderReviews(id);
                setReviews(providerReviews);

            } catch (err) {
                setError(err.message || 'Sağlayıcı bilgileri yüklenirken bir hata oluştu.');
                toast({
                    title: "Hata",
                    description: "Sağlayıcı bilgileri yüklenirken bir sorun oluştu.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, toast]);

    const onSubmitReview = async (data) => {
        if (!isAuthenticated) {
            toast({
                title: "Yetkisiz İşlem",
                description: "Yorum yapmak için giriş yapmalısınız.",
                variant: "destructive",
            });
            return;
        }

        try {
            const reviewData = {
                ...data,
                rating: parseFloat(data.rating), // String'i sayıya çevir
                provider_id: provider.id,
                user_id: user.id, // Oturum açmış kullanıcının ID'si
            };
            await createReview(reviewData);
            toast({
                title: "Yorum Gönderildi",
                description: "Yorumunuz başarıyla eklendi.",
                variant: "success", // Başarılı bir gönderim bildirimi  
            });
            reset(); // Formu sıfırla
            // Yorumlar listesini yeniden çek
            const updatedReviews = await getProviderReviews(id);
            setReviews(updatedReviews);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Yorum gönderilirken bir hata oluştu.';
            toast({
                title: "Yorum Hatası",
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-10 w-1/2 mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Skeleton className="h-48 w-full mb-8" />
                        <Skeleton className="h-32 w-full mb-8" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="lg:col-span-1">
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-500 text-lg">
                Hata: {error}
                <Button onClick={() => navigate('/')} className="mt-4">Ana Sayfaya Dön</Button>
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400 text-lg">
                Sağlayıcı bulunamadı.
                <Button onClick={() => navigate('/providers')} className="mt-4">Sağlayıcılara Geri Dön</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols gap-8">
                {/* Sağlayıcı Detayları */}
                <div className="lg:col-span-2">
                    <Card className="mb-8">
                        <CardHeader className="flex flex-col md:flex-row items-center space-x-4 p-6">
                            <Avatar className="h-24 w-24 flex-shrink-0">
                                <AvatarImage
                                    src={provider.logo_url || `https://placehold.co/96x96/e2e8f0/000000?text=${provider.name.charAt(0)}`}
                                    alt={provider.name}
                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/96x96/e2e8f0/000000?text=${provider.name.charAt(0)}`; }}
                                />
                                <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-center md:text-left mt-4 md:mt-0">
                                <CardTitle className="text-3xl font-bold">{provider.name}</CardTitle>
                                <CardDescription className="flex flex-col md:flex-row items-center mt-2">
                                    <Badge variant="secondary" className="mr-2 mb-2 md:mb-0">
                                        Ort. Derecelendirme: {
                                            // average_rating'i sayıya dönüştür ve geçerli bir sayı ise toFixed kullan
                                            // Aksi takdirde '0.0' göster
                                            !isNaN(parseFloat(provider.average_rating))
                                                ? parseFloat(provider.average_rating).toFixed(1)
                                                : '0.0'
                                        } / 5
                                    </Badge>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        ({provider.review_count || 0} yorum)
                                    </span>
                                </CardDescription>
                                {provider.affiliate_url ? (
                                    <>
                                        <a
                                            href={provider.affiliate_url} // Affiliate URL varsa onu kullan, yoksa normal site URL'si
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full mt-4"
                                            onClick={() => {
                                                if (window.gtag) {
                                                    window.gtag('event', 'affiliate_click', {
                                                        provider_id: provider.id,
                                                        provider_name: provider.name,
                                                        provider_slug: provider.slug,
                                                        affiliate_url: provider.affiliate_url,
                                                    });
                                                }
                                            }}
                                        >
                                            <Button className="w-full md:w-auto px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:scale-105">
                                                Resmi Web Sitesini Ziyaret Et
                                            </Button>
                                        </a>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                                            Bu bir ortaklık bağlantısıdır. Bu bağlantıdan yapılan alışverişlerde KolayHosting komisyon kazanabilir.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <a
                                            href={provider.website_url} // Affiliate URL varsa onu kullan, yoksa normal site URL'si
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full mt-4"
                                            onClick={() => {
                                                if (window.gtag) {
                                                    window.gtag('event', 'affiliate_click', {
                                                        provider_id: provider.id,
                                                        provider_name: provider.name,
                                                        provider_slug: provider.slug,
                                                        affiliate_url: provider.affiliate_url,
                                                    });
                                                }
                                            }}
                                        >
                                            <Button className="w-full md:w-auto px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:scale-105">
                                                Resmi Web Sitesini Ziyaret Et
                                            </Button>
                                        </a>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                                            Bu sağlayıcı ile ortaklık bağlantımız bulunmamaktadır. Normal web sitesinden ziyaret edebilirsiniz.
                                        </p>
                                    </>

                                )
                                }
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Hakkında</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                {provider.description || 'Bu sağlayıcı hakkında detaylı bilgi bulunmamaktadır.'}
                            </p>

                            <Separator className="my-6" />

                            <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Planları</h3>
                            {plans.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {plans.map(plan => (
                                        <Card key={plan.id} className="p-4 hover:shadow-md transition-shadow">
                                            <CardTitle className="text-lg mb-1">{plan.name}</CardTitle>
                                            <CardDescription className="text-sm">
                                                {plan.category?.name && (
                                                    <Badge variant="secondary" className="mr-2">
                                                        {plan.category.name}
                                                    </Badge>
                                                )}
                                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                                    {plan.price} {plan.currency}
                                                </span>
                                            </CardDescription>
                                            <Button asChild variant="link" className="p-0 h-auto mt-2">
                                                <Link to={`/plans/${plan.id}`}>Detayları Gör</Link>
                                            </Button>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400">Bu sağlayıcıya ait henüz plan bulunmamaktadır.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Yorumlar Bölümü */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Kullanıcı Yorumları ({reviews.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {reviews.map(review => (
                                        <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                                            <div className="flex items-center mb-2">
                                                <Avatar className="h-9 w-9 mr-3">
                                                    <AvatarImage src={review.user?.avatar_url || `https://placehold.co/80x80/e2e8f0/000000?text=${review.user?.name?.charAt(0) || 'U'}`} alt={review.user?.name || 'Anonim'} />
                                                    <AvatarFallback>{review.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{review.user?.name || 'Anonim Kullanıcı'}</p>
                                                    <div className="flex items-center text-sm text-yellow-500">
                                                        {[...Array(review.rating)].map((_, i) => (
                                                            <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 18.896l-7.416 3.817 1.48-8.279L.001 9.306l8.332-1.151L12 .587z" /></svg>
                                                        ))}
                                                        {[...Array(5 - review.rating)].map((_, i) => (
                                                            <svg key={i + review.rating} className="h-4 w-4 fill-current text-gray-300" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 18.896l-7.416 3.817 1.48-8.279L.001 9.306l8.332-1.151L12 .587z" /></svg>
                                                        ))}
                                                        <span className="ml-2 text-gray-600 dark:text-gray-400">({review.rating}/5)</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{review.title}</p>
                                            <p className="text-gray-700 dark:text-gray-300 text-sm">{review.content}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                                {new Date(review.created_at).toLocaleDateString('tr-TR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-600 dark:text-gray-400">Bu sağlayıcı için henüz yorum bulunmamaktadır.</p>
                            )}

                            <Separator className="my-6" />

                            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Yorum Yapın</h3>
                            {isAuthenticated ? (
                                <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-4">
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="title">Yorum Başlığı</Label>
                                        <Input
                                            id="title"
                                            type="text"
                                            placeholder="Yorumunuz için kısa bir başlık"
                                            {...register("title")}
                                        />
                                        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                                    </div>
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="content">Yorumunuz</Label>
                                        <Textarea
                                            id="content"
                                            placeholder="Detaylı yorumunuzu buraya yazın..."
                                            {...register("content")}
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
                                                    <SelectTrigger className="w-full">
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
        </div>
    );
};

export default ProviderDetailPage;
