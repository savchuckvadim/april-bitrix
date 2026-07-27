'use client';

import React from 'react';
import { cn } from '@workspace/ui/lib/utils';

export type LiquidProgressTone = 'success' | 'warning' | 'destructive';

export interface LiquidProgressProps {
    /** Достижение в долях (0.84 = 84%); может быть > 1 (перевыполнение). */
    value: number;
    /**
     * Ожидаемое положение к текущему моменту в долях (риска на полосе):
     * «где сотрудник должен быть сейчас». undefined — без риски.
     */
    expected?: number;
    /** Тон заливки (обычно от сравнения value с expected). */
    tone?: LiquidProgressTone;
    /** Высота полосы. */
    size?: 'sm' | 'md';
    className?: string;
}

/** Токен-градиенты заливки (жидкое стекло: светлый блик сверху). */
const TONE_GRADIENT: Record<LiquidProgressTone, string> = {
    success:
        'linear-gradient(180deg, color-mix(in oklab, white 22%, var(--success)), var(--success))',
    warning:
        'linear-gradient(180deg, color-mix(in oklab, white 22%, var(--warning)), var(--warning))',
    destructive:
        'linear-gradient(180deg, color-mix(in oklab, white 22%, var(--destructive)), var(--destructive))',
};

/**
 * «Жидкий» прогресс-бар достижения плана: полоса-заливка токен-градиентом
 * с плавной анимацией ширины, блик сверху, вертикальная риска «ожидаемое
 * сейчас». Значения > 100% прижимаются к полной полосе (число подписи
 * показывает реальный %). Никаких хардкод-цветов — только токены тем.
 */
export const LiquidProgress: React.FC<LiquidProgressProps> = ({
    value,
    expected,
    tone = 'success',
    size = 'md',
    className,
}) => {
    const fillShare = Math.max(0, Math.min(value, 1));
    const expectedShare =
        expected === undefined ? null : Math.max(0, Math.min(expected, 1));

    return (
        <div
            className={cn(
                'relative w-full overflow-hidden rounded-full bg-muted',
                size === 'sm' ? 'h-2' : 'h-3',
                className,
            )}
        >
            <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{
                    width: `${fillShare * 100}%`,
                    background: TONE_GRADIENT[tone],
                }}
            />
            {/* Блик «жидкого стекла» поверх заливки */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-full opacity-40"
                style={{
                    background:
                        'linear-gradient(180deg, color-mix(in oklab, white 35%, transparent), transparent)',
                }}
            />
            {expectedShare !== null && (
                <div
                    className="absolute top-0 h-full w-0.5 bg-foreground/50"
                    style={{ left: `${expectedShare * 100}%` }}
                    title="Ожидаемое выполнение к текущему моменту"
                />
            )}
        </div>
    );
};
