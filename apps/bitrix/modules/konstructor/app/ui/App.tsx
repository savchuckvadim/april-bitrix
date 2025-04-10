// import "./App.scss";
// import "bootstrap/dist/css/bootstrap.min.css";
'use client'
import { useAppDispatch, useAppSelector } from "../lib/hooks/redux";
import { Suspense, useEffect } from "react";
import { initial } from "../model/AppThunk";
// import { Router } from "@/modules/konstructor/modules/processes/routes";

import { Provider } from "react-redux";

import { store } from "@/modules/konstructor/app/model/store";
// import { Preloader } from "@workspace/ui";
//@ts-ignore


export const App = ({ inBitrix }: { inBitrix: boolean }) => (
  <Provider store={store}>
    <EventApp inBitrix={inBitrix} />
  </Provider>
);
const EventApp = ({ inBitrix }: { inBitrix: boolean }) => {
  const dispatch = useAppDispatch();
  const app = useAppSelector((state) => state.app);

  if (!app.initialized && !app.isLoading) {
    dispatch(initial());
  }

  useEffect(() => {
    if (!app.initialized && !app.isLoading) {
      dispatch(initial());
    }
  }, [app])
  //TODO:
  // - one more task
  // - one presentation
  debugger
  return (
    <div>
      <div
        // data-testid='DATA.APP.TEST_ID'
        className="bg-background text-foreground"
      // style={{ display: 'flex' }}
      >
        {
          app.initialized
            ? <Suspense fallback={<>Загрузка ... </>}>
              {/* <Router />
               */}
              Конструктор Коммерческих предложений Гарант
              <></>
            </Suspense>

            : <p>
              Конструктор Коммерческих предложений Гарант
            </p>
        }

      </div>
    </div>
  );
};
