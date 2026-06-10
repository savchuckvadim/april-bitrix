'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { ForgotPasswordForm } from '@/modules/processes/auth/ui/components/forgot-password-form';

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen bg-background/90 flex items-center justify-center p-6">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Сброс пароля</CardTitle>
                    <CardDescription>
                        Восстановите доступ к аккаунту
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ForgotPasswordForm />
                </CardContent>
            </Card>
        </div>
    );
}
