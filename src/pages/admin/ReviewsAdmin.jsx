import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form'; // Controller'ı da içe aktar
import { zodResolver } from '@hookform/resolvers/zod'; // Zod resolver'ı içe aktar
import * as z from 'zod'; // Zod kütüphanesini içe aktar
import {
    getAllReviews,
    updateReview,
    deleteReview,
} from '../../api/reviews'; // Yorum API fonksiyonlarını içe aktar
import { useToastContext } from '../../hooks/toast-utils'; // Toast bildirimleri için

// Shadcn UI bileşenleri
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Skeleton } from '../../components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select'; // Dropdown seçimleri için
import { Badge } from '../../components/ui/badge'; // Yorum durumu için

// Zod ile yorum formunun şemasını tanımla
const reviewSchema = z.object({
    title: z.string().min(2, { message: "Yorum başlığı en az 2 karakter olmalıdır." }),
    content: z.string().min(10, { message: "Yorum içeriği en az 10 karakter olmalıdır." }),
    rating: z.preprocess(
        (val) => Number(val),
        z.number().min(1, { message: "Derecelendirme en az 1 olmalıdır." }).max(5, { message: "Derecelendirme en fazla 5 olmalıdır." })
    ),
    status: z.enum(["pending", "approved", "rejected"], {
        required_error: "Yorum durumu seçilmelidir.",
        invalid_type_error: "Geçersiz yorum durumu.",
    }),
});

