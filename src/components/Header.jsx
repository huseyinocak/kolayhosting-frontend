import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // useAuth hook'unu doğru yerden içe aktar
import { useToastContext } from '../hooks/toast-utils'; // useToastContext hook'unu içe aktar
import { Menu, Sun, Moon } from 'lucide-react'; // Hamburger menü ikonu için

// Shadcn UI bileşenleri
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose, // Menüyü kapatmak için
} from './ui/sheet'; // Shadcn'de Sheet bileşenleri Dialog'dan gelir

// useTheme hook'unu import et
import { useTheme } from '../hooks/useTheme';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const Header = () => {
    const { user, isAuthenticated, logout } = useAuth(); // Kullanıcı, kimlik doğrulama durumu ve yükleme fonksiyonu
    const navigate = useNavigate(); // Yönlendirme için
    const { toast } = useToastContext(); // useToastContext'ten toast bildirim fonksiyonunu alıyoruz
    const { theme, toggleTheme } = useTheme(); // useTheme hook'unu kullan

    const handleLogout = async () => {
        await logout(); // useAuth hook'undan gelen logout fonksiyonunu çağır
        toast({ // Toast bildirimi eklendi
            title: "Çıkış Yapıldı",
            description: "Başarıyla oturumunuz kapatıldı.",
        });
        navigate('/login'); // Çıkış yaptıktan sonra giriş sayfasına yönlendir
    };

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
            <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2">
                    <img src="/logo.webp" alt="KolayHosting Logo" className="h-8 md:h-10" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">KolayHosting</span>
                </Link>

                {/* Navigasyon Linkleri (Masaüstü) */}
                <div className="hidden md:flex items-center space-x-6">
                    <Link to="/categories" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-base font-medium">
                        Kategoriler
                    </Link>
                    <Link to="/plans" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-base font-medium">
                        Planlar
                    </Link>
                    <Link to="/providers" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-base font-medium">
                        Sağlayıcılar
                    </Link>
                    <Link to="/features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-base font-medium">
                        Özellikler
                    </Link>
                    <Link to="/compare" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-base font-medium">
                        Karşılaştır
                    </Link>
                </div>
                {/* Kullanıcı Giriş/Kayıt veya Avatar (Masaüstü) */}
                <div className="hidden md:flex items-center">
                   {/* Tema Değiştirme Butonu */}
                    <Tooltip> {/* Tooltip bileşeni eklendi */}
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className="mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-110" // Daha estetik geçişler
                                aria-label="Temayı Değiştir"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="h-6 w-6 text-yellow-400 transition-colors duration-300" />
                                ) : (
                                    <Moon className="h-6 w-6 text-blue-600 transition-colors duration-300" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{theme === 'dark' ? 'Aydınlık Moda Geç' : 'Karanlık Moda Geç'}</p>
                        </TooltipContent>
                    </Tooltip>
                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9">
                                        {/* user objesinin varlığını kontrol ederek avatar_url ve name özelliklerine güvenli erişim */}
                                        <AvatarImage src={user?.avatar_url || (user?.name ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}` : '')} alt={user?.name || 'User'} />
                                        <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.name || 'Misafir'}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email || 'misafir@example.com'}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                                        Profil
                                    </DropdownMenuItem>
                                    {user?.role === 'admin' && ( // user objesinin varlığını kontrol et
                                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                                            Admin Paneli
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={handleLogout}>
                                        Çıkış Yap
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="space-x-2 hidden md:flex"> {/* Masaüstünde görünür */}
                            <Button
                                variant="outline"
                                onClick={() => {
                                    navigate('/login');
                                }}
                            >
                                Giriş Yap
                            </Button>
                            <Button
                                onClick={() => {
                                    navigate('/register');
                                }}
                            >
                                Kaydol
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mobil Hamburger Menü */}
                <div className="md:hidden flex items-center">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Menüyü Aç</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle>Menü</SheetTitle>
                                <SheetDescription>
                                    KolayHosting'e hoş geldiniz.
                                </SheetDescription>
                            </SheetHeader>
                            <nav className="mt-8 flex flex-col space-y-4">
                                <SheetClose asChild>
                                    <Link to="/" className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Ana Sayfa</Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link to="/categories" className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Kategoriler</Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link to="/plans" className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Planlar</Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link to="/providers" className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sağlayıcılar</Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link to="/features" className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Özellikler</Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link to="/compare" className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Karşılaştır</Link>
                                </SheetClose>
                                {isAuthenticated ? (
                                    <>
                                        <SheetClose asChild>
                                            <Link to="/profile" className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Profil</Link>
                                        </SheetClose>
                                        {user?.role === 'admin' && ( // user objesinin varlığını kontrol et
                                            <SheetClose asChild>
                                                <Link to="/admin" className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Admin Paneli</Link>
                                            </SheetClose>
                                        )}
                                        <Button onClick={handleLogout} className="w-full mt-4">Çıkış Yap</Button>
                                    </>
                                ) : (
                                    <div className="flex flex-col space-y-4 mt-4">
                                        <SheetClose asChild>
                                            <Button variant="outline" onClick={() => navigate('/login')}>Giriş Yap</Button>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Button onClick={() => navigate('/register')}>Kaydol</Button>
                                        </SheetClose>
                                    </div>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    );
};

export default Header;
