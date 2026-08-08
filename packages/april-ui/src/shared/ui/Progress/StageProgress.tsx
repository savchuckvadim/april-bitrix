'use client';

import React from 'react';
import { cn } from '@workspace/ui/lib/utils';

/**
 * Опорные цвета градиента по умолчанию — воронка сделки в порядке стадий
 * (--deal-stage-* из april-tokens.css): жёлтый → фиолетовый → огненный →
 * красно-фиолетовый → тёмно-синий.
 */
const DEAL_STAGE_RAMP = [
    'var(--deal-stage-pres)',
    'var(--deal-stage-docs)',
    'var(--deal-stage-decision)',
    'var(--deal-stage-payment)',
    'var(--deal-stage-supply)',
];

/** Больше насечек на 3px-полосе уже не различить — прячем их вовсе. */
const MAX_TICKS = 12;

export interface StageProgressProps {
    /** Доля пройденной воронки: 0…1. */
    value: number;
    /** Всего стадий — рисует насечки границ. Не задано или > 12 — без насечек. */
    total?: number;
    /**
     * CSS-цвета опорных точек градиента. По умолчанию — токены воронки
     * сделки; можно передать живые цвета стадий портала.
     */
    ramp?: string[];
    /**
     * По чему растянут градиент:
     * - 'track' (дефолт) — на весь трек, заливка обрезает: цвет на срезе
     *   соответствует позиции в общей палитре;
     * - 'fill' — ровно по заполненной части: градиент начинается первым
     *   цветом рампы и ЗАКАНЧИВАЕТСЯ последним на срезе. Для рампы из
     *   реальных цветов пройденных стадий (конец = цвет текущей стадии).
     */
    rampScope?: 'track' | 'fill';
    /** Блик-переливание по заполненной части (гасится prefers-reduced-motion). */
    shimmer?: boolean;
    className?: string;
}

/**
 * Очень тонкий стадийный прогресс: закрашенное — пройденные стадии, пробел
 * справа — сколько осталось. Заливка — градиент через цвета стадий, при этом
 * градиент растянут на всю ширину трека и обрезан заливкой: цвет на срезе
 * соответствует текущей стадии, а не концу палитры.
 *
 * Компонент только про полосу — подписи (название, «3 / 8») остаются у
 * консюмера: в разных местах они разные, а полоса везде одна.
 */
export const StageProgress: React.FC<StageProgressProps> = ({
    value,
    total,
    ramp = DEAL_STAGE_RAMP,
    rampScope = 'track',
    shimmer = false,
    className,
}) => {
    const share = Math.max(0, Math.min(value, 1));
    const ticks =
        total && total > 1 && total <= MAX_TICKS
            ? Array.from({ length: total - 1 }, (_, index) => (index + 1) / total)
            : [];

    return (
        <div
            className={cn(
                // 4px: на 3px градиент стадий читался с трудом.
                'relative h-1 w-full rounded-full bg-foreground/10',
                className,
            )}
        >
            {share > 0 && (
                <div
                    className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
                    style={{
                        width: `${share * 100}%`,
                        backgroundImage: `linear-gradient(90deg, ${
                            ramp.length === 1
                                ? `${ramp[0]}, ${ramp[0]}`
                                : ramp.join(', ')
                        })`,
                        backgroundSize:
                            rampScope === 'fill'
                                ? '100% 100%'
                                : `${100 / share}% 100%`,
                    }}
                >
                    {shimmer && (
                        <span
                            aria-hidden
                            className="absolute inset-0 animate-stage-sheen bg-[linear-gradient(100deg,transparent_32%,color-mix(in_oklab,white_45%,transparent)_50%,transparent_68%)] bg-[length:240%_100%] motion-reduce:hidden"
                        />
                    )}
                </div>
            )}

            {ticks.map(position => (
                <span
                    key={position}
                    aria-hidden
                    className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-card"
                    style={{ left: `${position * 100}%` }}
                />
            ))}
        </div>
    );
};
