import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form'; // useForm hook'unu içe aktar
import { zodResolver } from '@hookform/resolvers/zod'; // Zod resolver'ı içe aktar
import * as z from 'zod'; // Zod kütüphanesini içe aktar
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../../api/categories'; // Kategori API fonksiyonlarını içe aktar
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
import { Textarea } from '../../components/ui/textarea'; // Açıklama için
import { Skeleton } from '../../components/ui/skeleton'; // Yükleme iskeleti için

// Zod ile kategori formunun şemasını tanımla
const categorySchema = z.object({
    name: z.string().min(2, { message: "Kategori adı en az 2 karakter olmalıdır." }),
    description: z.string().optional(), // Açıklama alanı isteğe bağlı
});

const CategoriesAdmin = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Ekleme/Düzenleme diyaloğu
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // Onay diyaloğu
    const [categoryToDeleteId, setCategoryToDeleteId] = useState(null); // Silinecek kategori ID'si
    const [currentCategory, setCurrentCategory] = useState(null); // Düzenlenecek kategori
    const { toast } = useToastContext();

    // useForm hook'unu başlat
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset, // Formu sıfırlamak için
        setValue, // Form alanlarına değer atamak için
    } = useForm({
        resolver: zodResolver(categorySchema),
    });

    // Kategorileri API'den çekme fonksiyonu
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await getAllCategories(); // API'den kategorileri al
            setCategories(data); // Kategorileri state'e ata
        } catch (err) {
            console.error('Kategoriler yüklenirken hata:', err);
            setError('Kategoriler yüklenemedi. Lütfen daha sonra tekrar deneyin.');
            toast({
                title: 'Hata',
                description: 'Kategoriler yüklenirken bir sorun oluştu.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false); // Yükleme tamamlandı
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Diyalog açıldığında veya currentCategory değiştiğinde formu doldur
    useEffect(() => {
        if (isDialogOpen && currentCategory) {
            setValue('name', currentCategory.name);
            setValue('description', currentCategory.description || '');
        } else if (!isDialogOpen) {
            reset(); // Diyalog kapandığında formu sıfırla
            setCurrentCategory(null); // currentCategory'yi de sıfırla
        }
    }, [isDialogOpen, currentCategory, reset, setValue]);

    // Yeni kategori ekleme veya mevcut kategori düzenleme
    const onSubmit = async (data) => {
        try {
            if (currentCategory) {
                // Kategoriyi düzenle
                await updateCategory(currentCategory.id, data);
                toast({
                    title: 'Başarılı',
                    description: 'Kategori başarıyla güncellendi.',
                });
            } else {
                // Yeni kategori oluştur
                await createCategory(data);
                toast({
                    title: 'Başarılı',
                    description: 'Yeni kategori başarıyla oluşturuldu.',
                });
            }
            setIsDialogOpen(false); // Diyaloğu kapat
            fetchCategories(); // Kategorileri yeniden çek
        } catch (err) {
            toast({
                title: 'Hata',
                description: `Kategori kaydedilirken bir sorun oluştu: ${err.response?.data?.message || err.message}`,
                variant: 'destructive',
            });
        }
    };

    // Kategori düzenleme diyaloğunu açma
    const handleEditClick = (category) => {
        setCurrentCategory(category);
        setIsDialogOpen(true);
    };

    // Kategori silme onay diyaloğunu açma
    const handleDeleteClick = (categoryId) => {
        setCategoryToDeleteId(categoryId);
        setIsConfirmDialogOpen(true);
    };

    // Kategori silme işlemini gerçekleştirme
    const confirmDeleteCategory = async () => {
        setIsConfirmDialogOpen(false); // Onay diyaloğunu kapat
        if (categoryToDeleteId) {
            try {
                await deleteCategory(categoryToDeleteId);
                toast({
                    title: 'Başarılı',
                    description: 'Kategori başarıyla silindi.',
                });
                fetchCategories(); // Kategorileri yeniden çek
            } catch (err) {
                toast({
                    title: 'Hata',
                    description: `Kategori silinirken bir sorun oluştu: ${err.response?.data?.message || err.message}`,
                    variant: 'destructive',
                });
            } finally {
                setCategoryToDeleteId(null); // Silinecek ID'yi sıfırla
            }
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-10">Kategori Yönetimi</h1>
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
                <Button onClick={fetchCategories} className="mt-4">
                    Tekrar Dene
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
                Kategori Yönetimi
            </h1>

            <div className="flex justify-end mb-6">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setCurrentCategory(null); // Yeni ekleme için currentCategory'yi sıfırla
                            setIsDialogOpen(true);
                        }}>Yeni Kategori Ekle</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{currentCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}</DialogTitle>
                            <DialogDescription>
                                {currentCategory
                                    ? 'Kategori bilgilerini güncelleyin.'
                                    : 'Yeni bir kategori oluşturmak için bilgileri girin.'}
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
                            <DialogFooter>
                                <Button type="submit">Kaydet</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {categories.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Ad</TableHead>
                            <TableHead>Açıklama</TableHead>
                            <TableHead>Plan Sayısı</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell className="font-medium">{category.id}</TableCell>
                                <TableCell>{category.name}</TableCell>
                                <TableCell>{category.description}</TableCell>
                                <TableCell>{category.plans_count || 0}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(category)}>
                                        Düzenle
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(category.id)}>
                                        Sil
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-gray-600 dark:text-gray-400">
                    Henüz hiç kategori bulunmamaktadır.
                </div>
            )}

            {/* Silme Onay Diyaloğu */}
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Silme Onayı</DialogTitle>
                        <DialogDescription>
                            Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                            İptal
                        </Button>
                        <Button variant="destructive" onClick={confirmDeleteCategory}>
                            Sil
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CategoriesAdmin;
