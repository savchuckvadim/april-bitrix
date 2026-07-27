'use client';

import { HTMLAttributes } from 'react';
import { GlassSurface } from './GlassSurface';
import './GlassCard.css';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * soft (дефолт) — читаемое стекло для контента;
     * strong — прозрачнее, для декоративных поверхностей;
     * liquid — «жидкое стекло» с рефракцией фона (GlassSurface, Chromium;
     * в Safari/Firefox автоматический откат к soft-рецепту).
     */
    intensity?: 'soft' | 'strong' | 'liquid';
}

/** Стеклянная карточка монорепы: сюда же складываем прочие glass-поверхности. */
export const GlassCard = ({
    intensity = 'soft',
    className = '',
    children,
    ...rest
}: GlassCardProps) => {
    if (intensity === 'liquid') {
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
