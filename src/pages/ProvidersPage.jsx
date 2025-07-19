// src/pages/ProvidersPage.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProviders } from '../api/providers'; // Import Provider API function
import { useToastContext } from '../hooks/toast-utils'; // Import useToastContext for toast notifications

// Shadcn UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton'; // For loading skeleton
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'; // For provider logos

const ProvidersPage = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { toast } = useToastContext();

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const data = await getAllProviders();
                setProviders(data);
            } catch (err) {
                setError(err.message || 'Providers could not be loaded.');
                toast({
                    title: "Error",
                    description: "There was a problem loading providers.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProviders();
    }, [toast]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-10">Hosting Providers</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, index) => ( // Show 6 skeleton cards
                        <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
                            <CardHeader className="flex flex-row items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="flex-1">
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
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
                <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">Hosting Sağlayıcıları</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {providers.length > 0 ? (
                    providers.map((provider) => (
                        <Card key={provider.id} className="hover:shadow-xl transition-shadow duration-300">
                            <CardHeader className="flex flex-row items-center space-x-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={provider.logo_url || `https://placehold.co/48x48/aabbcc/ffffff?text=${provider.name.charAt(0)}`} alt={`${provider.name} Logo`} />
                                    <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <CardTitle>{provider.name}</CardTitle>
                                    <CardDescription>Ortalama Derecelendirme: {provider.average_rating || 'N/A'}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    {provider.description || 'Açıklama bulunmuyor.'}
                                </p>
                                <div className="flex justify-between items-center">
                                    <Button variant="link" asChild className="p-0">
                                        <Link to={`/providers/${provider.id}`}>Detayları Görüntüle</Link>
                                    </Button>
                                    {provider.website_url && (
                                        <Button asChild>
                                            <a href={provider.website_url} target="_blank" rel="noopener noreferrer">
                                                Web Sitesine Git
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-600 dark:text-gray-400">
                        Henüz hiç sağlayıcı bulunmamaktadır.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProvidersPage;