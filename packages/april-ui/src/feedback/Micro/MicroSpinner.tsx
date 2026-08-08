'use client';

import { useId } from 'react';
import { LoaderPinwheel } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { TIMER_GRADIENT } from '../Processing/processing-fx';

export interface MicroSpinnerProps {
    /** Размер иконки в px. */
    size?: number;
    className?: string;
    /** Палитра штриха и свечения; по умолчанию — как у кольца отчёта kpi-sales. */
    gradient?: string[];
    /** Мягкое вращающееся conic-свечение позади цветочка (эффект таймера отчёта). */
    glow?: boolean;
}

/**
 * Микро-спиннер: крутящийся «цветочек» (LoaderPinwheel) с градиентным
 * штрихом фирменной палитры. Для микро-кнопок, pbx-полей и любых мест,
 * где грузится один элемент, а не экран. Градиент настоящий: скрытый
 * svg-градиент документа подключается к штриху иконки через url(#id).
 */
export const MicroSpinner = ({
    size = 14,
    className,
    gradient = TIMER_GRADIENT,
    glow = false,
}: MicroSpinnerProps) => {
    // Двоеточия из useId ломают url(#id) в CSS-значении stroke.
    const gradientId = `micro-spin-${useId().replace(/:/g, '')}`;

    return (
        <span
            role="status"
            aria-label="Загрузка"
            className={cn(
                'relative inline-flex shrink-0 items-center justify-center',
                className,
            )}
            style={{ width: size, height: size }}
        >
            <svg width="0" height="0" className="absolute" aria-hidden>
                <defs>
                    <linearGradient
                        id={gradientId}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop offset="0%" stopColor={gradient[0]} />
                        <stop
                            offset="50%"
                            stopColor={gradient[1] ?? gradient[0]}
                        />
                        <stop
                            offset="100%"
                            stopColor={gradient[2] ?? gradient[0]}
                        />
                    </linearGradient>
                </defs>
            </svg>

            {glow && (
                <span
                    aria-hidden
                    className="absolute inset-0 animate-spin rounded-full opacity-50 blur-[3px] motion-reduce:animate-none"
                    style={{
                        animationDuration: '3s',
                        background: `conic-gradient(from 0deg, ${gradient.join(', ')})`,
                    }}
                />
            )}

            <LoaderPinwheel
                aria-hidden
                size={size}
                // Толще штатного (2): на 12–16px тонкий градиентный штрих мутнеет.
                strokeWidth={2.5}
                className="relative animate-spin motion-reduce:animate-none"
                style={{
                    stroke: `url(#${gradientId})`,
                    animationDuration: '1.6s',
                }}
            />
        </span>
    );
};
