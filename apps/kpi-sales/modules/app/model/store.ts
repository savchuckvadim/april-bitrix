import {
    Action,
    combineReducers,
    configureStore,
    createListenerMiddleware,
    ListenerMiddlewareInstance,
    ThunkAction,
} from '@reduxjs/toolkit';
import { WSClient } from '@workspace/ws';
import { appReducer } from './AppSlice';
import departmentReducer from '@/modules/entities/department/model/department-slice';
import reportReducer from '@/modules/entities/report/model/report-slice';
import { download } from '@/modules/feature/download';
import { callingStatisticsReducer } from '@/modules/entities/calling-statistics';
import { userReportReducer } from '@/modules/entities';
import { reportTypeReducer } from '@/modules/feature/';
import { mergedReportReducer } from '@/modules/feature/merged-kpi-calling-report';
import { startStoreListeners } from './listeners/start-store-listeners';

export const listenerMiddleware = createListenerMiddleware();

let wsClient: WSClient;

/**
 * WS живёт на том же сервере, что и API kpi-report-sales (socket.io
 * gateway внутри приложения) — хост совпадает с базой api-пакета.
 */
const resolveWsHost = () =>
    process.env.NEXT_PUBLIC_KPI_SALES_API_URL || 'http://localhost:3000/';

export const initWSClient = (userId: number, domain: string) => {
    wsClient = new WSClient(userId, domain, resolveWsHost());
    return wsClient;
};

export const getWSClient = () => {
    if (!wsClient) throw new Error('WSClient not initialized');
    return wsClient;
};

const rootReducer = combineReducers({
    app: appReducer,
    department: departmentReducer,
    report: reportReducer,
    callingStatistics: callingStatisticsReducer,
    reportType: reportTypeReducer,
    download,
    mergedReport: mergedReportReducer,
    userReport: userReportReducer,
});

export const setupStore = () =>
    configureStore({
        reducer: rootReducer,
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware({
                thunk: {
                    extraArgument: { getWSClient },
                },
            }).prepend(listenerMiddleware.middleware),
    });

export type ThunkExtraArgument = {
    getWSClient: typeof getWSClient;
};

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

// Регистрация после setupStore (kpi-service-паттерн): слушатели типизированы
// стором, thunks о них не знают.
startStoreListeners(
    listenerMiddleware as ListenerMiddlewareInstance<
        RootState,
        AppDispatch,
        ThunkExtraArgument
    >,
);
