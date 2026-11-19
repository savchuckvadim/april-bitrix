import {
    CALL_REVIEW_TEXT,
    callReviewErrorText,
    isCallReviewView,
    type CallReviewLoad,
} from '@/modules/entities/call-review';
import { backendBase, unwrapEnvelope } from './backend';

/** Адрес ручек личной страницы руководителя на бэкенде. */
export const callLeadBackendUrl = (token: string, lead: string, tail = ''): string =>
    `${backendBase()}/api/ai-analytics/call-page/${encodeURIComponent(token)}/lead/${encodeURIComponent(lead)}${tail}`;

/**
 * Блок «Оценка руководителя» по личному ключу. Вызывается только на сервере
 * Next: адрес бэкенда в браузер не попадает. Ключ недействителен (404), срок
 * истёк (410) или сбой — текст бэка (или запасной), страница звонка при
 * этом показывается как обычная.
 */
export async function loadCallLead(token: string, lead: string): Promise<CallReviewLoad> {
    const failed = CALL_REVIEW_TEXT.errors.loadFailed;
    try {
        const response = await fetch(callLeadBackendUrl(token, lead), { cache: 'no-store' });
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
            return {
                status: 'unavailable',
                message: callReviewErrorText(payload, response.status, failed),
            };
        }
        const view = unwrapEnvelope(payload);
        return isCallReviewView(view)
            ? { status: 'ok', view }
            : { status: 'unavailable', message: failed };
    } catch (error) {
        console.error('[call lead] загрузка не удалась:', error);
        return { status: 'unavailable', message: failed };
    }
}
