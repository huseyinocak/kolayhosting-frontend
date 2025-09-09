import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // useAuth hook'unu doğru yerden içe aktar
import { useToastContext } from '../hooks/toast-utils'; // useToastContext hook'unu içe aktar
import { Menu, Sun, Moon, Globe } from 'lucide-react'; // Hamburger menü ikonu için

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
import { useTranslation } from 'react-i18next';

const Header = () => {
    const { user, isAuthenticated, logout } = useAuth(); // Kullanıcı, kimlik doğrulama durumu ve yükleme fonksiyonu
    const navigate = useNavigate(); // Yönlendirme için
    const { toast } = useToastContext(); // useToastContext'ten toast bildirim fonksiyonunu alıyoruz
    const { theme, toggleTheme } = useTheme(); // useTheme hook'unu kullan
    const { t, i18n } = useTranslation(); // t ve i18n objesini al
    const location = useLocation(); // Mevcut URL konumunu al


    const handleLogout = async () => {
        await logout(); // useAuth hook'undan gelen logout fonksiyonunu çağır
        toast({ // Toast bildirimi eklendi
            title: t('logout_success_title'),
            description: t('logout_success_description'),
            variant: 'success', // Başarılı bir çıkış bildirimi
        });
        navigate('/login'); // Çıkış yaptıktan sonra giriş sayfasına yönlendir
    };
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        toast({
            title: t('language_changed_title'), // Yeni çeviri anahtarı
            description: t('language_changed_description', { lang: lng === 'tr' ? 'Türkçe' : 'English' }), // Yeni çeviri anahtarı
            variant: 'success', // Başarılı bir değişiklik bildirimi
        });
    };

    // Linklerin aktif olup olmadığını kontrol eden yardımcı fonksiyon
    const isActiveLink = (path) => {
        return location.pathname === path;
    };


    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
            <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2">
                    <img src="/kolayhosting_logosu.png" alt="KolayHosting Logo" className="h-8 md:h-10" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">KolayHosting</span>
                </Link>

                {/* Navigasyon Linkleri (Masaüstü) */}
                <div className="hidden md:flex items-center space-x-6">
                    <Link to="/categories" className={`text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isActiveLink('/categories') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                        {t('categories')} {/* Çeviri kullan */}
                    </Link>
                    <Link to="/plans" className={`text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isActiveLink('/plans') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                        {t('plans')} {/* Çeviri kullan */}
                    </Link>
                    <Link to="/providers" className={`text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isActiveLink('/providers') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                        {t('providers')} {/* Çeviri kullan */}
                    </Link>
                    <Link to="/features" className={`text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isActiveLink('/features') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                        {t('features')} {/* Çeviri kullan */}
                    </Link>
                    <Link to="/compare" className={`text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isActiveLink('/compare') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                        {t('compare')} {/* Çeviri kullan */}
                    </Link>
                </div>
                {/* Kullanıcı Giriş/Kayıt veya Avatar (Masaüstü) */}
                <div className="hidden md:flex items-center space-x-4">
                    {/* Dil Değiştirme Butonu */}
                    <DropdownMenu>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={t('change_language')} // Çeviri kullan
                                    >
                                        <Globe className="h-6 w-6" />
                                        <span className="sr-only">{t('change_language')}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                {t('change_language')}{/* Çeviri kullan */}
                            </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent className="w-40">
                            <DropdownMenuLabel>{t('language')}</DropdownMenuLabel> {/* Yeni çeviri anahtarı */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => changeLanguage('tr')}>
                                Türkçe
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeLanguage('en')}>
                                English
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {/* Tema Değiştirme Butonu */}
                    <Tooltip> {/* Tooltip bileşeni eklendi */}
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}

                                aria-label={theme === 'dark' ? t('toggle_light_mode') : t('toggle_dark_mode')} // Çeviri kullan
                            >
                                {theme === 'dark' ? (
                                    <Sun className="h-6 w-6 text-yellow-400 transition-colors duration-300" />
                                ) : (
                                    <Moon className="h-6 w-6 text-blue-600 transition-colors duration-300" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{theme === 'dark' ? t('toggle_light_mode') : t('toggle_dark_mode')}</p> {/* Çeviri kullan */}
                        </TooltipContent>
                    </Tooltip>
                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9  cursor-pointer">
                                        <AvatarImage src={user?.avatar_url || (user?.name ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}` : '')} alt={user?.name || t('user')} />
                                        <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.name || t('guest')}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email || 'guest@example.com'}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                                        {t('profile')}
                                    </DropdownMenuItem>
                                    {user?.role === 'admin' && ( // user objesinin varlığını kontrol et
                                        <>
                                            <DropdownMenuItem onClick={() => navigate('/admin')}>
                                                {t('admin_panel')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                                                {t('user_management')}
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <DropdownMenuItem onClick={handleLogout}>
                                        {t('logout')}
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
                                {t('login')}
                            </Button>
                            <Button
                                onClick={() => {
                                    navigate('/register');
                                }}
                            >
                                {t('register')}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Mobil Hamburger Menü */}
                <div className="md:hidden flex items-center space-x-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">{t('open_menu')}</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle>{t('menu')}</SheetTitle> {/* Çeviri kullan */}
                                <SheetDescription>
                                    {t('welcome_message_short')} {/* Yeni çeviri anahtarı */}
                                </SheetDescription>
                            </SheetHeader>
                            <nav className="mt-8 flex flex-col space-y-4">
                                <SheetClose asChild>
                                    <Link to="/" className={`text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isActiveLink('/') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>{t('homepage')}</Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link to="/categories" className={`text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isActiveLink('/categories') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>{t('categories')}</Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link to="/plans" className={`text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isActiveLink('/plans') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>{t('plans')}</Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link to="/providers" className={`text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isActiveLink('/providers') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>{t('providers')}</Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link to="/features" className={`text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isActiveLink('/features') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>{t('features')}</Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link to="/compare" className={`text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isActiveLink('/compare') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>{t('compare')}</Link>
                                </SheetClose>
                                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                                {isAuthenticated ? (
                                    <>
                                        <SheetClose asChild>
                                            <Link to="/profile" className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('profile')}</Link>
                                        </SheetClose>
                                        {user?.role === 'admin' && ( // user objesinin varlığını kontrol et
                                            <>
                                                {/* Yönetim Başlığı */}
                                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
                                                    {t('admin_management')}
                                                </h3>
                                                <SheetClose asChild>
                                                    <Link
                                                        to="/admin"
                                                        className={`text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isActiveLink('/admin') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}
                                                    >
                                                        {t('admin_dashboard')}
                                                    </Link>
                                                </SheetClose>
                                                <SheetClose asChild>
                                                    <Link to="/admin/users" className={`text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isActiveLink('/admin/users') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {t('user_management')}
                                                    </Link>
                                                </SheetClose>
                                                <SheetClose asChild>
                                                    <Link to="/admin/categories" className={`text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isActiveLink('/admin/categories') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {t('category_management')}
                                                    </Link>
                                                </SheetClose>
                                                <SheetClose asChild>
                                                    <Link to="/admin/providers" className={`text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isActiveLink('/admin/providers') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {t('provider_management')}
                                                    </Link>
                                                </SheetClose>
                                                <SheetClose asChild>
                                                    <Link to="/admin/plans" className={`text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isActiveLink('/admin/plans') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {t('plan_management')}
                                                    </Link>
                                                </SheetClose>
                                                <SheetClose asChild>
                                                    <Link to="/admin/features" className={`text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isActiveLink('/admin/features') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {t('feature_management')}
                                                    </Link>
                                                </SheetClose>
                                                <SheetClose asChild>
                                                    <Link to="/admin/reviews" className={`text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${isActiveLink('/admin/reviews') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {t('review_management')}
                                                    </Link>
                                                </SheetClose>
                                            </>
                                        )}
                                        <Button onClick={handleLogout} className="w-full mt-4">{t('logout')}</Button>
                                    </>
                                ) : (
                                    <div className="flex flex-col space-y-4 mt-4">
                                        <SheetClose asChild>
                                            <Button variant="outline" onClick={() => navigate('/login')}>{t('login')}</Button>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Button onClick={() => navigate('/register')}>{t('register')}</Button>
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
