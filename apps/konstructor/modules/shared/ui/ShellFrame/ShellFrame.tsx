'use client';

import type { ReactNode } from 'react';
import { cn } from '@workspace/ui/lib/utils';

export interface ShellFrameProps {
    header: ReactNode;
    children: ReactNode;
    /**
     * Вкладка карточки CRM: приложение карточкой со скруглёнными углами на
     * фоне карточки Битрикса — в любой теме, без острых углов фрейма.
     */
    framed?: boolean;
}

/**
 * Каркас экранов: шапка закреплена, скроллится только содержимое под ней.
 * scrollbar-gutter держит место под скроллбар — экран не дёргается, когда
 * содержимое перерастает высоту окна.
 */
export const ShellFrame = ({ header, children, framed = false }: ShellFrameProps) => (
    <div className={cn('h-svh', framed && 'bg-air-host-background')}>
        <div
            className={cn(
                'flex h-full flex-col bg-background',
                framed && 'overflow-hidden rounded-xl border border-border/60',
            )}
        >
            {header}
            <main className="flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-gutter:stable]">
                {children}
            </main>
        </div>
    </div>
);
