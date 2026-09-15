import { beforeEach, describe, expect, it, vi } from 'vitest';
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
import { ReportDateType } from '@/modules/entities/report/model/types/report/report-type';
import {
    aiAnalyticsActions,
    aiAnalyticsReducer,
} from '../model/ai-analytics-slice';
import { fetchAiOverview } from '../model/ai-analytics-thunks';
import { startAiRefetchListener } from '../model/listeners/ai-refetch.listener';
import { byType, overview, ready } from './ai-fixtures';

const { getOverview, getAttention, getByType } = vi.hoisted(() => ({
    getOverview: vi.fn(),
    getAttention: vi.fn(),
    getByType: vi.fn(),
}));

vi.mock('../lib/api/ai-analytics-helper', () => ({
    AiAnalyticsHelper: class {
        getOverview = getOverview;
        getAttention = getAttention;
        getByType = getByType;
        getPulse = vi.fn();
        getAgenda = vi.fn();
    },
}));

const USER = { ID: 42, LAST_NAME: 'Тест' } as unknown as BXUser;

const makeStore = () => {
    const listener = createListenerMiddleware();
    const store = configureStore({
        reducer: combineReducers({
            app: appReducer,
            report: reportReducer,
            department: departmentReducer,
            aiAnalytics: aiAnalyticsReducer,
        }),
        middleware: getDefault => getDefault().prepend(listener.middleware),
    });
    startAiRefetchListener(
        listener as ListenerMiddlewareInstance<
            RootState,
            AppDispatch,
            ThunkExtraArgument
        >,
    );
    store.dispatch(
        appActions.setAppData({ domain: 'test.bitrix24.ru', user: USER }),
    );
    store.dispatch(
        reportActions.setChangedDate({
            typeOfDate: ReportDateType.FROM,
            value: '2026-08-01',
        }),
    );
    store.dispatch(
        reportActions.setChangedDate({
            typeOfDate: ReportDateType.TO,
            value: '2026-08-31',
        }),
    );
    return store as unknown as {
        dispatch: AppDispatch;
        getState: () => RootState;
    };
};

const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));

describe('ai-refetch.listener — обзор', () => {
    beforeEach(() => {
        getOverview.mockReset().mockResolvedValue(ready(overview()));
        getAttention.mockReset();
        getByType.mockReset().mockResolvedValue(ready(byType()));
    });

    it('смена фильтра до открытия вкладки (idle) — запросов нет', async () => {
        const store = makeStore();
        store.dispatch(reportActions.setSavedFilter(null));
        await flush();
        expect(getOverview).not.toHaveBeenCalled();
    });

    it('смена состава менеджеров после загрузки → повторный обзор с новым ключом', async () => {
        const store = makeStore();
        await store.dispatch(fetchAiOverview());
        store.dispatch(
            departmentActions.setDepartmentCurrent([
                { ID: 7 },
            ] as unknown as BXUser[]),
        );
        store.dispatch(reportActions.setSavedFilter(null));
        await flush();
        expect(getOverview).toHaveBeenCalledTimes(2);
        expect(getOverview.mock.calls[1]?.[1]).toMatchObject({
            managerIds: [7],
        });
    });

    it('тот же фильтр → гард по ключу, второго POST нет', async () => {
        const store = makeStore();
        await store.dispatch(fetchAiOverview());
        store.dispatch(reportActions.setSavedFilter(null));
        await flush();
        expect(getOverview).toHaveBeenCalledTimes(1);
    });

    it('levelsSaved → обзор и «Внимание» с forceRefresh', async () => {
        getAttention.mockResolvedValue(ready(overview()));
        const store = makeStore();
        await store.dispatch(fetchAiOverview());
        store.dispatch(aiAnalyticsActions.levelsSaved('2026-09-07T10:00:00Z'));
        await flush();
        expect(getOverview).toHaveBeenCalledTimes(2);
        expect(getOverview.mock.calls[1]?.[2]).toMatchObject({
            forceRefresh: true,
        });
        expect(getAttention).toHaveBeenCalledTimes(1);
        expect(getByType).not.toHaveBeenCalled();
    });

    it('открытие drawer и смена типа/раскладки → срез by-type; закрытый drawer — нет', async () => {
        const store = makeStore();
        store.dispatch(aiAnalyticsActions.setSelectedCallType('presentation'));
        await flush();
        expect(getByType).not.toHaveBeenCalled();

        store.dispatch(aiAnalyticsActions.setTypesDrawerOpen(true));
        await flush();
        expect(getByType).toHaveBeenCalledTimes(1);

        store.dispatch(aiAnalyticsActions.setTypesLayout('long'));
        await flush();
        expect(getByType).toHaveBeenCalledTimes(2);
        expect(getByType.mock.calls[1]?.[3]).toBe('long');
    });
});
