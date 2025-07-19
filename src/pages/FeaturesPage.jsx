// src/pages/FeaturesPage.jsx

import React, { useEffect, useState } from 'react';
import { getAllFeatures } from '../api/features'; // Özellik API fonksiyonunu içe aktar
import { useToastContext } from '../hooks/toast-utils'; // Toast bildirimleri için

// Shadcn UI bileşenleri
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';

const FeaturesPage = () => {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { toast } = useToastContext();

    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const data = await getAllFeatures();
                setFeatures(data);
            } catch (err) {
                setError(err.message || 'Özellikler yüklenirken bir hata oluştu.');
                toast({
                    title: "Hata",
                    description: "Özellikler yüklenirken bir sorun oluştu.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchFeatures();
    }, [toast]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-10">Hosting Özellikleri</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(9)].map((_, index) => ( // 9 adet iskelet kartı göster
                        <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-16 w-full mb-4" />
                                <Skeleton className="h-10 w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-500">
                <p>{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">Tekrar Dene</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">Tüm Hosting Özellikleri</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.length > 0 ? (
                    features.map((feature) => (
                        <Card key={feature.id} className="hover:shadow-xl transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle>{feature.name}</CardTitle>
                                <CardDescription>
                                    <Badge variant="secondary">{feature.type || 'Diğer'}</Badge>
                                    {feature.unit && <span className="ml-2 text-gray-500">Birim: {feature.unit}</span>}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {feature.description || 'Bu özellik için açıklama bulunmamaktadır.'}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-600 dark:text-gray-400">
                        Henüz hiç özellik bulunmamaktadır.
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeaturesPage;
