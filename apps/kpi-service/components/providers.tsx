'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Provider } from 'react-redux';
import { store } from '@/modules/app/model/store';
import { ApiProvider } from './api-provider';
import { AprilThemeProvider } from '@workspace/theme';
import { ErrorBoundary } from '@/modules/app/providers/ErrorBoundary';
import { App } from '@/modules/app/';
import { ReportProvider } from '@/modules/entities/report';

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
                                <ReportProvider>
                                    {children}
                                </ReportProvider>
                            </App>
                        </ErrorBoundary>
                    </ApiProvider>
                </AprilThemeProvider>
            </NextThemesProvider>
        </Provider>
    );
}
