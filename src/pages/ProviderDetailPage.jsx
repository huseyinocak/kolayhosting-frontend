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

// Yorum formu için Zod şeması (plan detay sayfasındakiyle aynı)
const reviewSchema = z.object({
    title: z.string().min(3, { message: "Başlık en az 3 karakter olmalıdır." }).max(100, { message: "Başlık en fazla 100 karakter olmalıdır." }),
    content: z.string().min(10, { message: "Yorum içeriği en az 10 karakter olmalıdır." }).max(500, { message: "Yorum içeriği en fazla 500 karakter olmalıdır." }),
    rating: z.coerce.number().min(1, { message: "Derecelendirme 1 ile 5 arasında olmalıdır." }).max(5, { message: "Derecelendirme 1 ile 5 arasında olmalıdır." }),
});

const ProviderDetailPage = () => {
    const { id } = useParams();
    const [provider, setProvider] = useState(null);
    const [plans, setPlans] = useState([]);
    const [reviews, setReviews] = useState([]); // Tüm yorumları tutacak
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { toast } = useToastContext();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth(); // Kullanıcı ve kimlik doğrulama durumunu al

    // Yorum formu için useForm hook'u
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset: resetReviewForm,
        control,
    } = useForm({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            title: '',
            content: '',
            rating: '',
        },
    });

    // Sağlayıcı detaylarını, planlarını ve yorumlarını çekme fonksiyonu
    const fetchProviderDetails = async () => {
        setLoading(true);
        try {
            const [providerData, plansData, reviewsData] = await Promise.all([
                getProviderById(id),
                getProviderPlans(id),
                getProviderReviews(id), // Bu fonksiyon artık backend'den sadece onaylı yorumları getirmeli
            ]);
            setProvider(providerData);
            setPlans(plansData);
            setReviews(reviewsData); // Backend'den gelen yorumları doğrudan kullanıyoruz
        } catch (err) {
            setError(err.message || 'Sağlayıcı detayları yüklenirken bir hata oluştu.');
            toast({
                title: "Hata",
                description: "Sağlayıcı detayları yüklenirken bir sorun oluştu.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviderDetails();
    }, [id, toast]);

    // Yorum gönderme işlemi
    const onSubmitReview = async (data) => {
        if (!isAuthenticated || !user) {
            toast({
                title: "Yetkilendirme Hatası",
                description: "Yorum yapmak için giriş yapmalısınız.",
                variant: "destructive",
            });
            navigate('/login');
            return;
        }

        try {
            const reviewPayload = {
                provider_id: parseInt(id), // URL'den gelen sağlayıcı ID'si
                user_id: user.id, // Giriş yapmış kullanıcının ID'si
                title: data.title,
                content: data.content,
                rating: data.rating,
                status: 'pending', // Yorum başlangıçta beklemede olacak
            };
            await createReview(reviewPayload);
            toast({
                title: "Yorum Gönderildi",
                description: "Yorumunuz incelenmek üzere gönderildi. Onaylandıktan sonra yayınlanacaktır.",
            });
            resetReviewForm();
            fetchProviderDetails(); // Yorumları yeniden çek
        } catch (err) {
            toast({
                title: "Yorum Gönderme Hatası",
                description: err.response?.data?.message || "Yorumunuz gönderilirken bir sorun oluştu.",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-16 w-3/4 mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
                        </Card>
                        <Card>
                            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                            <CardContent><Skeleton className="h-32 w-full" /></CardContent>
                        </Card>
                    </div>
                    <div className="space-y-8">
                        <Card>
                            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                            <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-500">
                <p>{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">Tekrar Dene</Button>
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
                <p>Sağlayıcı bulunamadı.</p>
                <Button onClick={() => navigate('/providers')} className="mt-4">Tüm Sağlayıcılara Geri Dön</Button>
            </div>
        );
    }

    // Frontend'deki bu filtreleme kaldırıldı, çünkü backend'in zaten onaylı yorumları getirdiği varsayılıyor.
    // const approvedReviews = reviews.filter(review => review.status === 'approved');

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
                {provider.name} Detayları
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sağlayıcı Bilgileri */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center space-x-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={provider.logo_url || `https://placehold.co/80x80/aabbcc/ffffff?text=${provider.name.charAt(0)}`} alt={`${provider.name} Logo`} />
                                <AvatarFallback className="text-3xl">{provider.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-3xl">{provider.name}</CardTitle>
                                <CardDescription className="text-lg">
                                    Ortalama Derecelendirme: {provider.average_rating ? `${provider.average_rating} / 5` : 'N/A'}
                                </CardDescription>
                                {provider.website_url && (
                                    <Button variant="link" asChild className="p-0 mt-2">
                                        <a href={provider.website_url} target="_blank" rel="noopener noreferrer">
                                            Resmi Web Sitesi
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {provider.description || 'Bu sağlayıcı için açıklama bulunmamaktadır.'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Sağlayıcının Planları */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sağlayıcının Planları ({plans.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {plans.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {plans.map((plan) => (
                                        <Card key={plan.id} className="p-4">
                                            <CardTitle className="text-lg mb-2">{plan.name}</CardTitle>
                                            <CardDescription className="mb-2">
                                                {plan.category?.name || 'Bilinmeyen Kategori'}
                                            </CardDescription>
                                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                                {plan.currency} {plan.price} / ay
                                            </p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                                {plan.features_summary || 'Özellik özeti yok.'}
                                            </p>
                                            <Button variant="outline" asChild>
                                                <Link to={`/plans/${plan.id}`}>Plan Detayları</Link>
                                            </Button>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400">Bu sağlayıcıya ait plan bulunmamaktadır.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Yorumlar ve Yorum Ekle Formu */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Kullanıcı Yorumları ({reviews.length})</CardTitle> {/* reviews.length kullanıldı */}
                        </CardHeader>
                        <CardContent>
                            {reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <Card key={review.id} className="p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="font-semibold">{review.title}</p>
                                                <Badge variant="outline">{review.rating} / 5</Badge>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{review.content}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {review.user?.name || 'Anonim'} - {new Date(review.published_at).toLocaleDateString()}
                                            </p>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400">Bu sağlayıcı için henüz yorum bulunmamaktadır.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Yorum Ekle</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isAuthenticated ? (
                                <form onSubmit={handleSubmit(onSubmitReview)} className="grid gap-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="review-title">Başlık</Label>
                                        <Input
                                            id="review-title"
                                            placeholder="Yorumunuz için kısa bir başlık"
                                            {...register("title")}
                                        />
                                        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="review-content">Yorumunuz</Label>
                                        <Textarea
                                            id="review-content"
                                            placeholder="Deneyiminizi detaylıca anlatın..."
                                            {...register("content")}
                                        />
                                        {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="review-rating">Derecelendirme (1-5)</Label>
                                        <Controller
                                            name="rating"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={(value) => field.onChange(parseFloat(value))} value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger id="review-rating">
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
                                    <Button type="submit" className="w-full">Yorumu Gönder</Button>
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
