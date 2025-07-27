import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    getAllReviews,
    updateReview,
    deleteReview,
    changeReviewStatus,
} from '../../api/reviews'; // Yorum API fonksiyonlarını içe aktar
import { getAllPlans } from '../../api/plans'; // Planları çekmek için
import { getAllProviders } from '../../api/providers'; // Sağlayıcıları çekmek için
import { useToastContext } from '../../hooks/toast-utils'; // Toast bildirimleri için
import { useTranslation } from 'react-i18next'; // Çeviri için

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
import { Badge } from '../../components/ui/badge'; // Durum için Badge
import { Edit, Trash2, ArrowUpDown, Star } from 'lucide-react'; // İkonlar için
import { useQuery, useQueryClient } from '@tanstack/react-query'; // React Query için
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '../../components/ui/pagination'; // Sayfalama için


// Yorum düzenleme formu için Zod şeması
const reviewSchema = z.object({
    rating: z.preprocess(
        (val) => Number(val),
        z.number().min(1, { message: "Derecelendirme en az 1 olmalıdır." }).max(5, { message: "Derecelendirme en fazla 5 olmalıdır." })
    ),
    title: z.string().max(255, { message: "Başlık en fazla 255 karakter olabilir." }).optional().or(z.literal('')),
    content: z.string().min(10, { message: "Yorum içeriği en az 10 karakter olmalıdır." }),
    status: z.string().min(1, { message: "Durum zorunludur." }),
});

