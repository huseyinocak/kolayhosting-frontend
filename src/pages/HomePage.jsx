import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";


export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <section className="text-center mb-16 max-w-4xl mx-auto">
                <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                    En İyi Hosting Planlarını Kolayca Karşılaştırın
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                    İhtiyaçlarınıza en uygun hosting sağlayıcısını ve planını bulmak hiç bu kadar kolay olmamıştı.
                    Binlerce seçeneği karşılaştırın, kullanıcı yorumlarını okuyun ve bilinçli kararlar verin.
                </p>
                <div className="flex justify-center space-x-4">
                    <Button size="lg" className="px-8 py-3 text-lg" asChild>
                        <Link to="/categories">Kategorilere Göz At</Link>
                    </Button>
                    <Button variant="outline" size="lg" className="px-8 py-3 text-lg" asChild>
                        <Link to="/providers">Sağlayıcılara Göz At</Link>
                    </Button>
                </div>
            </section>

            {/* Featured Categories/Providers Section (Placeholder) */}
            <section className="w-full max-w-6xl mb-16">
                <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
                    Öne Çıkan Kategoriler
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Örnek Kategori Kartı */}
                    <Card className="hover:shadow-xl transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle>Web Hosting</CardTitle>
                            <CardDescription>Web siteniz için en uygun hosting çözümlerini bulun.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                Paylaşımlı, VPS, Dedicated sunucu seçenekleri ve daha fazlası.
                            </p>
                            <Button variant="link" asChild className="p-0">
                                <Link to="/categories/web-hosting">Daha Fazla Bilgi</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-xl transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle>Cloud Hosting</CardTitle>
                            <CardDescription>Esnek ve ölçeklenebilir bulut çözümleri.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                Yüksek performans ve güvenilirlik arayanlar için ideal.
                            </p>
                            <Button variant="link" asChild className="p-0">
                                <Link to="/categories/cloud-hosting">Daha Fazla Bilgi</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-xl transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle>WordPress Hosting</CardTitle>
                            <CardDescription>WordPress siteleri için optimize edilmiş hosting.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                Kolay kurulum, otomatik güncellemeler ve uzman destek.
                            </p>
                            <Button variant="link" asChild className="p-0">
                                <Link to="/categories/wordpress-hosting">Daha Fazla Bilgi</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
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