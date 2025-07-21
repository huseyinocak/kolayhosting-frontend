import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form'; // Controller'ı da içe aktar
import { zodResolver } from '@hookform/resolvers/zod'; // Zod resolver'ı içe aktar
import * as z from 'zod'; // Zod kütüphanesini içe aktar
import {
    getAllPlans,
    createPlan,
    updatePlan,
    deletePlan,
} from '../../api/plans'; // Plan API fonksiyonlarını içe aktar
import { getAllCategories } from '../../api/categories'; // Kategorileri çekmek için
import { getAllProviders } from '../../api/providers'; // Sağlayıcıları çekmek için
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

// Zod ile plan formunun şemasını tanımla
const planSchema = z.object({
    name: z.string().min(2, { message: "Plan adı en az 2 karakter olmalıdır." }),
    price: z.preprocess(
        (val) => Number(val),
        z.number().min(0, { message: "Fiyat sıfırdan küçük olamaz." })
    ),
    currency: z.string().min(1, { message: "Para birimi boş olamaz." }),
    renewal_price: z.preprocess(
        (val) => val === "" ? undefined : Number(val), // Boş stringi undefined olarak işle
        z.number().min(0, { message: "Yenileme fiyatı sıfırdan küçük olamaz." }).optional()
    ),
    discount_percentage: z.preprocess(
        (val) => val === "" ? undefined : Number(val), // Boş stringi undefined olarak işle
        z.number().min(0, { message: "İndirim yüzdesi sıfırdan küçük olamaz." }).max(100, { message: "İndirim yüzdesi 100'den büyük olamaz." }).optional()
    ),
    summary: z.string().optional(),
    link: z.string().url({ message: "Geçerli bir URL giriniz." }).optional().or(z.literal('')), // Boş stringi de kabul et
    category_id: z.string().min(1, { message: "Kategori seçilmelidir." }), // Select için string olarak gelecek
    provider_id: z.string().min(1, { message: "Sağlayıcı seçilmelidir." }), // Select için string olarak gelecek
});


