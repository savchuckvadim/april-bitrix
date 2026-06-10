'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { setupAuthInterceptor } from '@/modules/shared/api';

const PUBLIC_PREFIXES = ['/home', '/auth', '/install', '/bitrix'];

function isPublicPage(): boolean {
    if (typeof window === 'undefined') return true;
    const path = window.location.pathname;
    return path === '/' || PUBLIC_PREFIXES.some((p) => path.startsWith(p));
}

export function ApiInitializer() {
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        setupAuthInterceptor({
            onAuthFailed: () => {
                if (isPublicPage()) return;

                toast.error('Сессия истекла. Пожалуйста, войдите снова.');
                // window.location.href = '/auth/login';
            },
            onApiError: (message, status) => {
                if (status >= 500) {
                    toast.error(message || 'Ошибка сервера');
                } else if (status === 403) {
                    toast.error('Недостаточно прав');
                } else if (status >= 400) {
                    toast.warning(message || 'Ошибка запроса');
                }
            },
        });
    }, []);

    return null;
}
