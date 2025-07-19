import React from 'react';
import { Link } from 'react-router-dom';

// Shadcn UI bileşenleri
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const AdminDashboard = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">Admin Paneli</h1>

            <p className="text-center text-lg text-gray-700 dark:text-gray-300 mb-8">
                Yönetim paneline hoş geldiniz. Lütfen yönetmek istediğiniz bölümü seçin.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle>Kategoriler</CardTitle>
                        <CardDescription>Hosting kategorilerini yönetin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link to="/admin/categories">Kategorileri Yönet</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle>Sağlayıcılar</CardTitle>
                        <CardDescription>Hosting sağlayıcılarını yönetin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link to="/admin/providers">Sağlayıcıları Yönet</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle>Planlar</CardTitle>
                        <CardDescription>Hosting planlarını yönetin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link to="/admin/plans">Planları Yönet</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle>Özellikler</CardTitle>
                        <CardDescription>Plan özelliklerini yönetin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link to="/admin/features">Özellikleri Yönet</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle>Yorumlar</CardTitle>
                        <CardDescription>Kullanıcı yorumlarını yönetin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link to="/admin/reviews">Yorumları Yönet</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;