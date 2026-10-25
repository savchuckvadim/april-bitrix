'use client';

import type { SummaryFact } from '../lib/build-summary.util';

export interface SummaryFactsProps {
    facts: SummaryFact[];
}

/** Список «подпись — значение» саммари: в колонку, длинное переносится. */
export const SummaryFacts = ({ facts }: SummaryFactsProps) => (
    <dl className="flex flex-col gap-2 text-sm">
        {facts.map(fact => (
            <div key={fact.label} className="flex items-baseline justify-between gap-3">
                <dt className="shrink-0 text-muted-foreground">{fact.label}</dt>
                <dd className="min-w-0 text-right font-medium">{fact.value}</dd>
            </div>
        ))}
    </dl>
);
