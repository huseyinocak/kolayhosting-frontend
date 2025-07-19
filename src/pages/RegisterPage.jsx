// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // useAuth hook'unu doğru yerden içe aktarıyoruz
import { useToastContext } from '../hooks/toast-utils'; // useToastContext hook'unu içe aktarıyoruz

// Shadcn UI bileşenleri
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const { register, loading, error } = useAuth(); // useAuth hook'undan register fonksiyonu, yükleme ve hata durumu
    const navigate = useNavigate();
    const { toast } = useToastContext(); // useToastContext'ten toast bildirim fonksiyonunu alıyoruz

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== passwordConfirmation) {
            toast({
                title: "Kayıt Hatası",
                description: "Şifreler eşleşmiyor.",
                variant: "destructive",
            });
            return;
        }

        try {
            await register({ name, email, password, password_confirmation: passwordConfirmation });
            toast({
                title: "Kayıt Başarılı!",
                description: "Hesabınız oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz.",
            });
            navigate('/login');
        } catch {
            toast({
                title: "Kayıt Hatası",
                description: error || "Kayıt başarısız oldu. Lütfen bilgilerinizi kontrol edin.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-[350px] shadow-lg rounded-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Kaydol</CardTitle>
                    <CardDescription>Yeni bir hesap oluşturmak için bilgilerinizi girin.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="name">Adınız</Label>
                            <Input
                                type="text"
                                id="name"
                                placeholder="Adınız Soyadınız"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="email">E-posta</Label>
                            <Input
                                type="email"
                                id="email"
                                placeholder="eposta@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="password">Şifre</Label>
                            <Input
                                type="password"
                                id="password"
                                placeholder="Şifreniz"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="passwordConfirmation">Şifre Tekrar</Label>
                            <Input
                                type="password"
                                id="passwordConfirmation"
                                placeholder="Şifrenizi tekrar girin"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                required
                            />
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
