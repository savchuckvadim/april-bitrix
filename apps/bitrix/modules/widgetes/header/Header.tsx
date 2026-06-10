'use client';
import { useAuth } from '@/modules/processes/auth/lib/hooks';
import { useRouter } from 'next/navigation';
import { usePortal } from '@/modules/entities/portal/lib/hooks';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';

export const Header = () => {
    const { currentUser, currentClient, logout } = useAuth();
    const { selectedPortal } = usePortal();
    const router = useRouter();
    const handleLogout = () => {
        router.push('/auth/login'); // 🚀 редирект вручную

        logout();


    };

    return (
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
                            Добро пожаловать, {currentUser?.name} {currentUser?.surname}
                        </div>
                      
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            Выйти
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
