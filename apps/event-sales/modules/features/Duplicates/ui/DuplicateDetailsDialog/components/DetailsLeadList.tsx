'use client';

import { FC } from 'react';
import type { RelatedLead } from '../../../model';

interface DetailsLeadListProps {
    leads: RelatedLead[];
}

/** Связанные лиды: клиент мог зайти заявкой, которую ещё не сконвертировали. */
export const DetailsLeadList: FC<DetailsLeadListProps> = ({ leads }) => (
    <section className="space-y-1.5">
        <h3 className="text-xs font-semibold text-muted-foreground">
            Лиды ({leads.length})
        </h3>

        {leads.length ? (
            <ul className="space-y-1">
                {leads.map(lead => (
                    <li
                        key={lead.id}
                        className="flex items-baseline justify-between gap-2 rounded-md border border-border px-2 py-1.5"
                    >
                        <span className="min-w-0 truncate text-sm text-foreground">
                            {lead.title}
                        </span>
                        {lead.responsible && (
                            <span className="shrink-0 text-[0.6875rem] text-muted-foreground">
                                {lead.responsible.name}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-xs text-muted-foreground">Связанных лидов нет.</p>
        )}
    </section>
);
