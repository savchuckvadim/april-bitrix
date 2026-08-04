'use client';

import type { FC } from 'react';
import { Slider } from '@workspace/ui/components/slider';
import { cn } from '@workspace/ui/lib/utils';

/** Крупные размеры поверх базового Slider: пульт должен читаться издалека. */
const DIAL_SIZING =
    '[&_[data-slot=slider-track]]:h-4 [&_[data-slot=slider-track]]:rounded-full ' +
    '[&_[data-slot=slider-thumb]]:size-8 [&_[data-slot=slider-thumb]]:border-2 ' +
    '[&_[data-slot=slider-thumb]]:shadow-md';

interface CoverageDialProps {
    label: string;
    /** Куда растёт покрытие — задаёт направление заливки и позицию подписи. */
    direction: 'forward' | 'backward';
    value: number;
    onChange: (value: number) => void;
    /** Токен-классы заливки и акцента: лид и сделка окрашены по-разному. */
    rangeClass: string;
    thumbClass: string;
    valueClass: string;
    hint: string;
}

/** Одна ползунок покрытия — лид или сделка. */
export const CoverageDial: FC<CoverageDialProps> = ({
    label,
    direction,
    value,
    onChange,
    rangeClass,
    thumbClass,
    valueClass,
    hint,
}) => (
    <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-bold tracking-wide uppercase">
                {label}
            </span>
            <span
                className={cn(
                    'font-mono text-3xl leading-none font-bold tabular-nums',
                    valueClass,
                )}
            >
                {value}
                <span className="text-lg"> %</span>
            </span>
        </div>

        <Slider
            // Сделка растёт назад от конца — RTL заставляет полосу физически
            // заливаться справа налево, и направление читается без подписи.
            dir={direction === 'backward' ? 'rtl' : 'ltr'}
            value={[value]}
            min={0}
            max={100}
            step={5}
            onValueChange={next => onChange(next[0] ?? 0)}
            aria-label={`${label} — покрытие процесса в процентах`}
            className={cn(DIAL_SIZING, rangeClass, thumbClass)}
        />

        <p className="text-muted-foreground text-xs leading-snug">{hint}</p>
    </div>
);
