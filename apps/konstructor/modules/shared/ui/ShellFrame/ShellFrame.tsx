'use client';

import type { ReactNode } from 'react';

/**
 * Каркас экранов: шапка закреплена, скроллится только содержимое под ней.
 * scrollbar-gutter держит место под скроллбар — экран не дёргается, когда
 * содержимое перерастает высоту окна.
 */
export const ShellFrame = ({
    header,
    children,
}: {
    header: ReactNode;
    children: ReactNode;
}) => (
    <div className="flex h-svh flex-col bg-background">
        {header}
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-gutter:stable]">
            {children}
        </main>
    </div>
);
