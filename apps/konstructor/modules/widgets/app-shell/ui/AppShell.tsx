'use client';

import type { ReactNode } from 'react';
import { AppHeader } from './AppHeader';

/**
 * Каркас экранов во фрейме: шапка закреплена, скроллится только содержимое
 * под ней. scrollbar-gutter держит место под скроллбар — экран не дёргается,
 * когда содержимое перерастает высоту фрейма.
 */
export const AppShell = ({ children }: { children: ReactNode }) => (
    <div className="flex h-svh flex-col bg-background">
        <AppHeader />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-gutter:stable]">
            {children}
        </main>
    </div>
);
