'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import {
    Building,
    CheckCircle,

    Globe,
    AlertTriangle,

} from 'lucide-react';
// import {
//     APP_GROUPS,
// } from '../../modules/entities/entities';
import { useAuth } from '@/modules/processes/auth/lib/hooks';
import { useRouter } from 'next/navigation';

export default function ClientLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { currentUser, currentClient, logout } = useAuth();
    const router = useRouter();


    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);



    // Выход из системы
    const handleLogout = () => {
        router.push('/auth/login'); // 🚀 редирект вручную

        logout();


    };



    // Если пользователь авторизован
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Навигационная панель */}
            <nav className="bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Битрикс24 Управление
                            </h1>
                            <div className="hidden md:flex items-center gap-6">
                                <span className="text-blue-600 font-medium">Личный кабинет</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">
                                Добро пожаловать, {currentUser?.name}
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                Выйти
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto p-6">
                {/* Уведомления */}
                {success && (
                    <Alert className="mb-6 border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                )}

                {children}

            </div>
        </div>
    );
}
