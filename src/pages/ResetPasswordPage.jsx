import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToastContext } from '../hooks/toast-utils';
import { resetPassword } from '../api/auth'; // API fonksiyonu
import { useTranslation } from 'react-i18next';

// Shadcn UI bileşenleri
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToastContext();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    // URL'den token ve email'i al
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const emailFromUrl = queryParams.get('email');

    // Zod ile form şemasını tanımla
    const resetPasswordSchema = z.object({
        email: z.string().email({ message: t('email_invalid') }),
        password: z.string().min(8, { message: t('password_min_length', { min: 8 }) }),
        password_confirmation: z.string().min(8, { message: t('password_min_length', { min: 8 }) }),
    }).refine((data) => data.password === data.password_confirmation, {
        message: t('passwords_do_not_match'),
        path: ["password_confirmation"],
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: emailFromUrl || '', // URL'den gelen email'i önceden doldur
            password: '',
            password_confirmation: '',
        }
    });

    useEffect(() => {
        // Eğer token veya email URL'de yoksa, kullanıcıyı yönlendir
        if (!token || !emailFromUrl) {
            toast({
                title: t('invalid_reset_link_title'),
                description: t('invalid_reset_link_description'),
                variant: "destructive",
            });
            navigate('/forgot-password', { replace: true });
        }
    }, [token, emailFromUrl, navigate, toast, t]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // API'ye gönderilecek veriye token'ı ekle
            const payload = { ...data, token };
            const response = await resetPassword(payload);
            toast({
                title: t('password_reset_successful_title'),
                description: response.message || t('password_reset_successful_description'),
                variant: "success",
            });
            navigate('/login'); // Şifre sıfırlama sonrası giriş sayfasına yönlendir
        } catch (error) {
            console.error("Şifre sıfırlama hatası:", error);
            const errorMessage = error.message || t('password_reset_failed_generic');
            if (error.response?.data?.errors) {
                Object.entries(error.response.data.errors).forEach(([key, value]) => {
                    setError(key, {
                        type: "manual",
                        message: value[0],
                    });
                });
            } else {
                toast({
                    title: t('password_reset_failed_title'),
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
                    <CardTitle className="text-3xl font-bold">{t('reset_password_title')}</CardTitle>
                    <CardDescription>{t('reset_password_description')}</CardDescription>
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
                                readOnly // Email alanı URL'den geldiği için düzenlenemez olmalı
                                className="bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="password">{t('new_password')}</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={t('new_password_placeholder')}
                                {...register("password")}
                            />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="password_confirmation">{t('confirm_new_password')}</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                placeholder={t('confirm_new_password_placeholder')}
                                {...register("password_confirmation")}
                            />
                            {errors.password_confirmation && <p className="text-red-500 text-sm">{errors.password_confirmation.message}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? t('resetting_password') : t('reset_password_button')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPasswordPage;
