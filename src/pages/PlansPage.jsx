// src/pages/PlansPage.jsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllPlans } from '../api/plans';
import { useToastContext } from '../hooks/toast-utils';
import { useComparison } from '../hooks/useComparison'; // <-- Bu satır kritik! Doğru yolu kontrol edin.

// Shadcn UI bileşenleri
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Checkbox } from '../components/ui/checkbox';

const PlansPage = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { toast } = useToastContext();
    // useComparison hook'undan değerleri alıyoruz
    const { addPlanToCompare, removePlanFromCompare, isPlanInComparison, plansToCompare, MAX_COMPARISON_LIMIT } = useComparison();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await getAllPlans();
                setPlans(data);
            } catch (err) {
                setError(err.message || 'Planlar yüklenirken bir hata oluştu.');
                toast({
                    title: "Hata",
                    description: "Planlar yüklenirken bir sorun oluştu.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, [toast]);

    const handleCompareCheckboxChange = (plan, checked) => {
        if (checked) {
            addPlanToCompare(plan);
        } else {
            removePlanFromCompare(plan.id);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-10">Tüm Hosting Planları</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(9)].map((_, index) => (
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
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">Tüm Hosting Planları</h1>

            {/* Karşılaştırma Butonu ve Sayacı */}
            <div className="flex justify-end mb-6 space-x-4">
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Karşılaştırılacak Plan:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                        {plansToCompare.length} / {MAX_COMPARISON_LIMIT}
                    </span>
                </div>
                <Button
                    onClick={() => navigate('/compare')}
                    disabled={plansToCompare.length < 2}
                    className="px-6 py-2"
                >
                    Karşılaştır ({plansToCompare.length})
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.length > 0 ? (
                    plans.map((plan) => (
                        <Card key={plan.id} className="hover:shadow-xl transition-shadow duration-300 flex flex-col">
                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription>
                                    {plan.provider ? plan.provider.name : 'Bilinmeyen Sağlayıcı'} - {plan.category ? plan.category.name : 'Bilinmeyen Kategori'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                    {plan.currency} {plan.price} / ay
                                </p>
                                {plan.renewal_price && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                        Yenileme: {plan.currency} {plan.renewal_price}
                                    </p>
                                )}
                                {plan.discount_percentage && (
                                    <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                                        %{plan.discount_percentage} İndirim!
                                    </p>
                                )}
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    {plan.features_summary || 'Özellik özeti bulunmuyor.'} - {plan.renewal_price}
                                </p>
                            </CardContent>
                            <div className="p-6 pt-0 flex justify-between items-center">
                                <Button variant="link" asChild className="p-0">
                                    <Link to={`/plans/${plan.id}`}>Detayları Görüntüle</Link>
                                </Button>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`compare-${plan.id}`}
                                        checked={isPlanInComparison(plan.id)}
                                        onCheckedChange={(checked) => handleCompareCheckboxChange(plan, checked)}
                                        disabled={plansToCompare.length >= MAX_COMPARISON_LIMIT && !isPlanInComparison(plan.id)}
                                    />
                                    <label
                                        htmlFor={`compare-${plan.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Karşılaştır
                                    </label>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-600 dark:text-gray-400">
                        Henüz hiç plan bulunmamaktadır.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlansPage;
