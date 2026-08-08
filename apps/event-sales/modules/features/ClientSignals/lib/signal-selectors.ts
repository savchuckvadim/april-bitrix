import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/modules/app/model/store';
import { multifieldValues } from './signal-validate';

/**
 * Носитель телефона/email — ЛИД: в лид-контексте собственный, по сделке без
 * компании — связанный лид (из привязок задачи, тянет EVLid.fetchLead).
 * У сделки штатных PHONE/EMAIL в Битриксе нет, у компании точки связи живут
 * в её контактах (entities/EventContact) — там своя механика.
 * Носителя нет — null, контрол не рендерится (§5 доктрины).
 */
export interface SignalsTarget {
    leadId: number;
    phones: string[];
    emails: string[];
    /** Сырые мультифилды — нужны append'у при записи. */
    rawPhones: unknown;
    rawEmails: unknown;
}

export const getSignalsTarget = createSelector(
    [
        (state: RootState) => state.app.bitrix.company,
        (state: RootState) => state.app.bitrix.lead,
        (state: RootState) => state.eventLead.lead,
    ],
    (company, contextLead, linkedLead): SignalsTarget | null => {
        // В компании точки связи — у её контактов, фича молчит.
        if (company) return null;

        const lead = (contextLead ?? linkedLead) as unknown as Record<
            string,
            unknown
        > | null;
        if (!lead) return null;

        const leadId = Number(lead.ID);
        if (!Number.isFinite(leadId) || leadId <= 0) return null;

        return {
            leadId,
            phones: multifieldValues(lead.PHONE),
            emails: multifieldValues(lead.EMAIL),
            rawPhones: lead.PHONE,
            rawEmails: lead.EMAIL,
        };
    },
);
