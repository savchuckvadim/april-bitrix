'use client';

import { useEffect } from 'react';
import LoadingScreen from './LoadingScreen/LoadingScreen';
import { useApp } from '../lib/hooks/useApp';
import { useAppSelector } from '../lib/hooks/redux';
import { NON_AUTH_ERROR } from '../lib/initialize/app-init.util';
import { BOOT_PRELOADER_ID, BOOT_PRELOADER_HIDE_CLASS } from '@workspace/april-ui/feedback';
import { NonAuthScreen } from './NonAuthScreen';

export const App = ({ children }: { children: React.ReactNode }) => {
    const { initialized, isMounted, isLoading } = useApp();
    const error = useAppSelector(state => state.app.error);

    // JS загрузился — гасим SSR boot-прелоадер (дальше экраны App).
    useEffect(() => {
        if (!isMounted) return;
        const boot = document.getElementById(BOOT_PRELOADER_ID);
        if (!boot) return;
        boot.classList.add(BOOT_PRELOADER_HIDE_CLASS);
        const timer = setTimeout(() => boot.remove(), 400);
        return () => clearTimeout(timer);
    }, [isMounted]);

    if (isMounted && error.status) {
        return error.message === NON_AUTH_ERROR ? (
            <NonAuthScreen />
        ) : (
            <div className="flex min-h-screen items-center justify-center p-4 text-muted-foreground">
                {error.message || 'Ошибка инициализации приложения'}
            </div>
        );
    }

    return (
        <div className="h-calc(100vh - 300px) p-4">
            {isMounted && initialized && !isLoading ? (
                children
            ) : (
                <LoadingScreen />
            )}
        </div>
    );
};

export default App;
