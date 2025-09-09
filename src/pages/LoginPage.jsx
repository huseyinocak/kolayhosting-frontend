import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form'; // useForm hook'unu içe aktar
import { zodResolver } from '@hookform/resolvers/zod'; // Zod resolver'ı içe aktar
import * as z from 'zod'; // Zod kütüphanesini içe aktar
import { useAuth } from '../hooks/useAuth';
import { useToastContext } from '../hooks/toast-utils'; // useToastContext'i kullanıyoruz

// Shadcn UI bileşenleri
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useTranslation } from 'react-i18next';
import { resendVerificationLink } from '@/api/auth';
import { Eye, EyeOff } from 'lucide-react'; // Eye ve EyeOff ikonlarını import et
import { Helmet } from 'react-helmet-async';



const LoginPage = () => {
    const { login, loading } = useAuth(); // 'error' state'i hala burada, ancak doğrudan kullanılmayacak
    const navigate = useNavigate();
    const { toast } = useToastContext(); // useToastContext'ten toast fonksiyonunu alıyoruz
    const { t } = useTranslation(); // t fonksiyonunu al
    const [showVerificationWarning, setShowVerificationWarning] = useState(false); // E-posta doğrulama uyarısını kontrol etmek için
    const [showPassword, setShowPassword] = useState(false); // Şifre görünürlüğünü kontrol etmek için
    // Zod ile giriş formunun şemasını tanımla
    const loginSchema = z.object({
        email: z.email({ message: t('email_invalid') }),
        password: z.string().min(6, { message: t('password_min_length', { count: 6 }) }),
    });

    // useForm hook'unu başlat
    const {
        register, // Input'ları forma kaydetmek için
        handleSubmit, // Form gönderimini yönetmek için
        formState: { errors }, // Form hatalarını almak için
        setError, // Form hatalarını ayarlamak için
    } = useForm({
        resolver: zodResolver(loginSchema), // Zod şemasını resolver olarak kullan
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // Form gönderim işlemi
    const onSubmit = async (data) => {
        setShowVerificationWarning(false); // Form gönderildiğinde uyarıyı kapat
        try {
            await login({ email: data.email, password: data.password });
            toast({
                title: t('login_success'),
                description: t('redirecting_homepage'), // Yeni çeviri anahtarı
                variant: 'success', // Başarılı bir giriş bildirimi
            });
            navigate('/');
        } catch (error) {
            console.error("Giriş hatası:", error);
            const errorMessage = error.message || t('login_failed_generic');

            // Backend'den gelen spesifik hata mesajlarını kontrol et
            if (error.response?.status === 403 && error.response?.data?.message === 'E-posta adresiniz doğrulanmamış.') {
                setShowVerificationWarning(true); // E-posta doğrulama uyarısını göster
                toast({
                    title: t('email_not_verified_title'),
                    description: t('email_not_verified_description'),
                    variant: "warning",
                });
            } else if (error.response?.data?.errors) {
                // Laravel'den gelen doğrulama hatalarını işle
                Object.entries(error.response.data.errors).forEach(([key, value]) => {
                    setError(key, {
                        type: "manual",
                        message: value[0],
                    });
                });
            } else {
                toast({
                    title: t('login_failed_title'),
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        }
    };

    const handleResendVerification = async () => {
        try {
            await resendVerificationLink();
            toast({
                title: t('verification_link_sent_title'),
                description: t('verification_link_sent_description'),
                variant: "success",
            });
        } catch (error) {
            console.error("Doğrulama linki gönderme hatası:", error);
            toast({
                title: t('resend_verification_failed_title'),
                description: error.message || t('resend_verification_failed_description'),
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Helmet>
                <title>{t('login')} - KolayHosting</title>
                <meta name="description" content={t('login_description')} />
                <link rel="canonical" href={`${window.location.origin}/login`} />
            </Helmet>
            <Card className="w-[350px] shadow-lg rounded-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">{t('login')}</CardTitle> {/* Çeviri kullan */}
                    <CardDescription>{t('login_description')}</CardDescription> {/* Yeni çeviri anahtarı */}
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4"> {/* handleSubmit'i useForm'dan kullan */}
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="email">{t('email')}</Label> {/* Çeviri kullan */}
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('email_placeholder')} // Çeviri kullan
                                className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                {...register("email")}
                                autoFocus // Otomatik odaklanma için
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                        </div>
                        <div className="grid w-full items-center gap-1.5 relative">
                            <Label htmlFor="password">{t('password')}</Label> {/* Çeviri kullan */}
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"} // Şifre görünürlüğüne göre tipi değiştir
                                placeholder={t('password_placeholder')} // Çeviri kullan
                                 className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                {...register("password")}
                            />
                            {/* Şifre göster/gizle butonu */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 mt-3" // Konumlandırma
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-500" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-500" />
                                )}
                                <span className="sr-only">{showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}</span>
                            </Button>
                            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? t('logging_in') : t('login')} {/* Çeviri kullan */}
                        </Button>
                    </form>
                    {showVerificationWarning && (
                        <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-md text-yellow-800 dark:text-yellow-200 text-center">
                            <p className="mb-2">{t('email_not_verified_prompt')}</p>
                            <Button onClick={handleResendVerification} variant="outline" className="w-full">
                                {t('resend_verification_link')}
                            </Button>
                        </div>
                    )}
                    <div className="mt-4 text-center">
                        <Button variant="link" asChild className="p-0 h-auto text-sm">
                            <Link to="/forgot-password">
                                {t('forgot_password')} {/* Yeni çeviri anahtarı */}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="text-center flex justify-center text-sm">
                    {t('no_account_yet')}{' '} <Button variant="link" onClick={() => navigate('/register')} className="p-0 ml-1">{t('register')}</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;