const PlansAdmin = () => {
    const [plans, setPlans] = useState([]);
    const [categories, setCategories] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Ekleme/Düzenleme diyaloğu
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // Onay diyaloğu
    const [planToDeleteId, setPlanToDeleteId] = useState(null); // Silinecek plan ID'si
    const [currentPlan, setCurrentPlan] = useState(null); // Düzenlenecek plan
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
        resolver: zodResolver(planSchema),
    });

    // Planları, kategorileri ve sağlayıcıları API'den çekme fonksiyonu
    const fetchData = async () => {
        setLoading(true);
        try {
            const [plansData, categoriesData, providersData] = await Promise.all([
                getAllPlans(),
                getAllCategories(),
                getAllProviders(),
            ]);
            setPlans(plansData);
            setCategories(categoriesData);
            setProviders(providersData);
        } catch (err) {
            console.error('Veriler yüklenirken hata:', err);
            setError('Veriler yüklenemedi. Lütfen daha sonra tekrar deneyin.');
            toast({
                title: 'Hata',
                description: 'Veriler yüklenirken bir sorun oluştu.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Diyalog açıldığında veya currentPlan değiştiğinde formu doldur
    useEffect(() => {
        if (isDialogOpen && currentPlan) {
            setValue('name', currentPlan.name);
            setValue('price', currentPlan.price);
            setValue('currency', currentPlan.currency);
            setValue('renewal_price', currentPlan.renewal_price || '');
            setValue('discount_percentage', currentPlan.discount_percentage || '');
            setValue('summary', currentPlan.summary || '');
            setValue('link', currentPlan.link || '');
            setValue('category_id', String(currentPlan.category_id)); // Select için string olarak ayarla
            setValue('provider_id', String(currentPlan.provider_id)); // Select için string olarak ayarla
        } else if (!isDialogOpen) {
            reset(); // Diyalog kapandığında formu sıfırla
            setCurrentPlan(null); // currentPlan'ı da sıfırla
        }
    }, [isDialogOpen, currentPlan, reset, setValue]);

    // Yeni plan ekleme veya mevcut planı düzenleme
    const onSubmit = async (data) => {
        try {
            // category_id ve provider_id'yi number'a çevir
            const payload = {
                ...data,
                category_id: Number(data.category_id),
                provider_id: Number(data.provider_id),
            };

            if (currentPlan) {
                // Planı düzenle
                await updatePlan(currentPlan.id, payload);
                toast({
                    title: 'Başarılı',
                    description: 'Plan başarıyla güncellendi.',
                });
            } else {
                // Yeni plan oluştur
                await createPlan(payload);
                toast({
                    title: 'Başarılı',
                    description: 'Yeni plan başarıyla oluşturuldu.',
                });
            }
            setIsDialogOpen(false); // Diyaloğu kapat
            fetchData(); // Planları yeniden çek
        } catch (err) {
            toast({
                title: 'Hata',
                description: `Plan kaydedilirken bir sorun oluştu: ${err.response?.data?.message || err.message}`,
                variant: 'destructive',
            });
        }
    };

    // Plan düzenleme diyaloğunu açma
    const handleEditClick = (plan) => {
        setCurrentPlan(plan);
        setIsDialogOpen(true);
    };

    // Plan silme onay diyaloğunu açma
    const handleDeleteClick = (planId) => {
        setPlanToDeleteId(planId);
        setIsConfirmDialogOpen(true);
    };

    // Plan silme işlemini gerçekleştirme
    const confirmDeletePlan = async () => {
        setIsConfirmDialogOpen(false); // Onay diyaloğunu kapat
        if (planToDeleteId) {
            try {
                await deletePlan(planToDeleteId);
                toast({
                    title: 'Başarılı',
                    description: 'Plan başarıyla silindi.',
                });
                fetchData(); // Planları yeniden çek
            } catch (err) {
                toast({
                    title: 'Hata',
                    description: `Plan silinirken bir sorun oluştu: ${err.response?.data?.message || err.message}`,
                    variant: 'destructive',
                });
            } finally {
                setPlanToDeleteId(null); // Silinecek ID'yi sıfırla
            }
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-10">Plan Yönetimi</h1>
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
                <Button onClick={fetchData} className="mt-4">
                    Tekrar Dene
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
                Plan Yönetimi
            </h1>

            <div className="flex justify-end mb-6">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setCurrentPlan(null); // Yeni ekleme için currentPlan'ı sıfırla
                            setIsDialogOpen(true);
                        }}>Yeni Plan Ekle</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]"> {/* Daha geniş diyalog */}
                        <DialogHeader>
                            <DialogTitle>{currentPlan ? 'Planı Düzenle' : 'Yeni Plan Ekle'}</DialogTitle>
                            <DialogDescription>
                                {currentPlan
                                    ? 'Plan bilgilerini güncelleyin.'
                                    : 'Yeni bir plan oluşturmak için bilgileri girin.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Ad
                                </Label>
                                <Input
                                    id="name"
                                    {...register("name")}
                                    className="col-span-3"
                                />
                                {errors.name && <p className="col-span-4 text-red-500 text-sm text-right">{errors.name.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">
                                    Fiyat
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    {...register("price")}
                                    className="col-span-3"
                                />
                                {errors.price && <p className="col-span-4 text-red-500 text-sm text-right">{errors.price.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="currency" className="text-right">
                                    Para Birimi
                                </Label>
                                <Input
                                    id="currency"
                                    {...register("currency")}
                                    className="col-span-3"
                                    placeholder="Örn: USD, TL"
                                />
                                {errors.currency && <p className="col-span-4 text-red-500 text-sm text-right">{errors.currency.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="renewal_price" className="text-right">
                                    Yenileme Fiyatı
                                </Label>
                                <Input
                                    id="renewal_price"
                                    type="number"
                                    step="0.01"
                                    {...register("renewal_price")}
                                    className="col-span-3"
                                    placeholder="İsteğe bağlı"
                                />
                                {errors.renewal_price && <p className="col-span-4 text-red-500 text-sm text-right">{errors.renewal_price.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="discount_percentage" className="text-right">
                                    İndirim (%)
                                </Label>
                                <Input
                                    id="discount_percentage"
                                    type="number"
                                    step="0.01"
                                    {...register("discount_percentage")}
                                    className="col-span-3"
                                    placeholder="İsteğe bağlı"
                                />
                                {errors.discount_percentage && <p className="col-span-4 text-red-500 text-sm text-right">{errors.discount_percentage.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="summary" className="text-right">
                                    Özet
                                </Label>
                                <Textarea
                                    id="summary"
                                    {...register("summary")}
                                    className="col-span-3"
                                    placeholder="Planın kısa özeti"
                                />
                                {errors.summary && <p className="col-span-4 text-red-500 text-sm text-right">{errors.summary.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="link" className="text-right">
                                    Link
                                </Label>
                                <Input
                                    id="link"
                                    type="url"
                                    {...register("link")}
                                    className="col-span-3"
                                    placeholder="Planın satın alma linki"
                                />
                                {errors.link && <p className="col-span-4 text-red-500 text-sm text-right">{errors.link.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category_id" className="text-right">
                                    Kategori
                                </Label>
                                <Controller
                                    name="category_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} className="col-span-3">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Kategori Seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(category => (
                                                    <SelectItem key={category.id} value={String(category.id)}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.category_id && <p className="col-span-4 text-red-500 text-sm text-right">{errors.category_id.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="provider_id" className="text-right">
                                    Sağlayıcı
                                </Label>
                                <Controller
                                    name="provider_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} className="col-span-3">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sağlayıcı Seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {providers.map(provider => (
                                                    <SelectItem key={provider.id} value={String(provider.id)}>
                                                        {provider.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.provider_id && <p className="col-span-4 text-red-500 text-sm text-right">{errors.provider_id.message}</p>}
                            </div>
                            <DialogFooter>
                                <Button type="submit">Kaydet</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {plans.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Ad</TableHead>
                            <TableHead>Fiyat</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Sağlayıcı</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plans.map((plan) => (
                            <TableRow key={plan.id}>
                                <TableCell className="font-medium">{plan.id}</TableCell>
                                <TableCell>{plan.name}</TableCell>
                                <TableCell>{plan.currency} {plan.price}</TableCell>
                                <TableCell>{plan.category?.name || 'N/A'}</TableCell>
                                <TableCell>{plan.provider?.name || 'N/A'}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(plan)}>
                                        Düzenle
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(plan.id)}>
                                        Sil
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-gray-600 dark:text-gray-400">
                    Henüz hiç plan bulunmamaktadır.
                </div>
            )}

            {/* Silme Onay Diyaloğu */}
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Silme Onayı</DialogTitle>
                        <DialogDescription>
                            Bu planı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                            İptal
                        </Button>
                        <Button variant="destructive" onClick={confirmDeletePlan}>
                            Sil
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PlansAdmin;
