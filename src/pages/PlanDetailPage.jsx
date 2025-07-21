import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPlanById, getPlanFeatures, getPlanReviews } from '../api/plans'; // Plan API fonksiyonlarını içe aktar
import { createReview } from '../api/reviews'; // Yorum oluşturma API fonksiyonunu içe aktar
import { useAuth } from '../hooks/useAuth'; // Kullanıcının oturum durumunu kontrol etmek için
import { useToastContext } from '../hooks/toast-utils'; // Toast bildirimleri için
import { useForm, Controller } from 'react-hook-form'; // Form yönetimi için
import { zodResolver } from '@hookform/resolvers/zod'; // Zod resolver için
import * as z from 'zod'; // Zod şemaları için

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

import { CheckCircle2, Star } from 'lucide-react'; // İkonlar için
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Yorum formu için Zod şeması
const reviewSchema = z.object({
    title: z.string().min(2, { message: "Başlık en az 2 karakter olmalıdır." }),
    content: z.string().min(10, { message: "Yorum içeriği en az 10 karakter olmalıdır." }),
    rating: z.preprocess(
        (val) => Number(val),
        z.number().min(1, { message: "Derecelendirme 1 ile 5 arasında olmalıdır." }).max(5, { message: "Derecelendirme 1 ile 5 arasında olmalıdır." })
    ),
});

