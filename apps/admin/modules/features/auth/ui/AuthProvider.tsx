'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { setupAuthInterceptor } from '@/modules/shared/lib/api/nest-client';
import { authStore } from '../model/auth.store';
import { bootstrapAuth } from '../lib/use-auth.hook';

/**
 * Инициализация auth-слоя (ЯВНАЯ, вместо side-эффекта при импорте):
 *  1) устанавливает 401-интерцептор api-пакетов (один раз): сессия
 *     кончилась → стор в anonymous → редирект на /auth/login?returnTo=…;
 *  2) запускает идемпотентный bootstrap (валидация токена GET /auth/me).
 *
 * Живёт в цепочке провайдеров приложения. SSR-безопасен: вся работа —
 * в useEffect (только клиент).
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setupAuthInterceptor({
            onAuthFailed: () => {
                authStore.setAnonymous();
                // уже на логине — не зацикливаем редирект
                if (window.location.pathname.startsWith('/auth')) {
                    return;
                }
                const returnTo = encodeURIComponent(
                    window.location.pathname + window.location.search,
                );
                router.replace(`/auth/login?returnTo=${returnTo}`);
            },
        });
        // на страницах логина токен не проверяем (форма сама решает)
        if (!pathname.startsWith('/auth')) {
            void bootstrapAuth();
        }
        // pathname в deps не нужен: инициализация одноразовая
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>{children}</>;
};
