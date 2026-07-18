'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '../lib/use-auth.hook';

/**
 * Выход администратора: токен забывается (Bearer-мир — на бэке чистить
 * нечего; refresh-ротация и revoke — тема общего auth, docs/AUTH.md §5).
 */
export const LogoutButton = () => {
    const router = useRouter();
    const { logout } = useAuth();
    return (
        <Button
            variant="ghost"
            size="sm"
            title="Выйти"
            onClick={() => {
                logout();
                router.replace('/auth/login');
            }}
        >
            <LogOut className="h-4 w-4" />
        </Button>
    );
};
