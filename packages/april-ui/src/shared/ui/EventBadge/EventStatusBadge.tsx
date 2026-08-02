'use client';

import { FC } from 'react';
import { ToneBadge, type ToneBadgeSurface } from '../../../badges/ToneBadge';
import { EVENT_STATUS_BADGE, EventDeadlineStatus } from './event-badge-maps';

interface EventStatusBadgeProps {
    status: EventDeadlineStatus;
    /** Поверхность: в списках держите flat/glass, liquid — точечно. */
    surface?: ToneBadgeSurface;
    className?: string;
}

/** Бэйдж статуса срока события: запланирован / скоро / просрочен. */
export const EventStatusBadge: FC<EventStatusBadgeProps> = ({
    status,
    surface,
    className,
}) => {
    const badge = EVENT_STATUS_BADGE[status];
    return (
        <ToneBadge tone={badge.tone} surface={surface} className={className}>
            {badge.label}
        </ToneBadge>
    );
};
