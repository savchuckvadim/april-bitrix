'use client'



import { useAppDispatch, useAppSelector } from "../lib/hooks/redux";
import { initial } from "../model/AppThunk";
import { useEffect, useState } from "react";


import { ErrorBoundary } from "../providers/ErrorBoundary";
import { logClient } from "../lib/helper/logClient";
import { LoadingScreen } from "@/modules/shared";
import { APP_TITLE } from "../consts/app";
import StartPage from "@/modules/pages/StartPage";
// import { Preloader } from "@workspace/ui";
//@ts-ignore


const App = ({ children, inBitrix, envBitrix, isPublic }: { children: React.ReactNode,   inBitrix: boolean, envBitrix: boolean | string | undefined, isPublic: boolean }) => {

    console.log('KONSTRUCTOR APP')
    console.log('envBitrix', envBitrix)

    return (

        <AppRoot inBitrix={inBitrix} isPublic={isPublic}>
            {children}
        </AppRoot>


    )
}

const AppRoot = ({ children, inBitrix, isPublic }: { children: React.ReactNode, inBitrix: boolean, isPublic: boolean }) => {
    const dispatch = useAppDispatch();
    const app = useAppSelector((state) => state.app);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && !app.initialized && !app.isLoading) {
            dispatch(initial(inBitrix, isPublic));
        }
    }, [isClient, app.initialized, app.isLoading, dispatch, inBitrix]);

    if (!isClient) {
        return <LoadingScreen />;
    }
    logClient('AppRoot', {
        level: 'info',
        context: 'AppRoot LOG TEST',
        message: 'AppRoot is mounted',
    });
    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-background">


                {app.initialized ? (
                    // <AppContent />
                    children
                ) : (
                    <LoadingScreen />
                )}
            </div>
        </ErrorBoundary>
    );
};

const AppContent = () => {
    return <StartPage />
};

export default App