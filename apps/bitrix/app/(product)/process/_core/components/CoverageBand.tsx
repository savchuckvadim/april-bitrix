'use client';

import type { FC } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@workspace/ui/lib/utils';

/** Пружина покрытия: полоса должна догонять ползунок, а не ползти за ней. */
const BAND_SPRING = { type: 'spring', stiffness: 320, damping: 34 } as const;

export interface CoverageBandProps {
    /** Подпись сущности. */
    label: string;
    /** Индекс первой покрытой стадии. */
    from: number;
    /** Сколько стадий покрыто. 0 — покрытия нет. */
    count: number;
    /** Всего стадий в хребте. */
    total: number;
    /** С какой стороны растёт полоса — влияет только на позицию подписи. */
    direction: 'forward' | 'backward';
    /** Токен-цвет заливки, например `var(--event-lead)`. */
    color: string;
    className?: string;
}

/**
 * Полоса покрытия сущности над (или под) хребтом процесса.
 *
 * Проценты считаются от колонок сетки, поэтому полоса всегда попадает ровно
 * в границы стадий: колонка i занимает [i/total, (i+1)/total]. Никаких
 * измерений DOM — координаты выводятся из модели.
 */
export const CoverageBand: FC<CoverageBandProps> = ({
    label,
    from,
    count,
    total,
    direction,
    color,
    className,
}) => {
    const prefersReduced = useReducedMotion();
    const isEmpty = count <= 0 || total <= 0;

    const left = isEmpty
        ? direction === 'forward'
            ? 0
            : 100
        : (from / total) * 100;
    const width = isEmpty ? 0 : (count / total) * 100;

    return (
        <div
            className={cn('relative h-9 w-full', className)}
            aria-label={
                isEmpty
                    ? `${label}: не участвует в процессе`
                    : `${label}: покрывает ${count} из ${total} стадий`
            }
        >
            {/* Дорожка: показывает, сколько ещё может вырасти покрытие. */}
            <div className="border-border/60 absolute inset-0 rounded-full border border-dashed" />

            <motion.div
                className="absolute inset-y-0 flex items-center overflow-hidden rounded-full px-3"
                style={{
                    background: `linear-gradient(180deg, color-mix(in oklab, white 24%, ${color}), ${color})`,
                }}
                initial={false}
                animate={{ left: `${left}%`, width: `${width}%` }}
                transition={prefersReduced ? { duration: 0 } : BAND_SPRING}
            >
                {/* Блик сверху — та же «жидкая» подача, что у LiquidProgress. */}
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-40"
                    style={{
                        background:
                            'linear-gradient(180deg, color-mix(in oklab, white 35%, transparent), transparent)',
                    }}
                />
                <span
                    className={cn(
                        'relative truncate text-sm font-bold tracking-wide whitespace-nowrap text-white uppercase',
                        direction === 'backward' && 'ml-auto',
                    )}
                >
                    {label}
                </span>
            </motion.div>

            {isEmpty && (
                <span
                    className={cn(
                        'text-muted-foreground absolute inset-y-0 flex items-center text-xs',
                        direction === 'forward' ? 'left-3' : 'right-3',
                    )}
                >
                    {label} — не участвует
                </span>
            )}
        </div>
    );
};
