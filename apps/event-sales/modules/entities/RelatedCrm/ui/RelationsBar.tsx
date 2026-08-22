'use client';

import { FC } from 'react';
import { HintTooltip } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { useRelationsBar } from '../lib/hooks/use-relations-bar';
import {
    MAX_RELATION_BARS,
    MAX_RELATION_BARS_COMPACT,
    type RelationsBarMode,
} from '../lib/relations-bar';
import { RelationBarSlot } from './RelationBarSlot';

interface RelationsBarProps {
    /**
     * Режим шапки: полоска и хвостик миниатюр в одну строку, без подписи
     * стадии. Высота — вес: каждая лишняя строка шапки это минус карточка
     * дела на экране 630×600.
     */
    compact?: boolean;
    /** Состав строки: всё, только основная, основная с заявками, только сделки. */
    mode?: RelationsBarMode;
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
    mode = 'all',
    className,
}) => {
    const bar = useRelationsBar(
        compact ? MAX_RELATION_BARS_COMPACT : MAX_RELATION_BARS,
        mode,
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
                // Подпись и в compact: название и стадия — ответ на «что
                // дальше», одна строка text-[0.6875rem] шапку не распирает.
                // Миниатюры остаются немыми.
                <RelationBarSlot
                    item={bar.main}
                    withLabel
                    className={cn('min-w-0 flex-1', compact && 'min-w-24')}
                />
            )}

            {bar.minis.map(item => (
                <div
                    key={`${item.kind}_${item.id}`}
                    className={cn('shrink-0', compact ? 'w-10' : 'w-16')}
                >
                    <RelationBarSlot item={item} />
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
