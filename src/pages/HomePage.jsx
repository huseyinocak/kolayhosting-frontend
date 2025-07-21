import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { getAllProviders } from '../api/providers'; // API function to fetch providers
import { Skeleton } from '@/components/ui/skeleton'; // For loading skeleton
import { Badge } from '@/components/ui/badge'; // For rating Badge
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // For provider logos
import { useToastContext } from '../hooks/toast-utils'; // For toast notifications
import { CheckCircle2, Star } from 'lucide-react'; // Yeni ikonlar için

export default function HomePage() {
    const [topProviders, setTopProviders] = useState([]);
    const [loadingProviders, setLoadingProviders] = useState(true);
    const [errorProviders, setErrorProviders] = useState(null);
    const { toast } = useToastContext();

    // Function to fetch top providers
    const fetchTopProviders = async () => {
        setLoadingProviders(true);
        setErrorProviders(null); // Reset error on new attempt
        try {
            // API'den ortalama derecelendirmeye göre azalan sırada ilk 10 sağlayıcıyı çek
            const response = await getAllProviders({
                sort_by: 'average_rating',
                sort_order: 'desc',
                per_page: 10 // Sadece ilk 10'u çek
            });
            // API'den gelen verinin 'data' özelliğini kullanıyoruz
            setTopProviders(response.data || []);
        } catch (err) {
            setErrorProviders(err.message || 'En iyi sağlayıcılar yüklenirken bir hata oluştu.');
            toast({
                title: "Hata",
                description: "En iyi sağlayıcılar yüklenirken bir sorun oluştu.",
                variant: "destructive",
            });
        } finally {
            setLoadingProviders(false);
        }
    };

    useEffect(() => {
        fetchTopProviders();
    }, []); // Component yüklendiğinde bir kez çalıştır

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4">
            {/* Hero Section */}
            <section className="text-center mb-16 max-w-4xl">
                <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                    En İyi Hosting Planlarını Karşılaştırın
                </h1>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                    İhtiyaçlarınıza en uygun hosting çözümünü bulmak için binlerce plan ve sağlayıcıyı kolayca karşılaştırın.
                </p>
                <div className="flex justify-center space-x-4">
                    <Button size="lg" asChild className="transition-all duration-300 hover:scale-105">
                        <Link to="/plans">Planları Keşfet</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild className="transition-all duration-300 hover:scale-105">
                        <Link to="/compare">Karşılaştırmaya Başla</Link>
                    </Button>
                </div>
            </section>

            {/* Top Providers Section */}
            <section className="w-full max-w-6xl mb-16">
                <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
                    En Popüler Hosting Sağlayıcıları
                </h2>
                {loadingProviders ? (
                    <div className="flex flex-col gap-6"> {/* Her satırda bir kart için flex-col */}
                        {[...Array(4)].map((_, index) => (
                            <Card key={index} className="flex items-center p-6 w-full"> {/* Geniş kartlar için w-full */}
                                <Skeleton className="w-32 h-32 rounded-full mr-6" /> {/* Daha büyük logo alanı */}
                                <div className="flex-1">
                                    <Skeleton className="h-8 w-1/2 mb-2" />
                                    <Skeleton className="h-5 w-1/3 mb-4" />
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                                <Skeleton className="h-12 w-32 ml-6" /> {/* Buton alanı */}
                            </Card>
                        ))}
                    </div>
                ) : errorProviders ? (
                    <div className="text-center text-red-500 text-lg">
                        Sağlayıcılar yüklenirken bir hata oluştu: {errorProviders}
                    </div>
                ) : topProviders.length > 0 ? (
                    <div className="flex flex-col gap-6"> {/* Her satırda bir kart için flex-col */}
                        {topProviders.map((provider, index) => (
                            <Card key={provider.id} className="flex flex-col md:flex-row items-center p-6 w-full hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                                {/* Sıra Numarası */}
                                <div className="hidden md:flex items-center justify-center text-3xl font-bold text-gray-500 dark:text-gray-400 mr-6 mb-4 md:mb-0 w-12 h-12 flex-shrink-0">
                                    {index + 1}
                                </div>

                                {/* Logo ve Derecelendirme */}
                                <div className="flex flex-col items-center md:items-start mr-6 mb-4 md:mb-0 flex-shrink-0">
                                    <Avatar className="w-32 h-32 mb-2"> {/* Logo boyutu büyütüldü */}
                                        <AvatarImage
                                            src={provider.logo_url || `https://placehold.co/128x128/e2e8f0/000000?text=${provider.name.charAt(0)}`} // Placeholder boyutu güncellendi
                                            alt={provider.name}
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/128x128/e2e8f0/000000?text=${provider.name.charAt(0)}`; }} // Hata durumunda placeholder boyutu güncellendi
                                        />
                                        <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex items-center mt-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-5 w-5 ${i < Math.round(parseFloat(provider.average_rating || 0)) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                fill={i < Math.round(parseFloat(provider.average_rating || 0)) ? 'currentColor' : 'none'}
                                            />
                                        ))}
                                        <span className="ml-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                            {
                                                !isNaN(parseFloat(provider.average_rating))
                                                    ? parseFloat(provider.average_rating).toFixed(1)
                                                    : '0.0'
                                            }
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {provider.review_count || 0} yorum
                                    </p>
                                </div>

                                {/* Sağlayıcı Bilgileri */}
                                <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
                                    <CardTitle className="text-2xl mb-2">{provider.name}</CardTitle>
                                    <CardDescription className="text-base text-gray-700 dark:text-gray-300 mb-4">
                                        {provider.summary || provider.description || 'Bu sağlayıcı için kısa bir açıklama bulunmamaktadır.'}
                                    </CardDescription>
                                    {/* Ek özellikler (örnek) */}
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                        <li className="flex items-center justify-center md:justify-start">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                            Ücretsiz alan adı, e-posta ve SSL dahildir.
                                        </li>
                                        <li className="flex items-center justify-center md:justify-start">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                            7/24 Müşteri Desteği
                                        </li>
                                        <li className="flex items-center justify-center md:justify-start">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                            Ek indirimler mevcut.
                                        </li>
                                    </ul>
                                </div>

                                {/* Buton */}
                                <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                                    <Button size="lg" asChild className="w-full md:w-auto px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                                        <Link to={`/providers/${provider.id}`}>Siteyi Ziyaret Et</Link>
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-600 dark:text-gray-400">
                        Henüz hiç sağlayıcı bulunmamaktadır.
                    </div>
                )}
            </section>

            {/* How It Works Section (Placeholder) */}
            <section className="w-full max-w-6xl">
                <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
                    Nasıl Çalışır?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <Card className="p-6">
                        <CardTitle className="mb-4">1. Araştırın</CardTitle>
                        <CardDescription>
                            İhtiyaçlarınıza göre hosting kategorilerini ve sağlayıcıları keşfedin.
                        </CardDescription>
                    </Card>
                    <Card className="p-6">
                        <CardTitle className="mb-4">2. Karşılaştırın</CardTitle>
                        <CardDescription>
                            Farklı planların özelliklerini, fiyatlarını ve yorumlarını karşılaştırın.
                        </CardDescription>
                    </Card>
                    <Card className="p-6">
                        <CardTitle className="mb-4">3. Seçiminizi Yapın</CardTitle>
                        <CardDescription>
                            En iyi kararı verin ve ideal hosting planınızı seçin.
                        </CardDescription>
                    </Card>
                </div>
            </section>
        </div>
    );
}
