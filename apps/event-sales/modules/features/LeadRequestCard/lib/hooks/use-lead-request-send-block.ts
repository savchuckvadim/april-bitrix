'use client';

import { LEAD_REQUEST_TEXT } from '../../consts/lead-request.const';
import { useLeadRequestAcceptState } from './use-lead-request-accept-state';

/**
 * Блокировка отправки отчёта непринятой заявкой — только СВОЕЙ: «сначала
 * примите».
 *
 * Заявка, назначенная другому, отправку НЕ блокирует (решение владельца
 * 16.09): работу определяет задача, а менеджер видит только свои. Заявка и
 * работа расходятся штатно — адресный ХО из сделки отдаёт сделку одному,
 * а лид остаётся на другом, — и прежний блок оставлял нового хозяина
 * работы без единой кнопки. Карточки нет (обычная компания, лид не в
 * контексте) — блокировки нет.
 */
export const useLeadRequestSendBlock = (): {
    blocked: boolean;
    reason: string | null;
} => {
    const view = useLeadRequestAcceptState();
    if (view === 'mine') {
        return { blocked: true, reason: LEAD_REQUEST_TEXT.sendBlockedByAccept };
    }
    return { blocked: false, reason: null };
};
