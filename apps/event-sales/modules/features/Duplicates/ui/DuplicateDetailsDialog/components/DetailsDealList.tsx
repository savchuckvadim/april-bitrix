'use client';

import { FC } from 'react';
import type { RelatedDeal } from '../../../model';
import { StageBar } from '../../StageBar/StageBar';

interface DetailsDealListProps {
    deals: RelatedDeal[];
}

/** Связанные сделки со стадией — видно, занят клиент или лежит без движения. */
export const DetailsDealList: FC<DetailsDealListProps> = ({ deals }) => (
    <section className="space-y-1.5">
        <h3 className="text-xs font-semibold text-muted-foreground">
            Сделки ({deals.length})
        </h3>

        {deals.length ? (
            <ul className="space-y-1.5">
                {deals.map(deal => (
                    <li
                        key={deal.id}
                        className="rounded-md border border-border p-2"
                    >
                        <div className="flex items-baseline justify-between gap-2">
                            <span className="min-w-0 truncate text-sm text-foreground">
                                {deal.title}
                            </span>
                            {deal.responsible && (
                                <span className="shrink-0 text-[0.6875rem] text-muted-foreground">
                                    {deal.responsible.name}
                                </span>
                            )}
                        </div>
                        <StageBar stage={deal.stage} className="mt-1" />
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-xs text-muted-foreground">Открытых сделок нет.</p>
        )}
    </section>
);
