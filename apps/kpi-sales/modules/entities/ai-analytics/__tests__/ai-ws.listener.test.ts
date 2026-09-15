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
import departmentReducer from '@/modules/entities/department/model/department-slice';
import { ReportDateType } from '@/modules/entities/report/model/types/report/report-type';
import { aiAnalyticsReducer } from '../model/ai-analytics-slice';
import { fetchAiOverview } from '../model/ai-analytics-thunks';
import {
    AI_WS_EVENTS,
    startAiWsListener,
} from '../model/listeners/ai-ws.listener';
import { overview, queued, ready } from './ai-fixtures';

const { getOverview, handlers } = vi.hoisted(() => ({
    getOverview: vi.fn(),
    handlers: new Map<string, (payload: unknown) => void>(),
}));

vi.mock('../lib/api/ai-analytics-helper', () => ({
    AiAnalyticsHelper: class {
        getOverview = getOverview;
        getAttention = vi.fn();
        getByType = vi.fn();
    },
}));

vi.mock('@/modules/app/model/ws-client', () => ({
    getWSClient: () => ({
        socket: { connected: true, id: 'sock-1', once: vi.fn() },
        on: (event: string, callback: (payload: unknown) => void) => {
            handlers.set(event, callback);
        },
    }),
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
    startAiWsListener(
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

/** Хендлеры вешаются один раз на модуль — стор один на файл. */
const store = makeStore();

describe('ai-ws.listener — очередь обзора', () => {
    beforeEach(() => {
        getOverview.mockReset();
    });

    it('после setAppData подписан на done и error', async () => {
        await flush();
        expect(handlers.has(AI_WS_EVENTS.OVERVIEW_DONE)).toBe(true);
        expect(handlers.has(AI_WS_EVENTS.OVERVIEW_ERROR)).toBe(true);
    });

    it('POST несёт socketId соединения', async () => {
        getOverview.mockResolvedValue(queued('srv'));
        await store.dispatch(fetchAiOverview());
        expect(getOverview.mock.calls[0]?.[2]).toMatchObject({
            socketId: 'sock-1',
        });
    });

    it('done по ключу → повторный POST → ready', async () => {
        getOverview.mockResolvedValue(ready(overview(), 'srv'));
        handlers.get(AI_WS_EVENTS.OVERVIEW_DONE)?.({
            requestKey: 'srv',
            generatedAt: 'now',
        });
        await flush();
        expect(getOverview).toHaveBeenCalledTimes(1);
        expect(store.getState().aiAnalytics.overview.status).toBe('ready');
    });

    it('error по ключу → секция в ошибку', async () => {
        getOverview.mockResolvedValue(queued('srv2'));
        await store.dispatch(fetchAiOverview({ force: true }));
        handlers.get(AI_WS_EVENTS.OVERVIEW_ERROR)?.({
            requestKey: 'srv2',
            message: 'Сломалось',
        });
        await flush();
        expect(store.getState().aiAnalytics.overview.status).toBe('error');
        expect(store.getState().aiAnalytics.overview.error).toBe('Сломалось');
    });
});
