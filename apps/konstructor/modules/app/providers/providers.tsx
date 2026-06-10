'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Provider } from 'react-redux';
import { store } from '@/modules/app/model/store';
import { ApiProvider } from './ApiProvider';
import App from '@/modules/app/ui/App';
import { ErrorBoundary } from '@/modules/app/providers/ErrorBoundary';
import { AprilThemeProvider } from './AprilThemeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
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
                        <ErrorBoundary>
                            <App>
                                {children}
                            </App>
                        </ErrorBoundary>
                    </ApiProvider>
                </AprilThemeProvider>
            </NextThemesProvider>
        </Provider>
    );
}
