'use client';

import * as React from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';

export type StatusColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray';

const colorClasses: Record<StatusColor, string> = {
    green: 'border-transparent bg-green-500/15 text-green-700 dark:text-green-400',
    yellow: 'border-transparent bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
    red: 'border-transparent bg-red-500/15 text-red-700 dark:text-red-400',
    blue: 'border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400',
    gray: 'border-transparent bg-muted text-muted-foreground',
};

interface StatusBadgeProps {
    color: StatusColor;
    children: React.ReactNode;
    title?: string;
    className?: string;
}

/** Цветной статус-бейдж (общий для модулей маркетплейса). */
export function StatusBadge({ color, children, title, className }: StatusBadgeProps) {
    return (
        <Badge variant="outline" title={title} className={cn(colorClasses[color], className)}>
            {children}
        </Badge>
    );
}
