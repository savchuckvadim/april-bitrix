'use client';

import { useAppDispatch, useAppSelector } from '../lib/hooks/redux';
import { initial } from '../model/thunk/AppThunk';
import { useEffect, useState } from 'react';

import { ErrorBoundary } from '../providers/ErrorBoundary';

import { APP_TITLE } from '../consts/app';

import { useApp } from '../lib/hooks/app';
import { store } from '../model/store';
import LoadingScreen from '@/modules/shared/components/LoadingScreen/ui/LoadingScreen';
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
    return (
        <div className="h-calc(100vh - 300px)">
            {isClient && initialized && !isLoading ? (
                children
            ) : (
                <LoadingScreen />
            )}
        </div>
    );
};

export default App;

