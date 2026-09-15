'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@workspace/ui/lib/utils';
import { useReducedMotion } from '../../lib/use-reduced-motion';
import { AI_TITLE_GRADIENT } from './ai-fx';

const GradientText = dynamic(
    () => import('@workspace/ui/components/GradientText'),
    { ssr: false },
);

export interface AiTabTitleProps {
    children: ReactNode;
    /** Палитра градиента (hex — параметр эффекта). */
    gradient?: string[];
    /** Длительность цикла анимации, сек. */
    animationSpeed?: number;
    className?: string;
}

/**
 * Заголовок вкладки AI-аналитики: анимированный градиентный текст
 * (reactbits GradientText) — единственная обёртка над эффектом в монорепе.
 * При «меньше движения» — обычный текст без анимации.
 */
export const AiTabTitle = ({
    children,
    gradient = AI_TITLE_GRADIENT,
    animationSpeed = 8,
    className,
}: AiTabTitleProps) => {
    const reducedMotion = useReducedMotion();
    const heading = (
        <h2 className={cn('text-xl font-semibold tracking-tight', className)}>
            {children}
        </h2>
    );

    if (reducedMotion) return heading;

    return (
        <GradientText
            colors={gradient}
            animationSpeed={animationSpeed}
            className="!m-0 !cursor-default !rounded-none !backdrop-blur-none"
        >
            {heading}
        </GradientText>
    );
};
