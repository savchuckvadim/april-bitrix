'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { LoadingScreen } from '@/modules/shared';

import { useApp } from '../lib/hooks/app';
import { NON_AUTH_ERROR } from '../lib/initialize/app-init/app-init.util';
import { IS_PROD } from '../consts/app-global';
import { store } from '../model/store';
import { NonAuthScreen } from './NonAuthScreen';

export const App = ({ children }: { children: ReactNode }) => {
    const { app, initialized, isLoading, isClient } = useApp();

    // Dev-консоль: store.getState() в браузере (рецепты — docs/dev-guide.md §8)
    useEffect(() => {
        if (!IS_PROD && typeof window !== 'undefined') {
            (window as unknown as { store: typeof store }).store = store;
        }
    }, []);

    if (isClient && app.error.status && app.error.message === NON_AUTH_ERROR) {
        return <NonAuthScreen />;
    }

    return (
        <div className="h-calc(100vh - 300px)">
            {isClient && initialized && !isLoading ? children : <LoadingScreen />}
        </div>
    );
};

export default App;
