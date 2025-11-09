import {
    Action,

    combineReducers,
    configureStore,
    createListenerMiddleware,
    ThunkAction,
} from '@reduxjs/toolkit';
import { appReducer } from './AppSlice';
// import { departmentAPI } from "@/modules/entities/departament";
import departmentReducer from '@/modules/entities/departament/model/departament-slice';
import { reportAPI } from '@/modules/entities/report/model/report-service';
import reportReducer from '@/modules/entities/report/model/report-slice';
import { download } from '@/modules/feature/download';
// import { reportMiddleware } from '@/modules/entities/report/model/report-middleware';
import { callingStatisticsReducer } from '@/modules/entities/calling-statistics';
import { callingStatisticsApi } from '@/modules/entities/calling-statistics/model/callingStatisticsService';
import { WSClient } from '@workspace/ws';
import { startUserReportAppListener, userReportReducer } from '@/modules/entities';
import { reportTypeReducer } from '@/modules/feature/';

export const listenerMiddleware = createListenerMiddleware();

let wsClient: WSClient;

// const socketMiddleware: Middleware = (storeAPI: MiddlewareAPI) => (next: Dispatch<AnyAction>) => (action: AnyAction) => {
//   // Место для обработки действий или взаимодействия с сокетом
//   return next(action);
// };

export const initWSClient = (userId: number, domain: string) => {
    wsClient = new WSClient(userId, domain);
    return wsClient;
};

export const getWSClient = () => {
    if (!wsClient) throw new Error('WSClient not initialized');
    return wsClient;
};

const rootReducer = combineReducers({
    app: appReducer,

    //april

    department: departmentReducer,
    // [departmentAPI.reducerPath]: departmentAPI.reducer,
    report: reportReducer,
    [reportAPI.reducerPath]: reportAPI.reducer,
    callingStatistics: callingStatisticsReducer,
    [callingStatisticsApi.reducerPath]: callingStatisticsApi.reducer,
    reportType: reportTypeReducer,
    download,

    userReport: userReportReducer,
});

export const setupStore = () => {
    return configureStore({
        reducer: rootReducer,
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware({
                thunk: {
                    extraArgument: { getWSClient },
                },
            })
                // .concat(portalAPI.middleware)
                // .concat(infoblockAPI.middleware)
                .concat(callingStatisticsApi.middleware)

                // .concat(departmentAPI.middleware)
                .concat(reportAPI.middleware),
        // .concat(reportMiddleware)
    });
};

//listeners
// startUserReportAppListener(listenerMiddleware as ListenerMiddlewareInstance<RootState, AppDispatch, ThunkExtraArgument>);

// Тип для extraArgument
export type ThunkExtraArgument = {
    getWSClient: typeof getWSClient;
};

// Тип для thunk
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    ThunkExtraArgument,
    Action<string>
>;

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
export type AppGetState = AppStore['getState'];

export const store = setupStore();

//@ts-ignore
// window.eventStore = store;
