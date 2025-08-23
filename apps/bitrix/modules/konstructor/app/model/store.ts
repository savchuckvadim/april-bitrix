import {
  combineReducers,
  configureStore,
  createListenerMiddleware,
} from "@reduxjs/toolkit";
import { appReducer } from "./AppSlice";
// import { eventReducer, eventRouterReducer } from "../../processes/event";
import { routerReducer } from "../../processes/routes/model/RouterSlice";

import { portalListener } from "../../entities/Portal/PortalListener";
// import { preloaderReducer } from "@packages/ui";
import { documentRouterReducer } from "../../processes/konstructor";
import { infoblockAPI, infoblockReducer } from "../../entities/Infoblock";
import { portalAPI, portalReducer } from "@workspace/pbx";
// import { complectCurrentReducer, complectProfReducer, complectUniversalReducer } from "../../entities/KonstructorComplect";
// import { portalAPI, portalReducer } from "../../../../../../packages/pbx/src";

export const listenerMiddleware = createListenerMiddleware();

// listenerMiddleware.startListening({
//   actionCreator: eventTaskActions.setFetchedTasks,
//   effect: async (action, listenerApi) => {
//     const { dispatch } = listenerApi;
//     // dispatch(initialEventTasks(action.payload.tasks));
//     // dispatch(getInitSale(null, action.payload.tasks));
//     // dispatch(updateLoggingForPortal(action.payload));
//   },
// });

// listenerMiddleware.startListening({
//   actionCreator: portalActions.setPortal,
//   effect: async (action, listenerApi) => {
//     const portal = action.payload.portal;
//     const { dispatch } = listenerApi;
//     // dispatch(getInitSale(action.payload.portal, null));
//     // dispatch(updateLoggingForPortal(action.payload));
//     dispatch(setInitEventCompany(portal));
//   },
// });

const rootReducer = combineReducers({
  app: appReducer,
  // [postAPI.reducerPath]: postAPI.reducer,
  //process
  router: routerReducer,
  documentRouter: documentRouterReducer,
  // event: eventReducer,
  // eventRouter: eventRouterReducer,

  // currentComplect:complectCurrentReducer,
  // profComplect:complectProfReducer,
  // universalComplect:complectUniversalReducer,
  infoblock: infoblockReducer,
  [infoblockAPI.reducerPath]: infoblockAPI.reducer,
  //april
  portal: portalReducer,
  [portalAPI.reducerPath]: portalAPI.reducer,

  //fom packages
  // preloader: preloaderReducer
});

export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(listenerMiddleware.middleware) // Добавление listener middleware в начало цепочки
        .concat(portalAPI.middleware)
        .concat(infoblockAPI.middleware),
    // .concat(taskAPI.middleware),
  });
};

//listeners
portalListener();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
export type AppGetState = AppStore["getState"];

export const store = setupStore();

//@ts-ignore
// window.eventStore = store;
