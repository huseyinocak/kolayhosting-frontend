import React from 'react';
import { useNavigate } from 'react-router-dom';
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

// Zod ile giriş formunun şemasını tanımla
const loginSchema = z.object({
    email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
    password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır." }),
});

const LoginPage = () => {
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToastContext(); // useToastContext'ten toast fonksiyonunu alıyoruz

    // useForm hook'unu başlat
    const {
        register, // Input'ları forma kaydetmek için
        handleSubmit, // Form gönderimini yönetmek için
        formState: { errors }, // Form hatalarını almak için
        reset, // Formu sıfırlamak için
    } = useForm({
        resolver: zodResolver(loginSchema), // Zod şemasını resolver olarak kullan
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // Form gönderim işlemi
    const onSubmit = async (data) => {
        try {
            await login({ email: data.email, password: data.password });
            toast({
                title: "Giriş Başarılı!",
                description: "Ana sayfaya yönlendiriliyorsunuz.",
            });
            navigate('/');
            reset(); // Formu sıfırla
        } catch {
            toast({
                title: "Giriş Hatası",
                description: error || "E-posta veya şifre yanlış.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-[350px] shadow-lg rounded-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Giriş Yap</CardTitle>
                    <CardDescription>Hesabınıza erişmek için e-posta ve şifrenizi girin.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4"> {/* handleSubmit'i useForm'dan kullan */}
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="email">E-posta</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="eposta@example.com"
                                {...register("email")} // Input'u forma kaydet
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="password">Şifre</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Şifreniz"
                                {...register("password")} // Input'u forma kaydet
                            />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="text-center flex justify-center text-sm">
                    Hesabınız yok mu? <Button variant="link" onClick={() => navigate('/register')} className="p-0 ml-1">Kaydolun</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;
