'use client';

import { FC } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';
import { EVENT_STATUS_BADGE, EventDeadlineStatus } from './event-badge-maps';

interface EventStatusBadgeProps {
    status: EventDeadlineStatus;
    className?: string;
}

/** Бэйдж статуса срока события: запланирован / скоро / просрочен. */
export const EventStatusBadge: FC<EventStatusBadgeProps> = ({
    status,
    className,
}) => {
    const badge = EVENT_STATUS_BADGE[status];
    return <Badge className={cn(badge.className, className)}>{badge.label}</Badge>;
};
