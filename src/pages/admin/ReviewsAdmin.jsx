import React, { useEffect, useState } from 'react';
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

const ReviewsAdmin = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentReview, setCurrentReview] = useState(null); // Düzenlenecek yorum

    // Form alanları
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewContent, setReviewContent] = useState('');
    const [reviewRating, setReviewRating] = useState('');
    const [reviewStatus, setReviewStatus] = useState(''); // 'pending', 'approved', 'rejected'
    const { toast } = useToastContext();

    // Yorumları API'den çekme fonksiyonu
    const fetchReviews = async () => {
        setLoading(true);
        try {
            const data = await getAllReviews();
            setReviews(data);
        } catch (err) {
            setError(err.message || 'Yorumlar yüklenirken bir hata oluştu.');
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

    // Yorumu düzenleme
    const handleSaveReview = async (e) => {
        e.preventDefault();
        if (!reviewTitle.trim() || !reviewContent.trim() || !reviewRating || !reviewStatus.trim()) {
            toast({
                title: 'Uyarı',
                description: 'Yorum başlığı, içeriği, derecelendirme ve durum boş bırakılamaz.',
                variant: 'warning',
            });
            return;
        }

        const payload = {
            title: reviewTitle,
            content: reviewContent,
            rating: parseFloat(reviewRating),
            status: reviewStatus,
        };

        try {
            if (currentReview) {
                await updateReview(currentReview.id, payload);
                toast({
                    title: 'Başarılı',
                    description: 'Yorum başarıyla güncellendi.',
                });
            }
            setIsDialogOpen(false); // Diyaloğu kapat
            resetForm(); // Formu sıfırla
            fetchReviews(); // Yorumları yeniden çek
        } catch (err) {
            toast({
                title: 'Hata',
                description: `Yorum kaydedilirken bir sorun oluştu: ${err.message || ''}`,
                variant: 'destructive',
            });
        }
    };

    // Yorum düzenleme diyaloğunu açma
    const handleEditClick = (review) => {
        setCurrentReview(review);
        setReviewTitle(review.title);
        setReviewContent(review.content);
        setReviewRating(String(review.rating));
        setReviewStatus(review.status);
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
                    description: `Yorum silinirken bir sorun oluştu: ${err.message || ''}`,
                    variant: 'destructive',
                });
            }
        }
    };

    // Formu sıfırlama
    const resetForm = () => {
        setCurrentReview(null);
        setReviewTitle('');
        setReviewContent('');
        setReviewRating('');
        setReviewStatus('');
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'approved':
                return 'default'; // Veya 'success' gibi bir varyantınız varsa
            case 'pending':
                return 'secondary';
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

            {/* Yeni yorum ekleme butonu yorumlar genellikle admin panelinden eklenmez,
                ancak düzenleme ve silme için bir diyalog kullanabiliriz.
                Yine de bir "Yeni Yorum Ekle" butonu bırakıyorum, isterseniz kaldırabilirsiniz.
            */}
            <div className="flex justify-end mb-6">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>Yeni Yorum Ekle</Button>
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
                        <form onSubmit={handleSaveReview} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                    Başlık
                                </Label>
                                <Input
                                    id="title"
                                    value={reviewTitle}
                                    onChange={(e) => setReviewTitle(e.target.value)}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="content" className="text-right">
                                    İçerik
                                </Label>
                                <Textarea
                                    id="content"
                                    value={reviewContent}
                                    onChange={(e) => setReviewContent(e.target.value)}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="rating" className="text-right">
                                    Derecelendirme
                                </Label>
                                <Input
                                    id="rating"
                                    value={reviewRating}
                                    onChange={(e) => setReviewRating(e.target.value)}
                                    className="col-span-3"
                                    type="number"
                                    step="1"
                                    min="0"
                                    max="5"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">
                                    Durum
                                </Label>
                                <Select onValueChange={setReviewStatus} value={reviewStatus} required>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Durum Seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Beklemede</SelectItem>
                                        <SelectItem value="approved">Onaylandı</SelectItem>
                                        <SelectItem value="rejected">Reddedildi</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                {/* Yorum içeriği, backend'den doğru gelirse burada görünecektir. */}
                                <TableCell className="max-w-[200px] whitespace-normal">{review.content}</TableCell>
                                <TableCell>{review.rating} / 5</TableCell>
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