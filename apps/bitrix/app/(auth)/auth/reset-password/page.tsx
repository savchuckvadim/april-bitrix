'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { XCircle, LogIn } from 'lucide-react';
import Link from 'next/link';
import { ResetPasswordForm } from '@/modules/processes/auth/ui/components/reset-password-form';

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    return (
        <div className="min-h-screen bg-background/90 flex items-center justify-center p-6">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Новый пароль</CardTitle>
                    <CardDescription>
                        Установите новый пароль для вашего аккаунта
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {token ? (
                        <ResetPasswordForm token={token} />
                    ) : (
                        <div className="space-y-4 text-center">
                            <div className="flex flex-col items-center py-4 space-y-4">
                                <XCircle className="w-16 h-16 text-destructive" />
                                <p className="text-lg font-medium">Токен не найден</p>
                                <p className="text-sm text-muted-foreground">
                                    Ссылка для сброса пароля некорректна.
                                </p>
                            </div>
                            <Link href="/auth/login">
                                <Button variant="outline" className="w-full">
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Вернуться на страницу входа
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
