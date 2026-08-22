'use client';

import { useEffect, useMemo, useState } from 'react';
import { findUfKey } from '@workspace/pbx';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    getSlaCountdown,
    parseAssignedAt,
    type SlaCountdown,
} from '../sla-countdown';

/**
 * Обратный отсчёт подтверждения заявки.
 *
 * Время назначения читается из поля лида (`op_lead_assigned_at`) по слепку
 * портала — того же, на которое смотрит SLA-крон: у фронта и крона один
 * источник, расходиться им не из чего. Поля нет в слепке или лид не в
 * контексте — таймера нет: молчать честнее, чем показывать выдуманный срок.
 *
 * Тик раз в 30 секунд: точность до минуты, чаще перерисовывать незачем.
 */
export const useSlaCountdown = (
    forLeadId?: number | null,
): SlaCountdown | null => {
    const lead = useAppSelector(s => s.app.bitrix.lead);
    const leadFields = useAppSelector(
        s => s.portal.portal?.lead?.bitrixfields ?? null,
    );
    const [now, setNow] = useState(() => Date.now());

    const assignedAtTs = useMemo(() => {
        const key = findUfKey(leadFields, 'op_lead_assigned_at');
        if (!key || !lead) return null;
        // Строка с полем есть только у лида контекста. Спрашивают про
        // другого (очередь ушла дальше) — честный null, а не чужое время.
        if (forLeadId != null && Number(lead.ID) !== Number(forLeadId)) {
            return null;
        }
        return parseAssignedAt(
            (lead as unknown as Record<string, unknown>)[key],
        );
    }, [lead, leadFields, forLeadId]);

    useEffect(() => {
        if (assignedAtTs === null) return;
        const timer = setInterval(() => setNow(Date.now()), 30_000);
        return () => clearInterval(timer);
    }, [assignedAtTs]);

    if (assignedAtTs === null) return null;
    return getSlaCountdown(assignedAtTs, now);
};
