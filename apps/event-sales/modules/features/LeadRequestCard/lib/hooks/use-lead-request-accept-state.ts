'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';

/** Видимое состояние блока принятия заявки. */
export type LeadRequestAcceptView = 'hidden' | 'mine' | 'foreign';

/**
 * Состояние блока принятия: карточки нет или заявка принята — hidden;
 * не принята и назначена текущему пользователю (или назначенный
 * неизвестен) — mine (кнопки «Принять»/«Передать»); не принята и
 * назначена другому — foreign (информация без кнопок: после передачи
 * принимает НОВЫЙ ответственный, прежний принять чужую заявку не может).
 */
export const useLeadRequestAcceptState = (): LeadRequestAcceptView => {
    const card = useAppSelector(state => state.leadRequest.card);
    const currentUserId = useAppSelector(
        state => Number(state.app.bitrix.user?.ID) || null,
    );
    if (!card || card.isAccepted) return 'hidden';
    if (
        card.assignedById &&
        currentUserId &&
        card.assignedById !== currentUserId
    ) {
        return 'foreign';
    }
    return 'mine';
};
