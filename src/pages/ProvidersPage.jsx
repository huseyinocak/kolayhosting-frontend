import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllProviders } from '../api/providers'; // Sağlayıcıları çekmek için
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Sağlayıcı logoları için Avatar
import { Badge } from '@/components/ui/badge'; // Derecelendirme için Badge

const ProvidersPage = () => {
    const { toast } = useToastContext();

    // Filtreleme ve Sıralama State'leri
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name_asc'); // 'name_asc', 'name_desc', 'rating_desc', 'created_at_desc'

    // Sayfalama State'leri
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(9); // Her sayfada 9 sağlayıcı göster

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

    // React Query ile sağlayıcıları çek
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['providers', debouncedSearchTerm, sortParams, currentPage, itemsPerPage],
        queryFn: () => getAllProviders({
            name: debouncedSearchTerm,
            sort_by: sortParams.sort_by,
            sort_order: sortParams.sort_order,
            page: currentPage,
            per_page: itemsPerPage,
        }),
        keepPreviousData: true, // Yeni veri yüklenirken eski veriyi göster
        staleTime: 5 * 60 * 1000, // 5 dakika boyunca veriyi "stale" olarak işaretleme
    });

    // API'den gelen sağlayıcılar ve sayfalama meta bilgileri
    const providers = data?.data || [];
    const totalPages = data?.meta?.last_page || 1;
    const totalProviders = data?.meta?.total || 0;

    useEffect(() => {
        if (isError) {
            toast({
                title: "Hata",
                description: error.message || "Sağlayıcılar yüklenirken bir sorun oluştu.",
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
                <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">Sağlayıcılar Yükleniyor...</h1>
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
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">Tüm Hosting Sağlayıcıları</h1>

            {/* Filtreleme ve Sıralama Kontrolleri */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-center">
                <Input
                    type="text"
                    placeholder="Sağlayıcı ara..."
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
                        <SelectItem value="average_rating_desc">Derecelendirmeye Göre (Yüksekten)</SelectItem>
                        <SelectItem value="average_rating_asc">Derecelendirmeye Göre (Düşükten)</SelectItem>
                        <SelectItem value="created_at_desc">En Yeni</SelectItem>
                        <SelectItem value="created_at_asc">En Eski</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Sağlayıcı Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {providers.length > 0 ? (
                    providers.map((provider) => (
                        <Card key={provider.id} className="hover:shadow-xl transition-shadow duration-300">
                            <CardHeader className="flex flex-row items-center space-x-4 p-6">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage
                                        src={provider.logo_url || `https://placehold.co/80x80/e2e8f0/000000?text=${provider.name.charAt(0)}`}
                                        alt={provider.name}
                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/e2e8f0/000000?text=${provider.name.charAt(0)}`; }}
                                    />
                                    <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <CardTitle className="text-xl">{provider.name}</CardTitle>
                                    <CardDescription className="flex items-center mt-1">
                                        <Badge variant="secondary" className="mr-2">
                                            Ort. Derecelendirme: {
                                                // average_rating'i sayıya dönüştür ve geçerli bir sayı ise toFixed kullan
                                                // Aksi takdirde '0.0' göster
                                                !isNaN(parseFloat(provider.average_rating))
                                                    ? parseFloat(provider.average_rating).toFixed(1)
                                                    : '0.0'
                                            } / 5
                                        </Badge>
                                        {/* Yıldız ikonları eklenebilir */}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                    {provider.description || 'Bu sağlayıcı için açıklama bulunmamaktadır.'}
                                </p>
                                {provider.website_url && (
                                    <a
                                        href={provider.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Web Sitesini Ziyaret Et
                                    </a>
                                )}
                                <Button asChild className="w-full">
                                    <Link to={`/providers/${provider.id}`}>Detayları Görüntüle</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-600 dark:text-gray-400">
                        Filtreleme kriterlerine uygun sağlayıcı bulunmamaktadır.
                    </div>
                )}
            </div>

            {/* Sayfalama Kontrolleri */}
            {totalProviders > 0 && (
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

export default ProvidersPage;
