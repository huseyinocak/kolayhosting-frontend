import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form'; // Controller'ı da içe aktar
import { zodResolver } from '@hookform/resolvers/zod'; // Zod resolver'ı içe aktar
import * as z from 'zod'; // Zod kütüphanesini içe aktar
import {
    getAllProviders,
    createProvider,
    updateProvider,
    deleteProvider,
} from '../../api/providers'; // Sağlayıcı API fonksiyonlarını içe aktar
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
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'; // Logo için Avatar

// Zod ile sağlayıcı formunun şemasını tanımla
const providerSchema = z.object({
    name: z.string().min(2, { message: "Sağlayıcı adı en az 2 karakter olmalıdır." }),
    logo_url: z.string().url({ message: "Geçerli bir URL giriniz." }).optional().or(z.literal('')), // Boş stringi de kabul et
    website_url: z.string().url({ message: "Geçerli bir URL giriniz." }).optional().or(z.literal('')), // Boş stringi de kabul et
    description: z.string().optional(),
    average_rating: z.preprocess(
        (val) => val === "" ? undefined : Number(val), // Boş stringi undefined olarak işle
        z.number().min(0, { message: "Derecelendirme sıfırdan küçük olamaz." }).max(5, { message: "Derecelendirme 5'ten büyük olamaz." }).optional()
    ),
});

