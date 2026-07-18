'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type LoginDto } from '@workspace/nest-admin-api';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../lib/use-auth.hook';

/**
 * Вход администратора (SuperUser, back/apps/admin POST /api/auth/login).
 *
 * Принцип «Bearer везде»: полученный accessToken сохраняется в cookie
 * фронтового домена (persistence) и уходит на все бэки ТОЛЬКО заголовком
 * Authorization (геттер подключён в api-пакеты). Общий AUTH_JWT_SECRET →
 * токен валиден и в admin, и в pbx-install, и в konstructor (SSO).
 */
export const LoginForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginDto>({ defaultValues: { login: '', password: '' } });

    const onSubmit = async (dto: LoginDto) => {
        setSubmitting(true);
        try {
            await login(dto);
            toast.success('Вход выполнен');
            router.replace(searchParams.get('returnTo') || '/dashboard');
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Не удалось войти — проверьте логин и пароль',
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LogIn className="h-5 w-5" />
                        Вход в админку
                    </CardTitle>
                    <CardDescription>
                        Учётные данные администратора (SuperUser)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
                        className="space-y-4"
                    >
                        <div className="space-y-1">
                            <Label htmlFor="login">Логин</Label>
                            <Input
                                id="login"
                                autoComplete="username"
                                {...register('login', {
                                    required: 'Укажите логин',
                                })}
                            />
                            {errors.login && (
                                <p className="text-sm text-red-600">
                                    {errors.login.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="password">Пароль</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    {...register('password', {
                                        required: 'Укажите пароль',
                                    })}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() =>
                                        setShowPassword((value) => !value)
                                    }
                                    className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={submitting}
                        >
                            {submitting ? 'Входим…' : 'Войти'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
