import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    combineReducers,
    configureStore,
    createListenerMiddleware,
    type ListenerMiddlewareInstance,
    type Middleware,
} from '@reduxjs/toolkit';
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
import type { CurrentUserInfo } from '@/modules/entities/department/model';
import {
    isSavedFilterApplied,
    resetReportFlowMemory,
} from '../../report-queue.util';
import { startReportChainListeners } from '../report-chain.listener';

/*
 * Шаги цепочки — метки вместо сетевых thunks: проверяем только, что запущено.
 * Какие источники запрашивает ensureReportData — в её собственных тестах.
 */
vi.mock('../../report-flow-thunks', () => ({
    loadSavedFilter: () => ({ type: 'chain/loadSavedFilter' }),
}));
vi.mock('../../ensure-report-data.thunk', () => ({
    ensureReportData: () => ({ type: 'chain/ensureReportData' }),
}));

const CHAIN = /^chain\//;

beforeEach(() => {
    resetReportFlowMemory();
});

const LEADER: CurrentUserInfo = {
    userId: 42,
    isHead: true,
    headOf: 'op',
    headOfDepartmentIds: [10],
    visibility: 'department',
    headOfSource: 'structure',
    subordinateIds: [],
    isSuperUser: false,
    colleagues: { group: [], department: [] },
};

const STRUCTURE = departmentActions.setStructure({
    isMulti: false,
    multipleTag: null,
    departments: [],
    currentUser: LEADER,
    visibleUsers: [],
    visibleGroups: [],
    isHeadManager: true,
    defaultSelected: [],
});

const makeStore = () => {
    const steps: string[] = [];
    const record: Middleware = () => next => action => {
        if (
            typeof action === 'object' &&
            action !== null &&
            'type' in action &&
            typeof action.type === 'string' &&
            CHAIN.test(action.type)
        ) {
            steps.push(action.type.replace(CHAIN, ''));
        }
        return next(action);
    };
    const listener = createListenerMiddleware();
    const store = configureStore({
        reducer: combineReducers({
            app: appReducer,
            report: reportReducer,
            department: departmentReducer,
        }),
        middleware: getDefault =>
            getDefault().prepend(listener.middleware).concat(record),
    });
    startReportChainListeners(
        listener as ListenerMiddlewareInstance<
            RootState,
            AppDispatch,
            ThunkExtraArgument
        >,
    );
    return { store, steps };
};

const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));

describe('report-chain.listener — цепочка загрузки отчёта', () => {
    it('в отчёте: структура → сохранённый фильтр → загрузка по нуждам вкладки', async () => {
        const { store, steps } = makeStore();
        store.dispatch(appActions.setLayoutKind('report'));
        store.dispatch(STRUCTURE);
        store.dispatch(reportActions.setSavedFilter(null));
        await flush();
        expect(steps).toEqual(['loadSavedFilter', 'ensureReportData']);
        expect(store.getState().report.chainDeferred).toBe(false);
    });

    it('сохранённый фильтр применён — запросы по необходимости разрешены, раньше — нет', async () => {
        const { store } = makeStore();
        store.dispatch(appActions.setLayoutKind('report'));
        store.dispatch(STRUCTURE);
        await flush();
        expect(isSavedFilterApplied()).toBe(false);

        store.dispatch(reportActions.setSavedFilter(null));
        await flush();
        expect(isSavedFilterApplied()).toBe(true);
    });

    it('на «Разборах звонков»: ни фильтра, ни расчёта отчёта — цепочка отложена', async () => {
        const { store, steps } = makeStore();
        store.dispatch(appActions.setLayoutKind('bare'));
        store.dispatch(STRUCTURE);
        await flush();
        expect(steps).toEqual([]);
        expect(store.getState().report.chainDeferred).toBe(true);
        expect(store.getState().department.status).toBe('ready');
    });

    it('фильтр, пришедший уже на «Разборах звонков», тоже не запускает расчёт', async () => {
        const { store, steps } = makeStore();
        store.dispatch(appActions.setLayoutKind('bare'));
        store.dispatch(reportActions.setSavedFilter(null));
        await flush();
        expect(steps).toEqual([]);
        expect(store.getState().report.chainDeferred).toBe(true);
        // Фильтр так и не применён к отчёту: запросы по необходимости закрыты.
        expect(isSavedFilterApplied()).toBe(false);
    });

    it('переход в отчёт доводит отложенную цепочку один раз', async () => {
        const { store, steps } = makeStore();
        store.dispatch(appActions.setLayoutKind('bare'));
        store.dispatch(STRUCTURE);
        store.dispatch(appActions.setLayoutKind('report'));
        await flush();
        expect(steps).toEqual(['loadSavedFilter']);
        expect(store.getState().report.chainDeferred).toBe(false);

        store.dispatch(appActions.setLayoutKind('bare'));
        store.dispatch(appActions.setLayoutKind('report'));
        await flush();
        expect(steps).toEqual(['loadSavedFilter']);
    });

    it('отчёт посчитан, переход на «Разборы» и обратно — ничего не перезапускается', async () => {
        const { store, steps } = makeStore();
        store.dispatch(appActions.setLayoutKind('report'));
        store.dispatch(STRUCTURE);
        store.dispatch(reportActions.setSavedFilter(null));
        await flush();
        steps.length = 0;

        store.dispatch(appActions.setLayoutKind('bare'));
        store.dispatch(appActions.setLayoutKind('report'));
        await flush();
        expect(steps).toEqual([]);
    });
});
