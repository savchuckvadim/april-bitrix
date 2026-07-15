'use client';

import { FC } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';
import {
    DEFAULT_EVENT_TYPE_BADGE_CLASS,
    EVENT_TYPE_BADGE_CLASS,
} from './event-badge-maps';

interface EventTypeBadgeProps {
    /** Русское название типа события (EV_TYPE): Холодный, Звонок, Презентация, … */
    type: string;
    className?: string;
}

/** Бэйдж типа события в цвете токена типа. */
export const EventTypeBadge: FC<EventTypeBadgeProps> = ({ type, className }) => (
    <Badge
        className={cn(
            'uppercase',
            EVENT_TYPE_BADGE_CLASS[type] ?? DEFAULT_EVENT_TYPE_BADGE_CLASS,
            className,
        )}
    >
        {type}
    </Badge>
);
