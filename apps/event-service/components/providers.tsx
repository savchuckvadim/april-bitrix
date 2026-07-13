'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Provider } from 'react-redux';
import { store } from '@/modules/app/model/store';
import { ApiProvider } from './api-provider';
import { AprilThemeProvider } from '@/modules/app/providers/AprilThemeProvider';
import App from '@/modules/app/ui/App';
import { ErrorBoundary } from '@/modules/app/providers/ErrorBoundary';
import { EventRouter } from '@/modules/processes/event';

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
                            {/* FSD process router: drives the current page via Next.js */}
                            <EventRouter />
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
