'use client'
import { Provider } from "react-redux";
import { store } from "@/modules/app/model/store";
import { useAppDispatch, useAppSelector } from "../lib/hooks/redux";
import { initial } from "../model/AppThunk";
import { useEffect, useState } from "react";
import { LoadingScreen } from "@/modules/general";
import { Report } from "@/modules/entities/report";
// import { Preloader } from "@workspace/ui";
//@ts-ignore


const App = ({ inBitrix }: { inBitrix: boolean }) => {
  debugger
  return (
    // <Provider store={store}>
      <AppRoot inBitrix={inBitrix} />
    // </Provider>
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

  return (
    <div className="min-h-screen bg-background">
 

      {app.initialized ? (
        <AppContent />
      ) : (
        <LoadingScreen />
      )}
    </div>
  );
};

const AppContent = () => {
  return <Report />
};

export default App