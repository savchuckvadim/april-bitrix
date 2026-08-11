'use client';

import { LEAD_REQUEST_TEXT } from '../../consts/lead-request.const';
import { useLeadRequestAcceptState } from './use-lead-request-accept-state';

/**
 * Блокировка отправки отчёта непринятой заявкой: своя непринятая —
 * «сначала примите»; назначена другому (передана повторно / после
 * непринятия) — работать по ней нельзя вовсе. Карточки нет (обычная
 * компания, лид не в контексте) — блокировки нет.
 */
export const useLeadRequestSendBlock = (): {
    blocked: boolean;
    reason: string | null;
} => {
    const view = useLeadRequestAcceptState();
    if (view === 'mine') {
        return { blocked: true, reason: LEAD_REQUEST_TEXT.sendBlockedByAccept };
    }
    if (view === 'foreign') {
        return {
            blocked: true,
            reason: LEAD_REQUEST_TEXT.sendBlockedByForeign,
        };
    }
    return { blocked: false, reason: null };
};
