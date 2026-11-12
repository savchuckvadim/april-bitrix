'use client';

import type { ReactNode } from 'react';
import { HostFrame } from '@workspace/april-ui/surfaces';

export interface ShellFrameProps {
    header: ReactNode;
    children: ReactNode;
    /** Вкладка карточки CRM: скруглённые углы на фоне карточки Битрикса. */
    framed?: boolean;
}

/**
 * Каркас экранов: шапка закреплена, скроллится только содержимое под ней.
 * scrollbar-gutter держит место под скроллбар — экран не дёргается, когда
 * содержимое перерастает высоту окна.
 */
export const ShellFrame = ({ header, children, framed = false }: ShellFrameProps) => (
    <HostFrame framed={framed} className="flex flex-col">
        {header}
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-gutter:stable]">
            {children}
        </main>
    </HostFrame>
);
