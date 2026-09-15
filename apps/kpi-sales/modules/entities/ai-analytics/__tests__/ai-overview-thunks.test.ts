import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { BXUser } from '@workspace/bx';
import { appActions, appReducer } from '@/modules/app/model/AppSlice';
import type { AppDispatch, RootState } from '@/modules/app/model/store';
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
import {
    AI_QUEUED_MAX_ATTEMPTS,
    AI_QUEUED_TIMEOUT_MS,
    failAiQueuedSections,
    fetchAiAttention,
    fetchAiByType,
    fetchAiOverview,
    recalcAiOverview,
    resumeAiQueuedSections,
    saveAiLevels,
} from '../model/ai-analytics-thunks';
import { buildAiRequestKey } from '../lib/ai-request-key.util';
import {
    attention,
    byType,
    overview,
    processing,
    queued,
    ready,
} from './ai-fixtures';

// vi.mock поднимается выше импортов — моки объявляем через vi.hoisted.
const { getOverview, getAttention, getByType, saveSettings } = vi.hoisted(
    () => ({
        getOverview: vi.fn(),
        getAttention: vi.fn(),
        getByType: vi.fn(),
        saveSettings: vi.fn(),
    }),
);

vi.mock('../lib/api/ai-analytics-helper', () => ({
    AiAnalyticsHelper: class {
        getOverview = getOverview;
        getAttention = getAttention;
        getByType = getByType;
        saveSettings = saveSettings;
        getSettings = vi.fn();
        getPulse = vi.fn();
        getAgenda = vi.fn();
        addFeedback = vi.fn();
        resetCache = vi.fn();
    },
}));

const USER = { ID: 42, LAST_NAME: 'Тест' } as unknown as BXUser;
const MANAGERS = [{ ID: 7 }, { ID: 3 }] as unknown as BXUser[];

const makeStore = () => {
    const store = configureStore({
        reducer: combineReducers({
            app: appReducer,
            report: reportReducer,
            department: departmentReducer,
            aiAnalytics: aiAnalyticsReducer,
        }),
    });
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
    store.dispatch(departmentActions.setDepartmentCurrent(MANAGERS));
    return store as unknown as {
        dispatch: AppDispatch;
        getState: () => RootState;
    };
};

const SCOPE = {
    domain: 'test.bitrix24.ru',
    requesterUserId: '42',
    from: '2026-08-01',
    to: '2026-08-31',
    managerIds: [3, 7],
};
const OVERVIEW_KEY = buildAiRequestKey(SCOPE);

describe('fetchAiOverview — ключ, фильтры, ready', () => {
    beforeEach(() => {
        getOverview.mockReset();
        getAttention.mockReset();
        getByType.mockReset();
    });

    it('ключ включает период и отсортированных менеджеров; POST несёт фильтры', async () => {
        getOverview.mockResolvedValue(ready(overview()));
        const store = makeStore();
        await store.dispatch(fetchAiOverview());

        const section = store.getState().aiAnalytics.overview;
        expect(section.status).toBe('ready');
        expect(section.requestKey).toBe(OVERVIEW_KEY);
        expect(section.serverKey).toBe('server-key');
        expect(section.data?.managers).toHaveLength(1);
        expect(getOverview).toHaveBeenCalledWith(
            { domain: 'test.bitrix24.ru', requesterUserId: '42' },
            { from: '2026-08-01', to: '2026-08-31', managerIds: [7, 3] },
            { socketId: undefined, forceRefresh: false },
        );
    });

    it('период длиннее 3 месяцев подтягивается к лимиту бэка', async () => {
        getOverview.mockResolvedValue(ready(overview()));
        const store = makeStore();
        store.dispatch(
            reportActions.setChangedDate({
                typeOfDate: ReportDateType.FROM,
                value: '2026-01-01',
            }),
        );
        await store.dispatch(fetchAiOverview());
        expect(getOverview.mock.calls[0]?.[1]).toMatchObject({
            from: '2026-06-01',
            to: '2026-08-31',
        });
    });

    it('гард: тот же ключ в loading/ready не шлёт второй POST, force — шлёт с forceRefresh', async () => {
        getOverview.mockResolvedValue(ready(overview()));
        const store = makeStore();
        const first = store.dispatch(fetchAiOverview());
        store.dispatch(fetchAiOverview());
        await first;
        await store.dispatch(fetchAiOverview());
        expect(getOverview).toHaveBeenCalledTimes(1);

        await store.dispatch(fetchAiOverview({ force: true }));
        expect(getOverview).toHaveBeenCalledTimes(2);
        expect(getOverview.mock.calls[1]?.[2]).toMatchObject({
            forceRefresh: true,
        });
    });

    it('error-конверт → status error с сообщением', async () => {
        getOverview.mockResolvedValue({
            status: 'error',
            requestKey: 'k',
            message: 'Период больше 3 мес.',
        });
        const store = makeStore();
        await store.dispatch(fetchAiOverview());
        expect(store.getState().aiAnalytics.overview.status).toBe('error');
        expect(store.getState().aiAnalytics.overview.error).toBe(
            'Период больше 3 мес.',
        );
    });

    it('смена фильтра во время запроса: устаревший ответ не перетирает секцию', async () => {
        let resolveFirst: (value: unknown) => void = () => undefined;
        getOverview.mockImplementationOnce(
            () =>
                new Promise(resolve => {
                    resolveFirst = resolve;
                }),
        );
        getOverview.mockResolvedValueOnce(ready(overview([]), 'k2'));
        const store = makeStore();
        const first = store.dispatch(fetchAiOverview());
        store.dispatch(
            departmentActions.setDepartmentCurrent([
                { ID: 7 },
            ] as unknown as BXUser[]),
        );
        const second = store.dispatch(fetchAiOverview());
        resolveFirst(ready(overview(), 'k1'));
        await Promise.all([first, second]);

        const section = store.getState().aiAnalytics.overview;
        expect(section.serverKey).toBe('k2');
        expect(section.data?.managers).toHaveLength(0);
    });
});