const ProvidersAdmin = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentProvider, setCurrentProvider] = useState(null); // Düzenlenecek sağlayıcı
    const { toast } = useToastContext();

    // useForm hook'unu başlat
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset, // Formu sıfırlamak için
        setValue, // Form alanlarına değer atamak için
    } = useForm({
        resolver: zodResolver(providerSchema),
    });

    // Sağlayıcıları API'den çekme fonksiyonu
    const fetchProviders = async () => {
        setLoading(true);
        try {
            const data = await getAllProviders();
            setProviders(data);
        } catch (err) {
            console.error('Sağlayıcılar yüklenirken hata:', err);
            setError('Sağlayıcılar yüklenemedi. Lütfen daha sonra tekrar deneyin.');
            toast({
                title: 'Hata',
                description: 'Sağlayıcılar yüklenirken bir sorun oluştu.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    // Diyalog açıldığında veya currentProvider değiştiğinde formu doldur
    useEffect(() => {
        if (isDialogOpen && currentProvider) {
            setValue('name', currentProvider.name);
            setValue('logo_url', currentProvider.logo_url || '');
            setValue('website_url', currentProvider.website_url || '');
            setValue('description', currentProvider.description || '');
            setValue('average_rating', currentProvider.average_rating || '');
        } else if (!isDialogOpen) {
            reset(); // Diyalog kapandığında formu sıfırla
            setCurrentProvider(null); // currentProvider'ı da sıfırla
        }
    }, [isDialogOpen, currentProvider, reset, setValue]);

    // Yeni sağlayıcı ekleme veya mevcut sağlayıcıyı düzenleme
    const onSubmit = async (data) => {
        try {
            const payload = { ...data };
            // average_rating boş string ise undefined yap (Zod preprocess ile zaten yapılıyor ama emin olmak için)
            if (payload.average_rating === '') {
                payload.average_rating = undefined;
            }

            if (currentProvider) {
                // Sağlayıcıyı düzenle
                await updateProvider(currentProvider.id, payload);
                toast({
                    title: 'Başarılı',
                    description: 'Sağlayıcı başarıyla güncellendi.',
                });
            } else {
                // Yeni sağlayıcı oluştur
                await createProvider(payload);
                toast({
                    title: 'Başarılı',
                    description: 'Yeni sağlayıcı başarıyla oluşturuldu.',
                });
            }
            setIsDialogOpen(false); // Diyaloğu kapat
            fetchProviders(); // Sağlayıcıları yeniden çek
        } catch (err) {
            toast({
                title: 'Hata',
                description: `Sağlayıcı kaydedilirken bir sorun oluştu: ${err.response?.data?.message || err.message}`,
                variant: 'destructive',
            });
        }
    };

    // Sağlayıcı düzenleme diyaloğunu açma
    const handleEditClick = (provider) => {
        setCurrentProvider(provider);
        setIsDialogOpen(true);
    };

    // Sağlayıcı silme
    const handleDeleteProvider = async (providerId) => {
        if (window.confirm('Bu sağlayıcıyı silmek istediğinizden emin misiniz?')) {
            try {
                await deleteProvider(providerId);
                toast({
                    title: 'Başarılı',
                    description: 'Sağlayıcı başarıyla silindi.',
                });
                fetchProviders(); // Sağlayıcıları yeniden çek
            } catch (err) {
                toast({
                    title: 'Hata',
                    description: `Sağlayıcı silinirken bir sorun oluştu: ${err.response?.data?.message || err.message}`,
                    variant: 'destructive',
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-10">Sağlayıcı Yönetimi</h1>
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
                <Button onClick={fetchProviders} className="mt-4">
                    Tekrar Dene
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
                Sağlayıcı Yönetimi
            </h1>

            <div className="flex justify-end mb-6">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setCurrentProvider(null); // Yeni ekleme için currentProvider'ı sıfırla
                            setIsDialogOpen(true);
                        }}>Yeni Sağlayıcı Ekle</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{currentProvider ? 'Sağlayıcıyı Düzenle' : 'Yeni Sağlayıcı Ekle'}</DialogTitle>
                            <DialogDescription>
                                {currentProvider
                                    ? 'Sağlayıcı bilgilerini güncelleyin.'
                                    : 'Yeni bir sağlayıcı oluşturmak için bilgileri girin.'}
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
                                <Label htmlFor="logo_url" className="text-right">
                                    Logo URL
                                </Label>
                                <Input
                                    id="logo_url"
                                    type="url"
                                    {...register("logo_url")}
                                    className="col-span-3"
                                    placeholder="https://example.com/logo.png"
                                />
                                {errors.logo_url && <p className="col-span-4 text-red-500 text-sm text-right">{errors.logo_url.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="website_url" className="text-right">
                                    Web Sitesi URL
                                </Label>
                                <Input
                                    id="website_url"
                                    type="url"
                                    {...register("website_url")}
                                    className="col-span-3"
                                    placeholder="https://example.com"
                                />
                                {errors.website_url && <p className="col-span-4 text-red-500 text-sm text-right">{errors.website_url.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Açıklama
                                </Label>
                                <Textarea
                                    id="description"
                                    {...register("description")}
                                    className="col-span-3"
                                />
                                {errors.description && <p className="col-span-4 text-red-500 text-sm text-right">{errors.description.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="average_rating" className="text-right">
                                    Ortalama Derecelendirme
                                </Label>
                                <Input
                                    id="average_rating"
                                    type="number"
                                    step="0.1"
                                    {...register("average_rating")}
                                    className="col-span-3"
                                    placeholder="0.0 - 5.0 arası"
                                />
                                {errors.average_rating && <p className="col-span-4 text-red-500 text-sm text-right">{errors.average_rating.message}</p>}
                            </div>
                            <DialogFooter>
                                <Button type="submit">Kaydet</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {providers.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Logo</TableHead>
                            <TableHead>Ad</TableHead>
                            <TableHead>Web Sitesi</TableHead>
                            <TableHead>Ortalama Derecelendirme</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {providers.map((provider) => (
                            <TableRow key={provider.id}>
                                <TableCell className="font-medium">{provider.id}</TableCell>
                                <TableCell>
                                    <Avatar>
                                        <AvatarImage src={provider.logo_url || `https://placehold.co/40x40/e2e8f0/000000?text=${provider.name.charAt(0)}`} alt={provider.name} />
                                        <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>{provider.name}</TableCell>
                                <TableCell>
                                    {provider.website_url ? (
                                        <a href={provider.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {provider.website_url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]}
                                        </a>
                                    ) : (
                                        '-'
                                    )}
                                </TableCell>
                                <TableCell>{provider.average_rating?.toFixed(1) || 'N/A'}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(provider)}>
                                        Düzenle
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteProvider(provider.id)}>
                                        Sil
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-gray-600 dark:text-gray-400">
                    Henüz hiç sağlayıcı bulunmamaktadır.
                </div>
            )}
        </div>
    );
};

export default ProvidersAdmin;
