'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AppProvider } from '@/modules/app';
import { AprilThemeProvider } from '@workspace/theme';
import { ReactQueryProvider } from './tanstack-query.provider';
// import { ApiInitializer } from './api-initializer';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="bx-light"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
        >
            <AprilThemeProvider>
                <ReactQueryProvider>
                    {/* <ApiInitializer /> */}
                    <Toaster richColors position="top-right" />
                    <AppProvider>{children}</AppProvider>
                </ReactQueryProvider>
            </AprilThemeProvider>
        </NextThemesProvider>
    );
}
