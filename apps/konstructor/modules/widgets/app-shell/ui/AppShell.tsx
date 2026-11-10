'use client';

import type { ReactNode } from 'react';
import { useSmallDisplay } from '@/modules/app/lib/hooks/use-small-display';
import { ShellFrame } from '@/modules/shared';
import { AppHeader } from './AppHeader';

/** Каркас экранов во фрейме: шапка с клиентом и сделкой над содержимым. */
export const AppShell = ({ children }: { children: ReactNode }) => {
    const { isSmall } = useSmallDisplay();
    return (
        <ShellFrame header={<AppHeader />} framed={isSmall}>
            {children}
        </ShellFrame>
    );
};
