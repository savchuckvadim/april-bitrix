'use client';

import { useAppDispatch, useAppSelector } from '../lib/hooks/redux';
import { initial } from '../model/thunk/AppThunk';
import { useEffect, useState } from 'react';

import { ErrorBoundary } from '../providers/ErrorBoundary';
import { logClient } from '../lib/helper/logClient';
import { BootPreloaderGate } from '@workspace/april-ui/feedback';
import { APP_TITLE } from '../consts/app';

import { useApp } from '../lib/hooks/app';
import { store } from '../model/store';
// import { Preloader } from "@workspace/ui";
//@ts-ignore

export const App = ({ children }: { children: React.ReactNode }) => {
    const { initialized, isLoading, isClient } = useApp();

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isClient) {
            if (isMounted) {
                if (typeof window !== 'undefined') {

                    (window as any).store = store;
                }
            }
        }
    }, [isMounted]);

    const isReady = isClient && initialized && !isLoading;

    /*
     * Экран загрузки ровно один — SSR boot-прелоадер из корневого layout.
     * Он же ждёт данные: гасим его не по факту гидратации, а по готовности
     * приложения. Раньше здесь стоял собственный LoadingScreen с другим
     * знаком (/logo/logo.svg), и на стыке было видно подмену прелоадера.
     */
    return (
        <div className="h-calc(100vh - 300px)">
            <BootPreloaderGate ready={isReady} />
            {isReady ? children : null}
        </div>
    );
};

export default App;

