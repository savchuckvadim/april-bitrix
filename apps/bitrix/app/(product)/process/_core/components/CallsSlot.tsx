'use client';

import type { FC, ReactNode } from 'react';
import { cn } from '@workspace/ui/lib/utils';

interface CallsSlotProps {
    /** Родительный падеж: «Карточка {лида}». */
    entityLabel: string;
    /** Токен-классы рамки активного слота. */
    accentClass: string;
    isActive: boolean;
    children: ReactNode;
}

/** Место, где может стоять форма «Звонки» — карточка лида или карточка сделки. */
export const CallsSlot: FC<CallsSlotProps> = ({
    entityLabel,
    accentClass,
    isActive,
    children,
}) => (
    <div
        className={cn(
            'flex min-h-28 flex-col rounded-xl border p-2.5 transition-colors',
            isActive ? accentClass : 'border-muted-foreground/30 border-dashed',
        )}
    >
        <p
            className={cn(
                'text-xs font-bold tracking-widest uppercase',
                !isActive && 'text-muted-foreground',
            )}
        >
            Карточка {entityLabel}
        </p>

        <div className="mt-2 flex-1">
            {isActive ? (
                children
            ) : (
                <p className="text-muted-foreground/70 text-xs">
                    Менеджер сюда не заходит
                </p>
            )}
        </div>
    </div>
);
