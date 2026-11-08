'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { siteSession, type SiteSessionSnapshot } from '@workspace/bitrix';

/** Текст ошибки API для человека: бэк отдаёт его по-русски. */
export function cabinetErrorText(
    error: unknown,
    fallback = 'Не получилось — попробуйте ещё раз',
): string {
    return error instanceof Error && error.message ? error.message : fallback;
}

const SERVER_SNAPSHOT: SiteSessionSnapshot = { status: 'idle', userId: null };

/**
 * Сессия кабинета на сайте. При первом монтировании пробует восстановить
 * вход по refresh-cookie (идемпотентно).
 */
export function useSiteSession(): SiteSessionSnapshot {
    const snapshot = useSyncExternalStore(
        siteSession.subscribe,
        siteSession.getSnapshot,
        () => SERVER_SNAPSHOT,
    );
    useEffect(() => {
        if (siteSession.getSnapshot().status === 'idle') {
            void siteSession.refresh();
        }
    }, []);
    return snapshot;
}

export interface LoadState<T> {
    data: T | null;
    error: string | null;
    loading: boolean;
    reload: () => void;
}

/**
 * Загрузка данных кабинета с перезапросом после действий. Перезагружается
 * при смене `deps` (сравнение по значению) и по `reload()`.
 */
export function useCabinetLoad<T>(
    loader: () => Promise<T>,
    deps: readonly (string | number | null | undefined)[],
): LoadState<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [tick, setTick] = useState(0);
    const loaderRef = useRef(loader);
    loaderRef.current = loader;
    const key = JSON.stringify(deps);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        loaderRef
            .current()
            .then((result) => {
                if (cancelled) return;
                setData(result);
                setError(null);
            })
            .catch((failure: unknown) => {
                if (!cancelled) setError(cabinetErrorText(failure));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [key, tick]);

    return {
        data,
        error,
        loading,
        reload: () => setTick((value) => value + 1),
    };
}

/** Действие с флагом «идёт» и текстом ошибки. */
export function useCabinetAction() {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const run = async <T,>(action: () => Promise<T>): Promise<T | null> => {
        setBusy(true);
        setError(null);
        try {
            return await action();
        } catch (failure) {
            setError(cabinetErrorText(failure));
            return null;
        } finally {
            setBusy(false);
        }
    };

    return { busy, error, run, clearError: () => setError(null) };
}
