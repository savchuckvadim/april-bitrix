'use client';

import type { ReactNode } from 'react';
import { cn } from '@workspace/ui/lib/utils';

export interface HostFrameProps {
    /**
     * Вкладка карточки CRM («маленький экран»): приложение карточкой со
     * скруглёнными углами на фоне карточки Битрикса — в любой теме, без
     * острых углов фрейма.
     */
    framed: boolean;
    children: ReactNode;
    /** Раскладка внутренней карточки: flex-col, отступы и т.п. */
    className?: string;
}

/**
 * Каркас приложения на всю высоту фрейма. Скролл — внутри приложения:
 * фрейм во вкладке карточки подгоняется под окно браузера
 * (`watchSmallFrameHeight` из @workspace/bitrix), а не под контент.
 */
export const HostFrame = ({ framed, children, className }: HostFrameProps) => (
    <div className={cn('h-svh', framed && 'bg-air-host-background')}>
        <div
            className={cn(
                'h-full bg-background',
                framed && 'overflow-hidden rounded-xl border border-border/60',
                className,
            )}
        >
            {children}
        </div>
    </div>
);
