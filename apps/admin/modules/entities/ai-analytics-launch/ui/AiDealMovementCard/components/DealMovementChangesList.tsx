'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import {
    DEAL_MOVEMENT_TEXT,
    dealMovementDealHref,
} from '../../../consts/deal-movement.const';
import {
    dealMovementMoreText,
    dealMovementShownChanges,
} from '../../../lib/deal-movement-results';
import type { DealMovementSnapshot } from '../../../model';

interface DealMovementChangesListProps {
    domain: string;
    snapshot: DealMovementSnapshot;
}

/**
 * Смены статуса последнего счёта: сделка со ссылкой на карточку, было →
 * стало, пометка «записано в ленту», причины словами, сумма; остаток —
 * «и ещё N».
 */
export const DealMovementChangesList = ({
    domain,
    snapshot,
}: DealMovementChangesListProps) => {
    const { shown, more } = dealMovementShownChanges(snapshot);
    const moreText = dealMovementMoreText(more);
    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">{DEAL_MOVEMENT_TEXT.changesTitle}</p>
            {shown.length === 0 && !moreText ? (
                <p className="text-sm text-muted-foreground">
                    {DEAL_MOVEMENT_TEXT.noChanges}
                </p>
            ) : (
                <ul className="space-y-2">
                    {shown.map(item => (
                        <li
                            key={item.dealId}
                            className="rounded-md border bg-card p-2 text-sm"
                        >
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <a
                                    href={dealMovementDealHref(domain, item.dealId)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium underline-offset-2 hover:underline"
                                >
                                    {item.title}
                                </a>
                                {item.amount && (
                                    <span className="text-xs text-muted-foreground">
                                        {item.amount}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <p>{item.transition}</p>
                                {item.notified && (
                                    <ToneBadge
                                        tone="success"
                                        variant="soft"
                                        size="sm"
                                    >
                                        {DEAL_MOVEMENT_TEXT.notifiedBadge}
                                    </ToneBadge>
                                )}
                            </div>
                            {item.reasons && (
                                <p className="text-xs text-muted-foreground">
                                    {item.reasons}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            {moreText && (
                <p className="text-xs text-muted-foreground">{moreText}</p>
            )}
        </div>
    );
};
