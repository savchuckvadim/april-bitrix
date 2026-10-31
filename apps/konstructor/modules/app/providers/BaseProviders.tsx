'use client';

import type { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AprilThemeProvider } from '@workspace/theme';
import { ErrorBoundary } from './ErrorBoundary';

/** Общая база поверхностей: тема, перехват ошибок, тосты. Стор добавляет каждая своя. */
export function BaseProviders({ children }: { children: ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
        >
            <AprilThemeProvider>
                <ErrorBoundary>{children}</ErrorBoundary>
                {/* тосты вместо легаси window.alert (этап 10) */}
                <Toaster richColors position="top-right" />
            </AprilThemeProvider>
        </NextThemesProvider>
    );
}
