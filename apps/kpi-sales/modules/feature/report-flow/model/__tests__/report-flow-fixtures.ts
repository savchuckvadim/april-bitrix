import {
    combineReducers,
    configureStore,
    createListenerMiddleware,
    type ListenerMiddlewareInstance,
} from '@reduxjs/toolkit';
import type { BXUser } from '@workspace/bx';
import { appActions, appReducer } from '@/modules/app/model/AppSlice';
import type {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import reportReducer, {
    reportActions,
} from '@/modules/entities/report/model/report-slice';
import departmentReducer, {
    departmentActions,
} from '@/modules/entities/department/model/department-slice';
import callingStatisticsReducer from '@/modules/entities/calling-statistics/model/callingStatisticsSlice';
import { makeCurrentUser } from '@/modules/entities/department/__tests__/department-fixtures';
import {
    EReportDateMode,
    ReportDateType,
} from '@/modules/entities/report/model/types/report/report-type';
import { EReportType } from '@/modules/feature/report-widget-type/consts/report-type.consts';
import {
    reportTypeActions,
    reportTypeReducer,
} from '@/modules/feature/report-widget-type/model/ReportTypeSlice';

/*
 * Общая заготовка тестов запросов отчёта «по необходимости»: стор с
 * приложением, структурой отделов, периодом и вкладкой.
 */

export interface TestStore {
    dispatch: AppDispatch;
    getState: () => RootState;
}

type TestListener = ListenerMiddlewareInstance<
    RootState,
    AppDispatch,
    ThunkExtraArgument
>;

/** Конверт запроса: ответ бэка с данными, в очереди или ошибка расчёта. */
export interface Envelope {
    status: 'ready' | 'queued' | 'error';
    data?: unknown[];
    message?: string;
}

export const READY: Envelope = { status: 'ready', data: [] };
export const FAILED: Envelope = { status: 'error', message: 'расчёт упал' };

const user = (id: number): BXUser =>
    ({ ID: id, NAME: `Имя${id}` }) as unknown as BXUser;

export const USERS = [user(1), user(2), user(3)];
const REAL_USER = { ID: 99, LAST_NAME: 'Руководитель' } as unknown as BXUser;

/** Ключ запроса по фильтру из makeReportFlowStore: ноябрь, сотрудники 1 и 2. */
export const DEFAULT_KEY = '2026-11-01|2026-11-20|1_2';

interface StoreOptions {
    /** Вкладка отчёта (по умолчанию «Все»). */
    tab?: EReportType;
    /** Подключить listeners к стору. */
    startListeners?: (listener: TestListener) => void;
}

/**
 * Приложение инициализировано, структура отделов готова (видимы 1–3,
 * выбраны 1–2), период — 1–20 ноября, вкладка — переданная.
 */
export const makeReportFlowStore = (options: StoreOptions = {}): TestStore => {
    const listener = createListenerMiddleware();
    const store = configureStore({
        reducer: combineReducers({
            app: appReducer,
            report: reportReducer,
            department: departmentReducer,
            callingStatistics: callingStatisticsReducer,
            reportType: reportTypeReducer,
        }),
        middleware: getDefault =>
            getDefault().prepend(listener.middleware),
    });
    options.startListeners?.(listener as unknown as TestListener);

    store.dispatch(
        appActions.setAppData({ domain: 'test.bitrix24.ru', user: REAL_USER }),
    );
    store.dispatch(
        departmentActions.setStructure({
            isMulti: false,
            multipleTag: null,
            departments: [],
            currentUser: makeCurrentUser(),
            visibleUsers: USERS,
            visibleGroups: [],
            isHeadManager: true,
            defaultSelected: [USERS[0]!, USERS[1]!],
        }),
    );
    store.dispatch(
        reportActions.setPeriod({
            mode: EReportDateMode.RANGE,
            [ReportDateType.FROM]: '2026-11-01',
            [ReportDateType.TO]: '2026-11-20',
        }),
    );
    store.dispatch(
        reportTypeActions.setCurrentReportType(options.tab ?? EReportType.All),
    );
    return store as unknown as TestStore;
};

/** Запросы thunk'ов — асинхронные: даём им закончиться. */
export const flush = () =>
    new Promise<void>(resolve => setTimeout(resolve, 0));
