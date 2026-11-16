import type { CallPageDto } from '@workspace/nest-kpi-report-sales-api';
import { backendBase, unwrapEnvelope } from './backend';

/** Чем закончилась загрузка страницы звонка. */
export type CallPageLoad =
    | { status: 'ok'; data: CallPageDto }
    /** Ссылка недействительна, отозвана или разбора ещё нет. */
    | { status: 'not-found' }
    /** Бэкенд не ответил или ответил не тем. */
    | { status: 'error' };

const isCallPage = (value: unknown): value is CallPageDto =>
    typeof value === 'object' &&
    value !== null &&
    'call' in value &&
    'transcript' in value &&
    'highlights' in value;

/**
 * Карточка звонка по ссылке-пропуску. Вызывается только на сервере Next:
 * адрес бэкенда в браузер не попадает.
 */
export async function loadCallPage(token: string): Promise<CallPageLoad> {
    try {
        const response = await fetch(
            `${backendBase()}/api/ai-analytics/call-page/${encodeURIComponent(token)}`,
            { cache: 'no-store' },
        );
        if (response.status === 404) return { status: 'not-found' };
        if (!response.ok) return { status: 'error' };
        const payload = unwrapEnvelope(await response.json());
        return isCallPage(payload)
            ? { status: 'ok', data: payload }
            : { status: 'error' };
    } catch (error) {
        console.error('[call page] загрузка не удалась:', error);
        return { status: 'error' };
    }
}
