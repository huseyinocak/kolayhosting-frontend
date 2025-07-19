import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form'; // Controller'ı da içe aktar
import { zodResolver } from '@hookform/resolvers/zod'; // Zod resolver'ı içe aktar
import * as z from 'zod'; // Zod kütüphanesini içe aktar
import {
    getAllFeatures,
    createFeature,
    updateFeature,
    deleteFeature,
} from '../../api/features'; // Özellik API fonksiyonlarını src/api/features.js'den içe aktar
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

// Zod ile özellik formunun şemasını tanımla
const featureSchema = z.object({
    name: z.string().min(2, { message: "Özellik adı en az 2 karakter olmalıdır." }),
    unit: z.string().optional(),
    type: z.enum(["numeric", "boolean", "text", "enum"], { // Belirli tiplerle kısıtla
        required_error: "Özellik tipi seçilmelidir.",
        invalid_type_error: "Geçersiz özellik tipi.",
    }),
});

const FeaturesAdmin = () => {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(null); // Düzenlenecek özellik
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
        resolver: zodResolver(featureSchema),
    });

    // Özellikleri API'den çekme fonksiyonu
    const fetchFeatures = async () => {
        setLoading(true);
        try {
            const data = await getAllFeatures(); // src/api/features.js'den çağırılıyor
            setFeatures(data);
        } catch (err) {
            setError(err.message || 'Özellikler yüklenirken bir hata oluştu.');
            toast({
                title: 'Hata',
                description: 'Özellikler yüklenirken bir sorun oluştu.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeatures();
    }, []);

    // Diyalog açıldığında veya currentFeature değiştiğinde formu doldur
    useEffect(() => {
        if (isDialogOpen && currentFeature) {
            setValue('name', currentFeature.name);
            setValue('unit', currentFeature.unit || '');
            setValue('type', currentFeature.type || '');
        } else if (!isDialogOpen) {
            reset(); // Diyalog kapandığında formu sıfırla
            setCurrentFeature(null); // currentFeature'yi de sıfırla
        }
    }, [isDialogOpen, currentFeature, reset, setValue]);

    // Yeni özellik ekleme veya mevcut özelliği düzenleme
    const onSubmit = async (data) => {
        try {
            if (currentFeature) {
                // Özelliği düzenle
                await updateFeature(currentFeature.id, data); // src/api/features.js'den çağırılıyor
                toast({
                    title: 'Başarılı',
                    description: 'Özellik başarıyla güncellendi.',
                });
            } else {
                // Yeni özellik oluştur
                await createFeature(data); // src/api/features.js'den çağırılıyor
                toast({
                    title: 'Başarılı',
                    description: 'Yeni özellik başarıyla oluşturuldu.',
                });
            }
            setIsDialogOpen(false); // Diyaloğu kapat
            fetchFeatures(); // Özellikleri yeniden çek
        } catch (err) {
            toast({
                title: 'Hata',
                description: `Özellik kaydedilirken bir sorun oluştu: ${err.response?.data?.message || err.message}`,
                variant: 'destructive',
            });
        }
    };

    // Özellik düzenleme diyaloğunu açma
    const handleEditClick = (feature) => {
        setCurrentFeature(feature);
        setIsDialogOpen(true);
    };

    // Özellik silme
    const handleDeleteFeature = async (featureId) => {
        if (window.confirm('Bu özelliği silmek istediğinizden emin misiniz?')) {
            try {
                await deleteFeature(featureId); // src/api/features.js'den çağırılıyor
                toast({
                    title: 'Başarılı',
                    description: 'Özellik başarıyla silindi.',
                });
                fetchFeatures(); // Özellikleri yeniden çek
            } catch (err) {
                toast({
                    title: 'Hata',
                    description: `Özellik silinirken bir sorun oluştu: ${err.response?.data?.message || err.message}`,
                    variant: 'destructive',
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-10">Özellik Yönetimi</h1>
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
                <Button onClick={fetchFeatures} className="mt-4">
                    Tekrar Dene
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
                Özellik Yönetimi
            </h1>

            <div className="flex justify-end mb-6">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setCurrentFeature(null); // Yeni ekleme için currentFeature'yi sıfırla
                            setIsDialogOpen(true);
                        }}>Yeni Özellik Ekle</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{currentFeature ? 'Özelliği Düzenle' : 'Yeni Özellik Ekle'}</DialogTitle>
                            <DialogDescription>
                                {currentFeature
                                    ? 'Özellik bilgilerini güncelleyin.'
                                    : 'Yeni bir özellik oluşturmak için bilgileri girin.'}
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
                                <Label htmlFor="unit" className="text-right">
                                    Birim
                                </Label>
                                <Input
                                    id="unit"
                                    {...register("unit")}
                                    className="col-span-3"
                                    placeholder="Örn: GB, Adet, Mbps"
                                />
                                {errors.unit && <p className="col-span-4 text-red-500 text-sm text-right">{errors.unit.message}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">
                                    Tip
                                </Label>
                                {/* Select bileşeni için Controller kullanıyoruz */}
                                <Controller
                                    name="type"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} className="col-span-3">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Özellik Tipini Seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="numeric">Sayısal</SelectItem>
                                                <SelectItem value="boolean">Boolean (Evet/Hayır)</SelectItem>
                                                <SelectItem value="text">Metin</SelectItem>
                                                <SelectItem value="enum">Seçenekli</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.type && <p className="col-span-4 text-red-500 text-sm text-right">{errors.type.message}</p>}
                            </div>
                            <DialogFooter>
                                <Button type="submit">Kaydet</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {features.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Ad</TableHead>
                            <TableHead>Birim</TableHead>
                            <TableHead>Tip</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {features.map((feature) => (
                            <TableRow key={feature.id}>
                                <TableCell className="font-medium">{feature.id}</TableCell>
                                <TableCell>{feature.name}</TableCell>
                                <TableCell>{feature.unit || '-'}</TableCell>
                                <TableCell>{feature.type}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(feature)}>
                                        Düzenle
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteFeature(feature.id)}>
                                        Sil
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-gray-600 dark:text-gray-400">
                    Henüz hiç özellik bulunmamaktadır.
                </div>
            )}
        </div>
    );
};

export default FeaturesAdmin;
