'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AppProvider } from '@/modules/app';
import { AprilThemeProvider } from '@workspace/theme';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="bx-dark"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
        >      <AprilThemeProvider>
                <AppProvider>{children}</AppProvider>
            </AprilThemeProvider>
        </NextThemesProvider>
    );
}
