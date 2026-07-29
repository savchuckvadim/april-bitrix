'use client';

import type { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Provider } from 'react-redux';
import { store } from '@/modules/app/model/store';
import { ApiProvider } from './ApiProvider';
import { ErrorBoundary } from './ErrorBoundary';
import { AprilThemeProvider } from './AprilThemeProvider';

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
                    </ApiProvider>
                </AprilThemeProvider>
            </NextThemesProvider>
        </Provider>
    );
}
