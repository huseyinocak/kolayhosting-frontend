import React, { useState } from 'react';
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
import { Eye, EyeOff } from 'lucide-react'; // Eye ve EyeOff ikonlarını import et

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
    const { register: authRegister, loading } = useAuth(); // useAuth hook'undan register fonksiyonu, yükleme ve hata durumu
    const navigate = useNavigate();
    const { toast } = useToastContext(); // useToastContext'ten toast bildirim fonksiyonunu alıyoruz
    const [registrationSuccess, setRegistrationSuccess] = useState(false); // Kayıt başarısını takip etmek için state
    const [showPassword, setShowPassword] = useState(false); // Şifre görünürlüğünü kontrol etmek için
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false); // Şifre tekrarı görünürlüğünü kontrol etmek için


    // useForm hook'unu başlat
    const {
        register, // Input'ları forma kaydetmek için
        handleSubmit, // Form gönderimini yönetmek için
        formState: { errors }, // Form hatalarını almak için
        setError, // Hataları manuel olarak ayarlamak için
    } = useForm({
        resolver: zodResolver(registerSchema), // Zod şemasını kullan
    });

    const onSubmit = async (data) => {
        console.log('Kayıt başarılı:', { data });
        try {
            // Şifre eşleşme kontrolü Zod şemasında yapıldığı için burada tekrar etmeye gerek yok.
            await authRegister({
                name: data.name,
                email: data.email,
                password: data.password,
                password_confirmation: data.passwordConfirmation, // Backend'in beklediği isim
            });
            setRegistrationSuccess(true); // Kayıt başarılı olduğunda state'i güncelle
            toast({
                title: "Kayıt Başarılı",
                description: "Hesabınız oluşturuldu. Lütfen e-posta adresinizi doğrulamak için gelen kutunuzu kontrol edin.",
                variant: "success", // Başarılı bir kayıt bildirimi
            });
            // Başarılı kayıttan sonra kullanıcıyı doğrudan giriş sayfasına yönlendirebiliriz
            // veya e-posta doğrulama mesajını göstermeye devam edebiliriz.
            // Şimdilik sadece mesajı gösterip, Login'e yönlendirmiyorum.
            // navigate('/login');
        } catch (error) {
            console.error("Kayıt hatası:", error);
            // API'den dönen spesifik hataları yakala ve göster
            if (error.response?.data?.errors) {
                // Laravel'den gelen doğrulama hatalarını işle
                Object.entries(error.response.data.errors).forEach(([key, value]) => {
                    setError(key, {
                        type: "manual",
                        message: value[0], // Hata mesajlarının ilkini al
                    });
                });
            } else {
                toast({
                    title: "Kayıt Hatası",
                    description: error.message || "Kayıt olurken bir hata oluştu.",
                    variant: "destructive",
                });
            }
        }
    };


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
                    {registrationSuccess ? (
                        <div className="text-center text-green-600 dark:text-green-400 mb-4">
                            <p className="text-lg font-semibold">Kayıt Başarılı!</p>
                            <p>Hesabınız oluşturuldu. Lütfen e-posta adresinizi doğrulamak için gelen kutunuzu kontrol edin.</p>
                            <Button onClick={() => navigate('/login')} className="mt-4">Giriş Yap</Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="name">Adınız</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    placeholder="Adınız Soyadınız"
                                    {...register("name")} // Input'u forma kaydet
                                    autoFocus // Otomatik odaklanma için 
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="email">E-posta</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    placeholder="eposta@example.com"
                                    {...register("email")} // Input'u forma kaydet
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                            </div>
                            <div className="grid w-full items-center gap-1.5 relative">
                                <Label htmlFor="password">Şifre</Label>
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    placeholder="Şifreniz"
                                    {...register("password")} // Input'u forma kaydet
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
                            <div className="grid w-full items-center gap-1.5 relative">
                                <Label htmlFor="passwordConfirmation">Şifre Tekrar</Label>
                                <Input
                                    type={showPasswordConfirmation ? "text" : "password"}
                                    id="passwordConfirmation"
                                    placeholder="Şifrenizi tekrar girin"
                                    className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                    {...register("passwordConfirmation")} // Input'u forma kaydet
                                />
                                {/* Şifre tekrarı göster/gizle butonu */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 mt-3" // Konumlandırma
                                    onClick={() => setShowPasswordConfirmation((prev) => !prev)}
                                >
                                    {showPasswordConfirmation ? (
                                        <EyeOff className="h-5 w-5 text-gray-500" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-500" />
                                    )}
                                    <span className="sr-only">{showPasswordConfirmation ? 'Şifreyi Gizle' : 'Şifreyi Göster'}</span>
                                </Button>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Kaydolunuyor...' : 'Kaydol'}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="text-center flex justify-center text-sm">
                    Zaten bir hesabınız var mı? <Button variant="link" onClick={() => navigate('/login')} className="p-0 ml-1">Giriş Yapın</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default RegisterPage;
