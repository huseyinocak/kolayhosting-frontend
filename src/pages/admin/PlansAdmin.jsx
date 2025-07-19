import React, { useEffect, useState } from 'react';
import {
    getAllPlans,
    createPlan,
    updatePlan,
    deletePlan,
} from '../../api/plans'; // Plan API fonksiyonlarını içe aktar
import { getAllCategories } from '../../api/categories'; // Kategorileri çekmek için
import { getAllProviders } from '../../api/providers'; // Sağlayıcıları çekmek için
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

const PlansAdmin = () => {
    const [plans, setPlans] = useState([]);
    const [categories, setCategories] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null); // Düzenlenecek plan

    // Form alanları
    const [planName, setPlanName] = useState('');
    const [planPrice, setPlanPrice] = useState('');
    const [planCurrency, setPlanCurrency] = useState('USD'); // Varsayılan değer
    const [planRenewalPrice, setPlanRenewalPrice] = useState('');
    const [planDiscountPercentage, setPlanDiscountPercentage] = useState('');
    const [planFeaturesSummary, setPlanFeaturesSummary] = useState('');
    const [planLink, setPlanLink] = useState('');
    const [planCategoryId, setPlanCategoryId] = useState('');
    const [planProviderId, setPlanProviderId] = useState('');

    const { toast } = useToastContext();

    // Planları, kategorileri ve sağlayıcıları API'den çekme fonksiyonu
    const fetchData = async () => {
        setLoading(true);
        try {
            const [plansData, categoriesData, providersData] = await Promise.all([
                getAllPlans(),
                getAllCategories(),
                getAllProviders(),
            ]);
            setPlans(plansData);
            setCategories(categoriesData);
            setProviders(providersData);
        } catch (err) {
            setError(err.message || 'Veriler yüklenirken bir hata oluştu.');
            toast({
                title: 'Hata',
                description: 'Veriler yüklenirken bir sorun oluştu.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Yeni plan ekleme veya mevcut planı düzenleme
    const handleSavePlan = async (e) => {
        e.preventDefault();
        if (!planName.trim() || !planPrice || !planCategoryId || !planProviderId) {
            toast({
                title: 'Uyarı',
                description: 'Plan adı, fiyatı, kategori ve sağlayıcı boş bırakılamaz.',
                variant: 'warning',
            });
            return;
        }

        const payload = {
            name: planName,
            price: parseFloat(planPrice),
            currency: planCurrency,
            renewal_price: planRenewalPrice ? parseFloat(planRenewalPrice) : null,
            discount_percentage: planDiscountPercentage ? parseFloat(planDiscountPercentage) : null,
            features_summary: planFeaturesSummary,
            link: planLink,
            category_id: parseInt(planCategoryId),
            provider_id: parseInt(planProviderId),
        };

        try {
            if (currentPlan) {
                // Planı düzenle
                await updatePlan(currentPlan.id, payload);
                toast({
                    title: 'Başarılı',
                    description: 'Plan başarıyla güncellendi.',
                });
            } else {
                // Yeni plan oluştur
                await createPlan(payload);
                toast({
                    title: 'Başarılı',
                    description: 'Yeni plan başarıyla oluşturuldu.',
                });
            }
            setIsDialogOpen(false); // Diyaloğu kapat
            resetForm(); // Formu sıfırla
            fetchData(); // Planları yeniden çek
        } catch (err) {
            toast({
                title: 'Hata',
                description: `Plan kaydedilirken bir sorun oluştu: ${err.message || ''}`,
                variant: 'destructive',
            });
        }
    };

    // Plan düzenleme diyaloğunu açma
    const handleEditClick = (plan) => {
        setCurrentPlan(plan);
        setPlanName(plan.name);
        setPlanPrice(String(plan.price));
        setPlanCurrency(plan.currency || 'USD');
        setPlanRenewalPrice(plan.renewal_price ? String(plan.renewal_price) : '');
        setPlanDiscountPercentage(plan.discount_percentage ? String(plan.discount_percentage) : '');
        setPlanFeaturesSummary(plan.features_summary || '');
        setPlanLink(plan.link || '');
        setPlanCategoryId(String(plan.category_id));
        setPlanProviderId(String(plan.provider_id));
        setIsDialogOpen(true);
    };

    // Plan silme
    const handleDeletePlan = async (planId) => {
        if (window.confirm('Bu planı silmek istediğinizden emin misiniz?')) {
            try {
                await deletePlan(planId);
                toast({
                    title: 'Başarılı',
                    description: 'Plan başarıyla silindi.',
                });
                fetchData(); // Planları yeniden çek
            } catch (err) {
                toast({
                    title: 'Hata',
                    description: `Plan silinirken bir sorun oluştu: ${err.message || ''}`,
                    variant: 'destructive',
                });
            }
        }
    };

    // Formu sıfırlama
    const resetForm = () => {
        setCurrentPlan(null);
        setPlanName('');
        setPlanPrice('');
        setPlanCurrency('USD');
        setPlanRenewalPrice('');
        setPlanDiscountPercentage('');
        setPlanFeaturesSummary('');
        setPlanLink('');
        setPlanCategoryId('');
        setPlanProviderId('');
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-10">Plan Yönetimi</h1>
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
                <Button onClick={fetchData} className="mt-4">
                    Tekrar Dene
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
                Plan Yönetimi
            </h1>

            <div className="flex justify-end mb-6">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>Yeni Plan Ekle</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]"> {/* Diyalog genişliği artırıldı */}
                        <DialogHeader>
                            <DialogTitle>{currentPlan ? 'Planı Düzenle' : 'Yeni Plan Ekle'}</DialogTitle>
                            <DialogDescription>
                                {currentPlan
                                    ? 'Plan bilgilerini güncelleyin.'
                                    : 'Yeni bir plan oluşturmak için bilgileri girin.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSavePlan} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Ad
                                </Label>
                                <Input
                                    id="name"
                                    value={planName}
                                    onChange={(e) => setPlanName(e.target.value)}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">
                                    Fiyat
                                </Label>
                                <Input
                                    id="price"
                                    value={planPrice}
                                    onChange={(e) => setPlanPrice(e.target.value)}
                                    className="col-span-2"
                                    type="number"
                                    step="0.01"
                                    required
                                />
                                <Select onValueChange={setPlanCurrency} value={planCurrency}>
                                    <SelectTrigger className="col-span-1">
                                        <SelectValue placeholder="Para Birimi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="TRY">TRY</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="renewal_price" className="text-right">
                                    Yenileme Fiyatı
                                </Label>
                                <Input
                                    id="renewal_price"
                                    value={planRenewalPrice}
                                    onChange={(e) => setPlanRenewalPrice(e.target.value)}
                                    className="col-span-3"
                                    type="number"
                                    step="0.01"
                                    placeholder="Opsiyonel"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="discount_percentage" className="text-right">
                                    İndirim (%)
                                </Label>
                                <Input
                                    id="discount_percentage"
                                    value={planDiscountPercentage}
                                    onChange={(e) => setPlanDiscountPercentage(e.target.value)}
                                    className="col-span-3"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="Opsiyonel"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="features_summary" className="text-right">
                                    Özellik Özeti
                                </Label>
                                <Textarea
                                    id="features_summary"
                                    value={planFeaturesSummary}
                                    onChange={(e) => setPlanFeaturesSummary(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Kısa özellik özeti"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="link" className="text-right">
                                    Plan Linki
                                </Label>
                                <Input
                                    id="link"
                                    value={planLink}
                                    onChange={(e) => setPlanLink(e.target.value)}
                                    className="col-span-3"
                                    type="url"
                                    placeholder="https://saglayici.com/plan-linki"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right">
                                    Kategori
                                </Label>
                                <Select onValueChange={setPlanCategoryId} value={planCategoryId}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Kategori Seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={String(category.id)}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="provider" className="text-right">
                                    Sağlayıcı
                                </Label>
                                <Select onValueChange={setPlanProviderId} value={planProviderId}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Sağlayıcı Seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {providers.map((provider) => (
                                            <SelectItem key={provider.id} value={String(provider.id)}>
                                                {provider.name}
                                            </SelectItem>
                                        ))}
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

            {plans.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Ad</TableHead>
                            <TableHead>Fiyat</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Sağlayıcı</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plans.map((plan) => (
                            <TableRow key={plan.id}>
                                <TableCell className="font-medium">{plan.id}</TableCell>
                                <TableCell>{plan.name}</TableCell>
                                <TableCell>{plan.currency} {plan.price}</TableCell>
                                <TableCell>{plan.category?.name || 'N/A'}</TableCell>
                                <TableCell>{plan.provider?.name || 'N/A'}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditClick(plan)}>
                                        Düzenle
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeletePlan(plan.id)}>
                                        Sil
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-gray-600 dark:text-gray-400">
                    Henüz hiç plan bulunmamaktadır.
                </div>
            )}
        </div>
    );
};

export default PlansAdmin;