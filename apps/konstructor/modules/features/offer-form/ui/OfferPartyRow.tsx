'use client';

import { cn } from '@workspace/ui/lib/utils';
import type { OfferPartyFact } from '../lib/offer-parties-summary.util';
import type { OfferPartyAnchor } from '../lib/offer-party-anchor.util';

export interface OfferPartyRowProps {
    fact: OfferPartyFact;
    /** Клик по строке: прокрутить экран к карточке наверху */
    onSelect: (anchor: OfferPartyAnchor) => void;
}

/** Строка сводки: подпись слева, значение и пометка справа; клик ведёт к карточке. */
export const OfferPartyRow = ({ fact, onSelect }: OfferPartyRowProps) => (
    <li className="-mx-1.5">
        <button
            type="button"
            onClick={() => onSelect(fact.anchor)}
            className="flex w-full cursor-pointer items-baseline justify-between gap-3 rounded-md px-1.5 py-1 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
            <span className="shrink-0 text-muted-foreground">{fact.label}</span>
            <span className="flex min-w-0 flex-col items-end text-right">
                <span className={cn('font-medium break-words', fact.isValueWarning && 'text-warning')}>
                    {fact.value}
                </span>
                {fact.note ? (
                    <span className={cn('text-xs', fact.isNoteWarning ? 'text-warning' : 'text-muted-foreground')}>
                        {fact.note}
                    </span>
                ) : null}
            </span>
        </button>
    </li>
);
