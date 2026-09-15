'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@workspace/ui/lib/utils';
import { useGlass } from '../../lib/glass/use-glass';
import { useReducedMotion } from '../../lib/use-reduced-motion';
import { AI_AURORA_COLOR_STOPS, AI_AURORA_FADE_MS } from './ai-fx';

const Aurora = dynamic(() => import('@workspace/ui/components/Aurora'), {
    ssr: false,
});

export interface AiTabAuroraProps {
    /** Стопы сияния (hex — параметры шейдера). */
    colorStops?: string[];
    amplitude?: number;
    blend?: number;
    /** Итоговая непрозрачность слоя после затухания. */
    opacity?: number;
    className?: string;
}

/**
 * Северное сияние под шапкой вкладки AI-аналитики (reactbits Aurora, WebGL)
 * — единственная обёртка над эффектом в монорепе. Грузится без SSR,
 * проявляется затуханием; не рендерится вовсе при выключенном стекле
 * (общий выключатель data-glass) и при «меньше движения» — WebGL-цикл
 * ради невидимого эффекта не нужен.
 *
 * Позиционируется абсолютно: родитель должен быть relative + overflow-hidden.
 */
export const AiTabAurora = ({
    colorStops = AI_AURORA_COLOR_STOPS,
    amplitude = 1,
    blend = 0.5,
    opacity = 0.55,
    className,
}: AiTabAuroraProps) => {
    const { enabled } = useGlass();
    const reducedMotion = useReducedMotion();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Первый кадр прозрачный, затем плавное проявление.
        const frame = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    if (!enabled || reducedMotion) return null;

    return (
        <div
            aria-hidden
            className={cn(
                'pointer-events-none absolute inset-0 transition-opacity ease-out',
                className,
            )}
            style={{
                opacity: visible ? opacity : 0,
                transitionDuration: `${AI_AURORA_FADE_MS}ms`,
            }}
        >
            <Aurora colorStops={colorStops} amplitude={amplitude} blend={blend} />
        </div>
    );
};
