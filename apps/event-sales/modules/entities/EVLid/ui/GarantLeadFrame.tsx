'use client';

import { FC } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getLeadgarantReportURL } from '../lib/event-lead-util';

/** Гарант-отчёт лида (iframe) — лид-контекст вместо sales-секций. */
export const GarantLeadFrame: FC = () => {
    const lead = useAppSelector(s => s.eventLead.lead);
    const url = getLeadgarantReportURL(lead);

    if (!url) return null;

    return (
        <iframe
            src={url}
            title="Гарант-отчёт"
            className="min-h-[480px] w-full rounded-xl border border-border bg-background"
        />
    );
};
