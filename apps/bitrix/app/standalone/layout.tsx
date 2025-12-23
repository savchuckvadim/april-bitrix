'use client';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import {

    CheckCircle,

    AlertTriangle,

} from 'lucide-react';

import { PortalProvider } from '@/modules/entities/portal';
import { useAuth } from '@/modules/processes/auth/lib/hooks';
import { Button } from '@workspace/ui/components/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClientLayout({
    children,

}: Readonly<{
    children: React.ReactNode;

}>) {
    const { logout, currentUser } = useAuth();
    const router = useRouter();




    // Выход из системы
    const handleLogout = () => {
        router.push('/auth/login'); // 🚀 редирект вручную

        logout();


    };






    // Если пользователь авторизован
    return (
        <div className="min-h-screen">
            {/* Навигационная панель */}
            <nav className="bg-card border-b shadow-sm border-none ">
                <div className="px-10 mx-auto py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link href="/standalone" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Битрикс24 Управление
                                </h1>
                            </Link>
                            {/* <div className="hidden md:flex items-center gap-6">
                                <span className="text-blue-600 font-medium">Личный кабинет</span>
                            </div> */}
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

            <div className=" mx-auto ">
                {/* Уведомления */}
                {false && (
                    <Alert className="mb-6 border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{'success'}</AlertDescription>
                    </Alert>
                )}

                {false && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{'error'}</AlertDescription>
                    </Alert>
                )}
                <PortalProvider>

                        {children}

                </PortalProvider>
            </div>
        </div>
    );
}
