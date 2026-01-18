'use client';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import {

    CheckCircle,

    AlertTriangle,

} from 'lucide-react';

import { PortalProvider } from '@/modules/entities/portal';
// import { useAuth } from '@/modules/processes/auth/lib/hooks';
import { Button } from '@workspace/ui/components/button';
// import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/modules/widgetes';
import { App } from '@/modules/app';

export default function StandaloneLayout({
    children,

}: Readonly<{
    children: React.ReactNode;

}>) {
    // const { logout, currentUser } = useAuth();
    // const router = useRouter();




    // // Выход из системы
    // const handleLogout = () => {
    //     router.push('/auth/login'); // 🚀 редирект вручную

    //     logout();


    // };






    // Если пользователь авторизован
    return (

            <div className="min-h-screen">
                {/* Навигационная панель */}
                <Header />

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
