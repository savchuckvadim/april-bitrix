import { combineReducers, configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { appReducer } from "./AppSlice";
// import { departmentAPI } from "@/modules/entities/departament";
import departmentReducer from "@/modules/entities/departament/model/departament-slice";
import { reportAPI } from "@/modules/entities/report/model/report-service";
import reportReducer from "@/modules/entities/report/model/report-slice";
import { download } from "@/modules/feature/download";
// import { reportMiddleware } from '@/modules/entities/report/model/report-middleware';
import { callingStatisticsReducer } from "@/modules/entities/calling-statistics";
import { callingStatisticsApi } from "@/modules/entities/calling-statistics/model/callingStatisticsService";


export const listenerMiddleware = createListenerMiddleware();

const rootReducer = combineReducers({
  app: appReducer,

  //april

  department: departmentReducer,
  // [departmentAPI.reducerPath]: departmentAPI.reducer,
  report: reportReducer,
  [reportAPI.reducerPath]: reportAPI.reducer,
  callingStatistics: callingStatisticsReducer,
  [callingStatisticsApi.reducerPath]: callingStatisticsApi.reducer,
  download

});

export const setupStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        // .concat(portalAPI.middleware)
        // .concat(infoblockAPI.middleware)
        .concat(callingStatisticsApi.middleware)
        
        // .concat(departmentAPI.middleware)
        .concat(reportAPI.middleware)
    // .concat(reportMiddleware)
  });
};

//listeners
// portalListener();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
export type AppGetState = AppStore["getState"];

export const store = setupStore();

//@ts-ignore
// window.eventStore = store;

