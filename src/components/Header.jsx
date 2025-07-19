import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // useAuth hook'unu doğru yerden içe aktar
import { useToastContext } from '../hooks/toast-utils'; // useToastContext hook'unu içe aktar

// Shadcn UI bileşenleri
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const Header = () => {
    const { user, isAuthenticated, logout } = useAuth(); // Kullanıcı, kimlik doğrulama durumu ve çıkış fonksiyonu
    const navigate = useNavigate(); // Yönlendirme için
    const { toast } = useToastContext(); // useToastContext'ten toast bildirim fonksiyonunu alıyoruz

    const handleLogout = async () => {
        console.log('Çıkış Yap butonu tıklandı.'); // Hata ayıklama için log
        try {
            await logout();
            toast({
                title: "Çıkış Başarılı",
                description: "Başarıyla çıkış yaptınız.",
            });
            navigate('/login'); // Çıkış sonrası giriş sayfasına yönlendir
        } catch {
            toast({
                title: "Çıkış Hatası",
                description: "Çıkış yaparken bir hata oluştu.",
                variant: "destructive",
            });
        }
    };

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
            <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo veya Uygulama Adı */}
                <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white">
                    KolayHosting
                </Link>

                {/* Navigasyon Linkleri */}
                <div className="hidden md:flex space-x-6">
                    <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                        Ana Sayfa
                    </Link>
                    <Link to="/categories" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                        Kategoriler
                    </Link>
                    <Link to="/providers" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                        Sağlayıcılar
                    </Link>
                    <Link to="/plans" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                        Planlar
                    </Link>
                </div>

                {/* Kullanıcı Durumu (Giriş Yapmış/Yapmamış) */}
                <div className="flex items-center space-x-4">
                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} alt={user?.name || 'User'} />
                                        <AvatarFallback>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {/* Admin rolüne sahipse Admin Paneli linki */}
                                {user?.role === 'admin' && (
                                    <DropdownMenuItem onClick={() => { console.log('Admin Paneli linki tıklandı.'); navigate('/admin'); }}>
                                        Admin Paneli
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={handleLogout}>
                                    Çıkış Yap
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    console.log('Giriş Yap butonu tıklandı.'); // Hata ayıklama için log
                                    navigate('/login');
                                }}
                            >
                                Giriş Yap
                            </Button>
                            <Button
                                onClick={() => {
                                    console.log('Kaydol butonu tıklandı.'); // Hata ayıklama için log
                                    navigate('/register');
                                }}
                            >
                                Kaydol
                            </Button>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;