'use client';

import { HTMLAttributes } from 'react';
import { GlassSurface } from './GlassSurface';
import { useGlass } from '../../../lib/glass/use-glass';
import './GlassCard.css';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * soft (дефолт) — читаемое стекло для контента;
     * strong — прозрачнее, для декоративных поверхностей;
     * liquid — «жидкое стекло» с рефракцией фона (GlassSurface, Chromium;
     * в Safari/Firefox автоматический откат к soft-рецепту).
     */
    intensity?: 'soft' | 'strong' | 'liquid';
}

/**
 * Стеклянная карточка монорепы: сюда же складываем прочие glass-поверхности.
 *
 * Когда стекло выключено (data-glass="off" или системное «меньше
 * прозрачности»), liquid деградирует до обычной карточки и GlassSurface не
 * рендерится вовсе — иначе в DOM остаётся SVG-фильтр и лишний композиторский
 * слой ради невидимого эффекта. Вид soft/strong гасится токенами
 * (packages/ui/src/styles/tokens/effects.css).
 */
export const GlassCard = ({
    intensity = 'soft',
    className = '',
    children,
    ...rest
}: GlassCardProps) => {
    const { enabled } = useGlass();

    if (intensity === 'liquid' && enabled) {
        return (
            <GlassSurface
                backgroundOpacity={0.4}
                saturation={1.6}
                className={className}
                {...rest}
            >
                {children}
            </GlassSurface>
        );
    }

    return (
        <div
            className={`april-glass-card ${
                intensity === 'strong' ? 'april-glass-card--strong' : ''
            } ${className}`}
            {...rest}
        >
            {children}
        </div>
    );
};