const PlanDetailPage = () => {
    const { id } = useParams(); // URL'den plan ID'sini al
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth(); // Kullanıcı bilgisi ve kimlik doğrulama durumu
    const { toast } = useToastContext();

    const [plan, setPlan] = useState(null);
    const [features, setFeatures] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Yorum formu için react-hook-form
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        control,
    } = useForm({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            title: '',
            content: '',
            rating: '',
        },
    });

    // Plan detaylarını, özelliklerini ve yorumlarını çek
    useEffect(() => {
        const fetchPlanDetails = async () => {
            setLoading(true);
            try {
                const planData = await getPlanById(id);
                setPlan(planData);

                const featuresData = await getPlanFeatures(id);
                setFeatures(featuresData);

                const reviewsData = await getPlanReviews(id);
                setReviews(reviewsData);

            } catch (err) {
                console.error('Plan detayları yüklenirken hata:', err);
                setError('Plan detayları yüklenemedi. Lütfen daha sonra tekrar deneyin.');
                toast({
                    title: "Hata",
                    description: "Plan detayları yüklenirken bir sorun oluştu.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPlanDetails();
    }, [id, toast]);

    // Yorum gönderme işlemi
    const onSubmitReview = async (data) => {
        if (!isAuthenticated) {
            toast({
                title: "Giriş Yapmalısınız",
                description: "Yorum yapmak için lütfen giriş yapın.",
                variant: "destructive",
            });
            return;
        }

        try {
            const reviewPayload = {
                ...data,
                plan_id: plan.id,
                user_id: user.id, // Authenticated kullanıcının ID'si
                rating: Number(data.rating), // Sayıya çevir
            };
            await createReview(reviewPayload);
            toast({
                title: "Yorum Gönderildi",
                description: "Yorumunuz başarıyla gönderildi ve onay bekliyor.",
            });
            reset(); // Formu sıfırla
            // Yorumu hemen listeye ekle ama durumu "pending" olarak işaretle
            setReviews(prevReviews => [
                {
                    ...reviewPayload,
                    id: Date.now(), // Geçici bir ID ver, gerçek ID backend'den gelmeli
                    user: { name: user.name, id: user.id }, // Kullanıcı adını ekle
                    status: 'pending', // Durumu beklemede olarak ayarla
                },
                ...prevReviews
            ]);
        } catch (err) {
            console.error('Yorum gönderilirken hata:', err);
            toast({
                title: "Yorum Gönderme Hatası",
                description: `Yorumunuz gönderilirken bir sorun oluştu: ${err.response?.data?.message || err.message}`,
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-10 w-1/2 mb-6" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <div className="space-y-8">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-500">
                <p>{error}</p>
                <Button onClick={() => navigate('/')} className="mt-4">
                    Ana Sayfaya Dön
                </Button>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
                Plan bulunamadı.
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Plan Detayları */}
                <div className="lg:col-span-2">
                    <Card className="mb-8">
                        <CardHeader className="flex flex-col md:flex-row items-center space-x-4 p-6">
                            <Avatar className="h-24 w-24 flex-shrink-0">
                                <AvatarImage
                                    src={plan.provider?.logo_url || `https://placehold.co/96x96/e2e8f0/000000?text=${plan.provider?.name?.charAt(0) || 'P'}`}
                                    alt={plan.provider?.name || 'Sağlayıcı'}
                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/96x96/e2e8f0/000000?text=${plan.provider?.name?.charAt(0) || 'P'}`; }}
                                />
                                <AvatarFallback>{plan.provider?.name?.charAt(0) || 'P'}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-center md:text-left mt-4 md:mt-0">
                                <CardTitle className="text-3xl font-bold">{plan.name}</CardTitle>
                                <CardDescription className="flex flex-col md:flex-row items-center mt-2">
                                    <Badge variant="secondary" className="mr-2 mb-2 md:mb-0">
                                        Kategori: {plan.category?.name || 'Bilinmiyor'}
                                    </Badge>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Sağlayıcı: <Link to={`/providers/${plan.provider?.id}`} className="text-blue-600 hover:underline">{plan.provider?.name || 'Bilinmiyor'}</Link>
                                    </span>
                                </CardDescription>
                                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-4">
                                    {plan.price} {plan.currency}
                                    {plan.renewal_price && plan.renewal_price !== plan.price && (
                                        <span className="text-lg text-gray-500 dark:text-gray-400 line-through ml-2">
                                            {plan.renewal_price} {plan.currency}
                                        </span>
                                    )}
                                    {plan.discount && (
                                        <Badge className="ml-2 bg-green-500 hover:bg-green-600 text-white">
                                            %{plan.discount} İndirim
                                        </Badge>
                                    )}
                                </p>
                                {/* Ortaklık Bağlantısı Butonu */}
                                {
                                    plan.affiliate_url ? (
                                        <>
                                        <a
                                                href={plan.affiliate_url} // Affiliate URL varsa onu kullan, yoksa normal site URL'si
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full mt-4"
                                                onClick={() => {
                                                    if (window.gtag) {
                                                        window.gtag('event', 'affiliate_click', {
                                                            plan_id: plan.id,
                                                            plan_name: plan.name,
                                                            provider_name: plan.provider?.name,
                                                            affiliate_url: plan.affiliate_url,
                                                        });
                                                    }
                                                }}
                                            >
                                                <Button className="w-full md:w-auto px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:scale-105">
                                                    Şimdi Satın Al
                                                </Button>
                                            </a>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                Bu plan için ortaklık bağlantısı bulunmaktadır. KolayHosting üzerinden satın alarak destek olabilirsiniz.
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <a
                                                href={plan.website_url} // Affiliate URL varsa onu kullan, yoksa normal site URL'si
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full mt-4"
                                                onClick={() => {
                                                    if (window.gtag) {
                                                        window.gtag('event', 'affiliate_click', {
                                                            plan_id: plan.id,
                                                            plan_name: plan.name,
                                                            provider_name: plan.provider?.name,
                                                            website_url: plan.website_url,
                                                        });
                                                    }
                                                }}
                                            >
                                                <Button className="w-full md:w-auto px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:scale-105">
                                                    Web Sitesine Git
                                                </Button>
                                            </a>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                Bu plan için ortaklık bağlantısı bulunmamaktadır. Normal web sitesinden satın alabilirsiniz.
                                            </p>
                                        </>
                                    )
                                }
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Açıklama</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                {plan.description || 'Bu plan hakkında detaylı açıklama bulunmamaktadır.'}
                            </p>

                            <Separator className="my-6" />

                            <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Özellikler</h3>
                            {features.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                                    {features.map(feature => (
                                        <div key={feature.id} className="flex items-center text-gray-700 dark:text-gray-300">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                            <span>{feature.name}: {feature.pivot?.value || 'Mevcut'}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400">Bu plana ait henüz özellik bulunmamaktadır.</p>
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
                                                            <Star key={i} className="h-4 w-4 fill-current" />
                                                        ))}
                                                        {[...Array(5 - review.rating)].map((_, i) => (
                                                            <Star key={i + review.rating} className="h-4 w-4 fill-current text-gray-300" />
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
                                <p className="text-center text-gray-600 dark:text-gray-400">Bu plan için henüz yorum bulunmamaktadır.</p>
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

export default PlanDetailPage;
