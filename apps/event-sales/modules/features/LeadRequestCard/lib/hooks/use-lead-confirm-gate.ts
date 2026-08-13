'use client';

import { useState } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useLeadRequestAcceptState } from './use-lead-request-accept-state';

export interface LeadConfirmGateView {
    /** Показывать экран: заявка ждёт решения и его ещё не отложили. */
    isVisible: boolean;
    /** Кого показать на экране: клиент, а не номер лида. */
    clientTitle: string;
    skip: () => void;
}

/**
 * Нужен ли экран подтверждения заявки.
 *
 * Показываем ровно в одном случае: заявка назначена текущему менеджеру и не
 * принята (состояние `mine`). Заявка чужая или уже принятая экраном не
 * закрывается — там работать можно.
 *
 * Пропуск живёт в компоненте, а не в сторе: это решение «посмотрю сначала»,
 * действующее до перезагрузки приложения. Хранить его дольше нельзя — иначе
 * менеджер один раз пропустит и больше никогда не увидит подтверждение.
 */
export const useLeadConfirmGate = (): LeadConfirmGateView => {
    const [isSkipped, setIsSkipped] = useState(false);
    const acceptState = useLeadRequestAcceptState();
    const leadId = useAppSelector(state => state.leadRequest.leadId);
    const company = useAppSelector(state => state.app.bitrix.company);
    const lead = useAppSelector(state => state.app.bitrix.lead);

    const clientTitle =
        company?.TITLE ||
        lead?.TITLE ||
        (leadId ? `Заявка №${leadId}` : 'Новая заявка');

    return {
        isVisible: acceptState === 'mine' && !isSkipped,
        clientTitle,
        skip: () => setIsSkipped(true),
    };
};
