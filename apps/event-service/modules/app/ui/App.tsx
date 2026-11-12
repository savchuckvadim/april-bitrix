'use client';

import { useAppDispatch, useAppSelector } from '../lib/hooks/redux';
import { initial } from '../model/thunk/AppThunk';
import { useEffect, useState } from 'react';

import { ErrorBoundary } from '../providers/ErrorBoundary';
import { logClient } from '../lib/helper/logClient';
import { LoadingScreen } from '@/modules/shared';
import { APP_TITLE } from '../consts/app';

import { useApp } from '../lib/hooks/app';
import { store } from '../model/store';
import { DealMiniHeader } from '@/modules/entities/EventDeal';
import { useSmallFrame } from '../lib/hooks/use-small-frame';
import { AppFrame } from './AppFrame';
// import { Preloader } from "@workspace/ui";
//@ts-ignore

export const App = ({ children }: { children: React.ReactNode }) => {
    const { initialized, isLoading, isClient } = useApp();
    // вкладка карточки: фрейм с окно браузера, рамка, свой скролл
    const isSmall = useSmallFrame();

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
    return (
        <AppFrame framed={isSmall} header={isReady ? <DealMiniHeader /> : null}>
            {isReady ? children : <LoadingScreen />}
        </AppFrame>
    );
};

export default App;