const ReviewsAdmin = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentReview, setCurrentReview] = useState(null); // Düzenlenecek yorum
    const { toast } = useToastContext();

    // useForm hook'unu başlat
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset, // Formu sıfırlamak için
        setValue, // Form alanlarına değer atamak için
        control, // Controller bileşeni için
    } = useForm({
        resolver: zodResolver(reviewSchema),
    });

    // Yorumları API'den çekme fonksiyonu
    const fetchReviews = async () => {
        setLoading(true);
        try {
            const data = await getAllReviews(); // Tüm yorumları (admin için) çek
            setReviews(data);
        } catch (err) {
            console.error('Yorumlar yüklenirken hata:', err);
            setError('Yorumlar yüklenemedi. Lütfen daha sonra tekrar deneyin.');
            toast({
                title: 'Hata',
                description: 'Yorumlar yüklenirken bir sorun oluştu.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    // Diyalog açıldığında veya currentReview değiştiğinde formu doldur
    useEffect(() => {
        if (isDialogOpen && currentReview) {
            setValue('title', currentReview.title);
            setValue('content', currentReview.content);
            setValue('rating', String(currentReview.rating)); // Select için string olarak ayarla
            setValue('status', currentReview.status);
        } else if (!isDialogOpen) {
            reset(); // Diyalog kapandığında formu sıfırla
            setCurrentReview(null); // currentReview'ı da sıfırla
        }
    }, [isDialogOpen, currentReview, reset, setValue]);

    // Yorumu düzenleme
    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                rating: Number(data.rating), // Number'a çevir
            };

            if (currentReview) {
                // Yorumu düzenle
                await updateReview(currentReview.id, payload);
                toast({
                    title: 'Başarılı',
                    description: 'Yorum başarıyla güncellendi.',
                });
            }
            setIsDialogOpen(false); // Diyaloğu kapat
            fetchReviews(); // Yorumları yeniden çek
        } catch (err) {
            toast({
                title: 'Hata',
                description: `Yorum kaydedilirken bir sorun oluştu: ${err.response?.data?.message || err.message}`,
                variant: 'destructive',
            });
        }
    };

    // Yorum düzenleme diyaloğunu açma
    const handleEditClick = (review) => {
        setCurrentReview(review);
        setIsDialogOpen(true);
    };

    // Yorum silme
    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
            try {
                await deleteReview(reviewId);
                toast({
                    title: 'Başarılı',
                    description: 'Yorum başarıyla silindi.',
                });
                fetchReviews(); // Yorumları yeniden çek
            } catch (err) {
                toast({
                    title: 'Hata',
                    description: `Yorum silinirken bir sorun oluştu: ${err.response?.data?.message || err.message}`,
                    variant: 'destructive',
                });
            }
        }
    };

    // Yorum durumu için Badge varyantı belirleme
    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'pending':
                return 'secondary';
            case 'approved':
                return 'default';
            case 'rejected':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-10">Yorum Yönetimi</h1>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-500">
                <p>{error}</p>
                <Button onClick={fetchReviews} className="mt-4">
                    Tekrar Dene
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
                Yorum Yönetimi
            </h1>

            {/* Yorum ekleme butonu yorumlar admin panelinde genellikle olmaz,
                çünkü yorumlar kullanıcılar tarafından eklenir ve admin sadece yönetir.
                Ancak manuel ekleme senaryosu için tutulabilir.
                Şimdilik kaldırılmıştır, ihtiyaca göre eklenebilir.
            */}
            {/* <div className="flex justify-end mb-6">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setCurrentReview(null);
                            setIsDialogOpen(true);
                        }}>Yeni Yorum Ekle</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{currentReview ? 'Yorumu Düzenle' : 'Yeni Yorum Ekle'}</DialogTitle>
                            <DialogDescription>
                                {currentReview
                                    ? 'Yorum bilgilerini güncelleyin.'
                                    : 'Yeni bir yorum oluşturmak için bilgileri girin.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                    Başlık
                                </Label>
                                <Input
                                    id="title"
                                    {...register("title")}
                                    className="col-span-3"
                                />
                                {errors.title && <p className="col-span-4 text-red-500 text-sm text-right">{errors.title.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="content" className="text-right">
                                    İçerik
                                </Label>
                                <Textarea
                                    id="content"
                                    {...register("content")}
                                    className="col-span-3"
                                />
                                {errors.content && <p className="col-span-4 text-red-500 text-sm text-right">{errors.content.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="rating" className="text-right">
                                    Derecelendirme
                                </Label>
                                <Controller
                                    name="rating"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} className="col-span-3">
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
                                {errors.rating && <p className="col-span-4 text-red-500 text-sm text-right">{errors.rating.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">
                                    Durum
                                </Label>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} className="col-span-3">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Durum Seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Beklemede</SelectItem>
                                                <SelectItem value="approved">Onaylandı</SelectItem>
                                                <SelectItem value="rejected">Reddedildi</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.status && <p className="col-span-4 text-red-500 text-sm text-right">{errors.status.message}</p>}
                            </div>
                            <DialogFooter>
                                <Button type="submit">Kaydet</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div> */}

            {/* Yorumları düzenlemek için sadece düzenleme diyaloğu */}
            <div className="flex justify-end mb-6">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    {/* Trigger kaldırıldı, sadece düzenle butonu ile açılacak */}
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Yorumu Düzenle</DialogTitle>
                            <DialogDescription>
                                Yorum bilgilerini güncelleyin.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                    Başlık
                                </Label>
                                <Input
                                    id="title"
                                    {...register("title")}
                                    className="col-span-3"
                                />
                                {errors.title && <p className="col-span-4 text-red-500 text-sm text-right">{errors.title.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="content" className="text-right">
                                    İçerik
                                </Label>
                                <Textarea
                                    id="content"
                                    {...register("content")}
                                    className="col-span-3"
                                />
                                {errors.content && <p className="col-span-4 text-red-500 text-sm text-right">{errors.content.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="rating" className="text-right">
                                    Derecelendirme
                                </Label>
                                <Controller
                                    name="rating"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} className="col-span-3">
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
                                {errors.rating && <p className="col-span-4 text-red-500 text-sm text-right">{errors.rating.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">
                                    Durum
                                </Label>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} className="col-span-3">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Durum Seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Beklemede</SelectItem>
                                                <SelectItem value="approved">Onaylandı</SelectItem>
                                                <SelectItem value="rejected">Reddedildi</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.status && <p className="col-span-4 text-red-500 text-sm text-right">{errors.status.message}</p>}
                            </div>
                            <DialogFooter>
                                <Button type="submit">Kaydet</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>


            {reviews.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Başlık</TableHead>
                            <TableHead>İçerik</TableHead>
                            <TableHead>Derecelendirme</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Kullanıcı</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reviews.map((review) => (
                            <TableRow key={review.id}>
                                <TableCell className="font-medium">{review.id}</TableCell>
                                <TableCell>{review.title}</TableCell>
                                <TableCell>{review.content.substring(0, 50)}...</TableCell> {/* İçeriği kısalt */}
                                <TableCell>{review.rating}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(review.status)}>
                                        {review.status === 'pending' && 'Beklemede'}
                                        {review.status === 'approved' && 'Onaylandı'}
                                        {review.status === 'rejected' && 'Reddedildi'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{review.user?.name || 'Anonim'}</TableCell>
                                <TableCell>{review.plan?.name || 'N/A'}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(review)}>
                                        Düzenle
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteReview(review.id)}>
                                        Sil
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-gray-600 dark:text-gray-400">
                    Henüz hiç yorum bulunmamaktadır.
                </div>
            )}
        </div>
    );
};

export default ReviewsAdmin;
