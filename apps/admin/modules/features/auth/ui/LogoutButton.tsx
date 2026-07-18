'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { LogOut } from 'lucide-react';
import { clearAccessToken } from '@/modules/shared/lib/api/nest-client';

/**
 * Выход администратора: токен просто забывается (Bearer-мир — на бэке
 * ничего чистить не нужно; refresh-ротация и revoke — тема общего auth).
 */
export const LogoutButton = () => {
    const router = useRouter();
    return (
        <Button
            variant="ghost"
            size="sm"
            title="Выйти"
            onClick={() => {
                clearAccessToken();
                router.replace('/auth/login');
            }}
        >
            <LogOut className="h-4 w-4" />
        </Button>
    );
};
