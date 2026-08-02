'use client';

import { FC } from 'react';
import { ToneBadge, type ToneBadgeSurface } from '../../../badges/ToneBadge';
import { DEFAULT_EVENT_TYPE_TONE, EVENT_TYPE_TONE } from './event-badge-maps';

interface EventTypeBadgeProps {
    /** Русское название типа события (EV_TYPE): Холодный, Звонок, Презентация, … */
    type: string;
    /** Поверхность: в списках держите flat/glass, liquid — точечно. */
    surface?: ToneBadgeSurface;
    className?: string;
}

/** Бэйдж типа события в цвете токена типа. */
export const EventTypeBadge: FC<EventTypeBadgeProps> = ({
    type,
    surface,
    className,
}) => (
    <ToneBadge
        tone={EVENT_TYPE_TONE[type] ?? DEFAULT_EVENT_TYPE_TONE}
        surface={surface}
        uppercase
        className={className}
    >
        {type}
    </ToneBadge>
);
