'use client';

import { LoadingScreen } from '@/modules/shared/ui';
import { useApp } from '../lib/hooks/app';


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

