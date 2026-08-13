'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SkapHelper } from '../api/skap-helper';
import type { SkapImportStatus } from '../../model';

/** Пока прогон идёт или файлы ждут обработки — поллим каждые 5 секунд. */
const POLL_INTERVAL_MS = 5_000;

const skapHelper = new SkapHelper();

/**
 * Портальная поверхность импорта СКАП: статус с автополлингом на время
 * прогона + запуск «Обновить из хранилища». Сознательно без react-query:
 * пакет встраивается в приложения без QueryClientProvider (kpi-service).
 * Ошибка запуска (например, «импорт выключен в настройках») отдаётся
 * наружу текстом из бэка; ошибка поллинга тихая — следующий тик повторит.
 */
export const useSkapImport = (domain: string) => {
    const [status, setStatus] = useState<SkapImportStatus | null>(null);
    const [isRunPending, setIsRunPending] = useState(false);
    const [runError, setRunError] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const refreshStatus = useCallback(async (): Promise<void> => {
        if (!domain) return;
        try {
            setStatus(await skapHelper.getStatus(domain));
        } catch {
            /* индикатор просто не обновится — не роняем шапку */
        }
    }, [domain]);

    // Первичная загрузка статуса (и перезагрузка при смене домена).
    useEffect(() => {
        setStatus(null);
        void refreshStatus();
    }, [refreshStatus]);

    // Автополлинг, пока бэку есть что делать; таймер чистим всегда.
    useEffect(() => {
        const active = status && (status.running || status.pendingFiles > 0);
        if (!active) return;
        timerRef.current = setTimeout(() => void refreshStatus(), POLL_INTERVAL_MS);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [status, refreshStatus]);

    const runImport = useCallback(async (): Promise<void> => {
        if (!domain) return;
        setIsRunPending(true);
        setRunError(null);
        try {
            await skapHelper.runImport(domain);
            await refreshStatus();
        } catch (error) {
            setRunError(
                error instanceof Error ? error.message : String(error),
            );
        } finally {
            setIsRunPending(false);
        }
    }, [domain, refreshStatus]);

    return {
        status,
        /** Прогон идёт прямо сейчас (или джоб только что поставлен). */
        isImporting: Boolean(status?.running) || isRunPending,
        runImport: () => void runImport(),
        runError,
    };
};
