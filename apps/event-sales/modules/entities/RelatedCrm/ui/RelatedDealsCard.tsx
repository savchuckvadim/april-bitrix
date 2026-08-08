'use client';

import { FC } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { cn } from '@workspace/ui/lib/utils';
import type { RelatedDeal } from '../model';
import { dealAmount } from '../lib/stage-view';
import { SectionState, type SectionStatus } from '@/modules/shared/SectionState';
import { StageMini } from './StageMini';

interface RelatedDealsCardProps {
    deals: RelatedDeal[];
    /** Сделка, из которой открылись, — подсвечиваем как текущую. */
    currentDealId: number | null;
    includeClosed: boolean;
    onIncludeClosedChange: (value: boolean) => void;
    status: SectionStatus;
    onRetry: () => void;
}

/**
 * Связанные сделки со стадиями.
 *
 * Стадия рисуется миниатюрой: цвет и позиция берутся из настроек воронки
 * портала, поэтому менеджер видит ту же картину, что и в самом Битриксе.
 */
export const RelatedDealsCard: FC<RelatedDealsCardProps> = ({
    deals,
    currentDealId,
    includeClosed,
    onIncludeClosedChange,
    status,
    onRetry,
}) => (
    <Card className="flex min-h-0 flex-col">
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">
                Сделки{status === 'ready' ? ` (${deals.length})` : ''}
            </CardTitle>
            <div className="flex shrink-0 items-center gap-2">
                <Label
                    htmlFor="deals-include-closed"
                    className="text-xs text-muted-foreground"
                >
                    с закрытыми
                </Label>
                <Switch
                    id="deals-include-closed"
                    checked={includeClosed}
                    onCheckedChange={onIncludeClosedChange}
                />
            </div>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 overflow-y-auto">
            <SectionState
                status={status}
                isEmpty={!deals.length}
                onRetry={onRetry}
                emptyText={
                    includeClosed
                        ? 'Сделок по клиенту ещё нет.'
                        : 'Открытых сделок нет.'
                }
            >
                <ul className="space-y-1.5">
                    {deals.map(deal => (
                        <li
                            key={deal.id}
                            className={cn(
                                'rounded-md border px-2 py-1.5',
                                deal.id === currentDealId
                                    ? 'border-[var(--event-current)] bg-muted/40'
                                    : 'border-border',
                                deal.closed && 'opacity-60',
                            )}
                        >
                            <div className="flex items-baseline justify-between gap-2">
                                <span className="min-w-0 truncate text-sm text-foreground">
                                    {deal.title}
                                </span>
                                <span className="flex shrink-0 items-baseline gap-2 text-xs text-muted-foreground">
                                    {dealAmount(deal.opportunity) && (
                                        <span className="font-medium text-foreground">
                                            {dealAmount(deal.opportunity)}
                                        </span>
                                    )}
                                    {deal.responsible?.name}
                                </span>
                            </div>
                            <StageMini
                                stage={deal.stage}
                                title={deal.title}
                                note={dealAmount(deal.opportunity)}
                                className="mt-1"
                            />
                        </li>
                    ))}
                </ul>
            </SectionState>
        </CardContent>
    </Card>
);

export default RelatedDealsCard;
