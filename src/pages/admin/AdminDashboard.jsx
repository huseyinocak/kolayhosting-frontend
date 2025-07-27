import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; // Veri çekmek için useQuery
import { getDashboardStats } from '../../api/adminDashboard'; // Dashboard istatistikleri API'si
import { useToastContext } from '../../hooks/toast-utils'; // Toast bildirimleri için
import { useTranslation } from 'react-i18next'; // Çeviri için

// Shadcn UI bileşenleri
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Server, MessageCircle, LayoutDashboard, List, Package, Star, Tag, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const AdminDashboard = () => {
    const { toast } = useToastContext();
    const { t } = useTranslation();

    // Dashboard istatistiklerini çekmek için useQuery kullanıyoruz
    const { data: stats, isLoading, isError, error } = useQuery({
        queryKey: ['dashboardStats'], // Sorgu anahtarı
        queryFn: getDashboardStats, // Veri çekme fonksiyonu
        onError: (err) => {
            // Hata durumunda toast bildirimi göster
            console.error("Dashboard İstatistikleri Yükleme Hatası:", err);
            toast({
                title: t('error'),
                description: err.message || t('failed_to_load_dashboard_stats'),
                variant: "destructive",
            });
        },
    });

    const adminSections = [
        {
            title: t('user_management'),
            description: t('user_management_description'),
            icon: <Users className="h-6 w-6 text-blue-500" />,
            link: '/admin/users',
        },
        {
            title: t('category_management'),
            description: t('category_management_description'),
            icon: <List className="h-6 w-6 text-green-500" />,
            link: '/admin/categories',
        },
        {
            title: t('provider_management'),
            description: t('provider_management_description'),
            icon: <Package className="h-6 w-6 text-purple-500" />,
            link: '/admin/providers',
        },
        {
            title: t('plan_management'),
            description: t('plan_management_description'),
            icon: <LayoutDashboard className="h-6 w-6 text-red-500" />,
            link: '/admin/plans',
        },
        {
            title: t('feature_management'),
            description: t('feature_management_description'),
            icon: <Tag className="h-6 w-6 text-yellow-500" />,
            link: '/admin/features',
        },
        {
            title: t('review_management'),
            description: t('review_management_description'),
            icon: <Star className="h-6 w-6 text-orange-500" />,
            link: '/admin/reviews',
        },
        // Daha fazla bölüm eklenebilir
    ];
    // Yükleme durumu için iskelet görünümü
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center mb-10"> {/* Başlık için esnek kapsayıcı */}
                    <Skeleton className="h-10 w-10 rounded-full mr-4" /> {/* Logo için iskelet */}
                    <Skeleton className="h-10 w-64" /> {/* Başlık metni için iskelet */}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="flex flex-col items-center justify-center p-6">
                            <Skeleton className="h-12 w-12 rounded-full mb-4" />
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </Card>
                    ))}
                </div>
                <Skeleton className="w-full h-[300px] rounded-md mt-10" /> {/* Hızlı bağlantılar için placeholder */}
            </div>
        );
    }
    // Hata durumu için mesaj
    if (isError) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-500 dark:text-red-400">
                <div className="flex items-center justify-center mb-10"> {/* Başlık için esnek kapsayıcı */}
                    <LayoutDashboard className="h-10 w-10 text-gray-900 dark:text-white mr-4" /> {/* Logo */}
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('admin_dashboard_title')}</h1>
                </div>
                <p>{t('error_loading_dashboard_stats')}: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">{t('admin_dashboard_title')}</h1> */}
            <div className="flex items-center justify-center mb-10">
                <LayoutDashboard className="h-10 w-10 text-gray-900 dark:text-white mr-4" /> {/* Logo */}
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('admin_dashboard_title')}</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                {/* Toplam Kullanıcı Sayısı Kartı */}
                <Card className="flex flex-col items-center justify-center p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                    <Users className="h-12 w-12 text-blue-500 mb-4" />
                    <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats?.total_users || 0}
                    </CardTitle>
                    <CardContent className="text-gray-600 dark:text-gray-400 p-0 mt-2">
                        {t('total_users')}
                    </CardContent>
                </Card>

                {/* Toplam Sağlayıcı Sayısı Kartı */}
                <Card className="flex flex-col items-center justify-center p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                    <Server className="h-12 w-12 text-green-500 mb-4" />
                    <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats?.total_providers || 0}
                    </CardTitle>
                    <CardContent className="text-gray-600 dark:text-gray-400 p-0 mt-2">
                        {t('total_providers')}
                    </CardContent>
                </Card>

                {/* Toplam Plan Sayısı Kartı */}
                <Card className="flex flex-col items-center justify-center p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                    <Package className="h-12 w-12 text-purple-500 mb-4" />
                    <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats?.total_plans || 0}
                    </CardTitle>
                    <CardContent className="text-gray-600 dark:text-gray-400 p-0 mt-2">
                        {t('total_plans')}
                    </CardContent>
                </Card>

                {/* Onay Bekleyen Yorum Sayısı Kartı */}
                <Card className="flex flex-col items-center justify-center p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                    <MessageCircle className="h-12 w-12 text-orange-500 mb-4" />
                    <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats?.pending_reviews || 0}
                    </CardTitle>
                    <CardContent className="text-gray-600 dark:text-gray-400 p-0 mt-2">
                        {t('pending_reviews')}
                    </CardContent>
                </Card>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('quick_links')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adminSections.map((section, index) => (
                        <Link to={section.link} key={index} className="block">
                            <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col justify-between">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xl font-medium">
                                        {section.title}
                                    </CardTitle>
                                    {section.icon}
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>
                                        {section.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;