describe('fetchAiOverview — очередь, WS done, таймаут', () => {
    beforeEach(() => {
        getOverview.mockReset();
        getAttention.mockReset();
        getByType.mockReset();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('queued → секция остаётся в loading с серверным ключом и jobStatus', async () => {
        getOverview.mockResolvedValue(queued('srv'));
        const store = makeStore();
        await store.dispatch(fetchAiOverview());
        const section = store.getState().aiAnalytics.overview;
        expect(section.status).toBe('loading');
        expect(section.serverKey).toBe('srv');
        expect(section.jobStatus).toBe('queued');
        expect(section.queuedAttempts).toBe(1);
    });

    it('WS done с этим ключом → повторный POST без forceRefresh → ready', async () => {
        getOverview
            .mockResolvedValueOnce(processing('srv'))
            .mockResolvedValueOnce(ready(overview(), 'srv'));
        const store = makeStore();
        await store.dispatch(fetchAiOverview({ force: true }));
        expect(store.getState().aiAnalytics.overview.jobStatus).toBe(
            'processing',
        );

        await store.dispatch(resumeAiQueuedSections('srv'));
        expect(getOverview).toHaveBeenCalledTimes(2);
        expect(getOverview.mock.calls[1]?.[2]).toMatchObject({
            forceRefresh: false,
        });
        expect(store.getState().aiAnalytics.overview.status).toBe('ready');
    });

    it('WS done с чужим ключом секцию не трогает', async () => {
        getOverview.mockResolvedValue(queued('srv'));
        const store = makeStore();
        await store.dispatch(fetchAiOverview());
        await store.dispatch(resumeAiQueuedSections('other'));
        expect(getOverview).toHaveBeenCalledTimes(1);
        expect(store.getState().aiAnalytics.overview.status).toBe('loading');
    });

    it('WS error с этим ключом → секция в ошибку с текстом', async () => {
        getOverview.mockResolvedValue(queued('srv'));
        const store = makeStore();
        await store.dispatch(fetchAiOverview());
        store.dispatch(
            failAiQueuedSections({ requestKey: 'srv', message: 'Упал расчёт' }),
        );
        expect(store.getState().aiAnalytics.overview.status).toBe('error');
        expect(store.getState().aiAnalytics.overview.error).toBe('Упал расчёт');
    });

    it('таймаут 90 с без WS → повторный POST по тому же ключу', async () => {
        vi.useFakeTimers();
        getOverview
            .mockResolvedValueOnce(queued('srv'))
            .mockResolvedValueOnce(ready(overview(), 'srv'));
        const store = makeStore();
        await store.dispatch(fetchAiOverview());
        expect(getOverview).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(AI_QUEUED_TIMEOUT_MS + 10);
        expect(getOverview).toHaveBeenCalledTimes(2);
        expect(store.getState().aiAnalytics.overview.status).toBe('ready');
        expect(store.getState().aiAnalytics.overview.requestKey).toBe(
            OVERVIEW_KEY,
        );
    });

    it('после AI_QUEUED_MAX_ATTEMPTS таймаутов подряд — ошибка «слишком долго»', async () => {
        vi.useFakeTimers();
        getOverview.mockResolvedValue(queued('srv'));
        const store = makeStore();
        await store.dispatch(fetchAiOverview());
        for (let i = 0; i < AI_QUEUED_MAX_ATTEMPTS; i += 1) {
            await vi.advanceTimersByTimeAsync(AI_QUEUED_TIMEOUT_MS + 10);
        }
        expect(getOverview).toHaveBeenCalledTimes(AI_QUEUED_MAX_ATTEMPTS + 1);
        expect(store.getState().aiAnalytics.overview.status).toBe('error');
        expect(store.getState().aiAnalytics.overview.error).toContain(
            'слишком долго',
        );
    });

    it('«Внимание» без обзора получает конверт обзора и возобновляется по done', async () => {
        getAttention
            .mockResolvedValueOnce(queued('srv'))
            .mockResolvedValueOnce(ready(attention(), 'srv-att'));
        getOverview.mockResolvedValue(ready(overview(), 'srv'));
        const store = makeStore();
        await store.dispatch(fetchAiAttention());
        expect(store.getState().aiAnalytics.attention.status).toBe('loading');
        expect(store.getState().aiAnalytics.attention.serverKey).toBe('srv');

        await store.dispatch(resumeAiQueuedSections('srv'));
        expect(getAttention).toHaveBeenCalledTimes(2);
        expect(store.getState().aiAnalytics.attention.status).toBe('ready');
        expect(store.getState().aiAnalytics.attention.data?.items).toHaveLength(
            1,
        );
    });

    it('«Пересчитать»: обзор с forceRefresh, затем «Внимание»', async () => {
        getOverview.mockResolvedValue(ready(overview()));
        getAttention.mockResolvedValue(ready(attention()));
        const store = makeStore();
        await store.dispatch(recalcAiOverview());
        expect(getOverview.mock.calls[0]?.[2]).toMatchObject({
            forceRefresh: true,
        });
        expect(getAttention).toHaveBeenCalledTimes(1);
        expect(getByType).not.toHaveBeenCalled();
    });
});

describe('fetchAiByType — тип и раскладка в ключе', () => {
    beforeEach(() => {
        getByType.mockReset();
    });

    it('ключ и POST берут выбранный тип и раскладку; «все» уходит как all', async () => {
        getByType.mockResolvedValue(ready(byType()));
        const store = makeStore();
        await store.dispatch(fetchAiByType());
        expect(getByType.mock.calls[0]?.[2]).toBe('all');
        expect(getByType.mock.calls[0]?.[3]).toBe('wide');
        expect(store.getState().aiAnalytics.byType.requestKey).toBe(
            buildAiRequestKey({ ...SCOPE, callType: 'all', layout: 'wide' }),
        );
        expect(store.getState().aiAnalytics.byType.requestKey).toContain(
            '|all|wide',
        );

        store.dispatch(aiAnalyticsActions.setSelectedCallType('objections'));
        store.dispatch(aiAnalyticsActions.setTypesLayout('long'));
        await store.dispatch(fetchAiByType());
        expect(getByType).toHaveBeenCalledTimes(2);
        expect(getByType.mock.calls[1]?.[2]).toBe('objections');
        expect(getByType.mock.calls[1]?.[3]).toBe('long');
    });

    it('«все»: смена раскладки wide ↔ long перезапрашивает срез с новым ключом', async () => {
        getByType.mockResolvedValue(
            ready(byType({ callType: 'all', title: 'Все типы' })),
        );
        const store = makeStore();
        await store.dispatch(fetchAiByType());
        await store.dispatch(fetchAiByType()); // тот же ключ, ready — без POST
        expect(getByType).toHaveBeenCalledTimes(1);

        store.dispatch(aiAnalyticsActions.setTypesLayout('long'));
        await store.dispatch(fetchAiByType());
        expect(getByType).toHaveBeenCalledTimes(2);
        expect(getByType.mock.calls[1]?.[2]).toBe('all');
        expect(getByType.mock.calls[1]?.[3]).toBe('long');
        expect(store.getState().aiAnalytics.byType.requestKey).toBe(
            buildAiRequestKey({ ...SCOPE, callType: 'all', layout: 'long' }),
        );

        store.dispatch(aiAnalyticsActions.setTypesLayout('wide'));
        await store.dispatch(fetchAiByType());
        expect(getByType).toHaveBeenCalledTimes(3);
        expect(getByType.mock.calls[2]?.[3]).toBe('wide');
        expect(store.getState().aiAnalytics.byType.requestKey).toContain(
            '|all|wide',
        );
    });
});

describe('saveAiLevels', () => {
    beforeEach(() => {
        saveSettings.mockReset();
    });

    it('ready → levelsSaved с savedAt; повторный вызов при saving не шлётся', async () => {
        saveSettings.mockResolvedValue(
            ready({
                id: '1',
                levels: [],
                savedAt: '2026-09-07T10:00:00Z',
                resetCount: 2,
            }),
        );
        const store = makeStore();
        const ok = await store.dispatch(
            saveAiLevels([{ managerId: 7, level: 'senior' }]),
        );
        expect(ok).toBe(true);
        expect(store.getState().aiAnalytics.levels.savedAt).toBe(
            '2026-09-07T10:00:00Z',
        );
        expect(saveSettings).toHaveBeenCalledWith(
            { domain: 'test.bitrix24.ru', requesterUserId: '42' },
            [{ managerId: 7, level: 'senior' }],
        );
    });

    it('403 сервера → levels.error, saving снят', async () => {
        saveSettings.mockRejectedValue(new Error('Forbidden'));
        const store = makeStore();
        const ok = await store.dispatch(saveAiLevels([]));
        expect(ok).toBe(false);
        expect(store.getState().aiAnalytics.levels.saving).toBe(false);
        expect(store.getState().aiAnalytics.levels.error).toBe('Forbidden');
    });
});
