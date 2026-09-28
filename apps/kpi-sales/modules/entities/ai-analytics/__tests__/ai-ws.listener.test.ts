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
import {
    fetchAiBrief,
    fetchAiDossier,
    fetchAiOverview,
} from '../model/ai-analytics-thunks';
import {
    AI_WS_EVENTS,
    startAiWsListener,
} from '../model/listeners/ai-ws.listener';
import { brief, dossier, overview, queued, ready } from './ai-fixtures';

const { getOverview, getBrief, getDossier, handlers } = vi.hoisted(() => ({
    getOverview: vi.fn(),
    getBrief: vi.fn(),
    getDossier: vi.fn(),
    handlers: new Map<string, (payload: unknown) => void>(),
}));

vi.mock('../lib/api/ai-analytics-helper', () => ({
    AiAnalyticsHelper: class {
        getOverview = getOverview;
        getBrief = getBrief;
        getDossier = getDossier;
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

describe('ai-ws.listener — очередь резюме (brief)', () => {
    beforeEach(() => {
        getBrief.mockReset();
        getOverview.mockReset();
    });

    it('подписан на brief:done и brief:error', () => {
        expect(handlers.has(AI_WS_EVENTS.BRIEF_DONE)).toBe(true);
        expect(handlers.has(AI_WS_EVENTS.BRIEF_ERROR)).toBe(true);
    });

    it('brief:done по ключу → повторный POST резюме → ready; обзор не трогает', async () => {
        getBrief
            .mockResolvedValueOnce(queued('srv-brief'))
            .mockResolvedValueOnce(ready(brief(), 'srv-brief'));
        await store.dispatch(fetchAiBrief({ force: true }));
        expect(getBrief.mock.calls[0]?.[2]).toMatchObject({
            socketId: 'sock-1',
        });
        expect(store.getState().aiAnalytics.brief.status).toBe('loading');

        handlers.get(AI_WS_EVENTS.BRIEF_DONE)?.({
            requestKey: 'srv-brief',
            generatedAt: 'now',
        });
        await flush();
        expect(getBrief).toHaveBeenCalledTimes(2);
        expect(getOverview).not.toHaveBeenCalled();
        expect(store.getState().aiAnalytics.brief.status).toBe('ready');
        expect(store.getState().aiAnalytics.brief.data?.source).toBe('llm');
    });

    it('brief:done по ключу очереди → повторный POST отдаёт ready с другим ключом → готово, повторов нет', async () => {
        // Очередь и событие несут ключ пакета до данных прошлого периода,
        // готовый ответ — ключ пакета уже с ними.
        getBrief
            .mockResolvedValueOnce(queued('srv-pack'))
            .mockResolvedValueOnce(ready(brief(), 'srv-pack-with-previous'));
        await store.dispatch(fetchAiBrief({ force: true }));
        expect(store.getState().aiAnalytics.brief.serverKey).toBe('srv-pack');

        // Событие с ключом, которого очередь не называла, — не наше.
        handlers.get(AI_WS_EVENTS.BRIEF_DONE)?.({
            requestKey: 'srv-pack-with-previous',
        });
        await flush();
        expect(getBrief).toHaveBeenCalledTimes(1);
        expect(store.getState().aiAnalytics.brief.status).toBe('loading');

        handlers.get(AI_WS_EVENTS.BRIEF_DONE)?.({
            requestKey: 'srv-pack',
            generatedAt: 'now',
        });
        await flush();
        expect(getBrief).toHaveBeenCalledTimes(2);
        expect(getBrief.mock.calls[1]?.[2]).toMatchObject({
            forceRefresh: false,
        });
        const section = store.getState().aiAnalytics.brief;
        expect(section.status).toBe('ready');
        expect(section.jobStatus).toBeNull();
        expect(section.serverKey).toBe('srv-pack-with-previous');
        expect(section.data?.previousPeriod).toEqual({
            from: '2026-07-01',
            to: '2026-07-31',
        });

        // Повторные события по любому из ключей готовую секцию не трогают.
        handlers.get(AI_WS_EVENTS.BRIEF_DONE)?.({ requestKey: 'srv-pack' });
        handlers.get(AI_WS_EVENTS.BRIEF_DONE)?.({
            requestKey: 'srv-pack-with-previous',
        });
        await flush();
        expect(getBrief).toHaveBeenCalledTimes(2);
        expect(store.getState().aiAnalytics.brief.status).toBe('ready');
    });

    it('brief:error по ключу → секция резюме в ошибку', async () => {
        getBrief.mockResolvedValue(queued('srv-brief-2'));
        await store.dispatch(fetchAiBrief({ force: true }));
        handlers.get(AI_WS_EVENTS.BRIEF_ERROR)?.({
            requestKey: 'srv-brief-2',
            message: 'Факт-чек провален',
        });
        await flush();
        expect(store.getState().aiAnalytics.brief.status).toBe('error');
        expect(store.getState().aiAnalytics.brief.error).toBe(
            'Факт-чек провален',
        );
    });
});

describe('ai-ws.listener — очередь досье (dossier)', () => {
    beforeEach(() => {
        getDossier.mockReset();
        getBrief.mockReset();
        getOverview.mockReset();
    });

    it('подписан на dossier:done и dossier:error', () => {
        expect(handlers.has(AI_WS_EVENTS.DOSSIER_DONE)).toBe(true);
        expect(handlers.has(AI_WS_EVENTS.DOSSIER_ERROR)).toBe(true);
    });

    it('dossier:done по ключу → повторный POST досье → ready; обзор и резюме не трогает', async () => {
        getDossier
            .mockResolvedValueOnce(queued('srv-dossier'))
            .mockResolvedValueOnce(ready(dossier(), 'srv-dossier'));
        await store.dispatch(fetchAiDossier({ managerId: '7', months: 3 }));
        expect(getDossier.mock.calls[0]?.[2]).toMatchObject({
            socketId: 'sock-1',
        });
        expect(store.getState().aiAnalytics.dossier.status).toBe('loading');

        handlers.get(AI_WS_EVENTS.DOSSIER_DONE)?.({
            requestKey: 'srv-dossier',
            generatedAt: 'now',
        });
        await flush();
        expect(getDossier).toHaveBeenCalledTimes(2);
        expect(getOverview).not.toHaveBeenCalled();
        expect(getBrief).not.toHaveBeenCalled();
        expect(store.getState().aiAnalytics.dossier.status).toBe('ready');
        expect(store.getState().aiAnalytics.dossier.data?.managerId).toBe('7');
    });

    it('dossier:error по ключу → секция досье в ошибку', async () => {
        getDossier.mockResolvedValue(queued('srv-dossier-2'));
        await store.dispatch(
            fetchAiDossier({ managerId: '7', months: 6 }, { force: true }),
        );
        handlers.get(AI_WS_EVENTS.DOSSIER_ERROR)?.({
            requestKey: 'srv-dossier-2',
            message: 'Снапшоты не собраны',
        });
        await flush();
        expect(store.getState().aiAnalytics.dossier.status).toBe('error');
        expect(store.getState().aiAnalytics.dossier.error).toBe(
            'Снапшоты не собраны',
        );
    });
});
