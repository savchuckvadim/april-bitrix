import { getWSClient } from '@/modules/app/model/store';

/**
 * Утилиты queue-flow эфирного времени (кандидат на общий shared-модуль:
 * та же механика нужна report/calling-statistic — F2, и уже продублирована
 * в finance-thunks).
 */

/** Интервал поллинг-фолбэка: он же подтягивает следующие порции job'ов бэка. */
export const AIRTIME_POLL_INTERVAL_MS = 7_000;

/**
 * socket.id текущего WS-соединения. Без соединения (прокси без upgrade,
 * ранний вызов) — undefined: очередь работает и без WS, чисто поллингом.
 */
export const safeSocketId = (): string | undefined => {
    try {
        return getWSClient().socket.id;
    } catch {
        return undefined;
    }
};

/** «~2 мин» / «~40 сек» — человекочитаемая оценка остатка сбора. */
export const formatEta = (etaSeconds: number | undefined): string | null => {
    if (!etaSeconds || etaSeconds <= 0) return null;
    if (etaSeconds < 90) return `~${Math.max(10, Math.round(etaSeconds / 10) * 10)} сек`;
    return `~${Math.ceil(etaSeconds / 60)} мин`;
};
