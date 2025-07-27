// src/pages/ComparisonPage.jsx

import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Link'i de ekledik
import { useToastContext } from '../hooks/toast-utils'; // Toast bildirimleri için

// Shadcn UI bileşenleri
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge'; // Özellik tipleri için
import { useComparison } from '@/hooks/useComparison';

const ComparisonPage = () => {
    const { plansToCompare, removePlanFromCompare, clearComparison } = useComparison();
    const { toast } = useToastContext(); // toast fonksiyonunu kullanmak için
    const navigate = useNavigate();

    // Karşılaştırma için özelliklerin listesini oluşturacağız
    // Tüm seçili planlardaki benzersiz özellikleri topluyoruz
    const allFeatures = React.useMemo(() => {
        const featuresMap = new Map();
        plansToCompare.forEach(plan => {
            // Planın features ilişkisi varsa
            if (plan.features && Array.isArray(plan.features)) {
                plan.features.forEach(pf => {
                    if (pf.feature) {
                        featuresMap.set(pf.feature.id, pf.feature);
                    }
                });
            }
        });
        // Özellikleri isme göre sıralayabiliriz
        return Array.from(featuresMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [plansToCompare]);

    const handleRemovePlan = (planId, planName) => {
        removePlanFromCompare(planId);
        toast({
            title: "Plan Kaldırıldı",
            description: `${planName} karşılaştırma listesinden kaldırıldı.`,
            variant: "info", // Bilgilendirme bildirimi
        });
    };

    const handleClearComparison = () => {
        clearComparison();
        toast({
            title: "Liste Temizlendi",
            description: "Karşılaştırma listesi başarıyla temizlendi.",
        });
    };

    if (plansToCompare.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Plan Karşılaştırma</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Karşılaştırılacak plan seçmediniz. Lütfen <Link to="/plans" className="text-blue-600 hover:underline">planlar sayfasına</Link> geri dönerek karşılaştırmak istediğiniz planları seçin.
                </p>
                <Button onClick={() => navigate('/plans')}>Planlara Göz At</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">Plan Karşılaştırma</h1>

            <div className="flex justify-end mb-6 space-x-4">
                <Button variant="outline" onClick={handleClearComparison} disabled={plansToCompare.length === 0}>
                    Tümünü Temizle
                </Button>
                <Button onClick={() => navigate('/plans')}>
                    Daha Fazla Plan Ekle
                </Button>
            </div>

            <Card className="overflow-x-auto">
                <CardHeader>
                    <CardTitle>Seçili Planlar</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px] sticky left-0 bg-white dark:bg-gray-800 z-10">Özellikler</TableHead>
                                {plansToCompare.map(plan => (
                                    <TableHead key={plan.id} className="text-center relative">
                                        <div className="flex flex-col items-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute top-0 right-0 p-1 h-auto"
                                                onClick={() => handleRemovePlan(plan.id, plan.name)} // Toast için plan adını da gönderiyoruz
                                            >
                                                &times; {/* Kapatma ikonu */}
                                            </Button>
                                            <Link to={`/plans/${plan.id}`} className="font-semibold text-blue-600 hover:underline mt-2">
                                                {plan.name}
                                            </Link>
                                            <p className="text-sm text-gray-500">{plan.provider?.name}</p>
                                            <p className="text-lg font-bold mt-1">{plan.currency} {plan.price}</p>
                                            {/* Ortaklık Bağlantısı Butonu */}
                                            {
                                                plan.affiliate_url ? (
                                                    <>
                                                        <a
                                                            href={plan.affiliate_url} // Affiliate URL varsa onu kullan, yoksa normal site URL'si
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-full mt-4"
                                                            onClick={() => {
                                                                if (window.gtag) {
                                                                    window.gtag('event', 'affiliate_click', {
                                                                        plan_id: plan.id,
                                                                        plan_name: plan.name,
                                                                        provider_name: plan.provider?.name,
                                                                        affiliate_url: plan.affiliate_url,
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <Button className="w-full md:w-auto px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:scale-105">
                                                                Şimdi Satın Al
                                                            </Button>
                                                        </a>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 my-2">
                                                            Bu plan için ortaklık bağlantısı bulunmaktadır. KolayHosting üzerinden satın alarak destek olabilirsiniz.
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <a
                                                            href={plan.website_url} // Affiliate URL varsa onu kullan, yoksa normal site URL'si
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-full mt-4"
                                                            onClick={() => {
                                                                if (window.gtag) {
                                                                    window.gtag('event', 'affiliate_click', {
                                                                        plan_id: plan.id,
                                                                        plan_name: plan.name,
                                                                        provider_name: plan.provider?.name,
                                                                        website_url: plan.website_url,
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <Button className="w-full md:w-auto px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:scale-105">
                                                                Web Sitesine Git
                                                            </Button>
                                                        </a>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 my-2">
                                                            Bu plan için ortaklık bağlantısı bulunmamaktadır.
                                                        </p>
                                                    </>
                                                )
                                            }
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Temel Plan Bilgileri */}
                            <TableRow>
                                <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-800">Fiyat</TableCell>
                                {plansToCompare.map(plan => (
                                    <TableCell key={plan.id} className="text-center">
                                        {plan.currency} {plan.price} / ay
                                        {plan.renewal_price && (
                                            <span className="block text-xs text-gray-500 line-through">
                                                Yenileme: {plan.currency} {plan.renewal_price}
                                            </span>
                                        )}
                                        {plan.discount_percentage && (
                                            <Badge variant="secondary" className="mt-1">%{plan.discount_percentage} İndirim</Badge>
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-800">Sağlayıcı</TableCell>
                                {plansToCompare.map(plan => (
                                    <TableCell key={plan.id} className="text-center">
                                        {plan.provider?.name || '-'}
                                    </TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-800">Kategori</TableCell>
                                {plansToCompare.map(plan => (
                                    <TableCell key={plan.id} className="text-center">
                                        {plan.category?.name || '-'}
                                    </TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-800">Özet</TableCell>
                                {plansToCompare.map(plan => (
                                    <TableCell key={plan.id} className="text-center text-sm">
                                        {plan.features_summary || '-'}
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Dinamik Özellikler */}
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableCell colSpan={plansToCompare.length + 1} className="font-bold text-lg text-blue-600 dark:text-blue-400">Detaylı Özellikler</TableCell>
                            </TableRow>
                            {allFeatures.map(feature => (
                                <TableRow key={feature.id}>
                                    <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-800">
                                        {feature.name} {feature.unit ? `(${feature.unit})` : ''}
                                    </TableCell>
                                    {plansToCompare.map(plan => {
                                        const planFeature = plan.features?.find(pf => pf.feature_id === feature.id);
                                        return (
                                            <TableCell key={`${plan.id}-${feature.id}`} className="text-center">
                                                {planFeature ? planFeature.value : '-'}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default ComparisonPage;
