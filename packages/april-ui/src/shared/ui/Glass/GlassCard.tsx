'use client';

import { HTMLAttributes } from 'react';
import './GlassCard.css';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * soft (дефолт) — читаемое стекло для контента;
     * strong — прозрачнее, для декоративных поверхностей.
     */
    intensity?: 'soft' | 'strong';
}

/** Стеклянная карточка монорепы: сюда же складываем прочие glass-поверхности. */
export const GlassCard = ({
    intensity = 'soft',
    className = '',
    children,
    ...rest
}: GlassCardProps) => (
    <div
        className={`april-glass-card ${
            intensity === 'strong' ? 'april-glass-card--strong' : ''
        } ${className}`}
        {...rest}
    >
        {children}
    </div>
);
