import React, { useEffect, useState } from 'react';
import {
    getAllProviders,
    createProvider,
    updateProvider,
    deleteProvider,
} from '../../api/providers'; // Sağlayıcı API fonksiyonlarını içe aktar
import { useToastContext } from '../../hooks/toast-utils'; // Toast bildirimleri için

// Shadcn UI bileşenleri
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Skeleton } from '../../components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'; // Logo için Avatar

const ProvidersAdmin = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentProvider, setCurrentProvider] = useState(null); // Düzenlenecek sağlayıcı
    const [providerName, setProviderName] = useState('');
    const [providerLogoUrl, setProviderLogoUrl] = useState('');
    const [providerWebsiteUrl, setProviderWebsiteUrl] = useState('');
    const [providerDescription, setProviderDescription] = useState('');
    const [providerAverageRating, setProviderAverageRating] = useState(''); // Sayısal giriş
    const { toast } = useToastContext();

    // Sağlayıcıları API'den çekme fonksiyonu
    const fetchProviders = async () => {
        setLoading(true);
        try {
            const data = await getAllProviders();
            setProviders(data);
        } catch (err) {
            setError(err.message || 'Sağlayıcılar yüklenirken bir hata oluştu.');
            toast({
                title: 'Hata',
                description: 'Sağlayıcılar yüklenirken bir sorun oluştu.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    // Yeni sağlayıcı ekleme veya mevcut sağlayıcıyı düzenleme
    const handleSaveProvider = async (e) => {
        e.preventDefault();
        if (!providerName.trim() || !providerWebsiteUrl.trim()) {
            toast({
                title: 'Uyarı',
                description: 'Sağlayıcı adı ve web sitesi URL\'si boş bırakılamaz.',
                variant: 'warning',
            });
            return;
        }

        const payload = {
            name: providerName,
            logo_url: providerLogoUrl,
            website_url: providerWebsiteUrl,
            description: providerDescription,
            average_rating: providerAverageRating ? parseFloat(providerAverageRating) : null,
        };

        try {
            if (currentProvider) {
                // Sağlayıcıyı düzenle
                await updateProvider(currentProvider.id, payload);
                toast({
                    title: 'Başarılı',
                    description: 'Sağlayıcı başarıyla güncellendi.',
                });
            } else {
                // Yeni sağlayıcı oluştur
                await createProvider(payload);
                toast({
                    title: 'Başarılı',
                    description: 'Yeni sağlayıcı başarıyla oluşturuldu.',
                });
            }
            setIsDialogOpen(false); // Diyaloğu kapat
            resetForm(); // Formu sıfırla
            fetchProviders(); // Sağlayıcıları yeniden çek
        } catch (err) {
            toast({
                title: 'Hata',
                description: `Sağlayıcı kaydedilirken bir sorun oluştu: ${err.message || ''}`,
                variant: 'destructive',
            });
        }
    };

    // Sağlayıcı düzenleme diyaloğunu açma
    const handleEditClick = (provider) => {
        setCurrentProvider(provider);
        setProviderName(provider.name);
        setProviderLogoUrl(provider.logo_url || '');
        setProviderWebsiteUrl(provider.website_url || '');
        setProviderDescription(provider.description || '');
        setProviderAverageRating(provider.average_rating ? String(provider.average_rating) : '');
        setIsDialogOpen(true);
    };

    // Sağlayıcı silme
    const handleDeleteProvider = async (providerId) => {
        if (window.confirm('Bu sağlayıcıyı silmek istediğinizden emin misiniz?')) {
            try {
                await deleteProvider(providerId);
                toast({
                    title: 'Başarılı',
                    description: 'Sağlayıcı başarıyla silindi.',
                });
                fetchProviders(); // Sağlayıcıları yeniden çek
            } catch (err) {
                toast({
                    title: 'Hata',
                    description: `Sağlayıcı silinirken bir sorun oluştu: ${err.message || ''}`,
                    variant: 'destructive',
                });
            }
        }
    };

    // Formu sıfırlama
    const resetForm = () => {
        setCurrentProvider(null);
        setProviderName('');
        setProviderLogoUrl('');
        setProviderWebsiteUrl('');
        setProviderDescription('');
        setProviderAverageRating('');
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-10">Sağlayıcı Yönetimi</h1>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-500">
                <p>{error}</p>
                <Button onClick={fetchProviders} className="mt-4">
                    Tekrar Dene
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
                Sağlayıcı Yönetimi
            </h1>

            <div className="flex justify-end mb-6">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>Yeni Sağlayıcı Ekle</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{currentProvider ? 'Sağlayıcıyı Düzenle' : 'Yeni Sağlayıcı Ekle'}</DialogTitle>
                            <DialogDescription>
                                {currentProvider
                                    ? 'Sağlayıcı bilgilerini güncelleyin.'
                                    : 'Yeni bir sağlayıcı oluşturmak için bilgileri girin.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSaveProvider} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Ad
                                </Label>
                                <Input
                                    id="name"
                                    value={providerName}
                                    onChange={(e) => setProviderName(e.target.value)}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="logo_url" className="text-right">
                                    Logo URL
                                </Label>
                                <Input
                                    id="logo_url"
                                    value={providerLogoUrl}
                                    onChange={(e) => setProviderLogoUrl(e.target.value)}
                                    className="col-span-3"
                                    type="url"
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="website_url" className="text-right">
                                    Web Sitesi URL
                                </Label>
                                <Input
                                    id="website_url"
                                    value={providerWebsiteUrl}
                                    onChange={(e) => setProviderWebsiteUrl(e.target.value)}
                                    className="col-span-3"
                                    type="url"
                                    placeholder="https://www.example.com"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Açıklama
                                </Label>
                                <Textarea
                                    id="description"
                                    value={providerDescription}
                                    onChange={(e) => setProviderDescription(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="average_rating" className="text-right">
                                    Ort. Derecelendirme
                                </Label>
                                <Input
                                    id="average_rating"
                                    value={providerAverageRating}
                                    onChange={(e) => setProviderAverageRating(e.target.value)}
                                    className="col-span-3"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    placeholder="Örn: 4.5"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Kaydet</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {providers.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Logo</TableHead>
                            <TableHead>Ad</TableHead>
                            <TableHead>Web Sitesi</TableHead>
                            <TableHead>Ort. Derecelendirme</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {providers.map((provider) => (
                            <TableRow key={provider.id}>
                                <TableCell className="font-medium">{provider.id}</TableCell>
                                <TableCell>
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={provider.logo_url || `https://placehold.co/40x40/aabbcc/ffffff?text=${provider.name.charAt(0)}`} alt={`${provider.name} Logo`} />
                                        <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>{provider.name}</TableCell>
                                <TableCell>
                                    <a href={provider.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {provider.website_url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]}
                                    </a>
                                </TableCell>
                                <TableCell>{provider.average_rating || 'N/A'}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(provider)}>
                                        Düzenle
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteProvider(provider.id)}>
                                        Sil
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-gray-600 dark:text-gray-400">
                    Henüz hiç sağlayıcı bulunmamaktadır.
                </div>
            )}
        </div>
    );
};

export default ProvidersAdmin;