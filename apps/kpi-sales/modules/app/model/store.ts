import {
    Action,
    combineReducers,
    configureStore,
    createListenerMiddleware,
    ListenerMiddlewareInstance,
    ThunkAction,
} from '@reduxjs/toolkit';
import { appReducer } from './AppSlice';
import departmentReducer from '@/modules/entities/department/model/department-slice';
import reportReducer from '@/modules/entities/report/model/report-slice';
import download from '@/modules/feature/download/model/download-slice';
import callingStatisticsReducer from '@/modules/entities/calling-statistics/model/callingStatisticsSlice';
import { userReportReducer } from '@/modules/entities/user-report/model/slice/UserReportSlice';
import { reportTypeReducer } from '@/modules/feature/report-widget-type/model/ReportTypeSlice';
import { mergedReportReducer } from '@/modules/feature/merged-kpi-calling-report/model/MergedReportSlice';
import { conversionsReducer } from '@/modules/feature/report-conversions/model/conversions-slice';
import { uiSettingsReducer } from '@/modules/feature/ui-settings/model/ui-settings-slice';
import { reportLinksReducer } from '@/modules/feature/report-links/model/report-links-slice';
import { airtimeReducer } from '@/modules/entities/airtime/model/airtime-slice';
import { financeReducer } from '@/modules/entities/finance/model/finance-slice';
import { reportAwardsReducer } from '@/modules/feature/report-awards/model/report-awards-slice';
import { pbxFieldsReducer } from '@/modules/feature/pbx-fields/model/pbx-fields-slice';
import { plansReducer } from '@/modules/feature/plans/model/plans-slice';
import { getWSClient } from './ws-client';
import { startStoreListeners } from './listeners/start-store-listeners';

/**
 * Реюсеры и стартеры listeners импортируются ТОЛЬКО прямыми путями, без
 * барелей слайсов: модуль стора выполняется на старте приложения, и барель
 * затащил бы в его граф весь UI фичи (а вместе с ним — обратные импорты
 * `@/modules/app`, то есть цикл инициализации).
 */
export const listenerMiddleware = createListenerMiddleware();

const rootReducer = combineReducers({
    app: appReducer,
    department: departmentReducer,
    report: reportReducer,
    callingStatistics: callingStatisticsReducer,
    reportType: reportTypeReducer,
    download,
    mergedReport: mergedReportReducer,
    userReport: userReportReducer,
    conversions: conversionsReducer,
    uiSettings: uiSettingsReducer,
    airtime: airtimeReducer,
    finance: financeReducer,
    reportLinks: reportLinksReducer,
    reportAwards: reportAwardsReducer,
    pbxFields: pbxFieldsReducer,
    plans: plansReducer,
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
