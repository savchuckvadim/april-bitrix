'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { CheckCircle2, AlertTriangle, Loader2, LogIn } from 'lucide-react';
import { getAuth } from '@workspace/nest-api';

export default function ConfirmPage() {
    const params = useParams();
    const router = useRouter();
    const token = params?.token as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const confirmEmail = async () => {
            if (!token) {
                setError('Токен подтверждения не найден');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const api = getAuth();
                await api.authConfirmEmail(token);
                setIsSuccess(true);
            } catch (err: any) {
                setError(err?.message || 'Ошибка подтверждения email. Токен может быть недействительным или истекшим.');
                setIsSuccess(false);
            } finally {
                setIsLoading(false);
            }
        };

        confirmEmail();
    }, [token]);

    const handleLogin = () => {
        router.push('/auth/login');
    };

    return (
        <div className="min-h-screen bg-background/90 flex items-center justify-center p-6">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Подтверждение email</CardTitle>
                    <CardDescription>
                        {isLoading && 'Проверяем ваш токен...'}
                        {isSuccess && 'Ваш email успешно подтверждён'}
                        {error && 'Произошла ошибка'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 className="w-12 h-12 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Подтверждение email...</p>
                        </div>
                    )}

                    {isSuccess && !isLoading && (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center justify-center py-4 space-y-4">
                                <CheckCircle2 className="w-16 h-16 text-green-500" />
                                <div className="text-center space-y-2">
                                    <p className="text-lg font-medium">
                                        Ваш email подтверждён ✅
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Теперь вы можете войти в систему.
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={handleLogin}
                                className="w-full"
                                size="lg"
                            >
                                <LogIn className="w-4 h-4 mr-2" />
                                Войти
                            </Button>
                        </div>
                    )}

                    {error && !isLoading && (
                        <div className="space-y-4">
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                            <Button
                                onClick={handleLogin}
                                variant="outline"
                                className="w-full"
                            >
                                <LogIn className="w-4 h-4 mr-2" />
                                Перейти на страницу входа
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
