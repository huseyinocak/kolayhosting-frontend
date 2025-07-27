import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    getAllFeatures,
    createFeature,
    updateFeature,
    deleteFeature,
} from '../../api/features'; // Özellik API fonksiyonlarını içe aktar
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
import { Skeleton } from '../../components/ui/skeleton';
import { PlusCircle, Edit, Trash2, ArrowUpDown } from 'lucide-react'; // İkonlar için
import { useQuery, useQueryClient } from '@tanstack/react-query'; // React Query için
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '../../components/ui/pagination'; // Sayfalama için
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select'; // Sıralama ve sayfa boyutu için


// Zod ile özellik formunun şemasını tanımla
const featureSchema = z.object({
    name: z.string().min(2, { message: "Özellik adı en az 2 karakter olmalıdır." }),
    unit: z.string().optional(), // Birim alanı isteğe bağlı
});

const FeaturesAdmin = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [featureToDeleteId, setFeatureToDeleteId] = useState(null);
    const [currentFeature, setCurrentFeature] = useState(null); // Düzenlenecek özellik
    const { toast } = useToastContext();
    const { t } = useTranslation();

    // Filtreleme ve Sıralama State'leri
    const [inputValue, setInputValue] = useState(''); // Arama inputunun anlık değeri için
    const [search, setSearch] = useState(''); // API'ye gönderilecek arama terimi için (debounced)
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

    // Özellikleri çekmek için useQuery
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['features', { search, sortBy, sortOrder, page, perPage }],
        queryFn: () => getAllFeatures({ search, sort_by: sortBy, sort_order: sortOrder, page, per_page: perPage }),
        keepPreviousData: true,
    });

    const features = data?.data || [];
    const paginationMeta = data?.meta;
    console.log("Pagination Meta:", paginationMeta);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(featureSchema),
        defaultValues: {
            name: '',
            unit: '',
        },
    });

    // Dialog açıldığında veya currentFeature değiştiğinde formu resetle
    useEffect(() => {
        if (isDialogOpen && currentFeature) {
            reset({
                name: currentFeature.name || '',
                unit: currentFeature.unit || '',
            });
        } else if (isDialogOpen && !currentFeature) {
            // Yeni özellik oluşturuluyorsa formu temizle
            reset({
                name: '',
                unit: '',
            });
        }
    }, [isDialogOpen, currentFeature, reset]);

    const handleAddFeatureClick = () => {
        setCurrentFeature(null);
        setIsDialogOpen(true);
    };

    const handleEditFeatureClick = (feature) => {
        setCurrentFeature(feature);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (featureId) => {
        setFeatureToDeleteId(featureId);
        setIsConfirmDialogOpen(true);
    };

    const confirmDeleteFeature = async () => {
        if (!featureToDeleteId) return;
        try {
            await deleteFeature(featureToDeleteId);
            queryClient.invalidateQueries(['features']); // Özellikleri yeniden çek
            toast({
                title: t("feature_deleted_successfully"),
                description: t("feature_deleted_successfully_description"),
                variant: "success",
            });
        } catch (error) {
            toast({
                title: t("delete_error"),
                description: t("failed_to_delete_feature"),
                variant: "destructive",
            });
            console.error("Özellik silme hatası:", error);
        } finally {
            setIsConfirmDialogOpen(false);
            setFeatureToDeleteId(null);
        }
    };

    const onSubmit = async (data) => {
        try {
            if (currentFeature) {
                await updateFeature(currentFeature.id, data);
                toast({
                    title: t("feature_updated_successfully"),
                    description: t("feature_updated_successfully_description"),
                    variant: "success",
                });
            } else {
                await createFeature(data);
                toast({
                    title: t("feature_created_successfully"),
                    description: t("feature_created_successfully_description"),
                    variant: "success",
                });
            }
            queryClient.invalidateQueries(['features']); // Özellikleri yeniden çek
            setIsDialogOpen(false);
            reset();
        } catch (error) {
            toast({
                title: t("operation_failed"),
                description: error.message || (currentFeature ? t("failed_to_update_feature") : t("failed_to_create_feature")),
                variant: "destructive",
            });
            console.error("Özellik işlemi hatası:", error.response?.data || error.message);
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

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-10">{t('admin_features_page_title')}</h1>
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

    if (isError) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-500">
                <p>{t('error_loading_features')}: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">{t('admin_features_page_title')}</h1>

            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAddFeatureClick}>
                            <PlusCircle className="mr-2 h-5 w-5" /> {t('add_new_feature')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{currentFeature ? t('edit_feature_title') : t('create_feature')}</DialogTitle>
                            <DialogDescription>
                                {currentFeature ? t('edit_feature_description') : t('add_new_feature_description')}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('feature_name')}</Label>
                                <Input id="name" {...register("name")} />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="unit">{t('feature_unit')}</Label>
                                <Input id="unit" {...register("unit")} placeholder={t('feature_unit_placeholder')} />
                                {errors.unit && <p className="text-red-500 text-sm">{errors.unit.message}</p>}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (currentFeature ? t('updating') : t('creating')) : (currentFeature ? t('save') : t('create'))}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <div className="flex items-center space-x-2">
                    <Input
                        placeholder={t('search_feature')}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                        }}
                        className="max-w-sm"
                    />
                    <Select onValueChange={(value) => { setSortBy(value); setPage(1); }} value={sortBy}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('sort_by')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">{t('name_ascending')}</SelectItem>
                            <SelectItem value="created_at">{t('created_at_descending')}</SelectItem>
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

            {features.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('name')}>
                                {t('feature_name')} {sortBy === 'name' && <ArrowUpDown className={`inline-block ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />}
                            </TableHead>
                            <TableHead>{t('feature_unit')}</TableHead>
                            <TableHead className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('created_at')}>
                                {t('feature_created_at')} {sortBy === 'created_at' && <ArrowUpDown className={`inline-block ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />}
                            </TableHead>
                            <TableHead className="text-right">{t('feature_actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {features.map((feature) => (
                            <TableRow key={feature.id}>
                                <TableCell className="font-medium">{feature.id}</TableCell>
                                <TableCell>{feature.name}</TableCell>
                                <TableCell>{feature.unit || 'N/A'}</TableCell>
                                <TableCell>{new Date(feature.created_at).toLocaleDateString('tr-TR')}</TableCell>
                                <TableCell className="text-right flex space-x-2 justify-end">
                                    <Button variant="outline" size="sm" onClick={() => handleEditFeatureClick(feature)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(feature.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-gray-600 dark:text-gray-400">
                    {t('no_features_found')}
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

            {/* Silme Onay Diyaloğu */}
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('confirm_delete_feature')}</DialogTitle>
                        <DialogDescription>
                            {t('delete_feature_confirmation_message')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                            {t('cancel')}
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteFeature}>
                            {t('delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FeaturesAdmin;
