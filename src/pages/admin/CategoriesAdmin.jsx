import React, { useEffect, useState } from 'react';
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

const CategoriesAdmin = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null); // Düzenlenecek kategori
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const { toast } = useToastContext();

    // Kategorileri API'den çekme fonksiyonu
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (err) {
            setError(err.message || 'Kategoriler yüklenirken bir hata oluştu.');
            toast({
                title: 'Hata',
                description: 'Kategoriler yüklenirken bir sorun oluştu.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Yeni kategori ekleme veya mevcut kategoriyi düzenleme
    const handleSaveCategory = async (e) => {
        e.preventDefault();
        if (!categoryName.trim() || !categoryDescription.trim()) {
            toast({
                title: 'Uyarı',
                description: 'Kategori adı ve açıklaması boş bırakılamaz.',
                variant: 'warning',
            });
            return;
        }

        try {
            if (currentCategory) {
                // Kategoriyi düzenle
                await updateCategory(currentCategory.id, {
                    name: categoryName,
                    description: categoryDescription,
                });
                toast({
                    title: 'Başarılı',
                    description: 'Kategori başarıyla güncellendi.',
                });
            } else {
                // Yeni kategori oluştur
                await createCategory({
                    name: categoryName,
                    description: categoryDescription,
                });
                toast({
                    title: 'Başarılı',
                    description: 'Yeni kategori başarıyla oluşturuldu.',
                });
            }
            setIsDialogOpen(false); // Diyaloğu kapat
            resetForm(); // Formu sıfırla
            fetchCategories(); // Kategorileri yeniden çek
        } catch (err) {
            toast({
                title: 'Hata',
                description: `Kategori kaydedilirken bir sorun oluştu: ${err.message || ''}`,
                variant: 'destructive',
            });
        }
    };

    // Kategori düzenleme diyaloğunu açma
    const handleEditClick = (category) => {
        setCurrentCategory(category);
        setCategoryName(category.name);
        setCategoryDescription(category.description);
        setIsDialogOpen(true);
    };

    // Kategori silme
    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
            try {
                await deleteCategory(categoryId);
                toast({
                    title: 'Başarılı',
                    description: 'Kategori başarıyla silindi.',
                });
                fetchCategories(); // Kategorileri yeniden çek
            } catch (err) {
                toast({
                    title: 'Hata',
                    description: `Kategori silinirken bir sorun oluştu: ${err.message || ''}`,
                    variant: 'destructive',
                });
            }
        }
    };

    // Formu sıfırlama
    const resetForm = () => {
        setCurrentCategory(null);
        setCategoryName('');
        setCategoryDescription('');
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
                        <Button onClick={resetForm}>Yeni Kategori Ekle</Button>
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
                        <form onSubmit={handleSaveCategory} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Ad
                                </Label>
                                <Input
                                    id="name"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Açıklama
                                </Label>
                                <Textarea
                                    id="description"
                                    value={categoryDescription}
                                    onChange={(e) => setCategoryDescription(e.target.value)}
                                    className="col-span-3"
                                    required
                                />
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
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(category.id)}>
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
        </div>
    );
};

export default CategoriesAdmin;
