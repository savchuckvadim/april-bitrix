'use client'
import { Provider } from "react-redux";

import { store } from "@konstructor/app/model/store";
import { useAppSelector } from "../lib/hooks/redux";
// import { initial } from "../model/AppThunk";
// import { Suspense, useEffect } from "react";
import { PageLoader,  } from "@/modules/general";
// import { Preloader } from "@workspace/ui";
//@ts-ignore


const App = ({ inBitrix }: { inBitrix: boolean }) => {

  console.log('App')
  console.log(inBitrix)
  return (
    <Provider store={store}>
      <KonstructorApp inBitrix={inBitrix} />
    </Provider>
  )
}
  ;
const KonstructorApp = ({ inBitrix }: { inBitrix: boolean }) => {
  debugger
  console.log('TARGET KonstructorApp')
  // const dispatch = useAppDispatch();
  const app = useAppSelector((state) => state.app);
  // const { loading } = usePageLoad(app.initialized)

  // if (!app.initialized && !app.isLoading) {
  //   dispatch(initial(inBitrix));
  // }

  // useEffect(() => {
  //   if (!app.initialized && !app.isLoading) {
  //     dispatch(initial(inBitrix));
  //   }
  // }, [app])
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
            ? <>
              Конструктор Коммерческих предложений Гарант
            </>
            //  <Suspense fallback={<>Загрузка ... </>}>

            //       <>
            //     Конструктор Коммерческих предложений Гарант
            //    </>
            //   </Suspense>

            : <PageLoader visible={true} />
        }

      </div>
    </div>
  );
};
export default App