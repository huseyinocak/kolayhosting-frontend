import { getAllCategories } from "@/api/categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastContext } from "../hooks/toast-utils";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


export default function CategoriesPage() {
    const { toast } = useToastContext(); // useToastContext'ten toast'ı alıyoruz
    const [categories, setCategories] = useState([]); // Kategorileri tutmak için state
    const [loading, setLoading] = useState(true); // Yükleme durumu
    const [error, setError] = useState(null); // Hata durumu

    // Kategorileri yüklemek için bir fonksiyon
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getAllCategories(); // API'den kategorileri al
                setCategories(response); // Kategorileri state'e ata
            } catch (err) {
                console.error('Kategoriler yüklenirken hata:', err);
                setError('Kategoriler yüklenemedi. Lütfen daha sonra tekrar deneyin.');
                toast({
                    title: "Hata",
                    description: error,
                    variant: "destructive",
                });
            } finally {
                setLoading(false); // Yükleme tamamlandı
            }
        }
        fetchCategories(); // Kategorileri yükle
    }, [toast, error]); // Toast ve error değiştiğinde tekrar çalışır

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-10">Hosting Kategorileri</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, index) => ( // 6 adet iskelet kartı göster
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
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">Hosting Kategorileri</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.length > 0 ? (
                    categories.map((category) => (
                        <Card key={category.id} className="hover:shadow-xl transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle>{category.name}</CardTitle>
                                <CardDescription>{category.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    Bu kategori altında {category.plans_count || 0} adet plan bulunmaktadır.
                                </p>
                                <Button variant="link" asChild className="p-0">
                                    <Link to={`/categories/${category.slug || category.id}/plans`}>Planları Görüntüle</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-600 dark:text-gray-400">
                        Henüz hiç kategori bulunmamaktadır.
                    </div>
                )}
            </div>
        </div>
    );
}   