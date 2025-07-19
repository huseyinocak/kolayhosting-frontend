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

// Yorum formu için Zod şeması
const reviewSchema = z.object({
    title: z.string().min(3, { message: "Başlık en az 3 karakter olmalıdır." }).max(100, { message: "Başlık en fazla 100 karakter olmalıdır." }),
    content: z.string().min(10, { message: "Yorum içeriği en az 10 karakter olmalıdır." }).max(500, { message: "Yorum içeriği en fazla 500 karakter olmalıdır." }),
    rating: z.coerce.number().min(1, { message: "Derecelendirme 1 ile 5 arasında olmalıdır." }).max(5, { message: "Derecelendirme 1 ile 5 arasında olmalıdır." }),
});

const PlanDetailPage = () => {
    const { id } = useParams();
    const [plan, setPlan] = useState(null);
    const [features, setFeatures] = useState([]);
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
        reset: resetReviewForm, // Formu sıfırlamak için
        control, // Controller için control objesini al
    } = useForm({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            title: '',
            content: '',
            rating: '',
        },
    });

    // Plan detaylarını, özelliklerini ve yorumlarını çekme fonksiyonu
    const fetchPlanDetails = async () => {
        setLoading(true);
        try {
            const [planData, featuresData, reviewsData] = await Promise.all([
                getPlanById(id),
                getPlanFeatures(id),
                getPlanReviews(id), // Bu fonksiyon artık backend'den sadece onaylı yorumları getirmeli
            ]);
            setPlan(planData);
            setFeatures(featuresData);
            setReviews(reviewsData); // Backend'den gelen yorumları doğrudan kullanıyoruz
        } catch (err) {
            setError(err.message || 'Plan detayları yüklenirken bir hata oluştu.');
            toast({
                title: "Hata",
                description: "Plan detayları yüklenirken bir sorun oluştu.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlanDetails();
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
                plan_id: parseInt(id), // URL'den gelen plan ID'si
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
            resetReviewForm(); // Formu sıfırla
            fetchPlanDetails(); // Yorumları yeniden çek (yeni yorumun listeye eklenmesi için)
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

    if (!plan) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
                <p>Plan bulunamadı.</p>
                <Button onClick={() => navigate('/plans')} className="mt-4">Tüm Planlara Geri Dön</Button>
            </div>
        );
    }

    // Frontend'deki bu filtreleme kaldırıldı, çünkü backend'in zaten onaylı yorumları getirdiği varsayılıyor.
    // const approvedReviews = reviews.filter(review => review.status === 'approved');

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
                {plan.name} Detayları
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Plan Bilgileri ve Özellikleri */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl">{plan.name}</CardTitle>
                            <CardDescription className="text-lg">
                                Sağlayıcı: {plan.provider?.name || 'Bilinmeyen'} | Kategori: {plan.category?.name || 'Bilinmeyen'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                                {plan.currency} {plan.price} / ay
                            </p>
                            {plan.renewal_price && (
                                <p className="text-lg text-gray-500 dark:text-gray-400 line-through mb-2">
                                    Yenileme: {plan.currency} {plan.renewal_price}
                                </p>
                            )}
                            {plan.discount_percentage && (
                                <Badge className="bg-green-500 text-white text-md mb-4">
                                    %{plan.discount_percentage} İndirim!
                                </Badge>
                            )}
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                {plan.description || plan.features_summary || 'Açıklama bulunmuyor.'}
                            </p>
                            {plan.link && (
                                <Button asChild className="w-full md:w-auto">
                                    <a href={plan.link} target="_blank" rel="noopener noreferrer">
                                        Planı Görüntüle
                                    </a>
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Özellikler</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {features.length > 0 ? (
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    {features.map((featureItem) => (
                                        <li key={featureItem.id} className="flex items-center space-x-2">
                                            <span className="text-blue-500 dark:text-blue-300">&#10003;</span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {featureItem.feature?.name}: {featureItem.value} {featureItem.feature?.unit}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400">Bu plana ait özellik bulunmamaktadır.</p>
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
                                <p className="text-gray-600 dark:text-gray-400">Bu plan için henüz yorum bulunmamaktadır.</p>
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

export default PlanDetailPage;