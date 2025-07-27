import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../api/categories'; // Kategorileri çekmek için
import { useToastContext } from '../hooks/toast-utils'; // Toast bildirimleri için
import { useQuery } from '@tanstack/react-query'; // React Query useQuery hook'unu içe aktar

// Shadcn UI bileşenleri
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Input } from '../components/ui/input'; // Arama çubuğu için
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select'; // Dropdown seçimleri için
import AnimatedListItem from '@/components/AnimatedListItem';

const CategoriesPage = () => {
    const { toast } = useToastContext();

    // Filtreleme ve Sıralama State'leri
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name_asc'); // 'name_asc', 'name_desc'

    // Sayfalama State'leri
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(9); // Her sayfada 9 kategori göster - setItemsPerPage kaldırıldı

    // Debounce'lu arama terimi için state
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Arama terimini debounce etmek için useEffect
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms gecikme

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    // Sıralama parametrelerini ayır
    const sortParams = useMemo(() => {
        const [sort_by, sort_order] = sortBy.split('_');
        return { sort_by, sort_order };
    }, [sortBy]);

    // React Query ile kategorileri çek
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['categories', debouncedSearchTerm, sortParams, currentPage, itemsPerPage],
        queryFn: () => getAllCategories({
            name: debouncedSearchTerm,
            sort_by: sortParams.sort_by,
            sort_order: sortParams.sort_order,
            page: currentPage,
            per_page: itemsPerPage,
        }),
        keepPreviousData: true, // Yeni veri yüklenirken eski veriyi göster
        staleTime: 5 * 60 * 1000, // 5 dakika boyunca veriyi "stale" olarak işaretleme
    });

    // API'den gelen kategoriler ve sayfalama meta bilgileri
    const categories = data?.data || [];
    const totalPages = data?.meta?.last_page || 1;
    const totalCategories = data?.meta?.total || 0;

    useEffect(() => {
        if (isError) {
            toast({
                title: "Hata",
                description: error.message || "Kategoriler yüklenirken bir sorun oluştu.",
                variant: "destructive",
            });
        }
    }, [isError, error, toast]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Arama yapıldığında sayfayı sıfırla
    };

    const handleSortChange = (value) => {
        setSortBy(value);
        setCurrentPage(1); // Sıralama değiştiğinde sayfayı sıfırla
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">Kategoriler Yükleniyor...</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(itemsPerPage)].map((_, index) => (
                        <Card key={index} className="w-full">
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">Tüm Hosting Kategorileri</h1>

            {/* Filtreleme ve Sıralama Kontrolleri */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-center">
                <Input
                    type="text"
                    placeholder="Kategori ara..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="max-w-sm md:max-w-xs"
                />
                <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sırala" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name_asc">İsme Göre (A-Z)</SelectItem>
                        <SelectItem value="name_desc">İsme Göre (Z-A)</SelectItem>
                        <SelectItem value="created_at_desc">En Yeni</SelectItem>
                        <SelectItem value="created_at_asc">En Eski</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Kategori Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.length > 0 ? (
                    categories.map((category,index) => (
                        <AnimatedListItem key={category.id} delay={index * 100}>
                            <Card key={category.id} className="hover:shadow-xl transition-shadow duration-300">
                                <CardHeader>
                                    <CardTitle>{category.name}</CardTitle>
                                    <CardDescription>
                                        {category.description || 'Açıklama bulunmamaktadır.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Mevcut Plan Sayısı: {category.plans_count || 0}
                                    </p>
                                    <Button asChild className="w-full">
                                        <Link to={`/categories/${category.id}/plans/`}>Planları Görüntüle</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </AnimatedListItem>

                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-600 dark:text-gray-400">
                        Filtreleme kriterlerine uygun kategori bulunmamaktadır.
                    </div>
                )}
            </div>

            {/* Sayfalama Kontrolleri */}
            {totalCategories > 0 && ( // Sadece kategori varsa sayfalama göster
                <div className="flex justify-center items-center space-x-4 mt-8">
                    <Button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1 || isLoading}
                        variant="outline"
                    >
                        Önceki
                    </Button>
                    <span className="text-lg font-semibold">
                        Sayfa {currentPage} / {totalPages}
                    </span>
                    <Button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages || isLoading}
                        variant="outline"
                    >
                        Sonraki
                    </Button>
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;
