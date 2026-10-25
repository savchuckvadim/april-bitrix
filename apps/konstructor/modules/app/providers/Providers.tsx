'use client';

import type { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { AprilThemeProvider } from '@workspace/theme';
import { store } from '@/modules/app/model/store';
import { ApiProvider } from './ApiProvider';
import { ErrorBoundary } from './ErrorBoundary';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <Provider store={store}>
            <NextThemesProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
                enableColorScheme
            >
                <AprilThemeProvider>
                    <ApiProvider>
                        <ErrorBoundary>{children}</ErrorBoundary>
                        {/* тосты вместо легаси window.alert (этап 10) */}
                        <Toaster richColors position="top-right" />
                    </ApiProvider>
                </AprilThemeProvider>
            </NextThemesProvider>
        </Provider>
    );
}
