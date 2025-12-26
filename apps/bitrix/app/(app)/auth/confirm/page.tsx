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


    const handleLogin = () => {
        router.push('/auth/login');
    };

    return (
        <div className="min-h-screen bg-background/90 flex items-center justify-center p-6">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Подтверждение email</CardTitle>
                    <CardDescription>
                        <p>
                            Ссылка для подтверждения email отправлена на ваш email.
                        </p>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">



                    <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center py-4 space-y-4">
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                            <div className="text-center space-y-2">
                                <p className="text-lg font-medium">
                                    Ваш email еще не подтверждён, мы отправили вам ссылку для подтверждения на ваш email.
                                </p>

                            </div>
                        </div>
                        <Button
                            onClick={handleLogin}
                            className="w-full"
                            size="lg"
                            disabled={true}
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            Войти
                        </Button>
                    </div>



                </CardContent>
            </Card>
        </div>
    );
}
