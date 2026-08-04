'use client';

import type { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { ProcessReadiness } from '../types';

/**
 * Честная пометка готовности.
 *
 * Пометка относится к ДОКУМЕНТУ, а не к продукту: так помечены куски, которые
 * здесь ещё дописываются. Страница объявляется каноном, поэтому недописанное
 * обязано выглядеть иначе, чем доведённое.
 */
export const ReadinessBadge: FC<{
    value: ProcessReadiness;
    className?: string;
}> = ({ value, className }) =>
    value === 'live' ? null : (
        <span
            title="Этот кусок раздела ещё дописывается"
            className={cn(
                'border-warning/50 text-warning shrink-0 rounded-full border border-dashed px-1.5 py-0.5 text-[10px] leading-tight whitespace-nowrap',
                className,
            )}
        >
            в разработке
        </span>
    );
