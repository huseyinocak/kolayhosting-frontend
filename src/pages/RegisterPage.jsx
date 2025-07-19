import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form'; // useForm hook'unu içe aktar
import { zodResolver } from '@hookform/resolvers/zod'; // Zod resolver'ı içe aktar
import * as z from 'zod'; // Zod kütüphanesini içe aktar
import { useAuth } from '../hooks/useAuth'; // useAuth hook'unu doğru yerden içe aktarıyoruz
import { useToastContext } from '../hooks/toast-utils'; // useToastContext hook'unu içe aktarıyoruz

// Shadcn UI bileşenleri
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

// Zod ile kayıt formunun şemasını tanımla
const registerSchema = z.object({
    name: z.string().min(2, { message: "Ad en az 2 karakter olmalıdır." }),
    email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
    password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır." }),
    passwordConfirmation: z.string().min(6, { message: "Şifre tekrarı en az 6 karakter olmalıdır." }),
}).refine((data) => data.password === data.passwordConfirmation, {
    message: "Şifreler eşleşmiyor.",
    path: ["passwordConfirmation"], // Hata mesajını hangi alana atayacağımızı belirtir
});

const RegisterPage = () => {
    const { register: authRegister, loading, error: authError } = useAuth(); // useAuth hook'undan register fonksiyonu, yükleme ve hata durumu
    const navigate = useNavigate();
    const { toast } = useToastContext(); // useToastContext'ten toast bildirim fonksiyonunu alıyoruz

    // useForm hook'unu başlat
    const {
        register, // Input'ları forma kaydetmek için
        handleSubmit, // Form gönderimini yönetmek için
        formState: { errors }, // Form hatalarını almak için
    } = useForm({
        resolver: zodResolver(registerSchema), // Zod şemasını kullan
    });

    const onSubmit = async (data) => {
        try {
            // Şifre eşleşme kontrolü Zod şemasında yapıldığı için burada tekrar etmeye gerek yok.
            await authRegister({
                name: data.name,
                email: data.email,
                password: data.password,
                password_confirmation: data.passwordConfirmation, // Backend'in beklediği isim
            });
            toast({
                title: "Kayıt Başarılı",
                description: "Hesabınız başarıyla oluşturuldu. Şimdi giriş yapabilirsiniz.",
            });
            navigate('/login'); // Kayıt sonrası giriş sayfasına yönlendir
        } catch (err) {
            // API'den gelen hataları yakala ve toast ile göster
            const apiErrorMessage = err.response?.data?.message || 'Kayıt başarısız oldu.';
            toast({
                title: "Kayıt Hatası",
                description: apiErrorMessage,
                variant: "destructive",
            });
            // Eğer backend'den spesifik validasyon hataları geliyorsa, bunları ilgili form alanlarına atayabiliriz.
            // Örneğin: if (err.response?.data?.errors?.email) setError('email', { type: 'manual', message: err.response.data.errors.email[0] });
        }
    };

    // useAuth'tan gelen genel bir hata varsa onu da toast ile göster
    React.useEffect(() => {
        if (authError) {
            toast({
                title: "Hata",
                description: authError,
                variant: "destructive",
            });
        }
    }, [authError, toast]);


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Kaydol</CardTitle>
                    <CardDescription>
                        Hesap oluşturmak için bilgilerinizi girin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="name">Adınız</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Adınız Soyadınız"
                                {...register("name")} // Input'u forma kaydet
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                        </div>
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
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="passwordConfirmation">Şifre Tekrar</Label>
                            <Input
                                type="password"
                                id="passwordConfirmation"
                                placeholder="Şifrenizi tekrar girin"
                                {...register("passwordConfirmation")} // Input'u forma kaydet
                            />
                            {errors.passwordConfirmation && <p className="text-red-500 text-sm">{errors.passwordConfirmation.message}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Kaydolunuyor...' : 'Kaydol'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="text-center flex justify-center text-sm">
                    Zaten bir hesabınız var mı? <Button variant="link" onClick={() => navigate('/login')} className="p-0 ml-1">Giriş Yapın</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default RegisterPage;
