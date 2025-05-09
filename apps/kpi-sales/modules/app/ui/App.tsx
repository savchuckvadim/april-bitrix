'use client'



import { useAppDispatch, useAppSelector } from "../lib/hooks/redux";
import { initial } from "../model/AppThunk";
import { useEffect, useState } from "react";
import { LoadingScreen } from "@/modules/general";
import { Report } from "@/modules/entities/report";
import { ErrorBoundary } from "../providers/ErrorBoundary";
import { logClient } from "../lib/helper/logClient";
// import { Preloader } from "@workspace/ui";
//@ts-ignore


const App = ({ inBitrix, envBitrix }: { inBitrix: boolean, envBitrix: boolean | string | undefined }) => {

  console.log('KPI SALES APP')
  console.log('envBitrix', envBitrix)

  return (

    <AppRoot inBitrix={inBitrix} />

  )
}

const AppRoot = ({ inBitrix }: { inBitrix: boolean }) => {
  const dispatch = useAppDispatch();
  const app = useAppSelector((state) => state.app);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !app.initialized && !app.isLoading) {
      dispatch(initial(inBitrix));
    }
  }, [isClient, app.initialized, app.isLoading, dispatch, inBitrix]);

  if (!isClient) {
    return <LoadingScreen />;
  }
  debugger
  logClient('AppRoot', {
    level: 'info',
    context: 'AppRoot LOG TEST',
    message: 'AppRoot is mounted',
    domain: app.domain,
    userId: app.bitrix.user?.ID,
  });
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">


        {app.initialized ? (
          <AppContent />
        ) : (
          <LoadingScreen />
        )}
      </div>
    </ErrorBoundary>
  );
};

const AppContent = () => {
  return <Report />
};

export default App