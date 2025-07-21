import React from 'react';
import { useAuth } from '../hooks/useAuth'; // useAuth hook'unu içe aktar
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge'; // Rol için Badge

/**
 * Kullanıcı Profil Sayfası Bileşeni.
 * Giriş yapmış kullanıcının bilgilerini (ad, e-posta, rol) gösterir.
 */
const ProfilePage = () => {
    const { user, loading } = useAuth(); // useAuth hook'undan kullanıcı verisi ve yükleme durumu

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-lg text-gray-700 dark:text-gray-300">Profil Yükleniyor...</div>
            </div>
        );
    }

    // Kullanıcı bilgisi yoksa (örneğin, oturum açmamışsa veya yükleme sonrası null ise)
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                <h1 className="text-3xl font-bold mb-4">Profil Bulunamadı</h1>
                <p className="text-lg">Lütfen giriş yapın veya bir hesap oluşturun.</p>
                {/* İsteğe bağlı olarak giriş/kayıt butonları eklenebilir */}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4 bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-md shadow-lg rounded-lg">
                <CardHeader className="text-center flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage
                            src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                            alt={user.name}
                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/96x96/e2e8f0/000000?text=${user.name.charAt(0)}`; }}
                        />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
                    <CardDescription className="flex items-center mt-2">
                        <Badge variant="secondary" className="capitalize">
                            {user.role || 'Kullanıcı'}
                        </Badge>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="email">E-posta</Label>
                        <Input
                            id="email"
                            type="email"
                            value={user.email}
                            readOnly // Sadece okunabilir
                            className="bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                        />
                    </div>
                    {/* İsteğe bağlı olarak daha fazla bilgi eklenebilir (örneğin kayıt tarihi) */}
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="memberSince">Üyelik Tarihi</Label>
                        <Input
                            id="memberSince"
                            type="text"
                            value={user.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                            readOnly
                            className="bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                        />
                    </div>
                    {/* Profil güncelleme formu veya butonları buraya eklenebilir */}
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfilePage;
