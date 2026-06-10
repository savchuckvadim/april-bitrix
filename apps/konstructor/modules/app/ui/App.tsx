'use client';


import { useEffect, useState } from 'react';
import { LoadingScreen } from '@/modules/shared';

import { useApp } from '../lib/hooks/app';
import { store } from '..';


export const App = ({ children }: { children: React.ReactNode }) => {
    const { initialized, isLoading, isClient, isReady } = useApp();

    useEffect(() => {
        if (isClient) {
            if (isReady) {
                if (typeof window !== 'undefined') {


                    (window as any).store = store;
                }
            }
        }
    }, [isReady]);
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

