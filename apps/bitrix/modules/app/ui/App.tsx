'use client';

import { useEffect, useState } from 'react';
import { useApp } from '../lib/hooks/app';
import { store } from '../model/store';
import LoadingScreen from '@/modules/shared/components/LoadingScreen/ui/LoadingScreen';

export const App = ({ children }: { children: React.ReactNode }) => {
    const { initialized, isLoading, isClient } = useApp();
    console.log('App');
    console.log(initialized, isLoading, isClient);



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

