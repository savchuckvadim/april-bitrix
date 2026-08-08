'use client';

import { FC } from 'react';
import {
    ToneBadge,
    type ToneBadgeSize,
    type ToneBadgeSurface,
    type ToneBadgeVariant,
} from '../../../badges/ToneBadge';
import { DEFAULT_EVENT_TYPE_TONE, EVENT_TYPE_TONE } from './event-badge-maps';

interface EventTypeBadgeProps {
    /** Русское название типа события (EV_TYPE): Холодный, Звонок, Презентация, … */
    type: string;
    /**
     * По умолчанию soft: сплошные заливки капсом на каждой карточке складывались
     * в «светофор» — приложение живёт во фрейме-миниатюре, где это давит вдвойне.
     * solid оставлен для точечных акцентов.
     */
    variant?: ToneBadgeVariant;
    /** Поверхность: в списках держите flat/glass, liquid — точечно. */
    surface?: ToneBadgeSurface;
    size?: ToneBadgeSize;
    className?: string;
}

/** Бэйдж типа события в цвете токена типа. */
export const EventTypeBadge: FC<EventTypeBadgeProps> = ({
    type,
    variant = 'soft',
    surface,
    size,
    className,
}) => (
    <ToneBadge
        tone={EVENT_TYPE_TONE[type] ?? DEFAULT_EVENT_TYPE_TONE}
        variant={variant}
        surface={surface}
        size={size}
        className={className}
    >
        {type}
    </ToneBadge>
);
