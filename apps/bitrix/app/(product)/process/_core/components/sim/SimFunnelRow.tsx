'use client';

import type { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';

export interface FunnelStageMark {
    code: string;
    label: string;
    /** Реальный цвет стадии из портала. */
    color: string;
    isTerminal?: boolean;
}

interface SimFunnelRowProps {
    label: string;
    stages: FunnelStageMark[];
    /** Индекс текущей стадии. -1 — сущности ещё нет. */
    currentIndex: number;
    isClosed: boolean;
    /** Почему сущность в этом состоянии — подсказка при наведении. */
    hint?: string;
}

/**
 * Одна воронка делениями по числу её стадий.
 *
 * Показываем всю лестницу, а не только текущую позицию: заказчику важно видеть,
 * сколько шагов всего и где он относительно них. Цвета делений — настоящие,
 * из портала, поэтому картинка совпадает с тем, что человек видит в своём
 * Битриксе. Подписи стадий — в подсказке при наведении.
 *
 * На узком экране строка ломается на две: сверху название и состояние, снизу
 * сама полоса во всю ширину. Иначе на подпись уходит половина экрана, а стадии
 * сжимаются в неразличимые полоски.
 */
export const SimFunnelRow: FC<SimFunnelRowProps> = ({
    label,
    stages,
    currentIndex,
    isClosed,
    hint,
}) => (
    <li
        title={hint}
        className="bg-card flex flex-col gap-1.5 rounded-lg border px-3 py-2 sm:flex-row sm:items-center sm:gap-3"
    >
        <span className="flex items-baseline gap-2 sm:contents">
            <span className="text-foreground truncate text-xs font-semibold sm:w-40 sm:shrink-0">
                {label}
            </span>
            <span
                className={cn(
                    'ml-auto text-[10px] font-bold tracking-wide uppercase sm:hidden',
                    isClosed ? 'text-muted-foreground/60' : 'text-success',
                )}
            >
                {isClosed ? 'закрыта' : 'открыта'}
            </span>
        </span>

        <span
            className="flex min-w-0 flex-1 gap-0.5"
            role="img"
            aria-label={`Стадия ${stages[currentIndex]?.label ?? '—'} из ${stages.length}`}
        >
            {stages.map((stage, index) => {
                const isPassed = index <= currentIndex;

                return (
                    <span
                        key={stage.code}
                        title={`${index + 1}. ${stage.label}${
                            stage.isTerminal ? ' · финал' : ''
                        }`}
                        className={cn(
                            'h-2.5 min-w-0 flex-1 rounded-sm transition-opacity',
                            stage.isTerminal && 'flex-[0.6]',
                            !isPassed && 'opacity-20',
                            isClosed && isPassed && 'opacity-55',
                        )}
                        style={{
                            backgroundColor: isPassed
                                ? stage.color
                                : 'var(--muted-foreground)',
                        }}
                    />
                );
            })}
        </span>

        <span className="text-muted-foreground truncate text-xs sm:w-36 sm:shrink-0 sm:text-right">
            {stages[currentIndex]?.label ?? '—'}
        </span>

        <span
            className={cn(
                'hidden w-16 shrink-0 text-right text-[10px] font-bold tracking-wide uppercase sm:block',
                isClosed ? 'text-muted-foreground/60' : 'text-success',
            )}
        >
            {isClosed ? 'закрыта' : 'открыта'}
        </span>
    </li>
);
