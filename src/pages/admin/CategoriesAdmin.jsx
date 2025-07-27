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
import { PlusCircle, Edit, Trash2, ArrowUpDown } from 'lucide-react'; // İkonlar için
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // React Query için
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

// Zod ile kategori formunun şemasını tanımla
const categorySchema = z.object({
    name: z.string().min(2, { message: "Kategori adı en az 2 karakter olmalıdır." }),
    description: z.string().optional(), // Açıklama alanı isteğe bağlı
});

const CategoriesAdmin = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [categoryToDeleteId, setCategoryToDeleteId] = useState(null);
    const [currentCategory, setCurrentCategory] = useState(null);
    const { toast } = useToastContext();

    // Filtreleme ve Sıralama State'leri
    const [inputValue, setInputValue] = useState(''); // Arama inputunun anlık değeri için
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const queryClient = useQueryClient();

    // Kategorileri çekmek için useQuery
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['categories', { search, sortBy, sortOrder, page, perPage }],
        queryFn: () => getAllCategories({ name: search, sort_by: sortBy, sort_order: sortOrder, page, per_page: perPage }),
        keepPreviousData: true, // Yeni veriler yüklenirken eski veriyi tutar
    });

    const categories = data?.data || [];
    const paginationMeta = data?.meta; // Laravel pagination meta bilgisi

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            // slug: '',
        },
    });

    // Arama inputu için debounce efekti
    useEffect(() => {
        const handler = setTimeout(() => {
            // Sadece 3 veya daha fazla karakter girildiğinde VEYA arama alanı tamamen boşaltıldığında arama yap
            if (inputValue.length >= 3 || inputValue === '') {
                setSearch(inputValue);
                setPage(1); // Arama yapıldığında sayfayı sıfırla
            }
            // Eğer değer 1 veya 2 karakterse ve boş değilse, `search` state'ini güncelleme.
            // Bu, useQuery'nin gereksiz yere tetiklenmesini engeller.
            // Kullanıcı 3 karaktere ulaştığında veya alanı boşalttığında arama tetiklenecektir.
        }, 500); // 500ms gecikme

        return () => {
            clearTimeout(handler); // Component unmount edildiğinde veya inputValue değiştiğinde timeout'u temizle
        };
    }, [inputValue]); // inputValue her değiştiğinde bu efekti yeniden çalıştır

    // Dialog açıldığında veya currentCategory değiştiğinde formu resetle
    useEffect(() => {
        if (isDialogOpen && currentCategory) {
            reset({
                name: currentCategory.name || '',
            });
        } else if (isDialogOpen && !currentCategory) {
            // Yeni kategori oluşturuluyorsa formu temizle
            reset({
                name: '',
            });
        }
    }, [isDialogOpen, currentCategory, reset]);

    const handleAddCategoryClick = () => {
        setCurrentCategory(null);
        setIsDialogOpen(true);
    };

    const handleEditCategoryClick = (category) => {
        setCurrentCategory(category);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (categoryId) => {
        setCategoryToDeleteId(categoryId);
        setIsConfirmDialogOpen(true);
    };

    const createMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']); // Kategorileri yeniden çek
            toast({
                title: "Kategori Oluşturuldu",
                description: "Yeni kategori başarıyla oluşturuldu.",
                variant: "success",
            });
            setIsDialogOpen(false);
        },
        onError: (err) => {
            toast({
                title: "Hata",
                description: `Kategori oluşturulurken bir sorun oluştu: ${err.response?.data?.message || err.message}`,
                variant: "destructive",
            });
            console.error("Kategori oluşturma hatası:", err);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']); // Kategorileri yeniden çek
            toast({
                title: "Kategori Güncellendi",
                description: "Kategori başarıyla güncellendi.",
                variant: "success",
            });
            setIsDialogOpen(false);
        },
        onError: (err) => {
            toast({
                title: "Hata",
                description: `Kategori güncellenirken bir sorun oluştu: ${err.response?.data?.message || err.message}`,
                variant: "destructive",
            });
            console.error("Kategori güncelleme hatası:", err);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']); // Kategorileri yeniden çek
            toast({
                title: "Kategori Silindi",
                description: "Kategori başarıyla silindi.",
                variant: "success",
            });
            setIsConfirmDialogOpen(false);
            setCategoryToDeleteId(null);
        },
        onError: (err) => {
            toast({
                title: "Hata",
                description: `Kategori silinirken bir sorun oluştu: ${err.response?.data?.message || err.message}`,
                variant: "destructive",
            });
            console.error("Kategori silme hatası:", err);
        },
    });

    const confirmDeleteCategory = () => {
        if (categoryToDeleteId) {
            deleteMutation.mutate(categoryToDeleteId);
        }
    };

    const onSubmit = async (data) => {
        if (currentCategory) {
            updateMutation.mutate({ id: currentCategory.id, data });
        } else {
            createMutation.mutate(data);
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
                <h1 className="text-4xl font-bold text-center mb-10">Kategori Yönetimi</h1>
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
                <p>Kategoriler yüklenirken hata: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">Kategori Yönetimi</h1>

            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAddCategoryClick}>
                            <PlusCircle className="mr-2 h-5 w-5" /> Yeni Kategori Ekle
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{currentCategory ? "Kategoriyi Düzenle" : "Yeni Kategori Oluştur"}</DialogTitle>
                            <DialogDescription>
                                {currentCategory ? "Seçili kategorinin bilgilerini güncelleyin." : "Yeni bir kategori oluşturmak için bilgileri doldurun."}
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
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting || createMutation.isLoading || updateMutation.isLoading}>
                                    {isSubmitting || createMutation.isLoading || updateMutation.isLoading ? "Kaydediliyor..." : "Kaydet"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Kategori ara..."
                        value={inputValue} // Input değeri anlık inputValue'dan alınır
                        onChange={(e) => {
                            setInputValue(e.target.value); // inputValue'ı anında güncelle
                        }}
                        className="max-w-sm"
                    />
                    <Select onValueChange={(value) => { setSortBy(value); setPage(1); }} value={sortBy}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sırala" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Adına Göre</SelectItem>
                            <SelectItem value="created_at">Oluşturulma Tarihine Göre</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(value) => { setSortOrder(value); setPage(1); }} value={sortOrder}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Yön" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="asc">Artan</SelectItem>
                            <SelectItem value="desc">Azalan</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={(value) => { setPerPage(Number(value)); setPage(1); }} value={String(perPage)}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Sayfa Boyutu" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {categories.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('name')}>
                                Adı {sortBy === 'name' && <ArrowUpDown className={`inline-block ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />}
                            </TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort('created_at')}>
                                Oluşturulma Tarihi {sortBy === 'created_at' && <ArrowUpDown className={`inline-block ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />}
                            </TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell className="font-medium">{category.id}</TableCell>
                                <TableCell>{category.name}</TableCell>
                                <TableCell>{category.slug}</TableCell>
                                <TableCell>{new Date(category.created_at).toLocaleDateString('tr-TR')}</TableCell>
                                <TableCell className="text-right flex space-x-2 justify-end">
                                    <Button variant="outline" size="sm" onClick={() => handleEditCategoryClick(category)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(category.id)}>
                                        <Trash2 className="h-4 w-4" />
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
