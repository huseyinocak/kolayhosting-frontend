import React, { useEffect, useState } from 'react';
import {
    getAllFeatures,
    createFeature,
    updateFeature,
    deleteFeature,
} from '../../api/plans'; // Özellik API fonksiyonlarını içe aktar (plans.js içinde tanımlı varsayılıyor)
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select'; // Dropdown seçimleri için

const FeaturesAdmin = () => {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(null); // Düzenlenecek özellik

    // Form alanları
    const [featureName, setFeatureName] = useState('');
    const [featureUnit, setFeatureUnit] = useState('');
    const [featureType, setFeatureType] = useState(''); // Örneğin: 'numeric', 'boolean', 'text'
    const { toast } = useToastContext();

    // Özellikleri API'den çekme fonksiyonu
    const fetchFeatures = async () => {
        setLoading(true);
        try {
            const data = await getAllFeatures();
            setFeatures(data);
        } catch (err) {
            setError(err.message || 'Özellikler yüklenirken bir hata oluştu.');
            toast({
                title: 'Hata',
                description: 'Özellikler yüklenirken bir sorun oluştu.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeatures();
    }, []);

    // Yeni özellik ekleme veya mevcut özelliği düzenleme
    const handleSaveFeature = async (e) => {
        e.preventDefault();
        if (!featureName.trim() || !featureType.trim()) {
            toast({
                title: 'Uyarı',
                description: 'Özellik adı ve tipi boş bırakılamaz.',
                variant: 'warning',
            });
            return;
        }

        const payload = {
            name: featureName,
            unit: featureUnit,
            type: featureType,
        };

        try {
            if (currentFeature) {
                // Özelliği düzenle
                await updateFeature(currentFeature.id, payload);
                toast({
                    title: 'Başarılı',
                    description: 'Özellik başarıyla güncellendi.',
                });
            } else {
                // Yeni özellik oluştur
                await createFeature(payload);
                toast({
                    title: 'Başarılı',
                    description: 'Yeni özellik başarıyla oluşturuldu.',
                });
            }
            setIsDialogOpen(false); // Diyaloğu kapat
            resetForm(); // Formu sıfırla
            fetchFeatures(); // Özellikleri yeniden çek
        } catch (err) {
            toast({
                title: 'Hata',
                description: `Özellik kaydedilirken bir sorun oluştu: ${err.message || ''}`,
                variant: 'destructive',
            });
        }
    };

    // Özellik düzenleme diyaloğunu açma
    const handleEditClick = (feature) => {
        setCurrentFeature(feature);
        setFeatureName(feature.name);
        setFeatureUnit(feature.unit || '');
        setFeatureType(feature.type || '');
        setIsDialogOpen(true);
    };

    // Özellik silme
    const handleDeleteFeature = async (featureId) => {
        if (window.confirm('Bu özelliği silmek istediğinizden emin misiniz?')) {
            try {
                await deleteFeature(featureId);
                toast({
                    title: 'Başarılı',
                    description: 'Özellik başarıyla silindi.',
                });
                fetchFeatures(); // Özellikleri yeniden çek
            } catch (err) {
                toast({
                    title: 'Hata',
                    description: `Özellik silinirken bir sorun oluştu: ${err.message || ''}`,
                    variant: 'destructive',
                });
            }
        }
    };

    // Formu sıfırlama
    const resetForm = () => {
        setCurrentFeature(null);
        setFeatureName('');
        setFeatureUnit('');
        setFeatureType('');
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-10">Özellik Yönetimi</h1>
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
                <Button onClick={fetchFeatures} className="mt-4">
                    Tekrar Dene
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
                Özellik Yönetimi
            </h1>

            <div className="flex justify-end mb-6">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>Yeni Özellik Ekle</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{currentFeature ? 'Özelliği Düzenle' : 'Yeni Özellik Ekle'}</DialogTitle>
                            <DialogDescription>
                                {currentFeature
                                    ? 'Özellik bilgilerini güncelleyin.'
                                    : 'Yeni bir özellik oluşturmak için bilgileri girin.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSaveFeature} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Ad
                                </Label>
                                <Input
                                    id="name"
                                    value={featureName}
                                    onChange={(e) => setFeatureName(e.target.value)}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="unit" className="text-right">
                                    Birim
                                </Label>
                                <Input
                                    id="unit"
                                    value={featureUnit}
                                    onChange={(e) => setFeatureUnit(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Örn: GB, Adet, Mbps"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">
                                    Tip
                                </Label>
                                <Select onValueChange={setFeatureType} value={featureType} required>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Özellik Tipini Seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="numeric">Sayısal</SelectItem>
                                        <SelectItem value="boolean">Boolean (Evet/Hayır)</SelectItem>
                                        <SelectItem value="text">Metin</SelectItem>
                                        <SelectItem value="enum">Seçenekli</SelectItem> {/* Eğer enum tipleriniz varsa */}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Kaydet</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {features.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Ad</TableHead>
                            <TableHead>Birim</TableHead>
                            <TableHead>Tip</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {features.map((feature) => (
                            <TableRow key={feature.id}>
                                <TableCell className="font-medium">{feature.id}</TableCell>
                                <TableCell>{feature.name}</TableCell>
                                <TableCell>{feature.unit || '-'}</TableCell>
                                <TableCell>{feature.type}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(feature)}>
                                        Düzenle
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteFeature(feature.id)}>
                                        Sil
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-gray-600 dark:text-gray-400">
                    Henüz hiç özellik bulunmamaktadır.
                </div>
            )}
        </div>
    );
};

export default FeaturesAdmin;