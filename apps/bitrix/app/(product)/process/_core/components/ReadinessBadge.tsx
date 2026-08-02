'use client';

import type { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { ProcessReadiness } from '../types';

/**
 * Честная пометка готовности.
 *
 * Страница объявляется каноном, поэтому то, чего в коде ещё нет, обязано
 * выглядеть иначе, чем то, что работает. Приём уже принят в /leads-process
 * (бейдж «проверка на дубли — в разработке»).
 */
export const ReadinessBadge: FC<{
    value: ProcessReadiness;
    className?: string;
}> = ({ value, className }) =>
    value === 'live' ? null : (
        <span
            title="Описано в проекте, но в коде этого пока нет"
            className={cn(
                'border-warning/50 text-warning shrink-0 rounded-full border border-dashed px-1.5 py-0.5 text-[10px] leading-tight whitespace-nowrap',
                className,
            )}
        >
            в разработке
        </span>
    );
