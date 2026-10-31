'use client';

import type { ReactNode } from 'react';
import { ShellFrame } from '@/modules/shared';
import { AppHeader } from './AppHeader';

/** Каркас экранов во фрейме: шапка с клиентом и сделкой над содержимым. */
export const AppShell = ({ children }: { children: ReactNode }) => (
    <ShellFrame header={<AppHeader />}>{children}</ShellFrame>
);
