'use client';

import { FC } from 'react';
import {
    ToneBadge,
    type ToneBadgeSurface,
    type ToneBadgeVariant,
} from '../../../badges/ToneBadge';
import { EVENT_STATUS_BADGE, EventDeadlineStatus } from './event-badge-maps';

interface EventStatusBadgeProps {
    status: EventDeadlineStatus;
    /** По умолчанию soft — цвет остаётся сигналом, а не заливкой на каждой строке. */
    variant?: ToneBadgeVariant;
    /** Поверхность: в списках держите flat/glass, liquid — точечно. */
    surface?: ToneBadgeSurface;
    className?: string;
}

/** Бэйдж статуса срока события: запланирован / скоро / просрочен. */
export const EventStatusBadge: FC<EventStatusBadgeProps> = ({
    status,
    variant = 'soft',
    surface,
    className,
}) => {
    const badge = EVENT_STATUS_BADGE[status];
    return (
        <ToneBadge
            tone={badge.tone}
            variant={variant}
            surface={surface}
            className={className}
        >
            {badge.label}
        </ToneBadge>
    );
};
