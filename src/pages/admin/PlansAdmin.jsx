import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form'; // Controller'ı da içe aktar
import { zodResolver } from '@hookform/resolvers/zod'; // Zod resolver'ı içe aktar
import * as z from 'zod'; // Zod kütüphanesini içe aktar
import {
    getAllPlans,
    createPlan,
    updatePlan,
    deletePlan,
    syncFeatures, // Yeni eklendi: Plan özelliklerini senkronize etmek için
} from '../../api/plans'; // Plan API fonksiyonlarını içe aktar
import { getAllCategories } from '../../api/categories'; // Kategorileri çekmek için
import { getAllProviders } from '../../api/providers'; // Sağlayıcıları çekmek için
import { getAllFeatures } from '../../api/features'; // Yeni eklendi: Özellikleri çekmek için
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
import { Checkbox } from '../../components/ui/checkbox'; // Checkbox için
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

// Zod ile plan formunun şemasını tanımla
const planSchema = z.object({
    name: z.string().min(1, { message: "Plan adı zorunludur." }),
    description: z.string().optional(),
    price: z.preprocess(
        (val) => Number(val),
        z.number().min(0, { message: "Fiyat pozitif bir sayı olmalıdır." })
    ),
    renewal_price: z.preprocess(
        (val) => Number(val),
        z.number().min(0, { message: "Yenileme fiyatı pozitif bir sayı olmalıdır." }).optional().nullable()
    ),
    discount_percentage: z.preprocess(
        (val) => Number(val),
        z.number().min(0).max(100).optional().nullable() // Yüzde 0-100 arası
    ),
    status: z.string().min(1, { message: "Durum zorunludur." }),
    provider_id: z.preprocess(
        (val) => Number(val),
        z.number().min(1, { message: "Sağlayıcı seçimi zorunludur." })
    ),
    category_id: z.preprocess(
        (val) => Number(val),
        z.number().min(1, { message: "Kategori seçimi zorunludur." })
    ),
    // Plan özellikleri için ayrı bir doğrulama yapısı
    features: z.array(z.object({
        feature_id: z.number(),
        value: z.string().min(1, { message: "Özellik değeri zorunludur." }),
    })).optional(),
});

