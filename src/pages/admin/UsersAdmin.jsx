// src/pages/admin/UsersAdmin.jsx

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, updateUser, deleteUser, createUser } from '../../api/apiUsers';
import { useToastContext } from '../../hooks/toast-utils';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

// Shadcn UI bileşenleri
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Checkbox } from '../../components/ui/checkbox'; // Checkbox için
import { PlusCircle, Edit, Trash2 } from 'lucide-react'; // İkonlar için

const UsersAdmin = () => {
    const { toast } = useToastContext();
    const { t } = useTranslation();
    const { user: currentUser } = useAuth();

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Zod ile kullanıcı düzenleme/ekleme şeması
    const userSchema = z.object({
        name: z.string().min(2, { message: t('name_min_2') }),
        email: z.email({ message: t('email_invalid') }),
        role: z.enum(['admin', 'user', 'premium_user'], { message: t('role_invalid') }),
        password: z.string().min(6, { message: t('password_min_6') }).optional().or(z.literal('')),
        password_confirmation: z.string().min(6, { message: t('password_min_6') }).optional().or(z.literal('')),
        is_premium: z.boolean().default(false), // is_premium alanı eklendi
    }).refine((data) => {
        if (data.password && data.password !== data.password_confirmation) {
            return false;
        }
        return true;
    }, {
        message: t('password_match'),
        path: ["password_confirmation"],
    });

    // Yeni kullanıcı ekleme formu için ayrı bir şema (şifre zorunlu)
    const newUserSchema = z.object({
        name: z.string().min(2, { message: t('name_min_2') }),
        email: z.email({ message: t('email_invalid') }),
        role: z.enum(['admin', 'user', 'premium_user'], { message: t('role_invalid') }),
        password: z.string().min(6, { message: t('password_min_6') }), // Yeni kullanıcıda şifre zorunlu
        password_confirmation: z.string().min(6, { message: t('password_min_6') }), // Yeni kullanıcıda şifre tekrarı zorunlu
        is_premium: z.boolean().default(false), // is_premium alanı eklendi
    }).refine((data) => data.password === data.password_confirmation, {
        message: t('password_match'),
        path: ["password_confirmation"],
    });

    // Düzenleme formu için useForm
    const { register, handleSubmit, control, reset, clearErrors, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(userSchema),
    });

    // Yeni kullanıcı ekleme formu için ayrı useForm instance'ı
    const { register: registerNewUser, handleSubmit: handleNewUserSubmit, control: controlNewUser, reset: resetNewUser, clearErrors: clearNewUserErrors, formState: { errors: newUserErrors, isSubmitting: isNewUserSubmitting } } = useForm({
        resolver: zodResolver(newUserSchema),
    });

    const queryClient = useQueryClient();

    // Tüm kullanıcıları çek
    const { data: users, isLoading, isError, error } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: () => getAllUsers(),
    });

    // Kullanıcı güncelleme mutasyonu
    const updateMutation = useMutation({
        mutationFn: (data) => updateUser(selectedUser.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminUsers']);
            toast({
                title: t('success'),
                description: t('user_updated_successfully'),
            });
            setIsEditDialogOpen(false);
        },
        onError: (err) => {
            console.error("Update User Error:", err); // Hata detaylarını logla
            toast({
                title: t('error'),
                description: err.response?.data?.message || t('failed_to_update_user'),
                variant: "destructive",
            });
        },
    });

    // Kullanıcı silme mutasyonu
    const deleteMutation = useMutation({
        mutationFn: (userId) => deleteUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminUsers']);
            toast({
                title: t('success'),
                description: t('user_deleted_successfully'),
            });
            setIsDeleteDialogOpen(false);
            setSelectedUser(null);
        },
        onError: (err) => {
            console.error("Delete User Error:", err); // Hata detaylarını logla
            toast({
                title: t('error'),
                description: err.response?.data?.message || t('failed_to_delete_user'),
                variant: "destructive",
            });
        },
    });

    // Yeni kullanıcı oluşturma mutasyonu
    const createMutation = useMutation({
        mutationFn: (userData) => createUser(userData),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminUsers']);
            toast({
                title: t('success'),
                description: t('user_created_successfully'),
            });
            setIsAddUserDialogOpen(false);
            resetNewUser();
        },
        onError: (err) => {
            console.error("Create User Error:", err); // Hata detaylarını logla
            toast({
                title: t('error'),
                description: err.response?.data?.message || t('failed_to_create_user'),
                variant: "destructive",
            });
        },
    });

    const handleEditClick = (user) => {
        setSelectedUser(user);
        reset({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '',
            password_confirmation: '',
            is_premium: user.is_premium, // is_premium değerini set et
        });
        clearErrors(); // Modalı açarken tüm hataları temizle
        setIsEditDialogOpen(true);
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    const handleEditSubmit = async (data) => {
        const dataToSend = { ...data };
        if (dataToSend.password === '') {
            delete dataToSend.password;
            delete dataToSend.password_confirmation;
        }
        // is_premium'u doğrudan gönder
        dataToSend.is_premium = data.is_premium;
        console.log("Submitting update with data:", dataToSend);
        updateMutation.mutate(dataToSend);
    };

    const handleNewUserSubmitForm = async (data) => {
        console.log("Submitting new user with data:", data);
        createMutation.mutate(data);
    };

    const handleDeleteConfirm = () => {
        if (selectedUser) {
            deleteMutation.mutate(selectedUser.id);
        }
    };

    useEffect(() => {
        if (!isEditDialogOpen) {
            clearErrors();
        }
    }, [isEditDialogOpen, clearErrors]);

    useEffect(() => {
        if (!isAddUserDialogOpen) {
            clearNewUserErrors();
        }
    }, [isAddUserDialogOpen, clearNewUserErrors]);


    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">{t('admin_users_page_title')}</h1>
                <Skeleton className="w-full h-[60px] rounded-md mb-4" />
                <Skeleton className="w-full h-[400px] rounded-md" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-500 dark:text-red-400">
                {t('error_loading_users')}: {error.message}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">{t('admin_users_page_title')}</h1>

            <div className="flex justify-end mb-6">
                {/* Yeni Kullanıcı Ekleme Butonu */}
                <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            resetNewUser();
                            setIsAddUserDialogOpen(true);
                        }}>{t('add_new_user')}</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{t('create_user')}</DialogTitle>
                            <DialogDescription>{t('add_new_user_description')}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleNewUserSubmit(handleNewUserSubmitForm)} className="space-y-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="create-name">{t('name')}</Label>
                                <Input id="create-name" {...registerNewUser('name')} placeholder={t('name_placeholder')} />
                                {newUserErrors.name && <p className="text-red-500 text-sm">{newUserErrors.name.message}</p>}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="create-email">{t('email')}</Label>
                                <Input id="create-email" type="email" {...registerNewUser('email')} placeholder={t('email_placeholder')} />
                                {newUserErrors.email && <p className="text-red-500 text-sm">{newUserErrors.email.message}</p>}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="create-password">{t('password')}</Label>
                                <Input id="create-password" type="password" {...registerNewUser('password')} placeholder={t('password_placeholder')} />
                                {newUserErrors.password && <p className="text-red-500 text-sm">{newUserErrors.password.message}</p>}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="create-password-confirm">{t('password_confirmation')}</Label>
                                <Input id="create-password-confirm" type="password" {...registerNewUser('password_confirmation')} placeholder={t('password_confirmation_placeholder')} />
                                {newUserErrors.password_confirmation && <p className="text-red-500 text-sm">{newUserErrors.password_confirmation.message}</p>}
                            </div>
                            {/* is_premium Checkbox for new user */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="create-is_premium">{t('premium_user')}</Label>
                                <Controller
                                    name="is_premium"
                                    control={controlNewUser}
                                    render={({ field }) => (
                                        <Checkbox
                                            id="create-is_premium"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="create-role">{t('role')}</Label>
                                <Controller
                                    name="role"
                                    control={controlNewUser}
                                    defaultValue="user"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger id="create-role">
                                                <SelectValue placeholder={t('select_role')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">{t('user')}</SelectItem>
                                                <SelectItem value="admin">{t('admin')}</SelectItem>
                                                <SelectItem value="premium_user">{t('premium_user')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {newUserErrors.role && <p className="text-red-500 text-sm">{newUserErrors.role.message}</p>}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isNewUserSubmitting || createMutation.isLoading}>
                                    {createMutation.isLoading ? t('creating_user') : t('create_user')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {users && users.data && users.data.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead  className="py-3 px-4 text-xs font-semibold uppercase tracking-wider">ID</TableHead>
                            <TableHead  className="py-3 px-4 text-xs font-semibold uppercase tracking-wider">{t('user_name')}</TableHead>
                            <TableHead className="py-3 px-4 text-xs font-semibold uppercase tracking-wider">{t('user_email')}</TableHead>
                            <TableHead className="py-3 px-4 text-xs font-semibold uppercase tracking-wider">{t('premium_user')}</TableHead> {/* Yeni sütun */}
                            <TableHead className="py-3 px-4 text-xs font-semibold uppercase tracking-wider">{t('user_role')}</TableHead>
                            <TableHead className="py-3 px-4 text-xs font-semibold uppercase tracking-wider">{t('user_created_at')}</TableHead>
                            <TableHead  className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-right">{t('user_actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.data.map((user) => (
                            <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150" >
                                <TableCell className="py-3 px-4 text-sm font-medium">{user.id}</TableCell>
                                <TableCell className="py-3 px-4 text-sm">
                                    {user.name}
                                </TableCell>
                                <TableCell className="py-3 px-4 text-sm">{user.email}</TableCell>
                                <TableCell className="py-3 px-4 text-sm">{user.is_premium ? t('yes') : t('no')}</TableCell>
                                <TableCell className="py-3 px-4 text-sm">
                                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                        {t(user.role)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-3 px-4 text-sm">{new Date(user.created_at).toLocaleDateString('tr-TR')}</TableCell>
                                <TableCell className="py-3 px-4 text-right flex space-x-2 justify-end">
                                    <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditClick(user)}>
                                         <Edit className="h-4 w-4" />{t('edit')}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteClick(user)}
                                        disabled={currentUser && currentUser.id === user.id}
                                    >
                                        <Trash2 className="h-4 w-4" />{t('delete')}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center text-gray-600 dark:text-gray-400">
                    {t('no_users_found')}
                </div>
            )}

            {/* Kullanıcı Düzenleme Diyaloğu */}
            {selectedUser && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{t('edit_user')}</DialogTitle>
                            <DialogDescription>{t('edit_user_description')}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="name">{t('name')}</Label>
                                <Input id="name" {...register('name')} />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="email">{t('email')}</Label>
                                <Input id="email" type="email" {...register('email')} />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="role">{t('role')}</Label>
                                <Controller
                                    name="role"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger id="role">
                                                <SelectValue placeholder={t('select_role')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">{t('user')}</SelectItem>
                                                <SelectItem value="admin">{t('admin')}</SelectItem>
                                                <SelectItem value="premium_user">{t('premium_user')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="password">{t('password')}</Label>
                                <Input id="password" type="password" {...register('password')} placeholder={t('password_placeholder_optional')} />
                                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="password_confirmation">{t('password_confirmation')}</Label>
                                <Input id="password_confirmation" type="password" {...register('password_confirmation')} placeholder={t('password_confirmation_placeholder_optional')} />
                                {errors.password_confirmation && <p className="text-red-500 text-sm">{errors.password_confirmation.message}</p>}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="edit-is_premium">{t('premium_user')}</Label>
                                <Controller
                                    name="is_premium"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            id="edit-is_premium"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting || updateMutation.isLoading}>
                                    {updateMutation.isLoading ? t('updating') : t('update_user')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Kullanıcı Silme Diyaloğu */}
            {selectedUser && (
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('confirm_delete_user')}</DialogTitle>
                            <DialogDescription>
                                {t('delete_user_confirmation_message', { userName: selectedUser.name })}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">{t('cancel')}</Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                                disabled={deleteMutation.isLoading || (currentUser && currentUser.id === selectedUser.id)}
                            >
                                {t('delete_user')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default UsersAdmin;
