'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AppProvider } from '@/modules/app';
import { AuthProvider } from '@/modules/features/auth';
import { AprilThemeProvider } from '@workspace/theme';
import { ReactQueryProvider } from './tanstack-query.provider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="default-dark" //bx-dark
            enableSystem
            disableTransitionOnChange
            enableColorScheme
        >      <AprilThemeProvider>
                <ReactQueryProvider>
                    <Toaster richColors position="top-right" />
                    <AuthProvider>
                        <AppProvider>{children}</AppProvider>
                    </AuthProvider>
                </ReactQueryProvider>
            </AprilThemeProvider>
        </NextThemesProvider>
    );
}
