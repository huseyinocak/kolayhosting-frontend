import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToastContext } from '../hooks/toast-utils';
import { forgotPassword } from '../api/auth'; // API fonksiyonu
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async'; // Helmet'i içe aktar

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
            if (response.success) {
                toast({
                    title: t('password_reset_link_sent_title'),
                    description: t('password_reset_link_sent_description'),
                    variant: "success",
                });
                navigate('/login'); // Link gönderildikten sonra giriş sayfasına yönlendir
            } else {
                setError("email", { type: "manual", message: response.message || t('password_reset_request_failed_generic') });
                toast({
                    title: t('password_reset_request_failed_title'),
                    description: response.message || t('password_reset_request_failed_generic'),
                    variant: "destructive",
                });
            }
        } catch (err) {
            setError("email", { type: "manual", message: err.message || t('password_reset_request_failed_generic') });
            toast({
                title: t('password_reset_request_failed_title'),
                description: err.message || t('password_reset_request_failed_generic'),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Helmet>
                <title>{t('forgot_password_title')} - KolayHosting</title>
                <meta name="description" content={t('forgot_password_description')} />
                <link rel="canonical" href={`${window.location.origin}/forgot-password`} />
            </Helmet>

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
                                className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