const PlansAdmin = () => {
    const [categories, setCategories] = useState([]);
    const [providers, setProviders] = useState([]);
    const [features, setFeatures] = useState([]); // Tüm mevcut özellikler
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null); // Düzenlenecek plan
    const [planToDelete, setPlanToDelete] = useState(null); // Silinecek plan ID'si
    const { toast } = useToastContext();
    const { t } = useTranslation();

    // Filtreleme ve Sıralama State'leri
    const [inputValue, setInputValue] = useState(''); // Arama inputunun anlık değeri için
    const [search, setSearch] = useState(''); // API'ye gönderilecek arama terimi için (debounced)
    const [filterStatus, setFilterStatus] = useState('all'); // Varsayılan değer "all"
    const [filterProvider, setFilterProvider] = useState('0'); // Varsayılan değer "0" (string olarak)
    const [filterCategory, setFilterCategory] = useState('0'); // Varsayılan değer "0" (string olarak)
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

    // Planları çekmek için useQuery
    const { data: plansData, isLoading: isLoadingPlans, isError: isErrorPlans, error: plansError } = useQuery({
        queryKey: ['plans', { search, status: filterStatus, provider_id: filterProvider, category_id: filterCategory, sortBy, sortOrder, page, perPage }],
        queryFn: () => {
            const params = {
                search,
                sort_by: sortBy,
                sort_order: sortOrder,
                page,
                per_page: perPage
            };
            // "all" seçeneği seçildiğinde ilgili parametreyi gönderme
            if (filterStatus !== 'all') {
                params.status = filterStatus;
            }
            // "0" seçeneği seçildiğinde ilgili parametreyi gönderme (sayısal ID'ler için)
            if (filterProvider !== '0') {
                params.provider_id = Number(filterProvider);
            }
            if (filterCategory !== '0') {
                params.category_id = Number(filterCategory);
            }
            return getAllPlans(params);
        },
        keepPreviousData: true,
    });

    const plans = plansData?.data || [];
    const paginationMeta = plansData?.meta;

    // Kategorileri, Sağlayıcıları ve Özellikleri çekmek için useQuery
    const { data: categoriesData, isLoading: isLoadingCategories, isError: isErrorCategories, error: categoriesError } = useQuery({
        queryKey: ['categories'],
        queryFn: () => getAllCategories({ per_page: 999 }), // Tüm kategorileri çek
    });

    const { data: providersData, isLoading: isLoadingProviders, isError: isErrorProviders, error: providersError } = useQuery({
        queryKey: ['providers'],
        queryFn: () => getAllProviders({ per_page: 999 }), // Tüm sağlayıcıları çek
    });

    const { data: featuresData, isLoading: isLoadingFeatures, isError: isErrorFeatures, error: featuresError } = useQuery({
        queryKey: ['features'],
        queryFn: () => getAllFeatures(), // Tüm özellikleri çek
    });


    useEffect(() => {
        if (categoriesData) setCategories(categoriesData.data);
        if (providersData) setProviders(providersData.data);
        if (featuresData) setFeatures(featuresData);
    }, [categoriesData, providersData, featuresData]);


    const {
        register,
        handleSubmit,
        reset,
        control, // Controller için
        watch, // Değişiklikleri izlemek için
        setValue, // Form değerlerini ayarlamak için
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(planSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            renewal_price: 0,
            discount_percentage: null,
            status: 'active',
            provider_id: '',
            category_id: '',
            features: [], // Varsayılan olarak boş özellikler dizisi
        },
    });

    const watchedFeatures = watch('features'); // Formdaki 'features' alanını izle

    // Dialog açıldığında veya currentPlan değiştiğinde formu resetle
    useEffect(() => {
        if (isDialogOpen && currentPlan) {
            // Planın özelliklerini formun 'features' alanına uygun hale getir
            const formattedFeatures = currentPlan.features?.map(pf => ({
                feature_id: pf.feature_id,
                value: pf.value,
            })) || [];
            reset({
                ...currentPlan,
                provider_id: String(currentPlan.provider_id) || '0', // Select için string olarak ayarla, yoksa '0'
                category_id: String(currentPlan.category_id) || '0', // Select için string olarak ayarla, yoksa '0'
                features: formattedFeatures,
            });
        } else if (isDialogOpen && !currentPlan) {
            // Yeni plan oluşturuluyorsa formu temizle
            reset({
                name: '',
                description: '',
                price: 0,
                renewal_price: 0,
                discount_percentage: null,
                status: 'active',
                provider_id: '0', // Yeni plan için varsayılan '0'
                category_id: '0', // Yeni plan için varsayılan '0'
                features: [],
            });
        }
    }, [isDialogOpen, currentPlan, reset]);

    const handleAddPlanClick = () => {
        setCurrentPlan(null);
        setIsDialogOpen(true);
    };

    const handleEditPlanClick = (plan) => {
        setCurrentPlan(plan);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (planId) => {
        setPlanToDelete(planId);
        setIsConfirmDialogOpen(true);
    };

    const confirmDeletePlan = async () => {
        if (!planToDelete) return;
        try {
            await deletePlan(planToDelete);
            queryClient.invalidateQueries(['plans']); // Planları yeniden çek
            toast({
                title: t("plan_deleted_successfully"),
                description: t("plan_deleted_successfully_description"),
                variant: "success",
            });
        } catch (error) {
            toast({
                title: t("delete_error"),
                description: t("failed_to_delete_plan"),
                variant: "destructive",
            });
            console.error("Plan silme hatası:", error);
        } finally {
            setIsConfirmDialogOpen(false);
            setPlanToDelete(null);
        }
    };

    const onSubmit = async (data) => {
        try {
            let response;
            const payload = {
                name: data.name,
                description: data.description,
                price: parseFloat(data.price),
                renewal_price: parseFloat(data.renewal_price) || null,
                discount_percentage: parseFloat(data.discount_percentage) || null,
                status: data.status,
                provider_id: parseInt(data.provider_id),
                category_id: parseInt(data.category_id),
            };

            if (currentPlan) {
                response = await updatePlan(currentPlan.id, payload);
                // Özellikleri senkronize et
                await syncFeatures(currentPlan.id, data.features);
                toast({
                    title: t("plan_updated_successfully"),
                    description: t("plan_updated_successfully_description"),
                    variant: "success",
                });
            } else {
                response = await createPlan(payload);
                // Yeni oluşturulan planın ID'sini alıp özellikleri senkronize et
                // Laravel'den dönen response.data.data içinde plan objesi olmalı
                const newPlanId = response.data.data?.id || response.data?.id;
                if (newPlanId) {
                    await syncFeatures(newPlanId, data.features);
                } else {
                    console.warn("Yeni oluşturulan planın ID'si bulunamadı, özellikler senkronize edilemedi.");
                }
                toast({
                    title: t("plan_created_successfully"),
                    description: t("plan_created_successfully_description"),
                    variant: "success",
                });
            }
            queryClient.invalidateQueries(['plans']); // Planları yeniden çek
            setIsDialogOpen(false);
            reset();
        } catch (error) {
            toast({
                title: t("operation_failed"),
                description: error.message || (currentPlan ? t("failed_to_update_plan") : t("failed_to_create_plan")),
                variant: "destructive",
            });
            console.error("Plan işlemi hatası:", error.response?.data || error.message);
        }
    };

    // Bir özelliğin seçili olup olmadığını kontrol eden fonksiyon
    const isFeatureSelected = (featureId) => {
        return watchedFeatures?.some(f => f.feature_id === featureId);
    };

    // Bir özelliğin seçimi değiştiğinde çağrılan fonksiyon
    const handleFeatureToggle = (feature, checked) => {
        const currentFeatures = watchedFeatures || [];
        if (checked) {
            // Özellik seçildiyse, listeye ekle
            setValue('features', [...currentFeatures, { feature_id: feature.id, value: '' }]);
        } else {
            // Özellik seçimi kaldırıldıysa, listeden çıkar
            setValue('features', currentFeatures.filter(f => f.feature_id !== feature.id));
        }
    };

    // Özellik değeri değiştiğinde çağrılan fonksiyon
    const handleFeatureValueChange = (featureId, value) => {
        const updatedFeatures = (watchedFeatures || []).map(f =>
            f.feature_id === featureId ? { ...f, value: value } : f
        );
        setValue('features', updatedFeatures);
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

    const isLoadingCombined = isLoadingPlans || isLoadingCategories || isLoadingProviders || isLoadingFeatures;
    const isErrorCombined = isErrorPlans || isErrorCategories || isErrorProviders || isErrorFeatures;
    const combinedError = plansError || categoriesError || providersError || featuresError;


    if (isLoadingCombined) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-10">{t('admin_plans_page_title')}</h1>
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
                <p>{t('error_loading_plans')}: {combinedError.message}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-4">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">{t('admin_plans_page_title')}</h1>

            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAddPlanClick}>
                            <PlusCircle className="mr-2 h-5 w-5" /> {t('add_new_plan')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{currentPlan ? t('edit_plan') : t('create_plan')}</DialogTitle>
                            <DialogDescription>
                                {currentPlan ? t('edit_plan_description') : t('add_new_plan_description')}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('plan_name')}</Label>
                                <Input id="name" {...register("name")} />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">{t('description')}</Label>
                                <Textarea id="description" {...register("description")} />
                                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">{t('price')}</Label>
                                    <Input id="price" type="number" step="0.01" {...register("price")} />
                                    {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="renewal_price">{t('renewal_price')}</Label>
                                    <Input id="renewal_price" type="number" step="0.01" {...register("renewal_price")} />
                                    {errors.renewal_price && <p className="text-red-500 text-sm">{errors.renewal_price.message}</p>}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="discount_percentage">{t('discount_percentage')}</Label>
                                <Input id="discount_percentage" type="number" step="0.01" {...register("discount_percentage")} />
                                {errors.discount_percentage && <p className="text-red-500 text-sm">{errors.discount_percentage.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">{t('status')}</Label>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('select_status')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{t('all_statuses')}</SelectItem>
                                                <SelectItem value="active">{t('active')}</SelectItem>
                                                <SelectItem value="inactive">{t('inactive')}</SelectItem>
                                                <SelectItem value="deprecated">{t('deprecated')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="provider_id">{t('provider')}</Label>
                                <Controller
                                    name="provider_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={String(field.value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('select_provider')} />
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
                                    )}
                                />
                                {errors.provider_id && <p className="text-red-500 text-sm">{errors.provider_id.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category_id">{t('category')}</Label>
                                <Controller
                                    name="category_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={String(field.value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('select_category')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">{t('all_categories')}</SelectItem>
                                                {categories.map(category => (
                                                    <SelectItem key={category.id} value={String(category.id)}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.category_id && <p className="text-red-500 text-sm">{errors.category_id.message}</p>}
                            </div>

                            {/* Plan Özellikleri Yönetimi */}
                            <div className="space-y-4 border p-4 rounded-md">
                                <h3 className="text-lg font-semibold">{t('plan_features')}</h3>
                                {features.length > 0 ? (
                                    features.map((feature) => (
                                        <div key={feature.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`feature-${feature.id}`}
                                                checked={isFeatureSelected(feature.id)}
                                                onCheckedChange={(checked) => handleFeatureToggle(feature, checked)}
                                            />
                                            <Label htmlFor={`feature-${feature.id}`} className="flex-grow">
                                                {feature.name} {feature.unit ? `(${feature.unit})` : ''}
                                            </Label>
                                            {isFeatureSelected(feature.id) && (
                                                <Input
                                                    type="text"
                                                    placeholder={t('value')}
                                                    value={watchedFeatures.find(f => f.feature_id === feature.id)?.value || ''}
                                                    onChange={(e) => handleFeatureValueChange(feature.id, e.target.value)}
                                                    className="w-1/3"
                                                />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-600 dark:text-gray-400">{t('no_features_found_message')}</p>
                                )}
                                {errors.features && <p className="text-red-500 text-sm">{errors.features.message}</p>}
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    {t('cancel')}
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (currentPlan ? t('updating') : t('creating')) : (currentPlan ? t('save') : t('create'))}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <div className="flex items-center space-x-2 flex-wrap gap-2">
                    <Input
                        placeholder={t('search_plan')}
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
                            <SelectItem value="active">{t('active')}</SelectItem>
                            <SelectItem value="inactive">{t('inactive')}</SelectItem>
                            <SelectItem value="pending">{t('pending')}</SelectItem>
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
                    <Select onValueChange={(value) => { setFilterCategory(value); setPage(1); }} value={filterCategory}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('filter_by_category')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">{t('all_categories')}</SelectItem>
                            {categories.map(category => (
                                <SelectItem key={category.id} value={String(category.id)}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(value) => { setSortBy(value); setPage(1); }} value={sortBy}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('sort_by')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">{t('plan_name')}</SelectItem>
                            <SelectItem value="price">{t('price')}</SelectItem>
                            <SelectItem value="created_at">{t('created_at')}</SelectItem>
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

            {plans.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('name')}>
                                {t('plan_name')} {sortBy === 'name' && <ArrowUpDown className={`inline-block ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />}
                            </TableHead>
                            <TableHead className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('price')}>
                                {t('price')} {sortBy === 'price' && <ArrowUpDown className={`inline-block ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />}
                            </TableHead>
                            <TableHead>{t('provider')}</TableHead>
                            <TableHead>{t('category')}</TableHead>
                            <TableHead>{t('status')}</TableHead>
                            <TableHead className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('created_at')}>
                                {t('created_at')} {sortBy === 'created_at' && <ArrowUpDown className={`inline-block ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />}
                            </TableHead>
                            <TableHead className="text-right">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plans.map((plan) => (
                            <TableRow key={plan.id}>
                                <TableCell className="font-medium">{plan.id}</TableCell>
                                <TableCell>{plan.name}</TableCell>
                                <TableCell>{plan.price} TL</TableCell>
                                <TableCell>{providers.find(p => p.id === plan.provider_id)?.name || t('unknown')}</TableCell>
                                <TableCell>{categories.find(c => c.id === plan.category_id)?.name || t('unknown')}</TableCell>
                                <TableCell>
                                    {plan.status === 'active' ? t('active') : plan.status === 'inactive' ? t('inactive') : t('deprecated')}
                                </TableCell>
                                <TableCell className="text-right flex space-x-2 justify-end">
                                    <Button variant="outline" size="sm" onClick={() => handleEditPlanClick(plan)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(plan.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-gray-600 dark:text-gray-400">
                    {t('no_plans_found')}
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
                        <DialogTitle>{t('confirm_delete_plan')}</DialogTitle>
                        <DialogDescription>
                            {t('delete_plan_confirmation_message')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                            {t('cancel')}
                        </Button>
                        <Button variant="destructive" onClick={confirmDeletePlan}>
                            {t('delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PlansAdmin;
