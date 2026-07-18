'use client';

import { useSyncExternalStore } from 'react';
import { getAuth, type LoginDto } from '@workspace/nest-admin-api';
import {
    clearAccessToken,
    getAccessToken,
    setAccessToken,
} from '@/modules/shared/lib/api/nest-client';
import { authStore, type AuthSnapshot } from '../model/auth.store';

/**
 * Хук аутентификации админки.
 *
 * - состояние — из external store (реактивно во всех компонентах);
 * - bootstrap (проверка токена через GET /auth/me) — идемпотентный,
 *   запускается AuthProvider-ом один раз на загрузку;
 * - login/logout — единственные точки входа/выхода (пишут cookie и стор).
 */

let bootstrapPromise: Promise<void> | null = null;

/** Идемпотентная проверка сессии при загрузке (зовёт AuthProvider) */
export function bootstrapAuth(): Promise<void> {
    if (bootstrapPromise) {
        return bootstrapPromise;
    }
    bootstrapPromise = (async () => {
        if (!getAccessToken()) {
            authStore.setAnonymous();
            return;
        }
        authStore.setLoading();
        try {
            const user = await getAuth().authGetMe();
            authStore.setAuthenticated(user);
        } catch {
            // 401 обработает интерцептор (редирект); прочее — считаем анонимом
            clearAccessToken();
            authStore.setAnonymous();
        }
    })();
    return bootstrapPromise;
}

/** Сброс дедупликации bootstrap-а (logout/тесты) */
export function resetAuthBootstrap(): void {
    bootstrapPromise = null;
}

export interface UseAuthResult extends AuthSnapshot {
    login: (dto: LoginDto) => Promise<void>;
    logout: () => void;
}

export function useAuth(): UseAuthResult {
    const snapshot = useSyncExternalStore(
        authStore.subscribe,
        authStore.getSnapshot,
        authStore.getSnapshot,
    );

    return {
        ...snapshot,
        async login(dto: LoginDto): Promise<void> {
            const response = await getAuth().authLogin(dto);
            setAccessToken(response.accessToken);
            authStore.setAuthenticated(response.user);
            resetAuthBootstrap();
        },
        logout(): void {
            clearAccessToken();
            authStore.setAnonymous();
            resetAuthBootstrap();
        },
    };
}
