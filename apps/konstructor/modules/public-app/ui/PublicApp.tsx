'use client';

import type { ReactNode } from 'react';
import { BootPreloaderGate } from '@workspace/april-ui/feedback';
import { FlowLayout } from '@/modules/processes/konstructor';
import { ShellFrame } from '@/modules/shared';
import { FlowSurfaceProvider } from '@/modules/shared/lib/routing';
import { usePublicApp } from '../hooks/use-public-app';
import { PublicErrorScreen } from './PublicErrorScreen';
import { PublicGoneScreen } from './PublicGoneScreen';
import { PublicHeader } from './PublicHeader';

/**
 * Гейт публичной версии. Экран загрузки — общий boot-прелоадер из корня; шаги
 * те же, что во фрейме, адреса и состав задаёт поверхность.
 */
export const PublicApp = ({
    token,
    children,
}: {
    token: string;
    children: ReactNode;
}) => {
    const app = usePublicApp(token);

    return (
        <>
            <BootPreloaderGate ready={app.isSettled} />
            {app.isGone ? <PublicGoneScreen /> : null}
            {app.isFailed ? <PublicErrorScreen onRetry={app.retry} /> : null}
            {app.isReady ? (
                <FlowSurfaceProvider surface={app.surface}>
                    <ShellFrame header={<PublicHeader />}>
                        <FlowLayout>{children}</FlowLayout>
                    </ShellFrame>
                </FlowSurfaceProvider>
            ) : null}
        </>
    );
};
