'use client';

import { FC } from 'react';
import { HintTooltip } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { useRelationsBar } from '../lib/hooks/use-relations-bar';
import {
    MAX_RELATION_BARS,
    MAX_RELATION_BARS_COMPACT,
} from '../lib/relations-bar';
import { dealAmount } from '../lib/stage-view';
import { DealStageBar } from './DealStageBar';
import { LeadStageBar } from './LeadStageBar';

interface RelationsBarProps {
    /**
     * Режим шапки: полоска и хвостик миниатюр в одну строку, без подписи
     * стадии. Высота — вес: каждая лишняя строка шапки это минус карточка
     * дела на экране 630×600.
     */
    compact?: boolean;
    className?: string;
}

/**
 * Куда движется клиент — одной строкой над работой.
 *
 * Крупная полоска — сделка, в которой мы сейчас: её стадия отвечает на главный
 * вопрос «что дальше». Следом миниатюрами остальные открытые сделки и заявки:
 * видно, что у клиента происходит ещё, но они не спорят с основной. Что не
 * поместилось — уходит в «+N» с тултипом, а не пропадает молча.
 */
export const RelationsBar: FC<RelationsBarProps> = ({
    compact = false,
    className,
}) => {
    const bar = useRelationsBar(
        compact ? MAX_RELATION_BARS_COMPACT : MAX_RELATION_BARS,
    );

    if (!bar.main && !bar.minis.length) return null;

    return (
        <div
            className={cn(
                'flex min-w-0 items-center',
                compact ? 'gap-1.5' : 'gap-3',
                className,
            )}
        >
            {bar.main && (
                <DealStageBar
                    className={cn('min-w-0 flex-1', compact && 'min-w-24')}
                    stage={bar.main.stage}
                    title={bar.main.title}
                    note={dealAmount(bar.main.opportunity)}
                    withLabel={!compact}
                />
            )}

            {bar.minis.map(item => (
                <div
                    key={`${item.kind}_${item.id}`}
                    className={cn('shrink-0', compact ? 'w-10' : 'w-16')}
                >
                    {item.kind === 'deal' && item.deal ? (
                        <DealStageBar
                            stage={item.deal.stage}
                            title={item.deal.title}
                            note={dealAmount(item.deal.opportunity)}
                        />
                    ) : (
                        <LeadStageBar
                            statusId={item.lead?.statusId}
                            title={item.title}
                        />
                    )}
                </div>
            ))}

            {bar.hidden.length > 0 && (
                <HintTooltip
                    title={`Ещё ${bar.hidden.length} в работе`}
                    lines={bar.hidden}
                >
                    <span className="shrink-0 cursor-default text-[0.625rem] text-muted-foreground/70">
                        +{bar.hidden.length}
                    </span>
                </HintTooltip>
            )}
        </div>
    );
};
