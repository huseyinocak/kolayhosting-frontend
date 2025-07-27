import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToastContext } from '../hooks/toast-utils';
import { forgotPassword } from '../api/auth'; // API fonksiyonu
import { useTranslation } from 'react-i18next';

// Shadcn UI bileşenleri
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const { toast } = useToastContext();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    // Zod ile form şemasını tanımla
    const forgotPasswordSchema = z.object({
        email: z.string().email({ message: t('email_invalid') }),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await forgotPassword(data.email);
            toast({
                title: t('password_reset_link_sent_title'),
                description: response.message || t('password_reset_link_sent_description'),
                variant: "success",
            });
            // Kullanıcıyı bir sonraki adıma yönlendirebilir veya bilgilendirme mesajını gösterebiliriz
            // Örneğin, giriş sayfasına geri yönlendirme:
            // navigate('/login');
        } catch (error) {
            console.error("Şifre sıfırlama talebi hatası:", error);
            const errorMessage = error.message || t('password_reset_request_failed_generic');
            if (error.response?.data?.errors) {
                Object.entries(error.response.data.errors).forEach(([key, value]) => {
                    setError(key, {
                        type: "manual",
                        message: value[0],
                    });
                });
            } else {
                toast({
                    title: t('password_reset_request_failed_title'),
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">{t('forgot_password_title')}</CardTitle>
                    <CardDescription>{t('forgot_password_description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="email">{t('email')}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('email_placeholder')}
                                {...register("email")}
                                autoFocus
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? t('sending_link') : t('send_password_reset_link')}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="text-center flex justify-center text-sm">
                    <Button variant="link" onClick={() => navigate('/login')} className="p-0 ml-1">
                        {t('back_to_login')}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;