const ReviewsAdmin = () => {
    const [plans, setPlans] = useState([]);
    const [providers, setProviders] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Düzenleme dialogu
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // Silme onay dialogu
    const [currentReview, setCurrentReview] = useState(null); // Düzenlenecek yorum
    const [reviewToDeleteId, setReviewToDeleteId] = useState(null); // Silinecek yorum ID'si
    const { toast } = useToastContext();
    const { t } = useTranslation();

    // Filtreleme ve Sıralama State'leri
    const [inputValue, setInputValue] = useState(''); // Arama inputunun anlık değeri için
    const [search, setSearch] = useState(''); // API'ye gönderilecek arama terimi için (debounced)
    const [filterStatus, setFilterStatus] = useState('all'); // Varsayılan değer "all"
    const [filterPlan, setFilterPlan] = useState('0'); // Varsayılan değer "0" (string olarak)
    const [filterProvider, setFilterProvider] = useState('0'); // Varsayılan değer "0" (string olarak)
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const queryClient = useQueryClient();

    // Arama inputu için debounce efekti
    useEffect(() => {
        const handler = setTimeout(() => {
            if (inputValue.length >= 3 || inputValue === '') {
                setSearch(inputValue);
                setPage(1); // Arama yapıldığında sayfayı sıfırla
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [inputValue]);

    // Yorumları çekmek için useQuery
    const { data: reviewsData, isLoading: isLoadingReviews, isError: isErrorReviews, error: reviewsError } = useQuery({
        queryKey: ['reviews', { search, status: filterStatus, plan_id: filterPlan, provider_id: filterProvider, sortBy, sortOrder, page, perPage }],
        queryFn: () => {
            const params = {
                search,
                sort_by: sortBy,
                sort_order: sortOrder,
                page,
                per_page: perPage
            };
            if (filterStatus !== 'all') {
                params.status = filterStatus;
            }
            if (filterPlan !== '0') {
                params.plan_id = Number(filterPlan);
            }
            if (filterProvider !== '0') {
                params.provider_id = Number(filterProvider);
            }
            return getAllReviews(params);
        },
        keepPreviousData: true,
    });

    const reviews = reviewsData?.data || [];
    const paginationMeta = reviewsData?.meta;

    // Planları ve Sağlayıcıları çekmek için useQuery
    const { data: plansLookupData, isLoading: isLoadingPlans, isError: isErrorPlans, error: plansError } = useQuery({
        queryKey: ['plansLookup'],
        queryFn: () => getAllPlans({ per_page: 999 }), // Tüm planları çek
    });

    const { data: providersLookupData, isLoading: isLoadingProviders, isError: isErrorProviders, error: providersError } = useQuery({
        queryKey: ['providersLookup'],
        queryFn: () => getAllProviders({ per_page: 999 }), // Tüm sağlayıcıları çek
    });

    useEffect(() => {
        if (plansLookupData) setPlans(plansLookupData.data);
        if (providersLookupData) setProviders(providersLookupData.data);
    }, [plansLookupData, providersLookupData]);

    const {
        register,
        handleSubmit,
        reset,
        control, // Controller için
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            rating: 1,
            title: '',
            content: '',
            status: 'pending',
        },
    });

    // Dialog açıldığında veya currentReview değiştiğinde formu resetle
    useEffect(() => {
        if (isDialogOpen && currentReview) {
            reset({
                rating: currentReview.rating,
                title: currentReview.title || '',
                content: currentReview.content || '',
                status: currentReview.status,
            });
        } else if (isDialogOpen && !currentReview) {
            // Yeni yorum oluşturuluyorsa (bu sayfada yorum oluşturma yok, sadece düzenleme/silme/durum)
            // ama yine de resetlemek iyi bir pratik
            reset({
                rating: 1,
                title: '',
                content: '',
                status: 'pending',
            });
        }
    }, [isDialogOpen, currentReview, reset]);

    const handleEditReviewClick = (review) => {
        setCurrentReview(review);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (reviewId) => {
        setReviewToDeleteId(reviewId);
        setIsConfirmDialogOpen(true);
    };

    const confirmDeleteReview = async () => {
        if (!reviewToDeleteId) return;
        try {
            await deleteReview(reviewToDeleteId);
            queryClient.invalidateQueries(['reviews']); // Yorumları yeniden çek
            toast({
                title: t("review_deleted_successfully"),
                description: t("review_deleted_successfully_description"),
                variant: "success",
            });
        } catch (error) {
            toast({
                title: t("delete_error"),
                description: t("failed_to_delete_review"),
                variant: "destructive",
            });
            console.error("Yorum silme hatası:", error);
        } finally {
            setIsConfirmDialogOpen(false);
            setReviewToDeleteId(null);
        }
    };

    const onSubmit = async (data) => {
        if (!currentReview) return; // Düzenlenecek yorum yoksa işlem yapma
        try {
            await updateReview(currentReview.id, {
                rating: data.rating,
                title: data.title,
                content: data.content,
                status: data.status, // Durumu da güncelle
            });
            queryClient.invalidateQueries(['reviews']); // Yorumları yeniden çek
            toast({
                title: t("review_updated_successfully"),
                description: t("review_updated_successfully_description"),
                variant: "success",
            });
            setIsDialogOpen(false);
            reset();
        } catch (error) {
            toast({
                title: t("operation_failed"),
                description: error.message || t("failed_to_update_review"),
                variant: "destructive",
            });
            console.error("Yorum güncelleme hatası:", error.response?.data || error.message);
        }
    };

    // Yorum durumunu doğrudan tablodan değiştirmek için
    const handleStatusChange = async (reviewId, newStatus) => {
        try {
            await changeReviewStatus(reviewId, newStatus);
            queryClient.invalidateQueries(['reviews']); // Yorumları yeniden çek
            toast({
                title: t("review_status_updated_successfully"),
                description: t("review_status_updated_successfully_description", { status: t(newStatus) }),
                variant: "success",
            });
        } catch (error) {
            toast({
                title: t("operation_failed"),
                description: error.message || t("failed_to_update_review_status"),
                variant: "destructive",
            });
            console.error("Yorum durumu güncelleme hatası:", error.response?.data || error.message);
        }
    };

    // Sıralama başlığına tıklandığında sıralama yönünü değiştir
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc'); // Yeni sütuna göre sıralarken varsayılan olarak artan
        }
    };

    // Derecelendirme yıldızları için yardımcı fonksiyon
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                />
            );
        }
        return stars;
    };

    const isLoadingCombined = isLoadingReviews || isLoadingPlans || isLoadingProviders;
    const isErrorCombined = isErrorReviews || isErrorPlans || isErrorProviders;
    const combinedError = reviewsError || plansError || providersError;

    if (isLoadingCombined) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-10">{t('admin_reviews_page_title')}</h1>
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-12 w-full mb-4" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (isErrorCombined) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-500">
                <p>{t('error_loading_reviews')}: {combinedError.message}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">{t('admin_reviews_page_title')}</h1>

            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                {/* Yorum Ekleme butonu bu sayfada yok, çünkü yorumlar kullanıcılar tarafından eklenir. */}
                {/* Eğer bir adminin manuel yorum eklemesi gerekiyorsa buraya eklenebilir. */}

                <div className="flex items-center space-x-2 flex-wrap gap-2">
                    <Input
                        placeholder={t('search_review')}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                        }}
                        className="max-w-sm"
                    />
                    <Select onValueChange={(value) => { setFilterStatus(value); setPage(1); }} value={filterStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('filter_by_status')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('all_statuses')}</SelectItem>
                            <SelectItem value="pending">{t('pending')}</SelectItem>
                            <SelectItem value="approved">{t('approved')}</SelectItem>
                            <SelectItem value="rejected">{t('rejected')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(value) => { setFilterPlan(value); setPage(1); }} value={filterPlan}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('filter_by_plan')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">{t('all_plans')}</SelectItem>
                            {plans.map(plan => (
                                <SelectItem key={plan.id} value={String(plan.id)}>
                                    {plan.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(value) => { setFilterProvider(value); setPage(1); }} value={filterProvider}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('filter_by_provider')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">{t('all_providers')}</SelectItem>
                            {providers.map(provider => (
                                <SelectItem key={provider.id} value={String(provider.id)}>
                                    {provider.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(value) => { setSortBy(value); setPage(1); }} value={sortBy}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('sort_by')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="created_at">{t('created_at_descending')}</SelectItem>
                            <SelectItem value="rating">{t('rating')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(value) => { setSortOrder(value); setPage(1); }} value={sortOrder}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder={t('sort_direction')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="asc">{t('ascending')}</SelectItem>
                            <SelectItem value="desc">{t('descending')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(value) => { setPerPage(Number(value)); setPage(1); }} value={String(perPage)}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder={t('page_size')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {reviews.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>{t('review_user')}</TableHead>
                            <TableHead>{t('review_target')}</TableHead>
                            <TableHead>{t('review_title')}</TableHead>
                            <TableHead>{t('review_content')}</TableHead>
                            <TableHead className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('rating')}>
                                {t('review_rating')} {sortBy === 'rating' && <ArrowUpDown className={`inline-block ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />}
                            </TableHead>
                            <TableHead>{t('review_status')}</TableHead>
                            <TableHead className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('created_at')}>
                                {t('review_created_at')} {sortBy === 'created_at' && <ArrowUpDown className={`inline-block ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />}
                            </TableHead>
                            <TableHead className="text-right">{t('review_actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reviews.map((review) => (
                            <TableRow key={review.id}>
                                <TableCell className="font-medium">{review.id}</TableCell>
                                <TableCell>{review.user?.name || review.user_name || t('unknown_user')}</TableCell>
                                <TableCell>
                                    {review.plan ? (
                                        <span className="text-blue-500">{review.plan.name} ({t('plan')})</span>
                                    ) : review.provider ? (
                                        <span className="text-purple-500">{review.provider.name} ({t('provider')})</span>
                                    ) : (
                                        t('n_a')
                                    )}
                                </TableCell>
                                <TableCell>{review.title || t('no_title')}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{review.content}</TableCell>
                                <TableCell>
                                    <div className="flex items-center">
                                        {renderStars(review.rating)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Select onValueChange={(value) => handleStatusChange(review.id, value)} value={review.status}>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder={t('select_status')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">{t('pending')}</SelectItem>
                                            <SelectItem value="approved">{t('approved')}</SelectItem>
                                            <SelectItem value="rejected">{t('rejected')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>{new Date(review.created_at).toLocaleDateString('tr-TR')}</TableCell>
                                <TableCell className="text-right flex space-x-2 justify-end">
                                    <Button variant="outline" size="sm" onClick={() => handleEditReviewClick(review)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(review.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-gray-600 dark:text-gray-400">
                    {t('no_reviews_found')}
                </div>
            )}

            {/* Sayfalama Kontrolleri */}
            {paginationMeta && paginationMeta.last_page > 1 && (
                <Pagination className="mt-6">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                            />
                        </PaginationItem>
                        {[...Array(paginationMeta.last_page)].map((_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    onClick={() => setPage(i + 1)}
                                    isActive={page === i + 1}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setPage(prev => Math.min(prev + 1, paginationMeta.last_page))}
                                disabled={page === paginationMeta.last_page}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            {/* Yorum Düzenleme Diyaloğu */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('edit_review_title')}</DialogTitle>
                        <DialogDescription>
                            {t('edit_review_description')}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">{t('review_title')}</Label>
                            <Input id="title" {...register("title")} />
                            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="content">{t('review_content')}</Label>
                            <Textarea id="content" {...register("content")} />
                            {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="rating">{t('review_rating')}</Label>
                            <Controller
                                name="rating"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={String(field.value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('select_rating')} />
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
                        <div className="grid gap-2">
                            <Label htmlFor="status">{t('review_status')}</Label>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('select_status')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">{t('pending')}</SelectItem>
                                            <SelectItem value="approved">{t('approved')}</SelectItem>
                                            <SelectItem value="rejected">{t('rejected')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? t('updating') : t('save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Silme Onay Diyaloğu */}
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('confirm_delete_review')}</DialogTitle>
                        <DialogDescription>
                            {t('delete_review_confirmation_message')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                            {t('cancel')}
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteReview}>
                            {t('delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReviewsAdmin;
