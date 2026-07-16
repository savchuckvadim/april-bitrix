'use client';

import { useEffect, useSyncExternalStore } from 'react';
import {
    initPortalSession,
    portalSessionStore,
    type SessionSnapshot,
} from '@workspace/bitrix';

/**
 * Сессия кабинета: подписка на in-memory стор (@workspace/bitrix) +
 * ленивый bootstrap (обмен одноразового кода из query на Bearer-токен).
 * Реактивность — useSyncExternalStore: 401 в ЛЮБОМ запросе клиента
 * переведёт стор в expired и кабинет перерисуется сам.
 */
export function usePortalSession(): SessionSnapshot {
    const snapshot = useSyncExternalStore(
        portalSessionStore.subscribe,
        portalSessionStore.getSnapshot,
        portalSessionStore.getSnapshot,
    );

    useEffect(() => {
        void initPortalSession();
    }, []);

    return snapshot;
}
